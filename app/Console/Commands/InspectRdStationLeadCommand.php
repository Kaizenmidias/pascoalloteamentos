<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Services\RdStationCrmService;
use Illuminate\Console\Command;

class InspectRdStationLeadCommand extends Command
{
    protected $signature = 'rdstation:inspect-lead {lead_id}';

    protected $description = 'Inspeciona com segurança as associações RD Station de um lead';

    public function handle(RdStationCrmService $service): int
    {
        $lead = Lead::find($this->argument('lead_id'));
        if (! $lead) {
            $this->error('Lead não encontrado.');
            return self::FAILURE;
        }

        $this->line(json_encode($service->inspectLead($lead), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return self::SUCCESS;
    }
}
