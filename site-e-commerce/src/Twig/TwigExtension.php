<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class TwigExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('icon', $this->svgIcon(...), ['is_safe' => ['html']]),
            new TwigFunction('json_decode', $this->jsonDecode(...)),
            new TwigFunction('json_encode', $this->jsonEncode(...)),
            new TwigFunction('menu_active', $this->menuActive(...), ['is_safe' => ['html'], 'needs_context' => true]),
        ];
    }

    /**
     * Génère le code HTML pour une icone SVG.
     */
    public function svgIcon(string $name, string $asset, ?int $size = null): string
    {
        $attrs = '';
        if ($size) {
            $attrs = " width=\"{$size}px\" height=\"{$size}px\"";
        }

        return <<<HTML
        <svg class="icon icon-{$name}"{$attrs}>
          <use xlink:href="/images/{$asset}.svg?logo#{$name}"></use>
        </svg>
        HTML;
    }

    /**
     * Ajoute une class is-active pour les éléments actifs du menu.
     *
     * @param array<string,mixed> $context
     */
    public function menuActive(array $context, string $name): string
    {
        if (($context['menu'] ?? null) === $name) {
            return ' aria-current="page"';
        }

        return '';
    }

    public function jsonDecode($str) {
        return json_decode((string) $str, null, 512, JSON_THROW_ON_ERROR);
    }

    public function jsonEncode($str): bool|string
    {
        return json_encode($str, JSON_THROW_ON_ERROR);
    }
}
