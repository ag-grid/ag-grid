import react from '@vitejs/plugin-react';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { build } from 'vite';
import zlib from 'zlib';

import { AllEnterpriseModules, AllGridCommunityModules, baseModule, moduleCombinations } from './moduleDefinitions';

interface ModuleSizeResult {
    modules: string[];
    expectedSize: number;
    selfSize: number;
    gzipSelfSize: number;
    fileSize: number;
    gzipSize: number;
}

const distFilePattern = path.join(__dirname, 'dist/assets/agGridCommunityEnterprise*.js');
const srcFilePath = path.join(__dirname, 'src/App_Src.tsx');
const outFilePath = path.join(__dirname, 'src/App_AUTO.tsx');

const placeholderStartRgx = '/\\*\\* __PLACEHOLDER__START__ \\*/';
const placeholderEndRgx = '/\\*\\* __PLACEHOLDER__END__ \\*/';
const placeholderStart = '/** __PLACEHOLDER__START__ */';
const placeholderEnd = '/** __PLACEHOLDER__END__ */';

const entPlaceholderStartRgx = '/\\*\\* __ENTERPRISE_PLACEHOLDER__START__ \\*/';
const entPlaceholderEndRgx = '/\\*\\* __ENTERPRISE_PLACEHOLDER__END__ \\*/';
const entPlaceholderStart = '/** __ENTERPRISE_PLACEHOLDER__START__ */';
const entPlaceholderEnd = '/** __ENTERPRISE_PLACEHOLDER__END__ */';

const chartsPlaceholderStartRgx = '/\\*\\* __CHARTS_PLACEHOLDER__START__ \\*/';
const chartsPlaceholderEndRgx = '/\\*\\* __CHARTS_PLACEHOLDER__END__ \\*/';
const chartsPlaceholderStart = '/** __CHARTS_PLACEHOLDER__START__ */';
const chartsPlaceholderEnd = '/** __CHARTS_PLACEHOLDER__END__ */';

function reverseWords(str: string): string {
    return str.split(' ').reverse().join(' ');
}

// Rewrite src/App_AUTO.tsx so it registers/imports exactly the given modules.
// Mirrors the previous moduleUpdater.ts transform, kept in-process to avoid a spawn per combination.
function updateAppSource(source: string, modules: string[]): string {
    const communityModules = modules.filter((module) => AllGridCommunityModules[module] >= 0);
    const enterpriseModules = modules.filter((module) => AllEnterpriseModules[module] >= 0);

    const replacement = communityModules.join(', ');
    const regex = new RegExp(`${placeholderStartRgx}[\\s\\S]*?${placeholderEndRgx}`, 'g');
    let result = source.replace(regex, `${placeholderStart} ${replacement} ${placeholderEnd}`);

    const entReplacement = enterpriseModules.join(', ');
    const entRegex = new RegExp(`${entPlaceholderStartRgx}[\\s\\S]*?${entPlaceholderEndRgx}`, 'g');
    result = result.replace(entRegex, `${entPlaceholderStart} ${entReplacement} ${entPlaceholderEnd}`);

    if (modules[0] === 'AgChartsCommunityModule' || modules[0] === 'AgChartsEnterpriseModule') {
        const chartsModule = modules[0];
        const chartsReplacement = `import {${chartsModule}} from 'ag-charts-${chartsModule.includes('Enterprise') ? 'enterprise' : 'community'}';`;
        const chartsRegex = new RegExp(`${chartsPlaceholderStartRgx}[\\s\\S]*?${chartsPlaceholderEndRgx}`, 'g');
        result = result.replace(chartsRegex, `${chartsPlaceholderStart} ${chartsReplacement} ${chartsPlaceholderEnd}`);
        result = reverseWords(
            reverseWords(result).replace('IntegratedChartsModule', `IntegratedChartsModule.with(${chartsModule})`)
        );
        result = reverseWords(
            reverseWords(result).replace('SparklinesModule', `SparklinesModule.with(${chartsModule})`)
        );
    } else {
        const chartsRegex = new RegExp(`${chartsPlaceholderStartRgx}[\\s\\S]*?${chartsPlaceholderEndRgx}`, 'g');
        result = result.replace(chartsRegex, `${chartsPlaceholderStart}  ${chartsPlaceholderEnd}`);
    }

    return result;
}

