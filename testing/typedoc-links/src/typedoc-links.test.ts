import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Application, type LogLevel, Logger, TSConfigReader } from 'typedoc';
import { describe, expect, it } from 'vitest';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(thisDir, '..');
const repoRoot = path.resolve(projectRoot, '../..');

interface Package {
    name: string;
    entryPoint: string;
    tsconfig: string;
}

const PACKAGES: Package[] = [
    {
        name: 'ag-grid-community',
        entryPoint: path.join(repoRoot, 'packages/ag-grid-community/dist/types/src/main.d.ts'),
        tsconfig: path.join(projectRoot, 'tsconfig.community.json'),
    },
    {
        name: 'ag-grid-enterprise',
        entryPoint: path.join(repoRoot, 'packages/ag-grid-enterprise/dist/types/src/main.d.ts'),
        tsconfig: path.join(projectRoot, 'tsconfig.enterprise.json'),
    },
];

/** Collects every message TypeDoc logs so we can assert on link-resolution warnings. */
class CapturingLogger extends Logger {
    public readonly messages: string[] = [];

    public override log(message: string, level: LogLevel): void {
        this.messages.push(message);
        super.log(message, level);
    }
}

/** Runs TypeDoc against a package's built declarations and returns every "Failed to resolve link" warning. */
async function getUnresolvedLinks(pkg: Package): Promise<string[]> {
    const logger = new CapturingLogger();
    const app = await Application.bootstrap(
        {
            entryPoints: [pkg.entryPoint],
            tsconfig: pkg.tsconfig,
            // Resolve and validate links without type-checking the declarations or writing HTML.
            skipErrorChecking: true,
            emit: 'none',
            // Only care about link resolution here. `notExported`/`notDocumented` would flag the
            // many intentional internal (`_`-prefixed) API types and drown the real signal.
            validation: {
                invalidLink: true,
                notExported: false,
                notDocumented: false,
            },
        },
        [new TSConfigReader()]
    );
    app.logger = logger;

    const project = await app.convert();
    if (project) {
        // Link resolution warnings are emitted during validation, not conversion.
        app.validate(project);
    }

    return logger.messages.filter((message) => message.includes('Failed to resolve link'));
}

describe('published .d.ts JSDoc {@link} references', () => {
    it.each(PACKAGES)('$name built declarations exist (run `nx build:types` first)', ({ entryPoint }) => {
        expect(existsSync(entryPoint), `Missing ${entryPoint}`).toBe(true);
    });

    // A {@link} target that TypeDoc cannot resolve emits "Failed to resolve link" for every
    // downstream consumer generating API docs from our published types. The usual cause is a
    // reference to a symbol not exported from that package (e.g. an ag-grid-enterprise export
    // referenced from ag-grid-community). Reference such symbols as inline code instead.
    it.each(PACKAGES)('$name has no unresolved {@link} references', async (pkg) => {
        const unresolved = await getUnresolvedLinks(pkg);
        expect(unresolved).toEqual([]);
    });
});
