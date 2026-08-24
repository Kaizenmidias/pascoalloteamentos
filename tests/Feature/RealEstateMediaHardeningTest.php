<?php

namespace Tests\Feature;

use App\Models\MediaAsset;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RealEstateMediaHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_property_plan_pdf_is_saved_as_a_document_and_keeps_the_floor_plan_url(): void
    {
        Storage::fake('public');
        $admin = $this->adminUser();

        $this->actingAs($admin)->post('/admin/properties', [
            'title' => 'Imovel com planta em PDF',
            'slug' => 'imovel-com-planta-em-pdf',
            'commercial_purpose' => 'sale',
            'status' => 'published',
            'featured' => false,
            'price_on_request' => false,
            'furnished' => false,
            'accepts_financing' => false,
            'accepts_exchange' => false,
            'is_new' => false,
            'property_plan_url' => 'https://example.com/planta-em-pdf',
            'property_plan_pdf' => UploadedFile::fake()->create('planta.pdf', 120, 'application/pdf'),
        ])->assertRedirect();

        $property = Property::where('slug', 'imovel-com-planta-em-pdf')->firstOrFail();
        $this->assertSame('https://example.com/planta-em-pdf', $property->floorPlans()->first()->external_url);

        $document = $property->documents()->where('kind', 'property_plan')->firstOrFail();
        $this->assertSame('application/pdf', $document->mediaAsset->mime_type);
        $this->assertSame('document', $document->mediaAsset->type);
        $this->assertTrue(Storage::disk('public')->exists($document->mediaAsset->path));
    }

    public function test_property_plan_pdf_rejects_non_pdf_files(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)->post('/admin/properties', [
            'title' => 'Imovel com arquivo invalido',
            'slug' => 'imovel-com-arquivo-invalido',
            'commercial_purpose' => 'sale',
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'furnished' => false,
            'accepts_financing' => false,
            'accepts_exchange' => false,
            'is_new' => false,
            'property_plan_pdf' => UploadedFile::fake()->image('planta.jpg'),
        ])->assertSessionHasErrors('property_plan_pdf');
    }

    public function test_uploaded_media_ids_allow_fifty_items_but_not_fifty_one(): void
    {
        $admin = $this->adminUser();
        $ids = [];

        for ($index = 1; $index <= 51; $index++) {
            $ids[] = MediaAsset::create([
                'disk' => 'external',
                'path' => "https://example.test/media-{$index}.jpg",
                'original_name' => "media-{$index}.jpg",
                'mime_type' => 'image/jpeg',
                'media_type' => 'image',
                'size' => 123,
                'checksum' => hash('sha256', 'media-'.$index),
            ])->id;
        }

        $basePayload = [
            'title' => 'Galeria com upload separado',
            'slug' => 'galeria-com-upload-separado',
            'commercial_purpose' => 'sale',
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'furnished' => false,
            'accepts_financing' => false,
            'accepts_exchange' => false,
            'is_new' => false,
        ];

        $this->actingAs($admin)->post('/admin/properties', [
            ...$basePayload,
            'slug' => 'galeria-com-upload-50-itens',
            'uploaded_media_ids' => array_slice($ids, 0, 50),
            'media_order' => array_slice($ids, 0, 50),
        ])->assertRedirect();

        $this->actingAs($admin)->from('/admin/properties/create')->post('/admin/properties', [
            ...$basePayload,
            'slug' => 'galeria-com-upload-51-itens',
            'uploaded_media_ids' => $ids,
            'media_order' => $ids,
        ])->assertSessionHasErrors('uploaded_media_ids');
    }

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }
}