<?php

namespace Tests\Unit;

use App\Import\WordPress\LegacyEntity;
use App\Import\WordPress\LegacyRecordClassifier;
use PHPUnit\Framework\TestCase;

class LegacyRecordClassifierTest extends TestCase
{
    public function test_primary_cpts_are_classified_without_a_catalog_model(): void
    {
        $classifier = new LegacyRecordClassifier;
        $this->assertSame(LegacyEntity::Property, $classifier->classify('imoveis'));
        $this->assertSame(LegacyEntity::Condominium, $classifier->classify('condominios'));
        $this->assertSame(LegacyEntity::Subdivision, $classifier->classify('loteamentos'));
    }

    public function test_legacy_catalog_requires_an_explicit_discriminator(): void
    {
        $classifier = new LegacyRecordClassifier;
        $this->assertSame(LegacyEntity::Condominium, $classifier->classify('catalogo', ['tipo_item' => 'condominio']));
        $this->assertSame(LegacyEntity::Review, $classifier->classify('catalogo'));
    }
}
