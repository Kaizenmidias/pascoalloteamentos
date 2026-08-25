<?php

namespace App\Support;

final class HomeContent
{
    public static function hero(mixed $value, bool $includeFallbackSlide = true): array
    {
        $hero = self::toArray($value);
        $slides = self::toList($hero['slides'] ?? []);
        $slides = array_values(array_filter(array_map(
            fn (mixed $slide, int $index) => self::slide($slide, $index),
            $slides,
            array_keys($slides),
        )));

        usort($slides, fn (array $left, array $right) => $left['sort_order'] <=> $right['sort_order']);
        $slides = array_values(array_map(function (array $slide, int $index): array {
            $slide['sort_order'] = $index;

            return $slide;
        }, $slides, array_keys($slides)));

        if ($slides === [] && $includeFallbackSlide) {
            $slides = [self::fallbackSlide()];
        }

        return [
            'title' => self::text($hero['title'] ?? null, 'Encontre o lugar onde sua próxima história começa.'),
            'description' => self::text($hero['description'] ?? null, 'Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor.'),
            'slides' => $slides,
        ];
    }

    public static function differentials(mixed $value): array
    {
        $items = array_values(array_filter(array_map(function (mixed $item): ?array {
            $item = self::toArray($item);
            $title = self::text($item['title'] ?? ($item[0] ?? null));
            $text = self::text($item['text'] ?? ($item['description'] ?? ($item[1] ?? null)));

            return $title !== '' || $text !== '' ? ['title' => $title, 'text' => $text] : null;
        }, self::toList($value))));

        return $items ?: self::defaultDifferentials();
    }

    public static function numbers(mixed $value): array
    {
        $defaults = self::defaultNumbers();
        $items = self::toList($value);

        return array_map(function (array $fallback, int $index) use ($items): array {
            $item = self::toArray($items[$index] ?? []);

            return [
                'value' => self::text($item['value'] ?? null, $fallback['value']),
                'title' => self::text($item['title'] ?? null, $fallback['title']),
                'description' => self::text($item['description'] ?? null, $fallback['description']),
            ];
        }, $defaults, array_keys($defaults));
    }

    public static function defaultNumbers(): array
    {
        return [
            ['value' => '20+', 'title' => 'Anos de experiência', 'description' => 'de atuação no mercado.'],
            ['value' => '15+', 'title' => 'Empreendimentos', 'description' => 'entregues com excelência.'],
            ['value' => '2+', 'title' => 'Cidades', 'description' => 'com presença consolidada.'],
            ['value' => '2', 'title' => 'Distritos', 'description' => 'atendidos pela empresa.'],
        ];
    }

    private static function slide(mixed $value, int $index): ?array
    {
        $slide = self::toArray($value);
        if ($slide === []) {
            return null;
        }

        $image = self::imageUrl($slide['image'] ?? ($slide['url'] ?? null));
        $mobileImage = self::imageUrl($slide['mobile_image'] ?? null);
        $mediaId = self::positiveInteger($slide['media_id'] ?? null);
        $mobileMediaId = self::positiveInteger($slide['mobile_media_id'] ?? null);

        return [
            'image' => $image,
            'mobile_image' => $mobileImage,
            'media_id' => $mediaId,
            'mobile_media_id' => $mobileMediaId,
            'title' => self::text($slide['title'] ?? null),
            'excerpt' => self::text($slide['excerpt'] ?? ($slide['subtitle'] ?? ($slide['description'] ?? null))),
            'button_text' => self::text($slide['button_text'] ?? null),
            'button_url' => self::text($slide['button_url'] ?? null),
            'sort_order' => max(0, (int) ($slide['sort_order'] ?? $slide['order'] ?? $index)),
            'is_active' => self::boolean($slide['is_active'] ?? true),
        ];
    }

    private static function fallbackSlide(): array
    {
        return [
            'image' => '/reference-assets/hero-home.jpg',
            'mobile_image' => '',
            'media_id' => null,
            'mobile_media_id' => null,
            'title' => '',
            'excerpt' => '',
            'button_text' => '',
            'button_url' => '',
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    private static function defaultDifferentials(): array
    {
        return [
            ['title' => 'Arquitetura autoral', 'text' => 'Projetos exclusivos desenvolvidos para unir estética, funcionalidade e conforto.'],
            ['title' => 'Localizações estratégicas', 'text' => 'Empreendimentos em regiões com alto potencial de valorização.'],
            ['title' => 'Sustentabilidade', 'text' => 'Práticas conscientes e soluções inteligentes para reduzir impactos ambientais.'],
            ['title' => 'Alto padrão construtivo', 'text' => 'Materiais selecionados e processos rigorosos para garantir qualidade.'],
            ['title' => 'Equipe especializada', 'text' => 'Profissionais experientes dedicados a entregar projetos com eficiência.'],
            ['title' => 'Atendimento personalizado', 'text' => 'Relacionamento próximo, transparente e focado em compreender cada cliente.'],
        ];
    }

    private static function toList(mixed $value): array
    {
        $array = self::toArray($value);

        return array_is_list($array) ? $array : [];
    }

    private static function toArray(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_object($value)) {
            return get_object_vars($value);
        }

        if (is_string($value) && trim($value) !== '') {
            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    private static function imageUrl(mixed $value): string
    {
        if (is_array($value)) {
            $value = $value['url'] ?? '';
        } elseif (is_object($value)) {
            $value = $value->url ?? '';
        }

        return self::text($value);
    }

    private static function text(mixed $value, string $fallback = ''): string
    {
        if (! is_scalar($value) && $value !== null) {
            return $fallback;
        }

        $value = trim((string) $value);

        return $value !== '' ? $value : $fallback;
    }

    private static function positiveInteger(mixed $value): ?int
    {
        $value = filter_var($value, FILTER_VALIDATE_INT);

        return $value !== false && $value > 0 ? $value : null;
    }

    private static function boolean(mixed $value): bool
    {
        if (is_string($value)) {
            return ! in_array(strtolower(trim($value)), ['', '0', 'false', 'off', 'no'], true);
        }

        return (bool) $value;
    }
}
