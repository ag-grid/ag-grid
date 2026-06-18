import type { HighlightTooltipEventType, VerticalDirection } from 'ag-stack';
import {
    _addOrRemoveAttribute,
    _requestAnimationFrame,
    _setAriaActiveDescendant,
    _setAriaControlsAndLabel,
    _setAriaLabel,
    _setDisplayed,
} from 'ag-stack';

import type { Component, RichSelectParams } from 'ag-grid-community';
import { KeyCode, _clamp, _createElement, _createIconNoSpan } from 'ag-grid-community';

import { resolveRichSelectValueFormatter } from './agRichSelect';
import { RichSelectRow } from './agRichSelectRow';
import { VirtualList } from './virtualList';

export type AgRichSelectListEvent = 'fieldPickerValueSelected' | 'richSelectListRowSelected';

const LIST_COMPONENT_NAME = 'ag-rich-select-list';
const ROW_COMPONENT_NAME = 'ag-rich-select-row';

type AgRichSelectListState = 0 | 1 | 2 | 3;
const STATE_LOADING = 0;
const STATE_READY_WITH_RESULTS = 1;
const STATE_NO_RESULTS = 2;
const STATE_READY_FOR_INPUT = 3;

export class AgRichSelectList<TValue, TEventType extends string = AgRichSelectListEvent> extends VirtualList<
    Component<TEventType | AgRichSelectListEvent | HighlightTooltipEventType>,
    TValue,
    TEventType | AgRichSelectListEvent
