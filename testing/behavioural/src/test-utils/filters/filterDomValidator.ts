import type { GridApi } from 'ag-grid-community';

import { hasVisibleInvalidIcon, setItemDepth } from './filterDomSerialize';

/** Collects invariant violations found while validating a filter panel's DOM against its state. */
export class FilterDomErrors {
    public totalErrorsCount = 0;
    public validated = false;
    readonly #list: string[] = [];

    public add(error: string): void {
        this.#list.push(error);
        this.totalErrorsCount++;
    }

    public toString(): string {
        return this.#list.map((e) => '  • ' + e).join('\n');
    }
}

function labelOf(item: Element): string {
    return item.querySelector('.ag-checkbox-label')?.textContent?.trim() ?? '';
}

/**
 * Checks state-dependent invariants of a filter panel's DOM (the FilterDom analogue of the
 * GridRows/GridColumns validators). Violations are added to `errors`; FilterDom.check throws on any.
 */
export class FilterDomValidator {
    public constructor(
        private readonly errors: FilterDomErrors,
        private readonly api: GridApi,
        private readonly root: ParentNode = document
    ) {}

    public validate(
        mode: 'column-filter' | 'advanced-filter' | 'builder' | 'floating-filter' | 'filters-tool-panel'
    ): void {
        switch (mode) {
            case 'advanced-filter':
                this.validateAdvancedFilter();
                break;
            case 'column-filter':
                this.validateColumnFilter();
                break;
            case 'builder':
                this.validateBuilder();
                break;
            case 'floating-filter':
            case 'filters-tool-panel':
                break;
        }
    }

    /** Invalid expression must disable Apply (you cannot apply a filter that failed to parse). */
    private validateAdvancedFilter(): void {
        const wrapper = this.root.querySelector('.ag-advanced-filter');
        const input = wrapper?.querySelector<HTMLInputElement>('input[type=text]');
        if (!wrapper || !input) {
            return;
        }
        if (input.validationMessage) {
            const apply = wrapper.querySelector<HTMLButtonElement>(
                '.ag-advanced-filter-buttons .ag-filter-apply-panel-apply-button'
            );
            if (apply && !apply.disabled) {
                this.errors.add('advanced filter expression is invalid but the Apply button is enabled');
            }
        }
    }

    /** Set filter: the (Select All) checkbox must reflect the leaf selection (all / none / mixed). */
    private validateColumnFilter(): void {
        const popup = this.root.querySelector('.ag-filter-menu');
        const setList = popup?.querySelector('.ag-set-filter-list');
        if (!setList) {
            return;
        }
        const items = Array.from(setList.querySelectorAll<HTMLElement>('.ag-set-filter-item'));
        const selectAll = items.find((i) => labelOf(i) === '(Select All)');
        const box = selectAll?.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if (!selectAll || !box) {
            return;
        }
        // Validate against the top-level rows only: a group checkbox already summarises its whole
        // subtree (incl. collapsed descendants), so an indeterminate group counts as mixed. A flat
        // list has every row at depth 0, reducing this to plain all / none / mixed.
        const topLevel = items.filter((i) => i !== selectAll && setItemDepth(i) === 0);
        if (!topLevel.length) {
            return;
        }
        let allChecked = true;
        let allUnchecked = true;
        for (let i = 0, len = topLevel.length; i < len; ++i) {
            const cb = topLevel[i].querySelector<HTMLInputElement>('input[type="checkbox"]');
            if (cb?.indeterminate) {
                allChecked = false;
                allUnchecked = false;
            } else if (cb?.checked) {
                allUnchecked = false;
            } else {
                allChecked = false;
            }
        }
        if (allChecked && (!box.checked || box.indeterminate)) {
            this.errors.add('all set-filter items are selected but (Select All) is not fully checked');
        } else if (allUnchecked && (box.checked || box.indeterminate)) {
            this.errors.add('no set-filter items are selected but (Select All) is not fully unchecked');
        } else if (!allChecked && !allUnchecked && !box.indeterminate) {
            this.errors.add('set-filter selection is partial but (Select All) is not indeterminate');
        }
    }

    private validateBuilder(): void {
        const builder = this.root.querySelector('.ag-advanced-filter-builder');
        if (!builder) {
            return;
        }
        const wrappers = Array.from(builder.querySelectorAll('.ag-advanced-filter-builder-item-wrapper'));

        const first = wrappers[0];
        if (first && !first.querySelector('.ag-advanced-filter-builder-join-pill')) {
            this.errors.add('builder root item is not a join');
        }

        for (const wrapper of wrappers) {
            const column = wrapper.querySelector('.ag-advanced-filter-builder-column-pill');
            if (!column) {
                continue;
            }
            const operator = wrapper.querySelector('.ag-advanced-filter-builder-option-pill');
            const value = wrapper.querySelector('.ag-advanced-filter-builder-value-pill');
            const invalidVisible = hasVisibleInvalidIcon(wrapper);

            if (value && !operator) {
                this.errors.add('builder condition has a value pill but no operator pill');
            }
            if (!operator && !invalidVisible) {
                this.errors.add('builder condition is missing its operator but is not flagged invalid');
            }
        }
    }
}
