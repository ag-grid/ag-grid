import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GridApi, IFiltersToolPanel } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

async function tabOutOfInput(page: Page, input: Locator, backwards = false): Promise<boolean[]> {
    const sequence: boolean[] = [];
    for (let i = 0; i < 20; i++) {
        await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
        const focused = await input.evaluate((element) => element === document.activeElement);
        sequence.push(focused);
        if (!focused) {
            return sequence;
        }
    }
    throw new Error('Tab did not leave the input');
}

async function tabSequences(page: Page, input: Locator) {
    await page.locator('#native-before').focus();
    await input.focus();
    const forwards = await tabOutOfInput(page, input);
    await page.keyboard.press('Shift+Tab');
    await expect(input).toBeFocused();
    const backwards = await tabOutOfInput(page, input, true);
    return { forwards, backwards };
}

test.describe('native tab navigation in provided filters', () => {
    for (const container of ['toolPanel', 'columnFilter'] as const) {
        for (const includeTime of [false, true]) {
            test(`${container}: ${includeTime ? 'date-time' : 'date'} segments keep native Tab behaviour after adding a condition`, async ({
                page,
            }) => {
                await mountGrid(page, {
                    enterprise: true,
                    options: () => ({}),
                });
                await page.evaluate(
                    ({ includeTime, container }) => {
                        const api = (window as Window & { gridApi?: GridApi }).gridApi!;
                        api.updateGridOptions<{ date: string }>({
                            columnDefs: [
                                {
                                    field: 'date',
                                    filter: 'agDateColumnFilter',
                                    filterParams: { includeTime },
                                },
                            ],
                            sideBar: 'filters',
                            rowData: [],
                        });
                        api.closeToolPanel();
                        if (container === 'toolPanel') {
                            api.openToolPanel('filters');
                            api.getToolPanelInstance<IFiltersToolPanel>('filters')!.expandFilters(['date']);
                        } else {
                            api.showColumnFilter('date');
                        }
                    },
                    { includeTime, container }
                );
                const filter = page.locator('.ag-filter-body-wrapper');
                const input = filter.locator('input').first();
                await input.fill(includeTime ? '2026-10-12T12:34:56' : '2026-10-12');
                await expect(filter.getByRole('radio', { name: 'AND', exact: true })).toBeVisible();

                await input.evaluate((element: HTMLInputElement) => {
                    const before = document.createElement('button');
                    before.id = 'native-before';
                    const reference = document.createElement('input');
                    reference.id = 'native-date';
                    reference.type = element.type;
                    reference.step = element.step;
                    reference.value = element.value;
                    const after = document.createElement('button');
                    document.body.append(before, reference, after);
                });
                const expected = await tabSequences(page, page.locator('#native-date'));
                expect(await tabSequences(page, input)).toEqual(expected);
            });
        }
    }

    test('simple filters use one Tab stop for AND/OR and still trap focus in the popup', async ({ page }) => {
        const { withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'country', filter: 'agTextColumnFilter' }],
                suppressInputClearButton: true,
                rowData: [],
            }),
        });
        await withApi((api) => api.showColumnFilter('country'));
        const filter = page.locator('.ag-filter-body-wrapper');
        const inputs = filter.getByRole('textbox');
        await inputs.first().fill('France');
        const and = filter.getByRole('radio', { name: 'AND', exact: true });
        const or = filter.getByRole('radio', { name: 'OR', exact: true });
        await expect(and).toBeVisible();
        await page.keyboard.press('Tab');
        await expect(and).toBeFocused();
        await page.keyboard.press('ArrowRight');
        await expect(or).toBeChecked();
        await page.keyboard.press('Tab');
        await expect(filter.getByRole('combobox').last()).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(or).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(inputs.first()).toBeFocused();

        await inputs.last().focus();
        await page.keyboard.press('Tab');
        await expect(filter.getByRole('combobox').first()).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(inputs.last()).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(filter).toHaveCount(0);
    });

    test('Set Filter keeps managed list navigation, Space selection and Enter to apply', async ({ page }) => {
        const { withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } }],
                rowData: [{ country: 'France' }, { country: 'Spain' }],
            }),
        });
        await withApi((api) => api.showColumnFilter('country'));
        const filter = page.locator('.ag-set-filter-body-wrapper');
        await filter.locator('.ag-mini-filter input').focus();
        await page.keyboard.press('Tab');
        const options = filter.getByRole('option');
        await expect(options.first()).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(options.nth(1)).toBeFocused();
        await page.keyboard.press('Space');
        await expect(options.nth(1)).toHaveAttribute('aria-checked', 'false');
        await page.keyboard.press('Enter');
        await expect
            .poll(() => withApi((api) => api.getColumnFilterModel('country')))
            .toEqual({
                filterType: 'set',
                values: ['Spain'],
            });
    });
});
