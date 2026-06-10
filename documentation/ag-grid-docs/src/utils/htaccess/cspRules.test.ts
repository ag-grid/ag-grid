import { getCspDirectives, getScopedCspHtaccessBlock } from './cspRules';

describe('cspRules', () => {
    describe('scope', () => {
        it("site scope omits 'unsafe-eval' from script-src", () => {
            const directives = getCspDirectives({ env: 'production', scope: 'site' });
            expect(directives['script-src']).not.toContain("'unsafe-eval'");
        });

        it("examples scope includes 'unsafe-eval' in script-src", () => {
            const directives = getCspDirectives({ env: 'production', scope: 'examples' });
            expect(directives['script-src']).toContain("'unsafe-eval'");
        });

        it("both scopes include 'wasm-unsafe-eval' for browser-side Shiki highlighting", () => {
            // Narrower than 'unsafe-eval'; the site scope relies on it for WASM.
            expect(getCspDirectives({ env: 'production', scope: 'site' })['script-src']).toContain(
                "'wasm-unsafe-eval'"
            );
            expect(getCspDirectives({ env: 'production', scope: 'examples' })['script-src']).toContain(
                "'wasm-unsafe-eval'"
            );
        });

        it('defaults to site scope', () => {
            expect(getCspDirectives({ env: 'production' })).toEqual(
                getCspDirectives({ env: 'production', scope: 'site' })
            );
        });

        it("scopes differ only by script-src 'unsafe-eval'", () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            const examples = getCspDirectives({ env: 'production', scope: 'examples' });

            expect(Object.keys(examples)).toEqual(Object.keys(site));
            const names = Object.keys(site);
            for (let i = 0, len = names.length; i < len; ++i) {
                const name = names[i];
                if (name === 'script-src') {
                    expect(examples[name]).toEqual([...site[name], "'unsafe-eval'"]);
                } else {
                    expect(examples[name]).toEqual(site[name]);
                }
            }
        });

        it("both scopes keep 'unsafe-inline' in script-src and style-src", () => {
            const site = getCspDirectives({ env: 'production', scope: 'site' });
            const examples = getCspDirectives({ env: 'production', scope: 'examples' });
            expect(site['script-src']).toContain("'unsafe-inline'");
            expect(site['style-src']).toContain("'unsafe-inline'");
            expect(examples['script-src']).toContain("'unsafe-inline'");
            expect(examples['style-src']).toContain("'unsafe-inline'");
        });
    });

    describe('getScopedCspHtaccessBlock', () => {
        it('enforce mode unsets and re-sets the enforced header inside the <If> override', () => {
            const block = getScopedCspHtaccessBlock({ env: 'production' }, 'enforce');
            const ifIndex = block.indexOf('<If');
            expect(ifIndex).toBeGreaterThan(-1);
            const ifBlock = block.slice(ifIndex);
            expect(ifBlock).toContain('Header always unset Content-Security-Policy\n');
            expect(ifBlock).toContain('Header always set Content-Security-Policy "');
        });

        it('report-only mode never unsets the enforced header', () => {
            const block = getScopedCspHtaccessBlock({ env: 'production' }, 'report-only');
            const lines = block.split('\n');
            const enforcedUnset = lines.find((l) => l.trim() === 'Header always unset Content-Security-Policy');
            expect(enforcedUnset).toBeUndefined();
            expect(block).not.toContain('Header always set Content-Security-Policy "');
            expect(block).toContain('Header always set Content-Security-Policy-Report-Only "');
        });
    });
});
