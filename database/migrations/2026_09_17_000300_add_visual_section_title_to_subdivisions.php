<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subdivisions', function (Blueprint $table): void {
            $table->string('visual_section_title')->nullable()->after('promotion_headline');
        });
    }

    public function down(): void
    {
        Schema::table('subdivisions', function (Blueprint $table): void {
            $table->dropColumn('visual_section_title');
        });
    }
};
