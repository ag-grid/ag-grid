import cssAutoPrefix from 'autoprefixer';
import cssNano from 'cssnano';
import fs from 'fs';
import { globSync } from 'glob';
import { basename, dirname, join } from 'path';
import postcss from 'postcss';
import cssImport from 'postcss-import';
import cssRtl from 'postcss-rtlcss';
import cssUrl from 'postcss-url';

const srcFolder = join(__dirname, '..', 'src');
const themingFolder = join(srcFolder, 'theming');
const DEV_MODE = process.argv.includes('--dev');

const written = new Set<string>();

const generateAllCSSEmbeds = async () => {
    await generateCSSEmbed(join(themingFolder, 'core/core.css'));

    const cssEntryPoints = globSync(join(themingFolder, 'parts/**/*.css')).filter((path) => !path.includes('/css/'));
    for (const cssEntryPoint of cssEntryPoints) {
        await generateCSSEmbed(cssEntryPoint);
    }

    // remove any old generated files not written in this execution
    const generatedFiles = globSync(join(srcFolder, '**/GENERATED-*'));
    for (const generatedFile of generatedFiles) {
        if (!written.has(generatedFile)) {
            fs.rmSync(generatedFile);
        }
    }
};

const generateCSSEmbed = async (entry: string) => {
    const dir = dirname(entry);
    const entryName = basename(entry, '.css');
    const outputFile = join(dir, `GENERATED-${entryName}.ts`);
    const cssString = await loadAndProcessCSSFile(entry);
    const exportName = camelCase(entryName) + 'CSS';
    const result = `export const ${exportName} = /*css*/ \`${cssString.replace(/`/g, '\\`')}\`;\n`;

    await writeTsFile(outputFile, result);
    written.add(outputFile);
};

const loadAndProcessCSSFile = async (cssPath: string) => {
    const css = fs.readFileSync(cssPath, 'utf8');
    const result = await postcss(
        // inline @import(./path.css)
        cssImport(),
        // embed e.g. url(./path.svg) as data uri
        cssUrl({ url: 'inline' }),
        // add vendor prefixes
        cssAutoPrefix(),
        // auto RTL support
        cssRtl({
            ltrPrefix: `.ag-ltr`,
            rtlPrefix: `.ag-rtl`,
            bothPrefix: `:is(.ag-ltr, .ag-rtl)`,
        }),
        cssNano({
            preset: [
                'default',
                {
                    discardComments: !DEV_MODE,
                    normalizeWhitespace: !DEV_MODE,
                    minifySelectors: !DEV_MODE,
                },
            ],
        })
    ).process(css, { from: cssPath, to: cssPath });
    return result.css;
};

const writeTsFile = async (path: string, content: string) => {
    const fs = await import('fs');
    // write to a tmp file and rename over the existing file to provide atomic modification
    const tmpFile = path + '.tmp';
    fs.writeFileSync(tmpFile, content);
    fs.renameSync(tmpFile, path);
};

const camelCase = (str: string) => str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());

generateAllCSSEmbeds();
