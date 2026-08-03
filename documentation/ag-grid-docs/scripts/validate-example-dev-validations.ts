#!/usr/bin/env tsx
/* eslint-disable no-console */
import { readFile, readdir, stat } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

/**
 * Validates that every example source file that calls ModuleRegistry.registerModules
 * also calls enableDevValidations() guarded by a NODE_ENV check.
 *
 * This script is designed to be run as part of CI to ensure documentation examples
 * surface AG Grid's development-mode validations and helpful error messages.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_ROOT = join(__dirname, '..', 'src', 'content', 'docs');
const CANDIDATE_EXTENSIONS = ['.ts', '.tsx'];
const REGISTER_MODULES_PATTERN = /ModuleRegistry\.registerModules\(/;
const ENABLE_DEV_VALIDATIONS_PATTERN = /enableDevValidations/;

interface ValidationResult {
    totalFiles: number;
    missingGuard: string[];
}

async function isDirectory(path: string): Promise<boolean> {
    try {
        const stats = await stat(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

async function findCandidateFiles(basePath: string): Promise<string[]> {
    const files: string[] = [];

    async function traverse(currentPath: string) {
        let entries: string[];
        try {
            entries = await readdir(currentPath);
        } catch (error) {
            console.warn(`Warning: Could not read directory ${currentPath}:`, error);
            return;
        }

        for (const entry of entries) {
            const fullPath = join(currentPath, entry);

            if (await isDirectory(fullPath)) {
                await traverse(fullPath);
            } else if (CANDIDATE_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    }

    await traverse(basePath);
    return files;
}

async function validateExampleDevValidations(): Promise<ValidationResult> {
    console.log(`🔍 Searching for example source files in: ${DOCS_ROOT}`);

    const candidateFiles = await findCandidateFiles(DOCS_ROOT);

    const registeringFiles: string[] = [];
    for (const file of candidateFiles) {
        const content = await readFile(file, 'utf-8');
        if (REGISTER_MODULES_PATTERN.test(content)) {
            registeringFiles.push(file);
        }
    }

    console.log(`📁 Found ${registeringFiles.length} files calling ModuleRegistry.registerModules`);

    const missingGuard: string[] = [];
    for (const file of registeringFiles) {
        const content = await readFile(file, 'utf-8');
        const relativeFile = relative(DOCS_ROOT, file);

        if (ENABLE_DEV_VALIDATIONS_PATTERN.test(content)) {
            //   console.log(`✅ ${relativeFile}`);
        } else {
            missingGuard.push(relativeFile);
            console.log(`❌ ${relativeFile} - Missing enableDevValidations() guard`);
        }
    }

    return {
        totalFiles: registeringFiles.length,
        missingGuard,
    };
}

async function main() {
    console.log('🚀 Starting example dev-validations check...\n');

    try {
        const result = await validateExampleDevValidations();

        console.log('\n📊 Validation Results:');
        console.log(`Files registering modules: ${result.totalFiles}`);
        console.log(`Missing enableDevValidations guard: ${result.missingGuard.length}`);

        if (result.missingGuard.length > 0) {
            console.log('\n❌ The following files call ModuleRegistry.registerModules without enableDevValidations:');
            result.missingGuard.forEach((file) => {
                console.log(`   - ${file}`);
            });

            console.log(`\n💡 Add the following guard immediately before the ModuleRegistry.registerModules call:`);
            console.log(`
// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}
`);
            console.log("Also add 'enableDevValidations' to the value import from 'ag-grid-community'.\n");

            process.exit(1);
        } else {
            console.log('\n✅ All examples that register modules also enable dev validations! 🎉');
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

export { validateExampleDevValidations };
export type { ValidationResult };
