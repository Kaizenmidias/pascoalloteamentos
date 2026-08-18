<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RealEstateFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Quadra de Futebol Suíço', 'Quadra de Beach Tennis', 'Quadra Poliesportiva', 'Academia',
            'Espaço Fitness', 'Espaço Kids', 'Playground', 'Salão de Festas', 'Espaço Gourmet',
            'Churrasqueira', 'Piscina Adulto', 'Piscina Infantil', 'Piscina Aquecida', 'Sauna', 'SPA',
            'Brinquedoteca', 'Pet Place', 'Pista de Caminhada', 'Ciclovia', 'Espaço de Convivência',
            'Praça', 'Áreas Verdes', 'Bosque', 'Portaria', 'Portaria 24h', 'Segurança 24h',
            'Monitoramento por Câmeras', 'Controle de Acesso', 'Estacionamento para Visitantes',
            'Coworking', 'Salão de Jogos', 'Mini Mercado', 'Redário', 'Horta Comunitária',
            'Bicicletário', 'Fire Place', 'Espaço Zen', 'Lounge', 'Quiosque', 'Campo de Futebol',
        ];

        foreach ($names as $index => $name) {
            Feature::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'category' => 'Condomínios', 'scope' => 'condominium', 'is_active' => true, 'sort_order' => $index],
            );
        }
    }
}