// Inline mirror of vite.config.mts so build() runs from this warm process without re-reading the config file each time.
function createBuildConfig() {
    return {
        root: __dirname,
        configFile: false as const,
        logLevel: 'warn' as const,
        plugins: [react()],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom'],
                        agGridCommunityEnterprise: [
                            'ag-grid-community',
                            'ag-grid-enterprise',
                            'ag-charts-enterprise',
                            'ag-charts-community',
                        ],
                        agGridReact: ['ag-grid-react'],
                    },
                },
            },
        },
    };
}

async function measureCombination(
    appSource: string,
    modules: string[]
): Promise<{ fileSize: number; gzipSize: number }> {
    fs.writeFileSync(outFilePath, updateAppSource(appSource, modules), 'utf8');

    await build(createBuildConfig());

    const files = globSync(distFilePattern);
    if (files.length === 0) {
        throw new Error(`No dist file matched pattern for modules: ${modules.join(', ')}`);
    }

    const distFilePath = files[0];
    const contents = fs.readFileSync(distFilePath);
    const fileSizeInBytes = contents.length;
    const gzipSizeInBytes = zlib.gzipSync(contents).length;

    const toKb = (bytes: number) => parseFloat((bytes / 1024).toFixed(2));
    return { fileSize: toKb(fileSizeInBytes), gzipSize: toKb(gzipSizeInBytes) };
}

async function run() {
    let moduleCombinationsToProcess = moduleCombinations;

    const shardArg = process.argv.find((arg) => arg.startsWith('--shard'));
    if (shardArg) {
        const [currentShard, shards] = shardArg
            .replace('--shard=', '')
            .split('/')
            .map((arg) => parseInt(arg));

        console.log('*************************');
        console.log('* Running in shard mode *');
        console.log(`* Shard ${currentShard} / ${shards}           *`);
        console.log('*************************');

        const segmentSize = Math.ceil(moduleCombinations.length / shards);
        const startIndex = (currentShard - 1) * segmentSize;
        const endIndex = startIndex + segmentSize;
        moduleCombinationsToProcess = moduleCombinations.slice(startIndex, endIndex);
    }

    // The base module (no modules) determines the size of the app with nothing registered, so that each
    // module's self-size can be measured against it. It must be built first in every run.
    const combinations = [baseModule, ...moduleCombinationsToProcess];

    const appSource = fs.readFileSync(srcFilePath, 'utf8');

    const results: ModuleSizeResult[] = [];
    let baseSize = 0;
    let baseGzipSize = 0;

    for (let i = 0, len = combinations.length; i < len; ++i) {
        const { modules, expectedSize } = combinations[i];
        const { fileSize, gzipSize } = await measureCombination(appSource, modules);

        let selfSize: number;
        let gzipSelfSize: number;
        if (modules.length === 0) {
            baseSize = fileSize;
            baseGzipSize = gzipSize;
            selfSize = fileSize;
            gzipSelfSize = gzipSize;
        } else {
            selfSize = parseFloat((fileSize - baseSize).toFixed(2));
            gzipSelfSize = parseFloat((gzipSize - baseGzipSize).toFixed(2));
        }

        console.log(`Modules: ${modules.join(', ')}`);
        console.log(`File size: ${fileSize} kB | gzip size: ${gzipSize} kB`);

        results.push({ modules, selfSize, gzipSelfSize, fileSize, gzipSize, expectedSize });
    }

    fs.writeFileSync('module-size-results.json', JSON.stringify(results, null, 2));
    console.log(`Results (${results.length}) saved to module-size-results.json`);

    // Clear the generated App so the working tree is left in a clean state.
    fs.writeFileSync(outFilePath, updateAppSource(appSource, []), 'utf8');
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
