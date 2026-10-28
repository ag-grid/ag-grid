import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { eachFrameworkList, hasExamplePage, readExampleFrameworks } from './exampleFrameworks';

describe('eachFrameworkList', () => {
    test.each([
        [
            'an archive run runs vanilla only, whatever the variants',
            { archive: true, pinned: null, allVariants: true },
            ['vanilla'],
        ],
        [
            'an archive run pinned to another framework runs none',
            { archive: true, pinned: 'angular', allVariants: false },
            [],
        ],
        [
            'a run pinned to a framework runs that one',
            { archive: false, pinned: 'angular', allVariants: false },
            ['angular'],
        ],
        [
            'a run pinned to the React development build runs none',
            { archive: false, pinned: 'reactFunctionalTs_Dev', allVariants: false },
            [],
        ],
        [
            'a local run skips the production React build',
            { archive: false, pinned: null, allVariants: false },
            ['typescript', 'vanilla', 'reactFunctionalTs_Dev', 'angular', 'vue3'],
        ],
        [
            'a run with every variant runs both React builds',
            { archive: false, pinned: null, allVariants: true },
            ['typescript', 'vanilla', 'reactFunctionalTs', 'reactFunctionalTs_Dev', 'angular', 'vue3'],
        ],
    ] as const)('%s', (_, run, expected) => {
        expect(eachFrameworkList(run)).toEqual(expected);
    });
});

describe('readExampleFrameworks', () => {
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), 'example-frameworks-'));
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    /** The URL of a spec whose example folder holds this `exampleConfig.json`, or none. */
    const specBeside = async (config?: string) => {
        if (config !== undefined) {
            await writeFile(join(dir, 'exampleConfig.json'), config);
        }
        return pathToFileURL(join(dir, 'example.spec.ts')).href;
    };

    test('reads the frameworks the example config lists, an empty list included', async () => {
        expect(readExampleFrameworks(await specBeside('{ "supportedFrameworks": ["angular", "vue3"] }'))).toEqual(
            new Set(['angular', 'vue3'])
        );
        expect(readExampleFrameworks(await specBeside('{ "supportedFrameworks": [] }'))).toEqual(new Set());
    });

    test.each([
        ['no example config', undefined],
        ['an example config without supportedFrameworks', '{ "enterprise": true }'],
    ])('allows every framework for %s', async (_, config) => {
        expect(readExampleFrameworks(await specBeside(config))).toBeUndefined();
    });

    test.each([
        ['does not parse', (config: string) => writeFile(config, '{ "supportedFrameworks": ['), SyntaxError],
        ['cannot be read', (config: string) => mkdir(config), /EISDIR/],
    ])('fails on an example config that %s, rather than declaring every framework', async (_, plant, error) => {
        await plant(join(dir, 'exampleConfig.json'));

        expect(() => readExampleFrameworks(pathToFileURL(join(dir, 'example.spec.ts')).href)).toThrow(error);
    });
});

describe('hasExamplePage', () => {
    test('every framework without a list, only the listed ones with one, the React development build by its page', () => {
        const frameworks = new Set(['reactFunctionalTs', 'angular']);

        expect(hasExamplePage(undefined, 'vanilla')).toBe(true);
        expect(hasExamplePage(frameworks, 'angular')).toBe(true);
        expect(hasExamplePage(frameworks, 'vanilla')).toBe(false);
        expect(hasExamplePage(frameworks, 'reactFunctionalTs_Dev')).toBe(true);
        expect(hasExamplePage(new Set(['angular']), 'reactFunctionalTs_Dev')).toBe(false);
    });
});
