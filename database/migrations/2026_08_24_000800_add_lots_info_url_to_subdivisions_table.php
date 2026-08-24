<?php

use App\Models\Subdivision;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('subdivisions', 'lots_info_url')) {
            Schema::table('subdivisions', function (Blueprint $table): void {
                $table->string('lots_info_url', 2048)->nullable()->after('about_text');
            });
        }

        if (! Schema::hasTable('documents')) {
            return;
        }

        DB::table('subdivisions')
            ->select(['id'])
            ->whereNull('lots_info_url')
            ->orderBy('id')
            ->chunkById(100, function ($subdivisions): void {
                foreach ($subdivisions as $subdivision) {
                    $legacyUrl = DB::table('documents')
                        ->where('owner_type', Subdivision::class)
                        ->where('owner_id', $subdivision->id)
                        ->whereNotNull('external_url')
                        ->where(function ($query): void {
                            $query->where('kind', 'plans')
                                ->orWhere('title', "Informa\u{00e7}\u{00f5}es dos lotes")
                                ->orWhere('title', 'InformaÃ§Ãµes dos lotes');
                        })
                        ->orderBy('sort_order')
                        ->value('external_url');

                    if ($legacyUrl) {
                        DB::table('subdivisions')->where('id', $subdivision->id)->update(['lots_info_url' => $legacyUrl]);
                    }
                }
            });
    }

    public function down(): void
    {
        if (Schema::hasColumn('subdivisions', 'lots_info_url')) {
            Schema::table('subdivisions', function (Blueprint $table): void {
                $table->dropColumn('lots_info_url');
            });
        }
    }
};