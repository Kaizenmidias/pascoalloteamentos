<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legacy_imports', function (Blueprint $table) {
            $table->id();
            $table->string('source')->default('wordpress');
            $table->string('entity_type', 50);
            $table->unsignedBigInteger('legacy_id');
            $table->string('legacy_post_type', 80)->nullable();
            $table->string('checksum', 64);
            $table->string('destination_type', 50)->nullable();
            $table->unsignedBigInteger('destination_id')->nullable();
            $table->string('status', 20)->default('pending');
            $table->json('metadata')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['source', 'entity_type', 'legacy_id']);
            $table->index(['destination_type', 'destination_id']);
            $table->index(['status', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legacy_imports');
    }
};