> {
    private eStateComp: HTMLElement | undefined;
    private lastRowHovered: number = -1;
    private currentList: TValue[] | undefined;
    private readonly selectedItems: Set<TValue> = new Set<TValue>();
    private loadingLabel: string;
    private noMatchesLabel: string;
    private loadingState = STATE_READY_FOR_INPUT;
    private eStateCompLabel: HTMLElement;
    private eLoadingIcon: Element | undefined;
    private loadMoreRowsCallback?: (direction?: VerticalDirection) => void;
    private loadMoreRowsThreshold = 10;
    private stateAnnouncementCallback?: (value: string) => void;
    private readonly valueFormatter: (value: TValue | TValue[] | null | undefined) => string;

    constructor(
        private readonly params: RichSelectParams<TValue>,
        private readonly richSelectWrapper: HTMLElement,
        private readonly getSearchString: () => string
    ) {
        super({ cssIdentifier: 'rich-select' });
        this.valueFormatter = resolveRichSelectValueFormatter<TValue>(params.valueFormatter);
        this.setComponentCreator(this.createRowComponent.bind(this));
        /* nothing to update but method required to soft refresh */
        this.setComponentUpdater(() => {});
    }

    public override postConstruct(): void {
        super.postConstruct();
        const translate = this.getLocaleTextFunc();
        this.loadingLabel = translate('loadingOoo', 'Loading...');
        this.noMatchesLabel = translate('noMatches', 'No matches to show');

        this.eLoadingIcon = _createIconNoSpan('richSelectLoading', this.beans, null);
        this.eStateCompLabel = _createElement({ tag: 'span', cls: 'ag-loading-text', children: this.loadingLabel });

        this.eStateComp = _createElement({
            tag: 'div',
            cls: 'ag-rich-select-loading',
            children: [
                {
                    tag: 'span',
                    cls: 'ag-loading-icon',
                    children: [this.eLoadingIcon ? () => this.eLoadingIcon! : undefined],
                },
                { tag: 'span', cls: 'ag-loading-text', children: [() => this.eStateCompLabel] },
            ],
        });

        this.appendChild(this.eStateComp);

        const { cellRowHeight, pickerAriaLabelKey, pickerAriaLabelValue } = this.params;

        if (cellRowHeight) {
            this.setRowHeight(cellRowHeight);
        }

        const eGui = this.getGui();
        const eListAriaEl = this.getAriaElement();

        this.addManagedListeners(eGui, {
            mousemove: this.onMouseMove.bind(this),
            mouseout: this.onMouseOut.bind(this),
            mousedown: this.onMouseDown.bind(this),
            click: this.onClick.bind(this),
            scroll: this.onGuiScroll.bind(this),
        });

        eGui.classList.add(LIST_COMPONENT_NAME);

        const listId = `${LIST_COMPONENT_NAME}-${this.getCompId()}`;
        eListAriaEl.setAttribute('id', listId);
        const ariaLabel = translate(pickerAriaLabelKey, pickerAriaLabelValue);

        _setAriaLabel(eListAriaEl, ariaLabel);
        _setAriaControlsAndLabel(this.richSelectWrapper, eListAriaEl);
    }

    public setIsLoading() {
        this.setLoadingState(STATE_LOADING);
    }

    private setLoadingState(state: AgRichSelectListState): void {
        const hasChanged = this.loadingState !== state;
        this.loadingState = state;
        this.toggleStateComp();
        this.toggleVisibility();
        if (hasChanged) {
            const stateAnnouncement = this.getStateAnnouncementText(state);
            if (stateAnnouncement) {
                this.stateAnnouncementCallback?.(stateAnnouncement);
            }
        }
    }

    private toggleStateComp(): void {
        const { eStateComp, eStateCompLabel, eLoadingIcon, loadingState, loadingLabel, noMatchesLabel, params } = this;
        if (!eStateComp) {
            return;
        }
        if (loadingState === STATE_LOADING) {
            eStateCompLabel.textContent = loadingLabel;
            if (eLoadingIcon) {
                _setDisplayed(eLoadingIcon, true);
            }
            _setDisplayed(eStateComp, true);
            return;
        }
        if (loadingState === STATE_NO_RESULTS && params.allowNoResultsCopy) {
            eStateCompLabel.textContent = noMatchesLabel;
            if (eLoadingIcon) {
                _setDisplayed(eLoadingIcon, false);
            }
            _setDisplayed(eStateComp, true);
            return;
        }
        _setDisplayed(eStateComp, false);
    }

    private shouldBeVisible() {
        if (this.loadingState === STATE_NO_RESULTS) {
            return !!this.params.allowNoResultsCopy;
        }
        return this.loadingState !== STATE_READY_FOR_INPUT;
    }

    public toggleVisibility(forceVisible?: boolean) {
        const eListGui = this.getGui();
        if (forceVisible === undefined) {
            _setDisplayed(eListGui, this.shouldBeVisible());
        } else {
            _setDisplayed(eListGui, forceVisible);
        }
        this.scheduleMaybeRequestMoreRows();
    }

    public setLoadMoreRowsCallback(callback?: (direction?: VerticalDirection) => void, thresholdRows = 10): void {
        this.loadMoreRowsCallback = callback;
        this.loadMoreRowsThreshold = Math.max(thresholdRows, 1);
        this.maybeRequestMoreRows();
    }

    public setStateAnnouncementCallback(callback?: (value: string) => void): void {
        this.stateAnnouncementCallback = callback;
    }

    public override navigateToPage(key: 'PageUp' | 'PageDown' | 'Home' | 'End'): number | null {
        const newIndex = super.navigateToPage(key, this.lastRowHovered);

        if (newIndex != null) {
            _requestAnimationFrame(this.beans, () => {
                if (!this.isAlive()) {
                    return null;
                }
                this.highlightIndex(newIndex);
            });
        }

        return newIndex;
    }

    protected override drawVirtualRows(softRefresh?: boolean | undefined): void {
        super.drawVirtualRows(softRefresh);

        this.refreshSelectedItems();
        if (this.lastRowHovered !== -1) {
            this.updateRenderedHighlightState(this.lastRowHovered);
        }
    }

    public highlightFilterMatch(searchString: string): void {
        this.forEachRenderedRow((cmp: RichSelectRow<TValue>) => {
            cmp.highlightString(searchString);
        });
    }

    public onNavigationKeyDown(key: string, announceItem: () => void): void {
        _requestAnimationFrame(this.beans, () => {
            if (!this.currentList || !this.isAlive()) {
                return;
            }
            const len = this.currentList.length;
            const oldIndex = this.lastRowHovered;

            const diff = key === KeyCode.DOWN ? 1 : -1;
            const newIndex = _clamp(oldIndex === -1 ? 0 : oldIndex + diff, 0, len - 1);
            this.highlightIndex(newIndex);
            announceItem();
        });
    }

    public selectValue(value?: TValue[] | TValue | null): boolean {
        if (!this.currentList || value == null) {
            return false;
        }

        const selectedPositions = this.getIndicesForValues(value);

        const refresh = selectedPositions.length > 0;

        if (refresh) {
            // make sure the virtual list has been sized correctly
            this.refresh();
            this.ensureIndexVisible(selectedPositions[0]);
            // this second call to refresh is necessary to force scrolled elements
            // to be rendered with the correct index info.
            this.refresh(true);
        }

        this.selectListItems(Array.isArray(value) ? value : [value]);

        if (refresh) {
            this.highlightIndex(selectedPositions[0], true);
        }

        return refresh;
    }

    private selectListItems(values: TValue[], append = false): void {
        if (!append) {
            this.selectedItems.clear();
        }

        for (let i = 0; i < values.length; i++) {
            const currentItem = values[i];
            if (this.findItemInSelected(currentItem) !== undefined) {
                continue;
            }
            this.selectedItems.add(currentItem);
        }

        this.refreshSelectedItems();
    }

    public getCurrentList(): TValue[] | undefined {
        return this.currentList;
    }

    public setCurrentList(list: TValue[] | undefined): void {
        const newState = getListStateBasedOnResults<TValue>(list);
        this.setLoadingState(newState);
        list ||= [];
        this.currentList = list;

        this.setModel({
            getRowCount: () => list.length,
            getRow: (index: number) => list[index],
            areRowsEqual: (oldRow, newRow) => oldRow === newRow,
        });
    }

    public offsetHoveredIndexOnPrependedRows(prependedRowCount: number): void {
        if (prependedRowCount <= 0 || this.lastRowHovered < 0) {
            return;
        }

        this.lastRowHovered += prependedRowCount;
    }

    public restoreScrollOnPrependedRows(previousScrollTop: number, prependedRowCount: number): void {
        if (prependedRowCount <= 0) {
            return;
        }

        const eGui = this.getGui();
        const rowHeight = this.getRowHeight();
        const nextScrollTop = previousScrollTop + prependedRowCount * rowHeight;

        this.awaitStable(() => {
            if (!this.isAlive()) {
                return;
            }
            eGui.scrollTop = nextScrollTop;
        });
    }

    public getSelectedItems(): Set<TValue> {
        return this.selectedItems;
    }

    public getLastItemHovered(): TValue | undefined {
        return this.currentList?.[this.lastRowHovered];
    }

    public highlightIndex(index: number, preventUnnecessaryScroll?: boolean): void {
        if (!this.currentList) {
            return;
        }

        if (index < 0 || index >= this.currentList.length) {
            this.lastRowHovered = -1;
            this.setActiveOption();
        } else {
            this.lastRowHovered = index;

            const wasScrolled = this.ensureIndexVisible(index, !preventUnnecessaryScroll);

            if (wasScrolled && !preventUnnecessaryScroll) {
                this.refresh(true);
            }
        }

        this.updateRenderedHighlightState(index);
    }

    private updateRenderedHighlightState(index: number): void {
        let activeOptionId: string | undefined;

        this.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
            const highlighted = index === idx;
            cmp.toggleHighlighted(highlighted);

            if (highlighted) {
                activeOptionId = `${ROW_COMPONENT_NAME}-${cmp.getCompId()}`;
            }
        });

        this.setActiveOption(activeOptionId);
    }

    private setActiveOption(activeOptionId?: string): void {
        _setAriaActiveDescendant(this.richSelectWrapper, activeOptionId ?? null);
        _addOrRemoveAttribute(this.richSelectWrapper, 'data-active-option', activeOptionId);
    }

    public getIndicesForValues(values?: TValue[] | TValue | null): number[] {
        const { currentList } = this;

        if (!currentList || currentList.length === 0 || values === undefined) {
            return [];
        }

        const valuesToFind = Array.isArray(values) ? values : [values];

        if (valuesToFind.length === 0) {
            return [];
        }

        const positions: number[] = [];
        let formattedList: string[] | undefined;

        for (const value of valuesToFind) {
            let idx = currentList.indexOf(value as TValue);
            if (idx === -1 && value != null) {
                formattedList ??= currentList.map((item) => this.valueFormatter(item));
                // objects must go through the formatter, while primitives are compared by their raw string value
                // so a primitive selected value (e.g. 'Blue') can still match a formatted object option in the list.
                const formattedValue = this.getComparableFormattedValue(value as TValue | null | undefined);
                idx = formattedList.indexOf(formattedValue);
            }

            if (idx >= 0) {
                positions.push(idx);
            }
        }

        return positions;
    }

    public toggleListItemSelection(value: TValue): void {
        const item = this.findItemInSelected(value);

        if (item !== undefined) {
            this.selectedItems.delete(item);
        } else {
            this.selectedItems.add(value);
        }

        this.refreshSelectedItems();
        this.dispatchValueSelected();
    }

    private refreshSelectedItems(): void {
        this.forEachRenderedRow((cmp: RichSelectRow<TValue>) => {
            const selected = this.findItemInSelected(cmp.getValue()) !== undefined;
            cmp.updateSelected(selected);
        });
    }

    private findItemInSelected(value: TValue): TValue | undefined {
        if (typeof value === 'object') {
            if (this.selectedItems.has(value)) {
                return value;
            }
            const valueFormatted = this.valueFormatter(value);
            for (const item of this.selectedItems) {
                if (this.valueFormatter(item) === valueFormatted) {
                    return item;
                }
            }
        } else {
            return this.selectedItems.has(value) ? value : undefined;
        }
    }

    private getComparableFormattedValue(value: TValue | null | undefined): string {
        return value != null && typeof value === 'object' ? this.valueFormatter(value) : String(value ?? '');
    }

    private createRowComponent(
        value: TValue,
        listItemElement: HTMLElement
    ): Component<AgRichSelectListEvent | HighlightTooltipEventType> {
        const row = new RichSelectRow<TValue>(this.params);
        listItemElement.setAttribute('id', `${ROW_COMPONENT_NAME}-${row.getCompId()}`);
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
        if (!this.model) {
            return -1;
        }

        const eGui = this.getGui();
        const rect = eGui.getBoundingClientRect();
        const scrollTop = this.getScrollTop();
        const mouseY = e.clientY - rect.top + scrollTop;

        return _clamp(Math.floor(mouseY / this.getRowHeight()), 0, this.model.getRowCount() - 1);
    }

    private onMouseMove(e: MouseEvent): void {
        const row = this.getRowForMouseEvent(e);

        if (row !== -1 && row != this.lastRowHovered) {
            this.lastRowHovered = row;
            this.highlightIndex(row, true);
        }
    }

    private onGuiScroll(): void {
        this.maybeRequestMoreRows(true);
    }

    private scheduleMaybeRequestMoreRows(): void {
        if (this.beans) {
            _requestAnimationFrame(this.beans, () => this.maybeRequestMoreRows(false));
            return;
        }

        this.maybeRequestMoreRows(false);
    }

    private maybeRequestMoreRows(fromScrollEvent = false): void {
        const callback = this.loadMoreRowsCallback;
        const currentList = this.currentList;

        if (!callback || !currentList || this.loadingState === STATE_LOADING) {
            return;
        }

        const eGui = this.getGui();
        if (eGui.clientHeight <= 0) {
            return;
        }

        const remainingPixels = eGui.scrollHeight - (eGui.scrollTop + eGui.clientHeight);
        const remainingRows = remainingPixels / this.getRowHeight();
        const rowsFromTop = eGui.scrollTop / this.getRowHeight();
        const hasVerticalOverflow = eGui.scrollHeight > eGui.clientHeight;

        // if there is no vertical overflow, a scroll event cannot happen, so allow layout checks
        // to request previous rows while still preserving scroll-driven behaviour when overflow exists.
        if (rowsFromTop <= this.loadMoreRowsThreshold && (fromScrollEvent || !hasVerticalOverflow)) {
            callback('up');
        }
        if (remainingRows <= this.loadMoreRowsThreshold) {
            callback('down');
        }
    }

    private getStateAnnouncementText(state: AgRichSelectListState): string | undefined {
        if (state === STATE_LOADING) {
            return this.loadingLabel;
        }

        if (state === STATE_NO_RESULTS && this.params.allowNoResultsCopy) {
            return this.noMatchesLabel;
        }

        return undefined;
    }

    private onMouseDown(e: MouseEvent): void {
        // this prevents the list from receiving focus as it
        // should be controlled by the agRichSelect component
        e.preventDefault();
    }

    private onMouseOut(e: MouseEvent): void {
        if (!this.getGui().contains(e.relatedTarget as HTMLElement)) {
            this.highlightIndex(-1);
        }
    }

    private onClick(e: MouseEvent): void {
        const { multiSelect } = this.params;

        if (!this.currentList?.length) {
            return;
        }

        const row = this.getRowForMouseEvent(e);
        const item = this.currentList[row];

        if (multiSelect) {
            this.toggleListItemSelection(item);
        } else {
            this.selectListItems([item]);
            this.dispatchValueSelected();
        }
    }

    private dispatchValueSelected(): void {
        this.dispatchLocalEvent({
            type: 'richSelectListRowSelected',
            fromEnterKey: false,
            value: this.selectedItems,
        });
    }

    public override destroy(): void {
        super.destroy();
        this.eStateComp = undefined;
    }
}

function getListStateBasedOnResults<TValue>(valueList: TValue[] | undefined): AgRichSelectListState {
    if (!valueList) {
        return STATE_READY_FOR_INPUT;
    }
    if (valueList.length) {
        return STATE_READY_WITH_RESULTS;
    }
    return STATE_NO_RESULTS;
}
