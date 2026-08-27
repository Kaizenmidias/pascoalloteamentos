<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Lead extends Model
{
    public const STATUSES = [
        'new' => 'Novo Lead',
        'contacted' => 'Contato Feito',
        'qualified' => 'Visita agendada',
        'won' => 'Venda concluída',
        'lost' => 'Realizar novo contato',
    ];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'consent' => 'boolean', 'consented_at' => 'datetime', 'next_contact_at' => 'datetime'];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function condominium(): BelongsTo
    {
        return $this->belongsTo(Condominium::class);
    }

    public function subdivision(): BelongsTo
    {
        return $this->belongsTo(Subdivision::class);
    }

    public function entityType(): ?string
    {
        return $this->property ? 'property' : ($this->condominium ? 'condominium' : ($this->subdivision ? 'subdivision' : null));
    }

    public function entityTitle(): ?string
    {
        return $this->property?->title ?? $this->condominium?->title ?? $this->subdivision?->title;
    }

    public function entitySlug(): ?string
    {
        return $this->property?->slug ?? $this->condominium?->slug ?? $this->subdivision?->slug;
    }

    public function isSellYourPropertyLead(): bool
    {
        $metadata = is_array($this->metadata) ? $this->metadata : [];
        $haystack = Str::of(implode(' ', array_filter([
            (string) ($metadata['source_type'] ?? ''),
            (string) ($metadata['source_label'] ?? ''),
            (string) ($metadata['product_name'] ?? ''),
            (string) $this->source_url,
            (string) $this->name,
        ])))->lower();

        return $haystack->contains(['venda seu imóvel', 'venda seu imovel', 'venda-seu-imovel', 'venda do seu imóvel', 'venda do seu imovel', 'sell your property']);
    }

    public function originLabel(): string
    {
        if ($this->isSellYourPropertyLead()) {
            return 'Venda seu Imóvel';
        }

        $metadata = is_array($this->metadata) ? $this->metadata : [];

        return match ($metadata['source_type'] ?? null) {
            'property' => 'Site - Interesse no Imóvel',
            'condominium' => 'Site - Interesse no Condomínio',
            'subdivision' => 'Site - Interesse no Loteamento',
            'contact' => 'Site - Contato',
            default => ! empty($metadata['source_label']) ? 'Site - '.trim((string) $metadata['source_label']) : 'Site - Contato',
        };
    }

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? Str::headline((string) $this->status);
    }

    public function sanitizedMessage(): ?string
    {
        $message = trim((string) ($this->message ?? ''));

        if ($message === '') {
            return null;
        }

        $message = preg_replace('/<\s*br\s*\/?>/i', "\n", $message) ?? $message;
        $message = strip_tags(html_entity_decode($message, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return trim($message) ?: null;
    }
}