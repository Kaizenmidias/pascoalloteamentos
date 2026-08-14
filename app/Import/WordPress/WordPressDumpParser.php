<?php

namespace App\Import\WordPress;

use RuntimeException;

class WordPressDumpParser
{
    private const READ_CHUNK_SIZE = 1048576;

    public function parse(string $path, string $prefix): WordPressDump
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException("Dump WordPress not found or not readable: {$path}");
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new RuntimeException("Unable to open WordPress dump: {$path}");
        }

        $dump = new WordPressDump($path, $prefix);
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
                    $this->consumeStatement($sql, $dump, $prefix);
                }
            }

            $tail = trim($statement);
            if ($tail !== '') {
                $this->consumeStatement($tail, $dump, $prefix);
            }
        } finally {
            fclose($handle);
        }

        return $dump;
    }

    private function consumeStatement(string $statement, WordPressDump $dump, string $prefix): void
    {
        if (str_starts_with($statement, 'INSERT INTO')) {
            $this->consumeInsert($statement, $dump);
            return;
        }

        if (str_starts_with($statement, 'CREATE TABLE')) {
            $this->consumeCreate($statement, $dump, $prefix);
        }
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

    private function consumeCreate(string $statement, WordPressDump $dump, string $prefix): void
    {
        if (preg_match('/CREATE TABLE `?([^`\\s]+)`?/i', $statement, $matches)) {
            $table = $matches[1];
            if (str_starts_with($table, $prefix)) {
                $dump->tables[$table] = true;
            }
        }
    }

    private function consumeInsert(string $statement, WordPressDump $dump): void
    {
        if (! preg_match('/INSERT INTO `?([^`\\s]+)`?\\s*\\((.*?)\\)\\s*VALUES\\s*(.+);/is', $statement, $matches)) {
            return;
        }

        $table = $matches[1];
        $columns = $this->parseColumns($matches[2]);
        $rows = $this->parseRows($matches[3]);

        if (str_contains($table, '_posts')) {
            foreach ($rows as $row) {
                $record = $this->combine($columns, $row);
                $dump->posts[] = $record;
                $type = (string) ($record['post_type'] ?? '');
                $dump->postTypeCounts[$type] = ($dump->postTypeCounts[$type] ?? 0) + 1;
                if (($record['post_mime_type'] ?? '') === 'image/jpeg' || ($record['post_mime_type'] ?? '') === 'image/png' || ($record['post_mime_type'] ?? '') === 'image/webp' || ($record['post_mime_type'] ?? '') === 'image/gif') {
                    $dump->attachments[] = $record;
                }
            }
            return;
        }

        if (str_contains($table, '_postmeta')) {
            foreach ($rows as $row) {
                $record = $this->combine($columns, $row);
                $dump->postmeta[] = $record;
            }
            return;
        }

        if (str_contains($table, '_term_taxonomy')) {
            foreach ($rows as $row) {
                $record = $this->combine($columns, $row);
                $dump->termTaxonomy[] = $record;
            }
            return;
        }

        if (str_contains($table, '_term_relationships')) {
            foreach ($rows as $row) {
                $record = $this->combine($columns, $row);
                $dump->termRelationships[] = $record;
            }
            return;
        }

        if (str_contains($table, '_terms')) {
            foreach ($rows as $row) {
                $record = $this->combine($columns, $row);
                $dump->terms[] = $record;
            }
        }
    }

    private function parseColumns(string $raw): array
    {
        return array_map(static fn ($column) => trim($column, " `"), explode(',', $raw));
    }

    private function parseRows(string $raw): array
    {
        $rows = [];
        $current = [];
        $token = '';
        $inString = false;
        $escape = false;
        $depth = 0;

        foreach (str_split($raw) as $char) {
            if ($escape) {
                $token .= $char;
                $escape = false;
                continue;
            }

            if ($char === '\\') {
                $token .= $char;
                $escape = true;
                continue;
            }

            if ($char === "'") {
                $inString = ! $inString;
                $token .= $char;
                continue;
            }

            if (! $inString) {
                if ($char === '(') {
                    $depth++;
                    if ($depth === 1) {
                        $current = [];
                        $token = '';
                        continue;
                    }
                }

                if ($char === ')' && $depth === 1) {
                    $current[] = $this->unquote(trim($token));
                    $rows[] = $current;
                    $token = '';
                    $depth = 0;
                    continue;
                }

                if ($char === ',' && $depth === 1) {
                    $current[] = $this->unquote(trim($token));
                    $token = '';
                    continue;
                }
            }

            $token .= $char;
        }

        return $rows;
    }

    private function combine(array $columns, array $values): array
    {
        $combined = [];
        foreach ($columns as $index => $column) {
            $combined[$column] = $values[$index] ?? null;
        }

        return $combined;
    }

    private function unquote(string $value): mixed
    {
        if ($value === 'NULL') {
            return null;
        }

        if (strlen($value) >= 2 && $value[0] === "'" && substr($value, -1) === "'") {
            $value = substr($value, 1, -1);
            $value = str_replace(["\\'", "\\\\"], ["'", "\\"], $value);
        }

        return $value;
    }
}
