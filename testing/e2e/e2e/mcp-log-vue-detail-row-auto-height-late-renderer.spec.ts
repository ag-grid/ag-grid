/**
 * Issue: with `detailRowAutoHeight` in Vue, a custom detail cell renderer that loads its data before rendering
 * is not resized to its content if its root element changes once the data arrives. The Vue wrapper captures the
 * renderer's first root element once, when the component mounts, and the grid attaches its resize observer to that
 * element only. A renderer whose root is `<div v-if="rows">` with no `v-else` starts with a comment node as its root
 * so the wrapper has no element to hand to the grid, and a renderer with a `v-if` / `v-else` loading placeholder is
 * measured through the placeholder, which Vue then removes and replaces with a new root element.
 *
 * Setup: `<AgGridVue masterDetail detailRowAutoHeight :detailCellRenderer="...">` where the renderer sets its `rows`
 * in `onMounted` after a fake 50ms fetch and then renders a 500px tall element. The first row is expanded. Two common
 * loading patterns are tested: a `v-if` root with no `v-else`, and a `v-if` root with a `v-else` "Loading..."
 * placeholder. A control renders the loading text inside the same root element it later fills with content.
 *
 * Expected: the Master / Detail docs say "set `detailRowAutoHeight: true` in the master-level gridOptions and
 * ensure the content nested inside the detail cell renderer component sets a height value", so once the content has
 * loaded the detail row height should be about 500px, and no error should be thrown while the row renders.
 *
 * Actual: the control passes. With the placeholder the detail row stays at the placeholder's height, so the content
 * is clipped. With no `v-else` an uncaught TypeError from `ResizeObserver.observe` (parameter 1 is not of type
 * 'Element') is thrown when the row renders, and the detail row stays at the height it starts at under auto height.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Master detail row height for AG-18665. This is the Vue counterpart of the
 * React finding from searches such as "master detail row height cut off not showing all rows" (Vue 33.3.2 and 35.1.0
 * among others).
 *
 * Runs real Vue (global build from node_modules) against the enterprise bundle and the ag-grid-vue3 UMD build in
 * `packages/ag-grid-vue3/dist`, which `./grid-e2e.sh` does not rebuild.
 */
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import path from 'node:path';

const REPO_ROOT = path.join(__dirname, '../../..');
const CONTENT_HEIGHT = 500;

type LoadingPattern = 'stableRoot' | 'noElse' | 'placeholder';

const TEMPLATES: Record<LoadingPattern, string> = {
    stableRoot: `<div class="test-detail-root">
        <div v-if="rows" class="test-detail-content" style="height:500px">{{ rows }}</div>
        <template v-else>Loading...</template>
    </div>`,
    noElse: `<div v-if="rows" class="test-detail-content" style="height:500px">{{ rows }}</div>`,
    placeholder: `<div v-if="rows" class="test-detail-content" style="height:500px">{{ rows }}</div>
        <div v-else class="test-detail-loading">Loading...</div>`,
};

async function expectDetailRowSizedToContent(page: Page, pattern: LoadingPattern): Promise<void> {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setContent(
        '<!DOCTYPE html><html><body><div id="root" style="width:600px;height:800px"></div></body></html>'
    );
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'node_modules/vue/dist/vue.global.js') });
    await page.addScriptTag({
        path: path.join(REPO_ROOT, 'packages/ag-grid-enterprise/dist/ag-grid-enterprise.js'),
    });
    await page.evaluate(() => {
        (window as any)['ag-grid-community'] = (window as any).agGrid;
    });
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'packages/ag-grid-vue3/dist/main.umd.js') });

    await page.evaluate(
        ({ template }) => {
            const w = window as any;
            const { createApp, ref, onMounted } = w.Vue;

            const DetailRenderer = {
                template,
                setup() {
                    const rows = ref(undefined);
                    onMounted(() => {
                        setTimeout(() => (rows.value = 'detail content'), 50);
                    });
                    return { rows };
                },
            };

            createApp({
                components: { AgGridVue: w.AgGridVue.AgGridVue },
                template: `<ag-grid-vue style="width:600px;height:800px"
                    :columnDefs="columnDefs" :rowData="rowData" :masterDetail="true" :detailRowAutoHeight="true"
                    :detailCellRenderer="detailCellRenderer" @grid-ready="onGridReady" />`,
                data: () => ({
                    columnDefs: [{ field: 'k', cellRenderer: 'agGroupCellRenderer' }],
                    rowData: [{ k: '1' }],
                    detailCellRenderer: Object.freeze(DetailRenderer),
                }),
                methods: { onGridReady: (e: any) => (w.gridApi = e.api) },
            }).mount('#root');
        },
        { template: TEMPLATES[pattern] }
    );

    await page.waitForFunction(() => (window as any).gridApi?.getDisplayedRowAtIndex(0));
    await page.evaluate(() => (window as any).gridApi.getDisplayedRowAtIndex(0).setExpanded(true));
    // soft, so that a thrown error is reported alongside the height rather than hidden behind it
    await expect
        .configure({ soft: true })
        .poll(() => page.evaluate(() => (window as any).gridApi.getDisplayedRowAtIndex(1)?.rowHeight), {
            message: 'detail row height',
        })
        .toBeGreaterThanOrEqual(CONTENT_HEIGHT);

    expect(pageErrors, 'errors thrown while rendering the detail row').toEqual([]);
}

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
test.describe.skip('Vue detailRowAutoHeight with a detail renderer that loads data first', () => {
    test('control: renderer that keeps the same root element while loading is auto-sized', async ({ page }) => {
        await expectDetailRowSizedToContent(page, 'stableRoot');
    });

    test('renderer whose root is a v-if with no v-else is auto-sized without errors', async ({ page }) => {
        await expectDetailRowSizedToContent(page, 'noElse');
    });

    test('renderer with a v-if root and a v-else loading placeholder is auto-sized', async ({ page }) => {
        await expectDetailRowSizedToContent(page, 'placeholder');
    });
});
