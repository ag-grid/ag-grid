import * as fs from 'fs';
import { JSDOM } from 'jsdom';

import * as mockCanvas from '../src/chart/test/mock-canvas';
import * as examples from '../src/chart/test/examples';
import { AgChartV2 } from '../src/chart/agChartV2';

const galleryJson = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/gallery.json`;
const outputPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/src/components/chart-gallery/thumbnails`;

const galleryOpts = JSON.parse(fs.readFileSync(galleryJson).toString());
const thumbnailsToGenerate: string[] = [];

for (const group of Object.values(galleryOpts)) {
    for (const { example } of Object.values(group as Record<string, { example?: string }>)) {
        if (example) {
            thumbnailsToGenerate.push(example);
        }
    }
}

const run = async () => {
    const width = 800;
    const height = 570;

    for (const thumbnail of thumbnailsToGenerate) {
        const example = examples.DOCS_EXAMPLES[thumbnail];
        if (example == null) {
            console.error(`Didn't find example for ['${thumbnail}']!`);
            process.exitCode = 5;
            continue;
        }

        console.log(`Generating thumbnail for ['${thumbnail}']...`);

        const {
            window,
            window: { document, HTMLElement, navigator },
        } = new JSDOM('<html><body></body></html>');
        const globalNsValues = { window, document, HTMLElement, navigator };
        Object.assign(global, globalNsValues);

        const mockCtx = mockCanvas.setup({ width, height });

        const options = { ...example, autoSize: false, width, height };
        const chart = AgChartV2.create<any>(options);
        await chart.waitForUpdate(5_000);

        fs.writeFileSync(`${outputPath}/${thumbnail}.png`, mockCtx.ctx.nodeCanvas?.toBuffer());

        chart.destroy();
        mockCanvas.teardown(mockCtx);

        Object.keys(globalNsValues).forEach((k) => delete global[k]);
    }
};

run()
    .then(() => {
        process.exit();
    })
    .catch((e) => {
        console.error(e);
        process.exit(10);
    });
