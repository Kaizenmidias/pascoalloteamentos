<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $pageId = DB::table('pages')->where('slug', 'sobre-nos')->value('id');

        if (! $pageId) {
            return;
        }

        DB::table('pages')->where('id', $pageId)->update([
            'title' => 'Sobre nós',
            'updated_at' => now(),
        ]);

        $sections = DB::table('page_sections')
            ->where('page_id', $pageId)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $existingByType = $sections->groupBy('type');
        $now = now();
        $definitions = [
            'history' => [
                'label' => 'Uma história',
                'title' => 'Uma história construída com trabalho, confiança e visão de futuro.',
                'content' => "A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmãos Edson Pascoal e Hudson Paes Pascoal, com o propósito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades. Desde o início, cada projeto é conduzido com qualidade, planejamento e responsabilidade.\n\nAo longo de mais de 20 anos de atuação, a empresa consolidou sua presença na região, conquistando a confiança de clientes, investidores e parceiros por meio de um trabalho pautado na transparência, credibilidade e excelência em cada etapa do desenvolvimento imobiliário.\n\nHoje, seguimos construindo uma história sólida, desenvolvendo empreendimentos que geram oportunidades, valorização e qualidade de vida para milhares de famílias, sempre mantendo os valores que nos trouxeram até aqui e olhando para o futuro com a mesma dedicação do primeiro projeto.",
                'image' => '/reference-assets/about-team.webp',
            ],
            'numbers' => [
                'label' => 'Nossos números',
                'content' => [
                    ['prefix' => '+', 'value' => '20', 'suffix' => 'anos', 'description' => 'de experiência no mercado.'],
                    ['prefix' => '', 'value' => '2', 'suffix' => 'cidades', 'description' => 'com empreendimentos desenvolvidos.'],
                    ['prefix' => '', 'value' => '2', 'suffix' => 'distritos', 'description' => 'atendidos.'],
                ],
            ],
            'purpose' => [
                'title' => 'Nosso Propósito',
                'content' => "Mais do que desenvolver loteamentos, construímos oportunidades.\n\nSabemos que adquirir um terreno ou investir em um empreendimento é uma das decisões mais importantes da vida de uma família.\n\nPor isso, cada projeto nasce com planejamento, responsabilidade e uma visão de longo prazo, oferecendo infraestrutura completa e soluções que promovem qualidade de vida, segurança e valorização patrimonial.\n\nNosso compromisso é entregar muito mais do que um espaço urbano: queremos contribuir para que pessoas construam histórias, conquistem patrimônio e realizem sonhos.",
                'image' => '/reference-assets/about-purpose.webp',
            ],
            'mission' => [
                'title' => 'Missão',
                'content' => 'Desenvolver empreendimentos planejados com qualidade, segurança e infraestrutura completa, proporcionando valorização, bem-estar e qualidade de vida aos nossos clientes.',
                'image' => '/reference-assets/blog-city.jpg',
            ],
            'vision' => [
                'title' => 'Visão',
                'content' => 'Ser referência em loteamentos e empreendimentos imobiliários no Oeste do Paraná, reconhecida pela excelência, credibilidade e desenvolvimento sustentável.',
                'image' => '/reference-assets/about-plans.jpg',
            ],
            'values' => [
                'title' => 'Valores',
                'content' => 'Nossos valores se refletem no compromisso com a qualidade, no respeito às pessoas, na transparência das relações e na responsabilidade em cada empreendimento que desenvolvemos.',
                'image' => '/reference-assets/about-meeting.jpg',
            ],
            'differential' => [
                'title' => 'Nosso Diferencial',
                'content' => "Cada empreendimento é desenvolvido pensando no futuro.\n\nDesde a escolha da localização até a entrega da infraestrutura, cada etapa é conduzida por uma equipe comprometida com a qualidade, segurança e valorização do investimento de nossos clientes.\n\nAcreditamos que bons empreendimentos não apenas transformam terrenos, mas impulsionam o crescimento urbano, movimentam a economia local e melhoram a qualidade de vida das pessoas.\n\nÉ essa visão que nos motiva diariamente a desenvolver projetos que deixem um legado positivo para as próximas gerações.",
                'image' => '/reference-assets/about-team.webp',
            ],
            'cta' => [
                'title' => 'Vamos construir o próximo capítulo dessa história juntos.',
                'content' => 'Se você procura um loteamento para morar, investir ou desenvolver seu patrimônio com segurança, conte com a experiência e a credibilidade da Pascoal Loteamentos.',
                'button_label' => 'Conheça nossos empreendimentos',
                'button_url' => '/imoveis',
            ],
        ];

        DB::transaction(function () use ($pageId, $existingByType, $definitions, $now): void {
            foreach ($definitions as $type => $definition) {
                $sortOrder = array_search($type, array_keys($definitions), true);
                $existing = $existingByType->get($type)?->first();
                $existingData = $existing ? json_decode($existing->data ?: '[]', true) : [];
                $data = array_filter(array_merge($existingData ?: [], $definition), static fn ($value) => $value !== null);

                if ($existing && ! empty($existingData['image'])) {
                    $data['image'] = $existingData['image'];
                }

                $payload = [
                    'type' => $type,
                    'data' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'sort_order' => $sortOrder + 1,
                    'is_active' => true,
                    'updated_at' => $now,
                ];

                if ($existing) {
                    DB::table('page_sections')->where('id', $existing->id)->update($payload);
                } else {
                    DB::table('page_sections')->insert(array_merge($payload, [
                        'page_id' => $pageId,
                        'created_at' => $now,
                    ]));
                }
            }

            $canonicalIds = DB::table('page_sections')
                ->where('page_id', $pageId)
                ->whereIn('type', array_keys($definitions))
                ->orderBy('id')
                ->get()
                ->groupBy('type')
                ->map(fn ($group) => $group->first()->id)
                ->values();

            DB::table('page_sections')
                ->where('page_id', $pageId)
                ->where('type', '!=', 'hero')
                ->whereNotIn('id', $canonicalIds)
                ->update([
                    'is_active' => false,
                    'updated_at' => $now,
                ]);
        });
    }

    public function down(): void
    {
        // Content normalization is intentionally not reversed.
    }
};
