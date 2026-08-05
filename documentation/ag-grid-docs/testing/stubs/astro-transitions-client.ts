/**
 * Test stub for `astro:transitions/client`, a virtual module supplied by Astro's Vite plugin
 * that vitest does not load. Astro's own implementation cannot be aliased in instead: it
 * transitively imports the plugin-only `virtual:astro:adapter-config/client`.
 *
 * Components importing this are only rendered to static markup in tests, so navigation is
 * never invoked. Spy on `navigate` if a test ever needs to assert on it.
 */
export function navigate(href: string): void {
    throw new Error(`navigate('${href}') was called under test; astro:transitions/client is stubbed.`);
}
