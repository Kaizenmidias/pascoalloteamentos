<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\City;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Models\MediaAsset;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\State;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['username' => 'kaizen'],
            ['name' => 'Kaizen', 'email' => 'kaizen@pascoalloteamentos.local', 'password' => Hash::make('Kaizen@@2026'), 'email_verified_at' => now()],
        );

        $state = State::updateOrCreate(['code' => 'PR'], ['name' => 'Paraná']);
        $toledo = City::updateOrCreate(['state_id' => $state->id, 'slug' => 'toledo'], ['name' => 'Toledo']);
        $palotina = City::updateOrCreate(['state_id' => $state->id, 'slug' => 'palotina'], ['name' => 'Palotina']);

        $apartment = PropertyType::updateOrCreate(['slug' => 'apartamento'], ['name' => 'Apartamento', 'is_active' => true]);
        $residential = CondominiumType::updateOrCreate(['slug' => 'condominio-residencial'], ['name' => 'Condomínio residencial', 'is_active' => true]);
        $land = SubdivisionType::updateOrCreate(['slug' => 'terreno'], ['name' => 'Terreno', 'is_active' => true]);
        $finished = DevelopmentStatus::updateOrCreate(['slug' => 'concluido'], ['name' => 'Concluído', 'is_active' => true]);
        $building = DevelopmentStatus::updateOrCreate(['slug' => 'em-obras'], ['name' => 'Em obras', 'is_active' => true]);

        $features = collect(['Quadra de futebol suíço', 'Quadra de beach tennis', 'Sala de jogos', 'Brinquedoteca', 'Espaços de convivência', 'Piscina', 'Espaço kids', 'Academia'])->mapWithKeys(function ($name) {
            $slug = str($name)->slug()->toString();

            return [$slug => Feature::updateOrCreate(['slug' => $slug], ['name' => $name, 'is_active' => true])];
        });

        $condominium = Condominium::updateOrCreate(['slug' => 'condominio-vale-da-mata'], [
            'title' => 'Condomínio Vale da Mata', 'reference_code' => 'DEMO-COND-01', 'condominium_type_id' => $residential->id,
            'development_status_id' => $building->id, 'city_id' => $toledo->id, 'excerpt' => 'Condomínio fechado com lazer, segurança e qualidade de vida.',
            'description' => 'Um condomínio pensado para oferecer tranquilidade, conforto e uma estrutura completa para aproveitar cada momento com sua família.',
            'about_title' => 'Infraestrutura completa para viver com mais conforto e qualidade de vida', 'about_text' => 'O Condomínio Vale da Mata conta com uma estrutura completa para o dia a dia da sua família, oferecendo piscinas, academia, salão de festas, brinquedoteca, playground, quadras esportivas, quiosques com churrasqueiras e espaços de convivência.',
            'starting_price' => 680000, 'minimum_unit_area' => 160, 'latitude' => -24.7246, 'longitude' => -53.7412,
            'status' => 'published', 'featured' => true, 'published_at' => now()->subDays(20), 'whatsapp_contact' => '5545991119653',
        ]);
        $condominium->features()->sync($features->values()->take(8)->pluck('id'));
        $this->attachMedia($condominium, ['condominium-vale.webp', 'gallery-condo-2.webp', 'gallery-condo-3.webp']);
        $this->seedStages($condominium, ['Terraplenagem' => 63, 'Rede de água e esgoto' => 55, 'Drenagem' => 70, 'Pavimentação' => 48]);
        $this->seedFaqs($condominium, ['O empreendimento possui toda a infraestrutura necessária?' => 'Sim. O projeto contempla áreas de lazer, segurança e infraestrutura urbana completa.', 'Qual é a previsão de entrega?' => 'Consulte nossa equipe para o cronograma atualizado.']);

        $properties = [
            ['apartamento-202', 'Apartamento 202', 'property-202.jpg', 650000, 95.00, 2, 1, 2, 1, 'Em obras'],
            ['apartamento-401-edificio-livorno', 'Apartamento 401 - Edifício Livorno', 'property-livorno.jpeg', 820000, 123.45, 3, 3, 2, 1, 'Em obras'],
            ['apartamento-501-no-edificio-mogno', 'Apartamento 501 no Edifício Mogno', 'property-mogno.jpeg', 980000, 119.89, 3, 1, 2, 2, 'Concluído'],
        ];
        foreach ($properties as $index => [$slug, $title, $image, $price, $area, $bedrooms, $suites, $bathrooms, $parking, $statusName]) {
            $property = Property::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'reference_code' => 'DEMO-IMOVEL-'.($index + 1), 'property_type_id' => $apartment->id,
                'development_status_id' => $statusName === 'Concluído' ? $finished->id : $building->id, 'city_id' => $toledo->id,
                'excerpt' => $area.'m² privativos', 'description' => "{$title}\nRua Dr. Mario Totta, Vila Industrial.\n{$bedrooms} dormitórios;\n{$suites} suítes;\nSala de jantar/estar;\nCozinha e sacada com churrasqueira;\n{$parking} vaga(s) de garagem.",
                'address' => 'Rua Dr. Mario Totta', 'address_number' => (string) (638 + $index), 'neighborhood' => 'Vila Industrial',
                'regular_price' => $index === 1 ? 980000 : $price, 'sale_price' => $price, 'usable_area' => $area, 'total_area' => $area,
                'bedrooms' => $bedrooms, 'suites' => $suites, 'bathrooms' => $bathrooms, 'lavatories' => 1, 'parking_spaces' => $parking,
                'accepts_financing' => true, 'accepts_exchange' => $index === 1, 'is_new' => true, 'status' => 'published', 'featured' => true,
                'published_at' => now()->subDays(15 - $index), 'whatsapp_contact' => '5545991119653',
            ]);
            $gallery = $slug === 'apartamento-401-edificio-livorno' ? [$image, 'gallery-livorno-1.jpeg', 'gallery-livorno-3.jpeg'] : [$image];
            $this->attachMedia($property, $gallery);
        }

        $subdivisions = [
            ['loteamento-rossetto', 'Loteamento Rossetto', 'subdivision-rossetto.webp', $toledo->id, $finished->id, 55, 10, 200, 500],
            ['loteamento-espanha', 'Loteamento Espanha', 'subdivision-espanha.jpg', $palotina->id, $finished->id, 80, 12, 250, 600],
            ['loteamento-brisa-do-lago', 'Loteamento Brisa do Lago', 'subdivision-brisa.jpg', $toledo->id, $finished->id, 68, 8, 360, 720],
            ['loteamento-recanto-do-lago', 'Loteamento Recanto do Lago', 'subdivision-recanto.webp', $palotina->id, $building->id, 120, 35, 300, 650],
        ];
        foreach ($subdivisions as $index => [$slug, $title, $image, $cityId, $stageId, $total, $available, $min, $max]) {
            $subdivision = Subdivision::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'reference_code' => 'DEMO-LOTE-'.($index + 1), 'subdivision_type_id' => $land->id, 'development_status_id' => $stageId, 'city_id' => $cityId,
                'excerpt' => "Lotes a partir de {$min}m²", 'description' => "O {$title} nasce em uma região estratégica, com lotes planejados e infraestrutura completa para construir, morar ou investir.",
                'about_title' => 'Um lote perto de tudo o que você precisa', 'about_text' => "No {$title} você encontra lotes planejados e prontos para construir, em quadras bem distribuídas e com infraestrutura completa.",
                'total_lots' => $total, 'available_lots' => $available, 'minimum_lot_area' => $min, 'maximum_lot_area' => $max, 'sale_price' => 190000 + ($index * 25000),
                'latitude' => -24.7246 + ($index * .02), 'longitude' => -53.7412 + ($index * .02), 'status' => 'published', 'featured' => $index < 3,
                'published_at' => now()->subDays(10 - $index), 'whatsapp_contact' => '5545991119653',
            ]);
            $subdivision->features()->sync($features->values()->take(5)->pluck('id'));
            $this->attachMedia($subdivision, [$image, 'hero-home.jpg', 'blog-survey.webp']);
            $this->seedStages($subdivision, ['Terraplenagem' => 100, 'Pavimentação' => $stageId === $finished->id ? 100 : 63, 'Drenagem' => 100, 'Rede de água e esgoto' => 95]);
        }

        $category = BlogCategory::updateOrCreate(['slug' => 'mercado-imobiliario'], ['name' => 'Mercado Imobiliário']);
        $postImages = ['blog-city.jpg', 'blog-survey.webp', 'hero-home.jpg', 'blog-people.webp'];
        foreach ($postImages as $index => $image) {
            $media = $this->media($image, 'Conteúdo Pascoal Loteamentos');
            $post = BlogPost::updateOrCreate(['slug' => 'conteudo-mercado-imobiliario-'.($index + 1)], [
                'user_id' => $admin->id, 'featured_media_id' => $media->id, 'title' => ['Como escolher um empreendimento para investir', 'Infraestrutura que transforma bairros', 'Toledo e o crescimento do mercado imobiliário', 'Planejamento para realizar o sonho do imóvel'][$index],
                'excerpt' => 'Informação, planejamento e segurança para tomar as melhores decisões no mercado imobiliário.',
                'content' => "Investir em um imóvel ou loteamento é uma decisão importante. Localização, infraestrutura, credibilidade da incorporadora e potencial de valorização são fatores essenciais.\n\nA Pascoal Loteamentos desenvolve projetos que combinam planejamento urbano, qualidade construtiva e respeito às pessoas. Cada detalhe é pensado para criar lugares onde novas histórias possam começar.\n\nConverse com nossa equipe e conheça as oportunidades disponíveis.",
                'status' => 'published', 'published_at' => now()->subDays($index + 2),
            ]);
            $post->categories()->sync([$category->id]);
        }
    }

    private function media(string $path, string $alt): MediaAsset
    {
        return MediaAsset::updateOrCreate(['disk' => 'reference', 'path' => $path], ['original_name' => $path, 'alt_text' => $alt]);
    }

    private function attachMedia($model, array $paths): void
    {
        foreach ($paths as $index => $path) {
            $media = $this->media($path, $model->title);
            $model->mediaAssets()->syncWithoutDetaching([$media->id => ['collection' => 'gallery', 'sort_order' => $index, 'is_featured' => $index === 0]]);
        }
    }

    private function seedStages($model, array $stages): void
    {
        foreach ($stages as $index => $percent) {
            $model->constructionStages()->updateOrCreate(['name' => $index], ['progress_percent' => $percent, 'sort_order' => array_search($index, array_keys($stages), true)]);
        }
    }

    private function seedFaqs($model, array $faqs): void
    {
        foreach ($faqs as $question => $answer) {
            $model->faqs()->updateOrCreate(['question' => $question], ['answer' => $answer]);
        }
    }
}
