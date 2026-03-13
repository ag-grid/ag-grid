import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(__dirname, '..', 'dist');
const isProduction = ['production', 'staging'].includes(process.env.NX_TASK_TARGET_CONFIGURATION ?? '');

function readDist(filename: string): string {
    const filePath = join(distDir, filename);
    expect(existsSync(filePath)).toBe(true);
    return readFileSync(filePath, 'utf-8');
}

function expectValidUmd(content: string) {
    // UMD bundles contain the webpack UMD wrapper pattern.
    // Minified builds may reverse comparisons (e.g. "object"==typeof exports).
    expect(content).toMatch(/typeof exports\s*===?\s*['"]object['"]|['"]object['"]\s*===?\s*typeof exports/);
    expect(content).toMatch(/typeof define\s*===?\s*['"]function['"]|['"]function['"]\s*===?\s*typeof define/);
}

// Legacy theme CSS class names imported via main-umd-styles.ts from @ag-grid-community/styles
const LEGACY_THEME_MARKERS = ['ag-theme-alpine', 'ag-theme-balham', 'ag-theme-material', 'ag-theme-quartz'];

function expectLegacyCssPresent(content: string) {
    for (const marker of LEGACY_THEME_MARKERS) {
        // Legacy CSS contains class selectors like .ag-theme-alpine
        expect(content).toMatch(new RegExp(`\\.${marker}[^a-zA-Z-]`));
    }
}

function expectNoLegacyCss(content: string) {
    for (const marker of LEGACY_THEME_MARKERS) {
        // Should not contain CSS class selectors for legacy themes.
        // JS string references (e.g. return 'ag-theme-quartz') are acceptable.
        expect(content).not.toMatch(new RegExp(`\\.${marker}[^a-zA-Z-]`));
    }
}

if (isProduction) {
    describe('ag-grid-community UMD production builds', () => {
        const files = {
            styles: 'ag-grid-community.js',
            stylesMin: 'ag-grid-community.min.js',
            noStyles: 'ag-grid-community.noStyle.js',
            noStylesMin: 'ag-grid-community.min.noStyle.js',
        };

        it('should produce all 4 UMD files', () => {
            for (const filename of Object.values(files)) {
                expect(existsSync(join(distDir, filename))).toBe(true);
            }
        });

        describe('UMD format', () => {
            it.each(Object.entries(files))('%s should be valid UMD', (_key, filename) => {
                expectValidUmd(readDist(filename));
            });
        });

        describe('style files should include legacy CSS', () => {
            it.each([files.styles, files.stylesMin])('%s should contain legacy theme CSS', (filename) => {
                expectLegacyCssPresent(readDist(filename));
            });
        });

        describe('noStyle files should not include legacy CSS', () => {
            it.each([files.noStyles, files.noStylesMin])('%s should not contain legacy theme CSS', (filename) => {
                expectNoLegacyCss(readDist(filename));
            });
        });
    });
} else {
    describe('ag-grid-community UMD development build', () => {
        const devFile = 'ag-grid-community.js';

        it('should produce the development UMD file', () => {
            expect(existsSync(join(distDir, devFile))).toBe(true);
        });

        it('should be valid UMD', () => {
            expectValidUmd(readDist(devFile));
        });

        it('should contain inline source maps', () => {
            const content = readDist(devFile);
            expect(content).toContain('sourceMappingURL=data:application/json');
        });
    });
}
