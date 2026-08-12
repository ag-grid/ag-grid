import { waitFor } from '@testing-library/dom';

import type { GridApi, SideBarDef } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import {
    asyncSetTimeout,
    clickSelectOption,
    firePointerLikeClick,
    nudgeVirtualList,
    openPicker,
    setNativeInputValue,
} from '../../test-utils';

/**
 * Shared harness/helpers for the enterprise Filters Tool Panel behavioural tests. Local (not the shared
 * ColumnFilterHarness) because it drives the panel bodies rather than the `.ag-filter-menu` popup.
 */

const PANEL_SELECTOR = '.ag-filter-toolpanel';

function textOf(el: Element | null | undefined): string {
    return el?.textContent?.trim() ?? '';
}

/**
 * Drives the open Filters Tool Panel through public DOM only; top-level entries are group wrappers
 * (a single column is a group whose body is the filter; a real column group nests instances). Local
 * harness because the shared ColumnFilterHarness targets the `.ag-filter-menu` popup, not panel bodies.
 */
export class ToolPanelHarness {
    public constructor(public readonly api: GridApi) {}

    private get panel(): HTMLElement {
        // Scope to this grid's DOM: the state round-trip tests keep the source grid alive while
        // asserting on the restored grid, so a document-wide query would match the wrong panel.
        const root: ParentNode = (getGridElement(this.api) as HTMLElement | undefined) ?? document;
        const panel = root.querySelector<HTMLElement>(PANEL_SELECTOR);
        if (!panel) {
            throw new Error('Filters tool panel is not open');
        }
        return panel;
    }

    private groupWrappers(): HTMLElement[] {
        return Array.from(
            this.panel.querySelectorAll<HTMLElement>('.ag-filter-list-panel > .ag-filter-toolpanel-group-wrapper')
        );
    }

    private groupByTitle(title: string): HTMLElement {
        const wrapper = this.groupWrappers().find((w) => textOf(w.querySelector('.ag-group-title')) === title);
        if (!wrapper) {
            throw new Error(`Tool-panel group "${title}" not found. Available: ${this.columnTitles().join(', ')}`);
        }
        return wrapper;
    }

    /** Throws until the panel is open and has rendered its top-level column list. */
    public assertColumnListRendered(): void {
        // The `panel` getter throws while the panel element is absent, which is also "not ready yet".
        if (this.groupWrappers().length === 0) {
            throw new Error('Filters tool panel has not rendered its column list yet');
        }
    }

    /** Visible (not search-hidden) top-level group titles, in order. */
    public columnTitles(): string[] {
        return this.groupWrappers()
            .filter((w) => !w.classList.contains('ag-hidden'))
            .map((w) => textOf(w.querySelector('.ag-group-title')));
    }

    private isGroupExpanded(wrapper: HTMLElement): boolean {
        const container = wrapper.querySelector('.ag-group-container');
        return !!container && !container.classList.contains('ag-hidden');
    }

    /** Clicks a top-level group's title bar to expand it (no-op if already expanded). */
    public async expandGroup(title: string): Promise<this> {
        const wrapper = this.groupByTitle(title);
        if (!this.isGroupExpanded(wrapper)) {
            await firePointerLikeClick(
                wrapper.querySelector<HTMLElement>('.ag-filter-toolpanel-group-level-0-header')!
            );
            // Wait for the (async) filter comp to resolve and render into its body, rather than a fixed
            // delay. Requiring rendered content (not just the empty body element) is what lets callers
            // read the filter GUI straight after expanding.
            await waitFor(() => {
                const body = wrapper.querySelector('.ag-filter-toolpanel-instance-body');
                if (!body?.firstElementChild) {
                    throw new Error(`Filter body for "${title}" has not attached yet`);
                }
            });
        }
        return this;
    }

    /** Clicks a top-level group's title bar to collapse it (no-op if already collapsed). */
    public async collapseGroup(title: string): Promise<this> {
        const wrapper = this.groupByTitle(title);
        if (this.isGroupExpanded(wrapper)) {
            await firePointerLikeClick(
                wrapper.querySelector<HTMLElement>('.ag-filter-toolpanel-group-level-0-header')!
            );
            await asyncSetTimeout(0);
        }
        return this;
    }

    private body(title: string): HTMLElement {
        const body = this.groupByTitle(title).querySelector<HTMLElement>('.ag-filter-toolpanel-instance-body');
        if (!body) {
            throw new Error(`No filter body for "${title}" (is the group expanded?)`);
        }
        return body;
    }

