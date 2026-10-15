import type { InternalFramework } from '@ag-grid-types';
import { TYPESCRIPT_INTERNAL_FRAMEWORKS } from '@components/example-generator/types';
import type { FileContents, GeneratedContents } from '@components/example-generator/types';
import { stripOutExampleGeneratorCode } from '@components/example-runner/components/stripOutExampleGeneratorCode';
import { EXAMPLE_STYLE_FILE_NAME } from '@constants';

export interface ExampleViewerFiles {
    /** Files the code viewer shows, cleaned of the example generator harness */
    files: FileContents;
    /** File selected when the code viewer opens */
    mainFileName: string;
}

const isSpecFile = (fileName: string) => fileName.includes('.spec.') || fileName.includes('.test.');

/**
 * Drop the generated files the example runner code viewer does not show for the internal framework:
 * TypeScript interfaces for JavaScript variants, the HTML shell for React and Vue, the shared
 * example-controls stylesheet, and test specs.
 *
 * Returns a new map; `files` is left untouched.
 */
export function pruneExampleFiles(files: FileContents, internalFramework: InternalFramework): FileContents {
    return Object.fromEntries(
        Object.entries(pruneExportFiles(files, internalFramework)).filter(
            ([fileName]) => fileName !== EXAMPLE_STYLE_FILE_NAME
        )
    );
}

/**
 * The files sent to Plunker and CodeSandbox: pruned like the code viewer, but keeping the shared
 * example-controls stylesheet the exported example links to.
 */
export function pruneExportFiles(files: FileContents, internalFramework: InternalFramework): FileContents {
    const isTs = TYPESCRIPT_INTERNAL_FRAMEWORKS.includes(internalFramework);
    const hidesIndexHtml = internalFramework.startsWith('vue') || internalFramework.startsWith('react');

    return Object.fromEntries(
        Object.entries(files).filter(([fileName]) => {
            if (!isTs && fileName === 'interfaces.ts') {
                return false;
            }
            if (hidesIndexHtml && fileName === 'index.html') {
                return false;
            }
            return !isSpecFile(fileName);
        })
    );
}

/**
 * The files exactly as the example runner code viewer presents them: pruned for the internal
 * framework and stripped of the harness the example generator injects.
 *
 * Shared by the build-time renders (the crawlable source panel and the markdown twin pages) so
 * they cannot drift from what the Code button reveals.
 */
export function getExampleViewerFiles(
    contents: GeneratedContents,
    internalFramework: InternalFramework
): ExampleViewerFiles {
    const files = pruneExampleFiles(contents.files, internalFramework);
    stripOutExampleGeneratorCode(files);

    return {
        files,
        mainFileName: contents.mainFileName ?? contents.entryFileName,
    };
}
