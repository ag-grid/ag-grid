#!/usr/bin/env tsx
/* eslint-disable no-console */
import { readFile, stat, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Validates that framework-agnostic files in hand-authored `provided/` example variants stay in
 * lockstep with their vanilla counterpart.
 *
 * The example generator treats `provided/` as all-or-nothing per framework: when
 * `provided/<framework>/` exists, generation from the vanilla source is skipped entirely and only
 * the files in that folder are used. Root files are never merged in, so any file a framework needs
 * must be duplicated into every variant by hand. Nothing currently detects a variant that was
 * missed or edited in isolation, and such drift has reached production before now.
 *
 * This guard closes that gap for the files declared in SHARED_EXAMPLE_FILES below. It is
 * deliberately opt-in per example rather than repo-wide: examples not listed here are unchecked,
 * so a passing run is not a claim that the whole docs tree is drift-free.
 *
 * Pass `--fix` to copy the vanilla source over every variant instead of reporting, which is the
 * intended workflow after editing a shared file: edit the vanilla source, then sync.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXAMPLES_ROOT = join(__dirname, '..', 'src', 'content', 'docs');

const FRAMEWORK_VARIANTS = ['angular', 'reactFunctionalTs', 'vue3'] as const;

/**
 * Per-example list of files that must be byte-identical (after normalisation) between the vanilla
 * root and every `provided/` variant. Only list files with no framework-specific content — a
 * framework component, cell renderer or entry point belongs in neither this list nor a shared file.
 */
const SHARED_EXAMPLE_FILES: Record<string, string[]> = {
    'ai-toolkit/_examples/natural-language-grid-state': ['chatgptApi.ts', 'columnDefOperations.ts', 'gridOptions.ts'],
    'ai-toolkit/_examples/tool-panel-chat-assistant': [
        'chatgptApi.ts',
        'columnDefOperations.ts',
        'generateTransactions.ts',
        'gridOptions.ts',
        'systemPrompt.ts',
    ],
};

interface Drift {
    example: string;
    file: string;
    variant: string;
    reason: string;
}

/**
 * TypeScript requires a trailing comma to disambiguate a generic type parameter from a JSX tag in
 * `.tsx` files (`<T,>` rather than `<T>`), so that difference is expected and not drift.
 */
function normalise(source: string): string {
    return source.replace(/<([A-Za-z_$][\w$]*),>/g, '<$1>');
}

/**
 * Inverse of `normalise` when writing the vanilla source into a variant. Shared files contain no
 * JSX by definition, so a bare `<T>(` can only be a generic parameter list needing the trailing
 * comma that `.tsx` requires.
 */
function toVariantSource(source: string, variant: string): string {
    if (variant === 'reactFunctionalTs') {
        return source.replace(/<([A-Za-z_$][\w$]*)>\(/g, '<$1,>(');
    }
    return source;
}

async function readIfPresent(path: string): Promise<string | undefined> {
    try {
        const stats = await stat(path);
        if (!stats.isFile()) {
            return undefined;
        }
        return (await readFile(path)).toString();
    } catch {
        return undefined;
    }
}

function variantFileName(fileName: string, variant: string): string {
    if (variant === 'reactFunctionalTs') {
        return fileName.replace(/\.ts$/, '.tsx');
    }
    return fileName;
}

async function validateSharedExampleFiles(fix = false): Promise<{ drift: Drift[]; fixed: string[] }> {
    const drift: Drift[] = [];
    const fixed: string[] = [];
    const examples = Object.keys(SHARED_EXAMPLE_FILES);

    console.log(`📁 Checking ${examples.length} example(s) with declared shared files\n`);

    for (const example of examples) {
        const exampleDir = join(EXAMPLES_ROOT, example);
        const sharedFiles = SHARED_EXAMPLE_FILES[example];

        for (const fileName of sharedFiles) {
            const rootSource = await readIfPresent(join(exampleDir, fileName));
            if (rootSource === undefined) {
                drift.push({
                    example,
                    file: fileName,
                    variant: '(vanilla root)',
                    reason: 'declared as shared but missing from the example root',
                });
                continue;
            }

            for (const variant of FRAMEWORK_VARIANTS) {
                const variantDir = join(exampleDir, 'provided', variant);

                // A framework with no `provided/` folder is generated from the vanilla source, so
                // there is nothing to keep in sync for it.
                const variantExists = await stat(variantDir).then(
                    (s) => s.isDirectory(),
                    () => false
                );
                if (!variantExists) {
                    continue;
                }

                const variantFile = variantFileName(fileName, variant);
                const variantPath = join(variantDir, variantFile);
                const variantSource = await readIfPresent(variantPath);
                const isMissing = variantSource === undefined;

                if (!isMissing && normalise(variantSource) === normalise(rootSource)) {
                    continue;
                }

                if (fix) {
                    await writeFile(variantPath, toVariantSource(rootSource, variant));
                    fixed.push(`${example}/provided/${variant}/${variantFile}`);
                    continue;
                }

                drift.push({
                    example,
                    file: fileName,
                    variant,
                    reason: isMissing
                        ? `missing — expected provided/${variant}/${variantFile}`
                        : `differs from the vanilla ${fileName}`,
                });
            }
        }
    }

    return { drift, fixed };
}

async function main() {
    const fix = process.argv.includes('--fix');

    console.log(
        fix
            ? '🚀 Syncing shared example files into provided/ variants...\n'
            : '🚀 Validating shared example files across provided/ variants...\n'
    );

    try {
        const { drift, fixed } = await validateSharedExampleFiles(fix);

        if (fix) {
            if (fixed.length > 0) {
                console.log('🔧 Updated:\n');
                fixed.forEach((path) => console.log(`   - ${path}`));
                console.log('');
            }
            if (drift.length > 0) {
                console.log('❌ Could not be fixed automatically:\n');
                for (const { example, file, variant, reason } of drift) {
                    console.log(`   - ${example}/${file} [${variant}]: ${reason}`);
                }
                console.log('');
                process.exit(1);
            }
            console.log(
                fixed.length > 0
                    ? `✅ Synced ${fixed.length} file(s). Run nx format before committing. 🎉`
                    : '✅ Already in sync, nothing to do. 🎉'
            );
            process.exit(0);
        }

        if (drift.length > 0) {
            console.log('❌ Shared example files have drifted:\n');
            for (const { example, file, variant, reason } of drift) {
                console.log(`   - ${example}/${file} [${variant}]: ${reason}`);
            }
            console.log(
                '\n💡 These files carry no framework-specific content, so every provided/ variant must' +
                    '\n   match the vanilla root exactly. Re-run with --fix to copy the vanilla file over' +
                    '\n   each variant, or remove the file from SHARED_EXAMPLE_FILES in this script if it' +
                    '\n   has genuinely diverged by design.\n'
            );
            process.exit(1);
        }

        console.log('✅ All declared shared example files are in sync! 🎉');
        process.exit(0);
    } catch (error) {
        console.error('💥 Error during validation:', error);
        process.exit(1);
    }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { validateSharedExampleFiles };