    private visibleInputs(title: string, type: string): HTMLInputElement[] {
        return Array.from(
            this.body(title).querySelectorAll<HTMLInputElement>(`.ag-filter-body input[type="${type}"]`)
        ).filter((input) => !input.closest('.ag-hidden'));
    }

    public async setText(title: string, value: string, index = 0): Promise<this> {
        setNativeInputValue(this.visibleInputs(title, 'text')[index], value);
        await asyncSetTimeout(0);
        return this;
    }

    public async setNumber(title: string, value: number | string, index = 0): Promise<this> {
        setNativeInputValue(this.visibleInputs(title, 'number')[index], String(value));
        await asyncSetTimeout(0);
        return this;
    }

    /** Selects a simple-filter operator by its display label within a column's panel body. */
    public async selectOperator(title: string, displayName: string): Promise<this> {
        const select = this.body(title).querySelector<HTMLElement>('.ag-filter-select');
        if (!select) {
            throw new Error(`No operator select for "${title}"`);
        }
        await openPicker(select);
        await clickSelectOption(displayName);
        return this;
    }

    private setFilterItems(title: string): HTMLElement[] {
        const body = this.body(title);
        nudgeVirtualList('.ag-set-filter-list .ag-virtual-list-viewport', body);
        return Array.from(body.querySelectorAll<HTMLElement>('.ag-set-filter-list .ag-set-filter-item'));
    }

    public setFilterItemLabels(title: string): string[] {
        return this.setFilterItems(title).map((item) => textOf(item.querySelector('.ag-checkbox-label')));
    }

    public async toggleSetItem(title: string, label: string): Promise<this> {
        const item = this.setFilterItems(title).find((el) => textOf(el.querySelector('.ag-checkbox-label')) === label);
        if (!item) {
            throw new Error(`Set-filter item "${label}" not found for "${title}"`);
        }
        await firePointerLikeClick(item.querySelector<HTMLElement>('input[type="checkbox"]') ?? item);
        await asyncSetTimeout(0);
        return this;
    }

    /** Types into a set-filter column's mini-filter search box within its panel body. */
    public async setMiniFilter(title: string, value: string): Promise<this> {
        const input = this.body(title).querySelector<HTMLInputElement>('.ag-mini-filter input[type="text"]');
        if (!input) {
            throw new Error(`No set-filter mini-filter for "${title}"`);
        }
        setNativeInputValue(input, value);
        await asyncSetTimeout(0);
        return this;
    }

    /** True when the "No matches" indicator is shown for a set-filter column (list hidden). */
    public isNoMatchesShown(title: string): boolean {
        const el = this.body(title).querySelector('.ag-filter-no-matches');
        return !!el && !el.classList.contains('ag-hidden');
    }

    /** True when the set-filter value list is shown for a column. */
    public isSetListShown(title: string): boolean {
        const el = this.body(title).querySelector('.ag-set-filter-list');
        return !!el && !el.classList.contains('ag-hidden');
    }

    /** True when the top-level column/group is expanded. */
    public isGroupExpandedByTitle(title: string): boolean {
        return this.isGroupExpanded(this.groupByTitle(title));
    }

    /** True when a top-level column/group shows the active-filter indicator. */
    public isActive(title: string): boolean {
        return !!this.groupByTitle(title).querySelector('.ag-group')?.classList.contains('ag-has-filter');
    }

    private searchInput(): HTMLInputElement {
        const input = this.panel.querySelector<HTMLInputElement>('.ag-filter-toolpanel-search-input input');
        if (!input) {
            throw new Error('Filter columns search box is not present');
        }
        return input;
    }

    public isSearchPresent(): boolean {
        const field = this.panel.querySelector('.ag-filter-toolpanel-search-input');
        return !!field && !field.classList.contains('ag-hidden');
    }

    /**
     * Types into the column-list search box and waits past the 300ms debounce. The search result can
     * legitimately be "nothing changed" (e.g. clearing a search that matched everything), so there is
     * no positive signal to poll for here — callers assert the resulting title list themselves.
     */
    public async search(text: string): Promise<this> {
        setNativeInputValue(this.searchInput(), text);
        // eslint-disable-next-line no-restricted-syntax -- waits for the 300ms search debounce in agFiltersToolPanelHeader.ts
        await asyncSetTimeout(350);
        return this;
    }

    private expandAllButton(): HTMLElement | null {
        const button = this.panel.querySelector<HTMLElement>(
            '.ag-filter-toolpanel-search > .ag-filter-toolpanel-expand'
        );
        return button && !button.classList.contains('ag-hidden') ? button : null;
    }

