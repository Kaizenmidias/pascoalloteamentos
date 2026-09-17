<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\RdStationCrmService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncLeadToRdStation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;
    public array $backoff = [60, 300, 900];

    public function __construct(public int $leadId) {}

    public function handle(RdStationCrmService $service): void
    {
        $lead = Lead::find($this->leadId);
        if ($lead) $service->sync($lead);
    }
}
