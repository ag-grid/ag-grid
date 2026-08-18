import {
    DEVELOPMENT_FLAGS,
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_PARAM,
    FRAMEWORK_VERSION_PATTERN,
    FRAMEWORK_VERSION_PLACEHOLDER,
    IMPORT_MAP_OPTIONS_ID,
    PRODUCTION_FLAGS,
    PROD_PARAM,
} from '@utils/exampleModules/getImportMap';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

const INJECTOR_PATH = join(__dirname, '../../../../../public/example-runner/inject-import-map.js');
const injectorSource = readFileSync(INJECTOR_PATH, 'utf8');

const IMPORTS = {
    react: `https://esm.sh/react@${FRAMEWORK_VERSION_PLACEHOLDER}${DEV_FLAG_PLACEHOLDERS.query}`,
};

const stubPage = (
    search: string,
    {
        nonce,
        imports = IMPORTS,
        template,
        defaultProd,
    }: {
        nonce?: string;
        imports?: Record<string, string>;
        template?: string;
        defaultProd?: boolean;
    } = {}
) => {
    const head: any[] = [];
    const body: any[] = [];
    const options = JSON.stringify({
        ...(template === undefined ? { imports } : { template }),
        defaultVersion: '19.2.1',
        ...(defaultProd === undefined ? {} : { defaultProd }),
    });

    vi.stubGlobal('window', { location: { search } });
    vi.stubGlobal('document', {
        currentScript: nonce === undefined ? null : { nonce },
        getElementById: (id: string) => (id === IMPORT_MAP_OPTIONS_ID ? { textContent: options } : null),
        createElement: (tagName: string) => {
            const element = { tagName, attributes: {} as Record<string, string>, setAttribute: undefined as any };
            element.setAttribute = (name: string, value: string) => (element.attributes[name] = value);
            return element;
        },
        head: { appendChild: (element: any) => head.push(element) },
        body: { appendChild: (element: any) => body.push(element) },
    });

    return { head, body };
};

const injectImportMap = () => new Function(injectorSource)();

const registeredImports = (head: any[]) => JSON.parse(head[0].textContent).imports;

afterEach(() => vi.unstubAllGlobals());

describe('inject-import-map.js', () => {
    test('registers the pinned version when the URL requests none', () => {
        const { head } = stubPage('?enableTestIds=true', { defaultProd: true });

        injectImportMap();

        expect(head).toHaveLength(1);
        expect(head[0].type).toBe('importmap');
        expect(registeredImports(head).react).toBe('https://esm.sh/react@19.2.1');
    });

    test('registers the version the URL requests', () => {
        const { head } = stubPage('?version=18.3.1');

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@18.3.1');
    });

    test('registers the production build unless the URL asks for the development one', () => {
        const { head } = stubPage('?prod=true');

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@19.2.1');
    });

    test("registers the page's default build when the URL asks for neither", () => {
        const { head } = stubPage('?enableTestIds=true', { defaultProd: false });

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@19.2.1?dev');
    });

    test('falls back to the production build for a page that names no default', () => {
        const { head } = stubPage('');

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@19.2.1');
    });

    test('overrides a page defaulting to the development build with prod=true', () => {
        const { head } = stubPage('?prod=true', { defaultProd: false });

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@19.2.1');
    });

    test('registers the development build for prod=false', () => {
        const { head } = stubPage('?prod=false&version=18.3.1');

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@18.3.1?dev');
    });

    test('leaves a map with no build-dependent entries alone when asked for the development build', () => {
        const imports = { vue: `https://cdn/vue@${FRAMEWORK_VERSION_PLACEHOLDER}/vue.js` };
        const { head } = stubPage('?prod=false', { imports });

        injectImportMap();

        expect(registeredImports(head).vue).toBe('https://cdn/vue@19.2.1/vue.js');
    });

    test('reads a page carrying the map as a JSON string, from before it carried an object', () => {
        const { head } = stubPage('?version=18.3.1', { template: JSON.stringify({ imports: IMPORTS }) });

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@18.3.1');
    });

    test('takes the nonce of the script running it, for a page whose CSP allows only nonces', () => {
        const { head } = stubPage('', { nonce: 'test-nonce' });

        injectImportMap();

        expect(head[0].nonce).toBe('test-nonce');
    });

    test('registers no nonce when the page has none', () => {
        const { head } = stubPage('');

        injectImportMap();

        expect(head[0].nonce).toBeUndefined();
    });

    test('fails visibly rather than falling back when the version is not a version', () => {
        const { head, body } = stubPage('?version=latest');

        expect(() => injectImportMap()).toThrowError(/not a valid \?version= value/);

        expect(head).toHaveLength(0);
        expect(body[0].textContent).toContain('latest');
    });

    test('fails the same way for an empty version, rather than taking it as absent', () => {
        const { head } = stubPage('?version=');

        expect(() => injectImportMap()).toThrowError(/not a valid \?version= value/);

        expect(head).toHaveLength(0);
    });

    describe('carries the same constants the map is rendered with', () => {
        const literal = (name: string) => {
            const match = injectorSource.match(new RegExp(`const ${name} = ('[^']*');`));
            expect(match, `${name} not found in inject-import-map.js`).not.toBeNull();
            return new Function(`return ${match![1]}`)() as string;
        };

        test.each([
            ['OPTIONS_ID', IMPORT_MAP_OPTIONS_ID],
            ['VERSION_PARAM', FRAMEWORK_VERSION_PARAM],
            ['PROD_PARAM', PROD_PARAM],
            ['VERSION_PLACEHOLDER', FRAMEWORK_VERSION_PLACEHOLDER],
        ])('%s', (name, expected) => {
            expect(literal(name)).toBe(expected);
        });

        test('VERSION_PATTERN', () => {
            expect(literal('VERSION_PATTERN')).toBe(FRAMEWORK_VERSION_PATTERN.source);
        });

        test('BUILD_TOKENS', () => {
            const tokens = injectorSource.match(/const BUILD_TOKENS = (\{[\s\S]*?\n {4}\});/);
            expect(tokens, 'BUILD_TOKENS not found in inject-import-map.js').not.toBeNull();

            expect(new Function(`return ${tokens![1]}`)()).toEqual({
                production: {
                    [DEV_FLAG_PLACEHOLDERS.query]: PRODUCTION_FLAGS.query,
                    [DEV_FLAG_PLACEHOLDERS.appended]: PRODUCTION_FLAGS.appended,
                },
                development: {
                    [DEV_FLAG_PLACEHOLDERS.query]: DEVELOPMENT_FLAGS.query,
                    [DEV_FLAG_PLACEHOLDERS.appended]: DEVELOPMENT_FLAGS.appended,
                },
            });
        });
    });
});
