import type {
    Component,
    FieldPickerValueSelectedEvent,
    RichSelectParams,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { _setAriaControls, _setAriaLabel } from '@ag-grid-community/core';
import { KeyCode } from '@ag-grid-community/core';

import { RichSelectRow } from './agRichSelectRow';
import { VirtualList } from './virtualList';

export class AgRichSelectList<TValue> extends VirtualList {
    private eLoading: HTMLElement | undefined;
    private lastRowHovered: number = -1;
    private currentList: TValue[] | undefined;
    private selectedItems: Set<TValue> = new Set<TValue>();

    constructor(
        private readonly params: RichSelectParams,
        private readonly eWrapper: HTMLElement,
        private readonly getSearchString: () => string
    ) {
        super({ cssIdentifier: 'rich-select' });
        this.params = params;
        this.setComponentCreator((value: TValue) => this.createRowComponent(value));
        /* nothing to update but method required to soft refresh */
        this.setComponentUpdater(() => {});
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.createLoadingElement();

        const { cellRowHeight, pickerAriaLabelKey, pickerAriaLabelValue } = this.params;

        if (cellRowHeight) {
            this.setRowHeight(cellRowHeight);
        }

        const eGui = this.getGui();
        const eListAriaEl = this.getAriaElement();

        this.addManagedListener(eGui, 'mousemove', this.onPickerMouseMove.bind(this));
        this.addManagedListener(eGui, 'mouseout', () => {
            this.highlightIndex(-1);
        });
        this.addManagedListener(eGui, 'mousedown', (e) => {
            e.preventDefault();
        });
        this.addManagedListener(eGui, 'click', () => {
            this.onClick();
        });

        eGui.classList.add('ag-rich-select-list');

        const listId = `ag-rich-select-list-${this.getCompId()}`;
        eListAriaEl.setAttribute('id', listId);
        const translate = this.localeService.getLocaleTextFunc();
        const ariaLabel = translate(pickerAriaLabelKey, pickerAriaLabelValue);

        _setAriaLabel(eListAriaEl, ariaLabel);
        _setAriaControls(this.eWrapper, eListAriaEl);
    }

    public highlightFilterMatch(searchString: string): void {
        this.forEachRenderedRow((cmp: RichSelectRow<TValue>) => {
            cmp.highlightString(searchString);
        });
    }

    public onNavigationKeyDown(key: string): void {
        this.animationFrameService.requestAnimationFrame(() => {
            if (!this.currentList || !this.isAlive()) {
                return;
            }
            const len = this.currentList.length;
            const oldIndex = this.lastRowHovered;

            const diff = key === KeyCode.DOWN ? 1 : -1;
            const newIndex = Math.min(Math.max(oldIndex === -1 ? 0 : oldIndex + diff, 0), len - 1);
            this.highlightIndex(newIndex);
        });
    }

    public override navigateToPage(key: 'PageUp' | 'PageDown' | 'Home' | 'End'): number | null {
        const newIndex = super.navigateToPage(key, this.lastRowHovered);

        if (newIndex != null) {
            this.animationFrameService.requestAnimationFrame(() => {
                if (!this.isAlive()) {
                    return null;
                }
                this.highlightIndex(newIndex);
            });
        }

        return newIndex;
    }

    public selectValue(value?: TValue[] | TValue): void {
        if (!this.currentList) {
            if (this.eLoading) {
                this.appendChild(this.eLoading);
            }
            return;
        }

        if (this.eLoading?.offsetParent) {
            this.eLoading.parentElement?.removeChild(this.eLoading);
        }

        if (value == null) {
            return;
        }

        const selectedPositions = this.getIndicesForValues(value);
        const len = selectedPositions.length;

        if (len === 0) {
            return;
        }

        // make sure the virtual list has been sized correctly
        this.refresh();
        this.ensureIndexVisible(selectedPositions[0]);
        // this second call to refresh is necessary to force scrolled elements
        // to be rendered with the correct index info.
        this.refresh(true);

        this.selectListItems(Array.isArray(value) ? value : [value]);
    }

    public getCurrentList(): TValue[] | undefined {
        return this.currentList;
    }

    public setCurrentList(list: TValue[]): void {
        this.currentList = list;

        this.setModel({
            getRowCount: () => list.length,
            getRow: (index: number) => list[index],
            areRowsEqual: (oldRow, newRow) => oldRow === newRow,
        });
    }

    public selectListItems(values: TValue[], append = false): void {
        if (!append) {
            this.selectedItems.clear();
        }

        for (let i = 0; i < values.length; i++) {
            const currentItem = values[i];
            if (this.selectedItems.has(currentItem)) {
                continue;
            }
            this.selectedItems.add(currentItem);
        }

        this.refreshSelectedItems();
    }

    public getSelectedItems(): Set<TValue> {
        return this.selectedItems;
    }

    public getLastItemHovered(): TValue {
        return this.currentList![this.lastRowHovered];
    }

    public highlightIndex(index: number, preventUnnecessaryScroll?: boolean): void {
        if (!this.currentList) {
            return;
        }

        if (index < 0 || index >= this.currentList.length) {
            this.lastRowHovered = -1;
        } else {
            this.lastRowHovered = index;

            const wasScrolled = this.ensureIndexVisible(index, !preventUnnecessaryScroll);

            if (wasScrolled && !preventUnnecessaryScroll) {
                this.refresh(true);
            }
        }

        this.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
            cmp.updateHighlighted(index === idx);
        });
    }

    public getIndicesForValues(values?: TValue[] | TValue): number[] {
        const { currentList } = this;

        if (!currentList || currentList.length === 0 || values == null) {
            return [];
        }

        if (!Array.isArray(values)) {
            values = [values] as TValue[];
        }

        if (values.length === 0) {
            return [];
        }

        const positions: number[] = [];

        for (let i = 0; i < values.length; i++) {
            const idx = currentList.indexOf(values[i]);
            if (idx >= 0) {
                positions.push(idx);
            }
        }

        return positions;
    }

    public toggleListItemSelection(value: TValue): void {
        if (this.selectedItems.has(value)) {
            this.selectedItems.delete(value);
        } else {
            this.selectedItems.add(value);
        }

        this.refreshSelectedItems();
    }

    private refreshSelectedItems(): void {
        this.forEachRenderedRow((cmp: RichSelectRow<TValue>) => {
            const selected = this.selectedItems.has(cmp.getValue());
            cmp.updateSelected(selected);
        });
    }

    private createLoadingElement(): void {
        const eDocument = this.gos.getDocument();
        const translate = this.localeService.getLocaleTextFunc();
        const el = eDocument.createElement('div');

        el.classList.add('ag-loading-text');
        el.innerText = translate('loadingOoo', 'Loading...');
        this.eLoading = el;
    }

    private createRowComponent(value: TValue): Component {
        const row = new RichSelectRow<TValue>(this.params, this.eWrapper, (value) => this.selectedItems.has(value));
        row.setParentComponent(this);

        this.createBean(row);
        row.setState(value);

        const { highlightMatch, searchType = 'fuzzy' } = this.params;

        if (highlightMatch && searchType !== 'fuzzy') {
            row.highlightString(this.getSearchString());
        }

        return row;
    }

    private getRowForMouseEvent(e: MouseEvent): number {
        const eGui = this.getGui();
        const rect = eGui.getBoundingClientRect();
        const scrollTop = this.getScrollTop();
        const mouseY = e.clientY - rect.top + scrollTop;

        return Math.floor(mouseY / this.getRowHeight());
    }

    private onPickerMouseMove(e: MouseEvent): void {
        const row = this.getRowForMouseEvent(e);

        if (row !== -1 && row != this.lastRowHovered) {
            this.lastRowHovered = row;
            this.highlightIndex(row, true);
        }
    }

    private onClick(): void {
        const { multiSelect } = this.params;

        if (!this.currentList) {
            return;
        }

        const item = this.currentList[this.lastRowHovered];

        if (multiSelect) {
            this.toggleListItemSelection(item);
        } else {
            this.selectListItems([item]);
            this.dispatchValueSelected();
        }
    }

    private dispatchValueSelected(): void {
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: 'fieldPickerValueSelected',
            fromEnterKey: false,
            value: this.selectedItems,
        };

        this.dispatchLocalEvent(event);
    }

    public override destroy(): void {
        super.destroy();
        this.eLoading = undefined;
    }
}
