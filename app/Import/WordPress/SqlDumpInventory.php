<?php

namespace App\Import\WordPress;

use RuntimeException;

class SqlDumpInventory
{
    public function inspect(string $path, string $prefix): array
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException("Dump WordPress não encontrado ou não legível: {$path}");
        }
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new RuntimeException("Não foi possível abrir: {$path}");
        }
        $tables = [];
        try {
            while (($line = fgets($handle)) !== false) {
                if (preg_match('/^CREATE TABLE [`\"]([^`\"]+)[`\"]/', ltrim($line), $match) && str_starts_with($match[1], $prefix)) {
                    $tables[] = $match[1];
                }
            }
        } finally {
            fclose($handle);
        }

        return ['path' => realpath($path), 'bytes' => filesize($path), 'prefix' => $prefix, 'tables' => array_values(array_unique($tables))];
    }
}
