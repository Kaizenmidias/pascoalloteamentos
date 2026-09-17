<?php

namespace App\Console\Commands;

use App\Jobs\SyncLeadToRdStation;
use App\Models\Lead;
use Illuminate\Console\Command;

class SyncLeadToRdStationCommand extends Command
{
    protected $signature = 'leads:sync-rd {lead_id : ID do lead local}';

    protected $description = 'Reprocessa a sincronização de um lead com o RD Station CRM';

    public function handle(): int
    {
        $lead = Lead::find($this->argument('lead_id'));
        if (! $lead) {
            $this->error('Lead não encontrado.');
            return self::FAILURE;
        }

        if ($lead->rd_deal_id) {
            $this->info('Lead já sincronizado.');
            return self::SUCCESS;
        }

        SyncLeadToRdStation::dispatchSync($lead->id);
        $lead->refresh();
        $this->line('Status da sincronização: '.($lead->rd_sync_status ?: 'aguardando').'.');

        return self::SUCCESS;
    }
}
