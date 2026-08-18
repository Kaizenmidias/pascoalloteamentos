<?php

namespace App\Support;

use App\Models\Condominium;
use App\Models\Subdivision;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ConstructionStageCatalog
{
    private const COMMON = [
        ['code' => 'earthworks', 'name' => 'Terraplenagem', 'aliases' => ['terraplanagem']],
        ['code' => 'water-sewage', 'name' => 'Rede de água e esgoto', 'aliases' => ['agua e esgoto', 'rede agua esgoto']],
        ['code' => 'drainage', 'name' => 'Drenagem'],
        ['code' => 'electrical-lighting', 'name' => 'Elétrica/Iluminação', 'aliases' => ['eletrica', 'iluminacao', 'eletricailuminacao']],
        ['code' => 'signage', 'name' => 'Sinalização'],
        ['code' => 'trees', 'name' => 'Arborização'],
        ['code' => 'common-areas', 'name' => 'Áreas Comuns'],
        ['code' => 'perimeter-wall', 'name' => 'Muro de fechamento'],
        ['code' => 'public-sidewalk', 'name' => 'Passeio Público'],
    ];

    private const SUBDIVISION_ONLY = [
        ['code' => 'paving', 'name' => 'Pavimentação'],
        ['code' => 'lot-grassing', 'name' => 'Gramagem dos Lotes'],
        ['code' => 'square', 'name' => 'Praça'],
    ];

    public static function definitionsFor(Model|string $owner): array
    {
        $class = is_string($owner) ? $owner : $owner::class;
        if ($class === Condominium::class) {
            return self::COMMON;
        }
        if ($class === Subdivision::class) {
            return [self::COMMON[0], self::SUBDIVISION_ONLY[0], ...array_slice(self::COMMON, 1), self::SUBDIVISION_ONLY[1], self::SUBDIVISION_ONLY[2]];
        }

        return [];
    }

    public static function applicableStages(Model $owner, Collection $stages): Collection
    {
        $definitions = self::definitionsFor($owner);

        return $stages->filter(fn ($stage) => collect($definitions)->contains(
            fn ($definition) => self::matches($definition, (string) $stage->code, (string) $stage->name),
        ))->values();
    }

    public static function matches(array $definition, string $code, string $name): bool
    {
        if ($code === $definition['code']) {
            return true;
        }

        $normalizedName = Str::slug($name);
        $names = [$definition['name'], ...($definition['aliases'] ?? [])];

        return collect($names)->contains(fn ($candidate) => Str::slug($candidate) === $normalizedName);
    }
}
