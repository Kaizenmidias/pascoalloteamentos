<?php

namespace App\Import\WordPress;

use App\Models\LegacyImport;

class ImportCheckpointRepository
{
    public function unchanged(LegacyEntity $entity, int $legacyId, string $checksum): bool
    {
        return LegacyImport::where(['source' => 'wordpress', 'entity_type' => $entity->value, 'legacy_id' => $legacyId, 'checksum' => $checksum, 'status' => 'completed'])->exists();
    }

    public function begin(LegacyEntity $entity, int $legacyId, string $postType, string $checksum): LegacyImport
    {
        return LegacyImport::updateOrCreate(['source' => 'wordpress', 'entity_type' => $entity->value, 'legacy_id' => $legacyId], ['legacy_post_type' => $postType, 'checksum' => $checksum, 'status' => 'processing', 'error_message' => null, 'started_at' => now(), 'completed_at' => null]);
    }

    public function complete(LegacyImport $checkpoint, string $destinationType, int $destinationId, array $metadata = []): void
    {
        $checkpoint->update(['destination_type' => $destinationType, 'destination_id' => $destinationId, 'metadata' => $metadata, 'status' => 'completed', 'completed_at' => now()]);
    }

    public function fail(LegacyImport $checkpoint, \Throwable $error): void
    {
        $checkpoint->update(['status' => 'failed', 'error_message' => mb_substr($error->getMessage(), 0, 65000), 'completed_at' => now()]);
    }
}
