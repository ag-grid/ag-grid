// Bundled SVG markup for the Bryntum campaign pages. Keys are paths relative to
// `./svg/` (e.g. 'heroes/gantt.svg', 'brands/brand-1.svg'); values are the raw
// SVG markup read at build time by Vite's `?raw` import.
const svgModules = import.meta.glob('./svg/**/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>;

export function getBryntumSvg(src: string): string | undefined {
    return svgModules[`./svg/${src}`];
}
