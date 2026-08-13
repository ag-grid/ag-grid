import { DEV_FLAG_PLACEHOLDERS, FRAMEWORK_VERSION_PLACEHOLDER, injectImportMap } from './injectImportMap';

const OPTIONS = {
    template: JSON.stringify({
        imports: {
            react: `https://esm.sh/react@${FRAMEWORK_VERSION_PLACEHOLDER}${DEV_FLAG_PLACEHOLDERS.query}`,
        },
    }),
    buildTokens: {
        production: { [DEV_FLAG_PLACEHOLDERS.query]: '', [DEV_FLAG_PLACEHOLDERS.appended]: '' },
        development: { [DEV_FLAG_PLACEHOLDERS.query]: '?dev', [DEV_FLAG_PLACEHOLDERS.appended]: '&dev' },
    },
    defaultVersion: '19.2.1',
    placeholder: FRAMEWORK_VERSION_PLACEHOLDER,
    versionParam: 'version',
    versionPattern: /^\d+\.\d+\.\d+(?:[-+][\w.-]+)*$/.source,
    prodParam: 'prod',
};

/**
 * The function runs in the example page, so the test supplies the pieces of the page it
 * touches: the URL it reads the version from and the elements it appends.
 */
const stubPage = (search: string, nonce?: string) => {
    const elements: any[] = [];
    const head: any[] = [];
    const body: any[] = [];

    vi.stubGlobal('window', { location: { search } });
    vi.stubGlobal('document', {
        currentScript: nonce === undefined ? null : { nonce },
        createElement: (tagName: string) => {
            const element = { tagName, attributes: {} as Record<string, string>, setAttribute: undefined as any };
            element.setAttribute = (name: string, value: string) => (element.attributes[name] = value);
            elements.push(element);
            return element;
        },
        head: { appendChild: (element: any) => head.push(element) },
        body: { appendChild: (element: any) => body.push(element) },
    });

    return { head, body };
};

afterEach(() => vi.unstubAllGlobals());

describe('injectImportMap', () => {
    test('registers the pinned version when the URL requests none', () => {
        const { head } = stubPage('?enableTestIds=true');

        injectImportMap(OPTIONS);

        expect(head).toHaveLength(1);
        expect(head[0].type).toBe('importmap');
        expect(JSON.parse(head[0].textContent).imports.react).toBe('https://esm.sh/react@19.2.1');
    });

    test('registers the version the URL requests', () => {
        const { head } = stubPage('?version=18.3.1');

        injectImportMap(OPTIONS);

        expect(JSON.parse(head[0].textContent).imports.react).toBe('https://esm.sh/react@18.3.1');
    });

    test('registers the production build unless the URL asks for the development one', () => {
        const { head } = stubPage('?prod=true');

        injectImportMap(OPTIONS);

        expect(JSON.parse(head[0].textContent).imports.react).toBe('https://esm.sh/react@19.2.1');
    });

    test('registers the development build for prod=false', () => {
        const { head } = stubPage('?prod=false&version=18.3.1');

        injectImportMap(OPTIONS);

        expect(JSON.parse(head[0].textContent).imports.react).toBe('https://esm.sh/react@18.3.1?dev');
    });

    test('leaves a map with no build-dependent entries alone when asked for the development build', () => {
        const { head } = stubPage('?prod=false');

        // Every framework but React: no build token appears, so both builds give the same map
        injectImportMap({
            ...OPTIONS,
            template: JSON.stringify({ imports: { vue: `https://cdn/vue@${FRAMEWORK_VERSION_PLACEHOLDER}/vue.js` } }),
        });

        expect(JSON.parse(head[0].textContent).imports.vue).toBe('https://cdn/vue@19.2.1/vue.js');
    });

    test('takes the nonce of the script running it, for a page whose CSP allows only nonces', () => {
        const { head } = stubPage('', 'test-nonce');

        injectImportMap(OPTIONS);

        expect(head[0].nonce).toBe('test-nonce');
    });

    test('registers no nonce when the page has none', () => {
        const { head } = stubPage('');

        injectImportMap(OPTIONS);

        expect(head[0].nonce).toBeUndefined();
    });

    test('fails visibly rather than falling back when the version is not a version', () => {
        const { head, body } = stubPage('?version=latest');

        expect(() => injectImportMap(OPTIONS)).toThrowError(/not a valid \?version= value/);

        // No map registered, so the example cannot quietly run against the pinned default
        expect(head).toHaveLength(0);
        expect(body[0].textContent).toContain('latest');
    });

    test('fails the same way for an empty version, rather than taking it as absent', () => {
        const { head } = stubPage('?version=');

        expect(() => injectImportMap(OPTIONS)).toThrowError(/not a valid \?version= value/);

        expect(head).toHaveLength(0);
    });
});
