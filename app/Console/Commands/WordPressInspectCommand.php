<?php

namespace App\Console\Commands;

use App\Import\WordPress\SqlDumpInventory;
use Illuminate\Console\Command;

class WordPressInspectCommand extends Command
{
    protected $signature = 'wordpress:inspect';

    protected $description = 'Inspeciona a fonte WordPress sem gravar dados';

    public function handle(SqlDumpInventory $inventory): int
    {
        $report = $inventory->inspect(config('wordpress.sql_path'), config('wordpress.table_prefix'));
        $this->info('Dump: '.$report['path']);
        $this->line('Tamanho: '.number_format($report['bytes']).' bytes');
        $this->line('Prefixo: '.$report['prefix']);
        $this->table(['Tabelas do prefixo'], array_map(fn ($table) => [$table], $report['tables']));

        return self::SUCCESS;
    }
}
