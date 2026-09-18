<?php

namespace App\Console\Commands;

use App\Services\RdStationCrmService;
use Illuminate\Console\Command;

class ListRdStationPipelinesCommand extends Command
{
    protected $signature = 'rdstation:list-pipelines';

    protected $description = 'Lista funis e etapas disponíveis no RD Station CRM';

    public function handle(RdStationCrmService $rdStation): int
    {
        $pipelines = $rdStation->pipelines();
        if (! $pipelines) {
            $this->warn('Nenhum funil encontrado ou a integração não está conectada.');
            return self::SUCCESS;
        }

        foreach ($pipelines as $pipeline) {
            $this->line('Funil: '.$pipeline['name']);
            $this->line('ID: '.$pipeline['id']);

            foreach ($rdStation->pipelineStages((string) $pipeline['id']) as $stage) {
                $this->line('  Etapa: '.$stage['name']);
                $this->line('  ID: '.$stage['id']);
            }

            $this->newLine();
        }

        return self::SUCCESS;
    }
}
