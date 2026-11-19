// usage: node run.mjs <bundleDir> <outDir> [profile] [modes...]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [bundleDir, outDir, profileFlag, ...modesArg] = process.argv.slice(2);
const profile = profileFlag === 'profile';
const modes = modesArg.length ? modesArg : ['flat', 'collapsed', 'grouped'];
fs.mkdirSync(outDir, { recursive: true });
const html = fs
    .readFileSync(new URL('./repro.html', import.meta.url), 'utf8')
    .replace('BUNDLE_DIR', 'file://' + path.resolve(bundleDir)).replace('BUNDLE_FILE', process.env.BUNDLE_FILE ?? 'ag-grid-enterprise.min.js');
const htmlPath = path.join(outDir, 'repro.html');
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ args: [`--js-flags=--max-old-space-size=8192 ${process.env.EXTRA_JS_FLAGS ?? ''}`] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('console', (m) => m.type() === 'error' && !m.text().includes('*') && console.log('console:', m.text()));
await page.goto('file://' + htmlPath);
const cdp = await page.context().newCDPSession(page);

for (const mode of modes) {
    const reps = profile ? 1 : 3;
    // warm-up
    if (!profile) await page.evaluate((m) => window.run(m), mode);
    for (let r = 0; r < reps; r++) {
        if (profile) {
            await cdp.send('Profiler.enable');
            await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
            await cdp.send('Profiler.start');
        }
        const res = await page.evaluate((m) => window.run(m), mode);
        console.log(mode, JSON.stringify(res));
        if (profile) {
            const { profile: p } = await cdp.send('Profiler.stop');
            fs.writeFileSync(path.join(outDir, `${mode}.cpuprofile`), JSON.stringify(p));
        }
    }
}
await browser.close();
