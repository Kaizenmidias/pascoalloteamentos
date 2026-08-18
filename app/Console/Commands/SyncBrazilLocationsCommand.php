<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\State;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SyncBrazilLocationsCommand extends Command
{
    protected $signature = 'locations:sync-ibge';

    protected $description = 'Sincroniza estados e municípios pela API oficial de localidades do IBGE';

    public function handle(): int
    {
        $states = Http::retry(3, 500)->timeout(30)
            ->get('https://servicodados.ibge.gov.br/api/v1/localidades/estados', ['orderBy' => 'nome'])
            ->throw()
            ->json();

        $municipalitiesByState = [];
        foreach ($states as $stateData) {
            $code = strtoupper((string) ($stateData['sigla'] ?? ''));
            if (strlen($code) !== 2) {
                continue;
            }

            $municipalitiesByState[$code] = Http::retry(3, 500)->timeout(30)
                ->get("https://servicodados.ibge.gov.br/api/v1/localidades/estados/{$code}/municipios", ['orderBy' => 'nome'])
                ->throw()
                ->json();
        }

        $slugOccurrences = collect($municipalitiesByState)
            ->flatten(1)
            ->map(fn ($municipality) => Str::slug((string) ($municipality['nome'] ?? '')))
            ->filter()
            ->countBy();

        $cityCount = 0;
        foreach ($states as $stateData) {
            $code = strtoupper((string) ($stateData['sigla'] ?? ''));
            $name = trim((string) ($stateData['nome'] ?? ''));
            $municipalities = $municipalitiesByState[$code] ?? [];
            if (strlen($code) !== 2 || $name === '') {
                continue;
            }

            DB::transaction(function () use ($code, $name, $municipalities, $slugOccurrences, &$cityCount): void {
                $state = State::query()->updateOrCreate(['code' => $code], ['name' => $name]);

                foreach ($municipalities as $municipality) {
                    $cityName = trim((string) ($municipality['nome'] ?? ''));
                    if ($cityName === '') {
                        continue;
                    }

                    $slug = Str::slug($cityName);
                    $city = City::query()->where(['state_id' => $state->id, 'slug' => $slug])->first();

                    if (! $city && ($slugOccurrences[$slug] ?? 0) === 1) {
                        $legacyMatches = City::query()->where('slug', $slug)->get();
                        if ($legacyMatches->count() === 1) {
                            $city = $legacyMatches->first();
                            $city->update(['state_id' => $state->id, 'name' => $cityName]);
                        }
                    }

                    City::query()->updateOrCreate(
                        ['state_id' => $state->id, 'slug' => $slug],
                        ['name' => $cityName],
                    );
                    $cityCount++;
                }
            });

            $this->line("{$code}: ".count($municipalities).' municípios');
        }

        $this->info(count($states)." estados e {$cityCount} municípios sincronizados.");

        return self::SUCCESS;
    }
}
