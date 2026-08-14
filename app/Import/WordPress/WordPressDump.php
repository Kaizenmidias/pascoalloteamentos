<?php

namespace App\Import\WordPress;

class WordPressDump
{
    public array $tables = [];
    public array $columnsByTable = [];
    public array $posts = [];
    public array $postmeta = [];
    public array $terms = [];
    public array $termTaxonomy = [];
    public array $termRelationships = [];
    public array $postTypeCounts = [];
    public array $attachments = [];

    public function __construct(
        public readonly string $path,
        public readonly string $prefix,
    ) {}
}