    public isExpandAllPresent(): boolean {
        return !!this.expandAllButton();
    }

    public async clickExpandAll(): Promise<this> {
        await firePointerLikeClick(this.expandAllButton()!);
        await asyncSetTimeout(0);
        return this;
    }

    /** Terse tree diagram of the panel: `▾/▸ title [*]`, nested column-group instances, and expanded bodies. */
    public serialize(): string {
        const lines = ['FILTERS TOOL PANEL'];
        for (const wrapper of this.groupWrappers()) {
            if (wrapper.classList.contains('ag-hidden')) {
                continue;
            }
            const group = wrapper.querySelector('.ag-group')!;
            const expanded = this.isGroupExpanded(wrapper);
            const active = group.classList.contains('ag-has-filter') ? ' *' : '';
            lines.push(`${expanded ? '▾' : '▸'} ${textOf(wrapper.querySelector('.ag-group-title'))}${active}`);
            if (expanded) {
                this.serializeInstances(wrapper, lines);
            }
        }
        return lines.join('\n');
    }

    private serializeInstances(wrapper: HTMLElement, lines: string[]): void {
        for (const instance of Array.from(wrapper.querySelectorAll<HTMLElement>('.ag-filter-toolpanel-instance'))) {
            if (instance.classList.contains('ag-hidden')) {
                continue;
            }
            const header = instance.querySelector('.ag-filter-toolpanel-instance-header');
            const headerVisible = !!header && !header.classList.contains('ag-hidden');
            const body = instance.querySelector<HTMLElement>('.ag-filter-toolpanel-instance-body');
            if (headerVisible) {
                const instExpanded = header.getAttribute('aria-expanded') === 'true';
                const instActive = !instance.querySelector('.ag-filter-icon')?.classList.contains('ag-hidden');
                lines.push(
                    `  ${instExpanded ? '▾' : '▸'} ${textOf(header.querySelector('.ag-header-cell-text'))}${instActive ? ' *' : ''}`
                );
                if (instExpanded && body) {
                    this.serializeBody(body, lines, '    ');
                }
            } else if (body) {
                this.serializeBody(body, lines, '  ');
            }
        }
    }

    private serializeBody(body: HTMLElement, lines: string[], indent: string): void {
        const setList = body.querySelector('.ag-set-filter-list');
        if (setList) {
            nudgeVirtualList('.ag-set-filter-list .ag-virtual-list-viewport', body);
            for (const item of Array.from(body.querySelectorAll('.ag-set-filter-item'))) {
                const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
                const mark = checkbox?.indeterminate ? '▪' : checkbox?.checked ? '☑' : '☐';
                lines.push(`${indent}${mark} ${textOf(item.querySelector('.ag-checkbox-label'))}`);
            }
            return;
        }
        // A simple filter can have several condition rows (AG Grid adds an empty one once the first
        // is complete); render each operator with its own visible inputs, plus the join between them.
        const selects = Array.from(body.querySelectorAll('.ag-filter-select .ag-picker-field-display'));
        const bodies = Array.from(body.querySelectorAll<HTMLElement>('.ag-filter-body'));
        const join = Array.from(
            body.querySelectorAll<HTMLInputElement>('.ag-filter-condition input[type=radio]:checked')
        )
            .map((radio) => textOf(radio.closest('.ag-radio-button')?.querySelector('.ag-radio-button-label')))
            .find(Boolean);
        const conditionCount = Math.max(selects.length, bodies.length);
        for (let i = 0; i < conditionCount; i++) {
            if (i > 0 && join) {
                lines.push(`${indent}${join.toUpperCase()}`);
            }
            lines.push(`${indent}operator: "${textOf(selects[i])}"`);
            const inputs = bodies[i]
                ? Array.from(bodies[i].querySelectorAll<HTMLInputElement>('input')).filter(
                      (input) => (input.type === 'text' || input.type === 'number') && !input.closest('.ag-hidden')
                  )
                : [];
            for (const input of inputs) {
                lines.push(`${indent}input: "${input.value}"`);
            }
        }
    }
}

export async function openFiltersPanel(api: GridApi): Promise<ToolPanelHarness> {
    const harness = new ToolPanelHarness(api);
    // Panel is lazily initialised on show: poll until it has rendered its column list, rather than
    // guessing a delay. Filter bodies are created on expand (and destroyed on collapse), so they are
    // gated by expandGroup's own poll, not here.
    await waitFor(() => harness.assertColumnListRendered());
    return harness;
}

export const FILTERS_SIDEBAR: SideBarDef = { toolPanels: ['filters'], defaultToolPanel: 'filters' };
