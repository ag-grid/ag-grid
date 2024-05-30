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
    private highlightedItems: number[] = [];

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

    public postConstruct(): void {
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

    public highlightIndex(index: number): void {
        this.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
            let highlighted = false;
            if (index !== -1) {
                highlighted = this.highlightedItems.some((currentIdx) => currentIdx === idx);
            }
            cmp.updateHighlighted(highlighted);
        });
    }

    public navigateToPage(key: 'PageUp' | 'PageDown' | 'Home' | 'End'): number | null {
        const newIndex = super.navigateToPage(key, this.lastRowHovered);

        if (newIndex != null) {
            this.animationFrameService.requestAnimationFrame(() => {
                if (!this.isAlive()) {
                    return null;
                }
                this.highlightSelectedValue(newIndex);
            });
        }

        return newIndex;
    }

    public highlightValue(value?: TValue): void {
        if (!this.currentList) {
            if (this.eLoading) {
                this.appendChild(this.eLoading);
            }
            return;
        }

        if (this.eLoading?.offsetParent) {
            this.eLoading.parentElement?.removeChild(this.eLoading);
        }

        const currentValueIndex = this.getValueIndex(value);

        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            this.refresh();
            this.ensureIndexVisible(currentValueIndex);
            // this second call to refresh is necessary to force scrolled elements
            // to be rendered with the correct index info.
            this.refresh(true);
            this.highlightSelectedValue(currentValueIndex);
        } else {
            this.refresh();
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

    public selectListItem(index: number, preventUnnecessaryScroll?: boolean): void {
        if (!this.currentList || index < 0 || index >= this.currentList.length) {
            return;
        }

        const wasScrolled = this.ensureIndexVisible(index, !preventUnnecessaryScroll);

        if (wasScrolled && !preventUnnecessaryScroll) {
            this.refresh(true);
        }
        this.highlightSelectedValue(index);
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

    private highlightSelectedValue(index?: number, value?: TValue): void {
        if (index == null) {
            index = this.getValueIndex(value);
        }

        this.lastRowHovered = index;
    }

    private getValueIndex(value?: TValue): number {
        const { currentList } = this;

        if (value == null || !currentList) {
            return -1;
        }

        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] === value) {
                return i;
            }
        }

        return -1;
    }

    public destroy(): void {
        super.destroy();
        this.eLoading = undefined;
    }
}
