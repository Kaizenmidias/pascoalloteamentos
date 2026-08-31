<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RealEstateFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            ['Água individual', 'external_features'],
            ['Água quente', 'external_features'],
            ['Aquecimento a gás', 'external_features'],
            ['Aquecimento solar', 'external_features'],
            ['Ar-condicionado', 'external_features'],
            ['Energia solar', 'external_features'],
            ['Jardim', 'external_features'],
            ['Paisagismo', 'external_features'],
            ['Portão eletrônico', 'external_features'],
            ['Portaria', 'external_features'],
            ['Portaria 24h', 'external_features'],
            ['Interfone', 'external_features'],
            ['Elevador', 'external_features'],
            ['Elevador social', 'external_features'],
            ['Elevador de serviço', 'external_features'],
            ['Gerador', 'external_features'],
            ['Gás encanado', 'external_features'],
            ['Medidor de água individual', 'external_features'],
            ['Medidor de gás individual', 'external_features'],
            ['Internet/fibra óptica', 'external_features'],
            ['Acesso para PCD', 'external_features'],
            ['Entrada de serviço', 'external_features'],
            ['Hall de entrada', 'external_features'],
            ['Depósito', 'external_features'],
            ['Bicicletário', 'external_features'],
            ['Zeladoria', 'external_features'],
            ['Segurança', 'external_features'],
            ['Câmeras de segurança', 'external_features'],
            ['Cerca elétrica', 'external_features'],
            ['Controle de acesso', 'external_features'],
            ['Fechadura eletrônica', 'external_features'],
            ['Quadra de Futebol Suíço', 'leisure_features'],
            ['Quadra de Beach Tennis', 'leisure_features'],
            ['Quadra Poliesportiva', 'leisure_features'],
            ['Academia', 'leisure_features'],
            ['Academia ao ar livre', 'leisure_features'],
            ['Espaço Fitness', 'leisure_features'],
            ['Espaço Kids', 'leisure_features'],
            ['Playground', 'leisure_features'],
            ['Salão de Festas', 'leisure_features'],
            ['Espaço Gourmet', 'leisure_features'],
            ['Churrasqueira', 'leisure_features'],
            ['Piscina', 'leisure_features'],
            ['Piscina Adulto', 'leisure_features'],
            ['Piscina Infantil', 'leisure_features'],
            ['Piscina Aquecida', 'leisure_features'],
            ['Sauna', 'leisure_features'],
            ['SPA', 'leisure_features'],
            ['Brinquedoteca', 'leisure_features'],
            ['Pet Place', 'leisure_features'],
            ['Pista de Caminhada', 'leisure_features'],
            ['Ciclovia', 'leisure_features'],
            ['Espaço de Convivência', 'leisure_features'],
            ['Praça', 'leisure_features'],
            ['Áreas Verdes', 'leisure_features'],
            ['Bosque', 'leisure_features'],
            ['Coworking', 'leisure_features'],
            ['Salão de Jogos', 'leisure_features'],
            ['Mini Mercado', 'leisure_features'],
            ['Redário', 'leisure_features'],
            ['Horta Comunitária', 'leisure_features'],
            ['Fire Place', 'leisure_features'],
            ['Espaço Zen', 'leisure_features'],
            ['Lounge', 'leisure_features'],
            ['Quiosque', 'leisure_features'],
            ['Campo de Futebol', 'leisure_features'],
        ];

        foreach ($features as $index => [$name, $category]) {
            Feature::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'category' => $category, 'scope' => 'property', 'is_active' => true, 'sort_order' => $index],
            );
        }
    }
}
