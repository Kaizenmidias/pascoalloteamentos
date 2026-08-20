<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

final class SafeRichHtml
{
    private const TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption'];

    public static function clean(?string $html): ?string
    {
        if ($html === null || trim($html) === '') return $html;
        if (! class_exists(DOMDocument::class)) {
            $allowed = strip_tags($html, '<p><br><strong><b><em><i><u><s><h2><h3><h4><ul><ol><li><blockquote><figure><figcaption>');
            return preg_replace('/<([a-z0-9]+)(?:\s[^>]*)?>/i', '<$1>', $allowed);
        }

        $document = new DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8"><div id="rich-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        $root = $document->getElementById('rich-root');
        if (! $root) return '';
        self::sanitizeChildren($root);

        return implode('', array_map(fn (DOMNode $node) => $document->saveHTML($node), iterator_to_array($root->childNodes)));
    }

    private static function sanitizeChildren(DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $node) {
            if (! $node instanceof DOMElement) continue;
            if (! in_array(strtolower($node->tagName), self::TAGS, true)) {
                while ($node->firstChild) $parent->insertBefore($node->firstChild, $node);
                $parent->removeChild($node);
                continue;
            }
            foreach (iterator_to_array($node->attributes) as $attribute) {
                if (! self::attributeAllowed($node, $attribute->name, $attribute->value)) $node->removeAttribute($attribute->name);
            }
            if ($node->tagName === 'a' && $node->hasAttribute('target')) $node->setAttribute('rel', 'noopener noreferrer');
            self::sanitizeChildren($node);
        }
    }

    private static function attributeAllowed(DOMElement $node, string $name, string $value): bool
    {
        if ($node->tagName === 'a' && in_array($name, ['href', 'target', 'rel'], true)) return $name !== 'href' || self::safeUrl($value);
        if ($node->tagName === 'img' && in_array($name, ['src', 'alt', 'width', 'height'], true)) return $name !== 'src' || self::safeUrl($value);
        if ($name === 'style') return self::safeStyle($value);
        return false;
    }

    private static function safeStyle(string $style): bool
    {
        foreach (array_filter(array_map('trim', explode(';', $style))) as $declaration) {
            if (preg_match('/^(text-align:\s*(left|center|right)|max-width:\s*100%|height:\s*auto)$/i', $declaration) !== 1) return false;
        }

        return true;
    }

    private static function safeUrl(string $url): bool
    {
        return str_starts_with($url, '/') || preg_match('/^https?:\/\//i', $url) === 1;
    }
}
