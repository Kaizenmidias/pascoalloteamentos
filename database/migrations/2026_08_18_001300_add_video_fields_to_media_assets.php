<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media_assets', function (Blueprint $table) {
            $table->string('media_type', 20)->nullable()->after('mime_type');
            $table->string('poster_disk')->nullable()->after('path');
            $table->string('poster_path')->nullable()->after('poster_disk');
        });
    }

    public function down(): void
    {
        Schema::table('media_assets', function (Blueprint $table) {
            $table->dropColumn(['media_type', 'poster_disk', 'poster_path']);
        });
    }
};
