// The probe caches its answer in module state, so each case needs a freshly imported module.
async function loadProbe(): Promise<() => boolean | null> {
    vi.resetModules();
    return (await import('./browser'))._isRealCssEngine;
}

describe('_isRealCssEngine', () => {
    const nativeClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')!;

    /** Stands in for a CSS engine: resolves the custom property the probe declares its width with. */
    function installCssEngine(rootWidth: number): void {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
            configurable: true,
            get(this: HTMLElement) {
                if (this === document.documentElement) {
                    return rootWidth;
                }
                if (rootWidth === 0) {
                    return 0;
                }
                const variable = /^var\((--[\w-]+)\)$/.exec(this.style.width)?.[1];
                const declared = variable && this.parentElement?.style.getPropertyValue(variable);
                return declared ? Number.parseFloat(declared) : 0;
            },
        });
    }

    afterEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', nativeClientWidth);
    });

    test('reports no engine in a headless DOM', async () => {
        const isRealCssEngine = await loadProbe();

        expect(isRealCssEngine()).toBe(false);
    });

    test('reports an engine that resolves the probe width', async () => {
        installCssEngine(1000);
        const isRealCssEngine = await loadProbe();

        expect(isRealCssEngine()).toBe(true);
    });

    test('re-probes after an unlaid-out document root gains layout', async () => {
        installCssEngine(0);
        const isRealCssEngine = await loadProbe();

        expect(isRealCssEngine()).toBe(false);

        installCssEngine(1000);

        expect(isRealCssEngine()).toBe(true);
    });

    test('keeps a positive answer once the document root loses layout', async () => {
        installCssEngine(1000);
        const isRealCssEngine = await loadProbe();

        expect(isRealCssEngine()).toBe(true);

        installCssEngine(0);

        expect(isRealCssEngine()).toBe(true);
    });
});
