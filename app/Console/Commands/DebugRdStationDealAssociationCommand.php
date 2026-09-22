<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Services\RdStationCrmService;
use Illuminate\Console\Command;

class DebugRdStationDealAssociationCommand extends Command
{
    protected $signature = 'rdstation:debug-deal-association {lead_id}';

    protected $description = 'Diagnostica uma única tentativa de associação RD Station sem alterar o Lead';

    public function handle(RdStationCrmService $service): int
    {
        $lead = Lead::find($this->argument('lead_id'));
        if (! $lead) {
            $this->error('Lead não encontrado.');
            return self::FAILURE;
        }

        $result = $service->debugDealAssociation($lead);
        $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return self::SUCCESS;
    }
}
