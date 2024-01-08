<?php

namespace App\Twig;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 * Système d'assets servant de remplacement à SymfonyEncore basé sur Vite.
 */
class TwigAssetExtension extends AbstractExtension
{
    public final const CACHE_KEY = 'asset_time';
    private readonly bool $isProduction;
    private ?array $paths = null;
    private bool $polyfillLoaded = false;

    public function __construct(
        private readonly string $assetPath,
        string $env,
        private readonly CacheItemPoolInterface $cache,
        private readonly RequestStack $requestStack
    ) {
        $this->isProduction = 'prod' === $env;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('vite_entry_link_tags', $this->link(...), ['is_safe' => ['html']]),
            new TwigFunction('vite_entry_script_tags', $this->script(...), ['is_safe' => ['html']]),
        ];
    }

    /**
     * Récupère le chemin des assets depuis le fichier manifest.json.
     */
    private function getAssetPaths(): array
    {
        if (null === $this->paths) {
            $cached = $this->cache->getItem(self::CACHE_KEY);
            if (!$cached->isHit()) {
                $manifest = $this->assetPath.'/.vite/manifest.json';
                if (file_exists($manifest)) {
                    $paths = json_decode((string) file_get_contents($manifest), true, 512, JSON_THROW_ON_ERROR);
                    $this->cache->save($cached->set($paths));
                    $this->paths = $paths;
                } else {
                    $this->paths = [];
                }
            } else {
                $this->paths = $cached->get();
            }
        }

        return $this->paths;
    }

    public function link(string $name, array $attrs = []): string
    {
        $uri = $this->uri($name.'.css');
        if (strpos($uri, ':5173')) {
            return ''; // Le CSS est chargé depuis le JS dans l'environnement de dev
        }

        $attributes = implode(' ', array_map(fn ($key) => "{$key}=\"{$attrs[$key]}\"", array_keys($attrs)));

        return sprintf(
            "<link rel=\"preload\" href=\"{$this->uri($name.'.css')}\" as=\"style\"><link media=\"print\" onload=\"this.media='all'\" rel=\"stylesheet\" href=\"%s\" %s>",
            $this->uri($name.'.css'),
            empty($attrs) ? '' : (' '.$attributes)
        );
    }

    public function script(string $name): string
    {
        $script = '';

        if (!$this->isProduction) {
            $request = $this->requestStack->getCurrentRequest();

            $script = '<script type="module">
                import RefreshRuntime from "http://'.$request->getHost().':5173/assets/@react-refresh"
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
        </script>';
        }

        $script .= $this->preload($name.'.ts').'<script src="'.$this->uri($name.'.ts').'" type="module" defer></script>';


        $request = $this->requestStack->getCurrentRequest();

        if (false === $this->polyfillLoaded && $request instanceof Request) {
            $userAgent = $request->headers->get('User-Agent') ?: '';
            if (strpos($userAgent, 'Safari') &&
                !strpos($userAgent, 'Chrome')) {
                $this->polyfillLoaded = true;
                $script = <<<HTML
                    <script src="//unpkg.com/document-register-element" defer></script>
                    $script
                HTML;
            }
        }

        return $script;
    }

    /**
     * Add preload for a specific script.
     *
     * @param string $name Le nom du fichier à charger ("app.js" par exemple)
     */
    private function preload(string $name): string
    {
        if (!$this->isProduction) {
            return '';
        }

        $imports = $this->getAssetPaths()[$name]['imports'] ?? [];
        $preloads = [];

        foreach ($imports as $import) {
            $preloads[] = <<<HTML
              <link rel="modulepreload" href="{$this->uri($import)}">
            HTML;
        }

        return implode("\n", $preloads);
    }

    /**
     * Génère l'URL associé à un asset passé en paramètre.
     *
     * @param string $name Le nom du fichier à charger ("app.js" par exemple)
     */
    private function uri(string $name): string
    {

        if (!$this->isProduction) {
            $request = $this->requestStack->getCurrentRequest();

            return $request ? "http://{$request->getHost()}:5173/assets/{$name}" : '';
        }

        if (strpos($name, '.css')) {
            $name = $this->getAssetPaths()[str_replace('.css', '.ts', $name)]['css'][0] ?? '';
        } else {
            $name = $this->getAssetPaths()[$name]['file'] ?? $this->getAssetPaths()[$name] ?? '';
        }

        return "/assets/$name";
    }
}
