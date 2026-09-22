<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Services\RdStationCrmService;
use Illuminate\Console\Command;

class RepairRdStationLeadContactCommand extends Command
{
    protected $signature = 'rdstation:repair-lead-contact {lead_id}';

    protected $description = 'Repara a associação de um contato a uma negociação RD Station';

    public function handle(RdStationCrmService $service): int
    {
        $lead = Lead::find($this->argument('lead_id'));
        if (! $lead) {
            $this->error('Lead não encontrado.');
            return self::FAILURE;
        }

        $result = $service->repairLeadContact($lead);
        $lead->update(['rd_sync_status' => $result['status'] === 'synced' ? 'synced' : 'failed_association']);
        $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $result['status'] === 'synced' ? self::SUCCESS : self::FAILURE;
    }
}
