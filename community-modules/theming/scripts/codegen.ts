import { removeAllGeneratedFiles } from './include/utils';

const NO_CLEAN = process.argv.includes('--no-clean');

const main = async () => {
    if (!NO_CLEAN) {
        removeAllGeneratedFiles();
    }

    const { generateAllCSSEmbeds } = await import('./include/build-css');
    await generateAllCSSEmbeds();
    process.stderr.write('✓ Generated CSS embeds\n');

    // use dynamic import because type generation needs to import files that don't
    // exist until the CSS embed generation step completes
    const { generateDocsFile } = await import('./include/build-types');
    await generateDocsFile();
    process.stderr.write('✓ Generated docs\n');
};

void main();
