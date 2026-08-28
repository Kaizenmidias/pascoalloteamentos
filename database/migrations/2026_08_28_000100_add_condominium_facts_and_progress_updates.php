<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominiums', function (Blueprint $table) {
            $table->json('summary_facts')->nullable()->after('summary');
        });

        Schema::create('construction_progress_updates', function (Blueprint $table) {
            $table->id();
            $table->string('progressable_type');
            $table->unsignedBigInteger('progressable_id');
            $table->date('progress_date');
            $table->timestamps();
            $table->index(['progressable_type', 'progressable_id'], 'progress_updates_owner_index');
            $table->unique(['progressable_type', 'progressable_id', 'progress_date'], 'progress_updates_owner_date_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('construction_progress_updates');

        Schema::table('condominiums', function (Blueprint $table) {
            $table->dropColumn('summary_facts');
        });
    }
};
