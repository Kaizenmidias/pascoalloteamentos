<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\RdStationCrmService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Http\Client\RequestException;
use Throwable;

class SyncLeadToRdStation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;
    public array $backoff = [60, 300, 900];
    public int $timeout = 60;

    public function __construct(public int $leadId) {}

    public function handle(RdStationCrmService $service): void
    {
        $lead = Lead::find($this->leadId);
        if (! $lead) return;

        try {
            $service->sync($lead);
        } catch (Throwable $exception) {
            $status = $exception instanceof RequestException ? $exception->response?->status() : null;
            if (in_array($status, [400, 403, 404, 422], true)) {
                $lead->update(['rd_sync_status' => 'failed_permanent']);
                return;
            }

            $lead->update(['rd_sync_status' => 'retrying']);
            throw $exception;
        }
    }

    public function failed(?Throwable $exception): void
    {
        Lead::whereKey($this->leadId)->update(['rd_sync_status' => 'failed_retry_exhausted']);
    }
}
