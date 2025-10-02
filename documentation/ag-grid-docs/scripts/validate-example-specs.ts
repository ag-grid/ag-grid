#!/usr/bin/env tsx

/* eslint-disable no-console */
import { readdir, stat } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

/**
 * Validates that every example folder under ag-grid-docs/src/content/docs/SECTION/_examples/EXAMPLE
 * has a corresponding spec file (matching pattern *.spec.*).
 *
 * This script is designed to be run as part of CI to ensure documentation examples
 * are properly tested.
 */ const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_ROOT = join(__dirname, '..', 'src', 'content', 'docs');
const EXAMPLES_DIR_NAME = '_examples';
const SPEC_FILE_PATTERN = /\.spec\./;

interface ValidationResult {
    totalExamples: number;
    missingSpecs: string[];
    examplesWithSpecs: number;
}

async function isDirectory(path: string): Promise<boolean> {
    try {
        const stats = await stat(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

async function findExampleDirectories(basePath: string): Promise<string[]> {
    const exampleDirs: string[] = [];

    async function traverse(currentPath: string) {
        try {
            const entries = await readdir(currentPath);

            for (const entry of entries) {
                const fullPath = join(currentPath, entry);

                if (await isDirectory(fullPath)) {
                    // If this is an _examples directory, find its subdirectories
                    if (entry === EXAMPLES_DIR_NAME) {
                        const exampleSubDirs = await readdir(fullPath);
                        for (const subDir of exampleSubDirs) {
                            const subDirPath = join(fullPath, subDir);
                            if (await isDirectory(subDirPath)) {
                                exampleDirs.push(subDirPath);
                            }
                        }
                    } else {
                        // Continue traversing for _examples directories
                        await traverse(fullPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not read directory ${currentPath}:`, error);
        }
    }

    await traverse(basePath);
    return exampleDirs;
}

function shouldSkipDirectory(dirPath: string): boolean {
    // Skip directories that are framework-specific implementations (like provided/angular, provided/react, etc.)
    // These typically don't have their own spec files
    const pathParts = dirPath.split('/');
    const isProvidedSubdir = pathParts.includes('provided');

    // Skip if it's a provided subdirectory with framework names
    if (isProvidedSubdir) {
        const lastPart = pathParts[pathParts.length - 1];
        const frameworkDirs = ['angular', 'react', 'reactFunctionalTs', 'vue3', 'vanilla', 'typescript'];
        if (frameworkDirs.includes(lastPart)) {
            return true;
        }
    }

    return false;
}

async function hasSpecFile(dirPath: string): Promise<boolean> {
    try {
        const files = await readdir(dirPath);
        return files.some((file) => SPEC_FILE_PATTERN.test(file));
    } catch {
        return false;
    }
}

async function validateExampleSpecs(): Promise<ValidationResult> {
    console.log(`🔍 Searching for example directories in: ${DOCS_ROOT}`);

    const exampleDirs = await findExampleDirectories(DOCS_ROOT);
    const filteredDirs = exampleDirs.filter((dir) => !shouldSkipDirectory(dir));

    console.log(`📁 Found ${filteredDirs.length} example directories to validate`);

    const missingSpecs: string[] = [];
    let examplesWithSpecs = 0;

    for (const exampleDir of filteredDirs) {
        const relativeDir = relative(DOCS_ROOT, exampleDir);

        if (await hasSpecFile(exampleDir)) {
            examplesWithSpecs++;
            //   console.log(`✅ ${relativeDir}`);
        } else {
            missingSpecs.push(relativeDir);

            console.log(`❌ ${relativeDir} - Missing spec file (*.spec.*)`);
        }
    }

    return {
        totalExamples: filteredDirs.length,
        missingSpecs,
        examplesWithSpecs,
    };
}

async function main() {
    console.log('🚀 Starting example spec validation...\n');

    try {
        const result = await validateExampleSpecs();

        console.log('\n📊 Validation Results:');
        console.log(`Total examples: ${result.totalExamples}`);
        console.log(`Examples with specs: ${result.examplesWithSpecs}`);
        console.log(`Missing specs: ${result.missingSpecs.length}`);

        if (result.missingSpecs.length > 0) {
            console.log('\n❌ The following examples are missing spec files:');
            result.missingSpecs.forEach((dir) => {
                console.log(`   - ${dir}`);
            });

            console.log(`\n💡 Please add a spec file (example.spec.ts) to each missing directory.`);
            console.log(
                'Each spec file should contain tests that validates the example functionality or the placeholder test.\n'
            );

            console.log(`

import { clickAllButtons, ensureGridReady, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await waitForGridContent(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });
});

                `);

            process.exit(1);
        } else {
            console.log('\n✅ All examples have spec files! 🎉');
            process.exit(0);
        }
    } catch (error) {
        console.error('💥 Error during validation:', error);
        process.exit(1);
    }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { validateExampleSpecs };
export type { ValidationResult };
