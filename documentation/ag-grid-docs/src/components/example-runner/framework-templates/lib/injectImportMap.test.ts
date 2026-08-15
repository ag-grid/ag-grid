import {
    DEVELOPMENT_FLAGS,
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_GLOBAL,
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

/**
 * The injector is served to the example page as it is written, so the test runs the file itself
 * rather than a module built from it -- what it asserts on is what a browser executes.
 */
const INJECTOR_PATH = join(__dirname, '../../../../../public/example-runner/inject-import-map.js');
const injectorSource = readFileSync(INJECTOR_PATH, 'utf8');

const TEMPLATE = JSON.stringify({
    imports: {
        react: `https://esm.sh/react@${FRAMEWORK_VERSION_PLACEHOLDER}${DEV_FLAG_PLACEHOLDERS.query}`,
    },
});

/**
 * The injector runs in the example page, so the test supplies the pieces of the page it touches:
 * the version and URL it resolves the version from, the block it reads the map from, and what it
 * appends.
 */
const stubPage = (
    search: string,
    {
        nonce,
        template = TEMPLATE,
        defaultProd,
        pageVersion = '19.2.1',
        defaultVersion,
    }: {
        nonce?: string;
        template?: string;
        defaultProd?: boolean;
        pageVersion?: string | null;
        defaultVersion?: string;
    } = {}
) => {
    const head: any[] = [];
    const body: any[] = [];
    // Each omitted rather than defaulted when the test names none, so that a page from before the
    // script read it can be stubbed
    const options = JSON.stringify({
        template,
        ...(defaultVersion === undefined ? {} : { defaultVersion }),
        ...(defaultProd === undefined ? {} : { defaultProd }),
    });

    vi.stubGlobal('window', {
        location: { search },
        ...(pageVersion === null ? {} : { [FRAMEWORK_VERSION_GLOBAL]: pageVersion }),
    });
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
    test('registers the version the page names when the URL requests none', () => {
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
        // The script is served from a mutable URL, so it outlives the pages that carry it
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
        // Every framework but React: no build token appears, so both builds give the same map
        const template = JSON.stringify({
            imports: { vue: `https://cdn/vue@${FRAMEWORK_VERSION_PLACEHOLDER}/vue.js` },
        });
        const { head } = stubPage('?prod=false', { template });

        injectImportMap();

        expect(registeredImports(head).vue).toBe('https://cdn/vue@19.2.1/vue.js');
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

        // No map registered, so the example cannot quietly run against the pinned default
        expect(head).toHaveLength(0);
        expect(body[0].textContent).toContain('latest');
    });

    test('fails the same way for an empty version, rather than taking it as absent', () => {
        const { head } = stubPage('?version=');

        expect(() => injectImportMap()).toThrowError(/not a valid \?version= value/);

        expect(head).toHaveLength(0);
    });

    test('registers the version the page has been edited to name', () => {
        const { head } = stubPage('', { pageVersion: '18.3.1' });

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@18.3.1');
    });

    test('lets the URL override the version the page names', () => {
        const { head } = stubPage('?version=17.0.2', { pageVersion: '18.3.1' });

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@17.0.2');
    });

    test('fails visibly when the page has been edited to a version that is not a version', () => {
        const { head, body } = stubPage('', { pageVersion: 'latest' });

        expect(() => injectImportMap()).toThrowError(
            new RegExp(`not a valid window.${FRAMEWORK_VERSION_GLOBAL} value`)
        );

        expect(head).toHaveLength(0);
        expect(body[0].textContent).toContain('latest');
    });

    test('reads the version from the map options for a page that names none of its own', () => {
        // The script is served from a mutable URL, so it outlives the pages that carry it
        const { head } = stubPage('', { pageVersion: null, defaultVersion: '18.3.1' });

        injectImportMap();

        expect(registeredImports(head).react).toBe('https://esm.sh/react@18.3.1');
    });

    /**
     * The served file cannot import the constants the map is rendered with, so it carries its own
     * copies. A page whose tokens the injector does not recognise would register a map still
     * holding placeholders, which fails as a wall of bare-specifier errors rather than as one
     * legible failure -- so the copies are checked against their source here instead.
     */
    describe('carries the same constants the map is rendered with', () => {
        // Evaluated rather than read as text, so that what is compared is the value the browser
        // ends up with rather than the escaping the source happens to use
        const literal = (name: string) => {
            const match = injectorSource.match(new RegExp(`var ${name} = ('[^']*');`));
            expect(match, `${name} not found in inject-import-map.js`).not.toBeNull();
            return new Function(`return ${match![1]}`)() as string;
        };

        test.each([
            ['OPTIONS_ID', IMPORT_MAP_OPTIONS_ID],
            ['VERSION_GLOBAL', FRAMEWORK_VERSION_GLOBAL],
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
            const tokens = injectorSource.match(/var BUILD_TOKENS = (\{[\s\S]*?\n {4}\});/);
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
