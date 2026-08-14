<?php

namespace App\Import\WordPress;

use RuntimeException;

class SqlDumpInventory
{
    private const READ_CHUNK_SIZE = 1048576;

    public function inspect(string $path, string $prefix): array
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException("Dump WordPress not found or not readable: {$path}");
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new RuntimeException("Unable to open: {$path}");
        }

        $tables = [];
        $statement = '';
        $inString = false;
        $escape = false;

        try {
            while (! feof($handle)) {
                $chunk = fread($handle, self::READ_CHUNK_SIZE);
                if ($chunk === false || $chunk === '') {
                    break;
                }

                foreach ($this->splitStatements($chunk, $statement, $inString, $escape) as $sql) {
                    if (preg_match('/^CREATE TABLE\s+`?([^`\s]+)`?/i', ltrim($sql), $match) && str_starts_with($match[1], $prefix)) {
                        $tables[] = $match[1];
                    }
                }
            }

            $tail = trim($statement);
            if ($tail !== '' && preg_match('/^CREATE TABLE\s+`?([^`\s]+)`?/i', ltrim($tail), $match) && str_starts_with($match[1], $prefix)) {
                $tables[] = $match[1];
            }
        } finally {
            fclose($handle);
        }

        return [
            'path' => realpath($path),
            'bytes' => filesize($path),
            'prefix' => $prefix,
            'tables' => array_values(array_unique($tables)),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function splitStatements(string $chunk, string &$statement, bool &$inString, bool &$escape): array
    {
        $statements = [];
        $length = strlen($chunk);

        for ($i = 0; $i < $length; $i++) {
            $char = $chunk[$i];
            $statement .= $char;

            if ($escape) {
                $escape = false;
                continue;
            }

            if ($char === '\\') {
                $escape = true;
                continue;
            }

            if ($char === "'") {
                $inString = ! $inString;
                continue;
            }

            if ($char === ';' && ! $inString) {
                $sql = trim($statement);
                if ($sql !== '') {
                    $statements[] = $sql;
                }
                $statement = '';
            }
        }

        return $statements;
    }
}
