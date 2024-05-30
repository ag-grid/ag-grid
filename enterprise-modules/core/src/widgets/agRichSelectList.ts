import type {
    Component,
    FieldPickerValueSelectedEvent,
    RichSelectParams,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { Events, VirtualList, _setAriaControls, _setAriaLabel } from '@ag-grid-community/core';

import { RichSelectRow } from './agRichSelectRow';

export class AgRichSelectList<TValue> extends VirtualList {
    private eLoading: HTMLElement | undefined;
    private lastRowHovered: number = -1;
    private currentList: TValue[] | undefined;
    private selectedItems: Set<number> = new Set<number>();

    constructor(
        private readonly params: RichSelectParams,
        private readonly eWrapper: HTMLElement
    ) {
        super({ cssIdentifier: 'rich-select' });
        this.params = params;
        this.setComponentCreator(this.createRowComponent.bind(this));
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
        this.addManagedListener(eGui, 'mousedown', (e) => {
            e.preventDefault();
            this.onMouseDown();
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

        const selectedPositions = this.getIndicesForValues(value);
        const len = selectedPositions.length;

        if (len === 0) {
            return;
        }

        if (len === 1) {
            // make sure the virtual list has been sized correctly
            this.refresh();
            this.ensureIndexVisible(selectedPositions[0]);
            // this second call to refresh is necessary to force scrolled elements
            // to be rendered with the correct index info.
            this.refresh(true);
            this.selectListItem(selectedPositions[0]);
        }
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

    public selectListItem(index: number): void {
        if (this.selectedItems.has(index)) {
            return;
        }
        this.selectedItems.add(index);
        this.refreshSelectedItems();
    }

    private deselectListItem(index: number): void {
        if (!this.selectedItems.has(index)) {
            return;
        }
        this.selectedItems.delete(index);
        this.refreshSelectedItems();
    }

    private refreshSelectedItems(): void {
        this.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
            const selected = this.selectedItems.has(idx);
            cmp.updateSelected(selected);
        });
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

    private createLoadingElement(): void {
        const eDocument = this.gos.getDocument();
        const translate = this.localeService.getLocaleTextFunc();
        const el = eDocument.createElement('div');

        el.classList.add('ag-loading-text');
        el.innerText = translate('loadingOoo', 'Loading...');
        this.eLoading = el;
    }

    private createRowComponent(value: TValue, searchString: string): Component {
        const row = new RichSelectRow<TValue>(this.params, this.eWrapper);
        row.setParentComponent(this);

        this.createBean(row);
        row.setState(value);

        const { highlightMatch, searchType = 'fuzzy' } = this.params;

        if (highlightMatch && searchType !== 'fuzzy') {
            row.highlightString(searchString);
        }

        return row;
    }

    private onPickerMouseMove(e: MouseEvent): void {
        const row = this.getRowForMouseEvent(e);

        if (row !== -1 && row != this.lastRowHovered) {
            this.lastRowHovered = row;
            // this.selectListItem(row, true);
        }
    }

    private getRowForMouseEvent(e: MouseEvent): number {
        const eGui = this.getGui();
        const rect = eGui.getBoundingClientRect();
        const scrollTop = this.getScrollTop();
        const mouseY = e.clientY - rect.top + scrollTop;

        return Math.floor(mouseY / this.getRowHeight());
    }

    private onMouseDown(): void {
        const parent = this.getParentComponent();
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey: false,
            value: 'foo',
            // value: this.value,
        };

        parent?.dispatchEvent(event);
    }

    private getIndicesForValues(values?: TValue[] | TValue): number[] {
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

    public override destroy(): void {
        super.destroy();
        this.eLoading = undefined;
    }
}
