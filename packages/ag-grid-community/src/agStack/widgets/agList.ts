import { KeyCode } from '../constants/keyCode';
import { AgComponentStub } from '../core/agComponentStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _setAriaRole } from '../utils/aria';
import { _last } from '../utils/array';
import { _clearElement, _isVisible } from '../utils/dom';
import { agListCSS } from './agList.css-GENERATED';
import { AgListItem } from './agListItem';

export interface ListOption<TValue = string> {
    value: TValue;
    text?: string;
}

export type AgListEvent = 'fieldValueChanged' | 'selectedItem';

export class AgList<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TEventType extends string = AgListEvent,
    TValue = string,
> extends AgComponentStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TEventType | AgListEvent
> {
    private options: ListOption<TValue>[] = [];

    private listItems: AgListItem<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TValue
    >[] = [];
    private highlightedItem: AgListItem<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TValue
    > | null = null;

    private value: TValue | null;
    private displayValue: string | null;

    constructor(private readonly cssIdentifier = 'default') {
        super({ tag: 'div', cls: `ag-list ag-${cssIdentifier}-list` });
        this.registerCSS(agListCSS);
    }

    public postConstruct(): void {
        const eGui = this.getGui();
        this.addManagedElementListeners(eGui, { mouseleave: () => this.clearHighlighted() });
    }

    public handleKeyDown(e: KeyboardEvent): void {
        const key = e.key;
        switch (key) {
            case KeyCode.ENTER:
                if (!this.highlightedItem) {
                    this.setValue(this.getValue());
                } else {
                    const pos = this.listItems.indexOf(this.highlightedItem);
                    this.setValueByIndex(pos);
                }
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                e.preventDefault();
                this.navigate(key);
                break;
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                e.preventDefault();
                this.navigateToPage(key);
                break;
        }
    }

    public addOptions(listOptions: ListOption<TValue>[]): this {
        for (const listOption of listOptions) {
            this.addOption(listOption);
        }
        return this;
    }

    public addOption(listOption: ListOption<TValue>): this {
        const { value, text } = listOption;
        const valueToRender = text ?? (value as any);

        this.options.push({ value, text: valueToRender });
        this.renderOption(value, valueToRender);

        this.updateIndices();

        return this;
    }

    public clearOptions(): void {
        this.options = [];
        this.reset(true);
        for (const item of this.listItems) {
            item.destroy();
        }

        _clearElement(this.getGui());

        this.listItems = [];
        this.refreshAriaRole();
    }

    public updateOptions(listOptions: ListOption<TValue>[]): boolean {
        const needsUpdate = this.options !== listOptions;
        if (needsUpdate) {
            this.clearOptions();
            this.addOptions(listOptions);
        }
        return needsUpdate;
    }

    public setValue(value?: TValue | null, silent?: boolean): this {
        if (this.value === value) {
            this.fireItemSelected();
            return this;
        }

        if (value == null) {
            this.reset(silent);
            return this;
        }

        const idx = this.options.findIndex((option) => option.value === value);

        if (idx !== -1) {
            const option = this.options[idx];

            this.value = option.value;
            this.displayValue = option.text!;
            this.highlightItem(this.listItems[idx]);

            if (!silent) {
                this.fireChangeEvent();
            }
        }

        return this;
    }

    public setValueByIndex(idx: number): this {
        return this.setValue(this.options[idx].value);
    }

    public getValue(): TValue | null {
        return this.value;
    }

    public getDisplayValue(): string | null {
        return this.displayValue;
    }

    public refreshHighlighted(): void {
        this.clearHighlighted();
        const idx = this.options.findIndex((option) => option.value === this.value);

        if (idx !== -1) {
            this.highlightItem(this.listItems[idx]);
        }
    }

    public highlightItem(
        item: AgListItem<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TComponentSelectorType,
            TValue
        >
    ): void {
        const itemEl = item.getGui();
        if (!_isVisible(itemEl)) {
            return;
        }

        this.clearHighlighted();
        item.setHighlighted(true);
        this.highlightedItem = item;

        const eGui = this.getGui();

        const { scrollTop, clientHeight } = eGui;
        const { offsetTop, offsetHeight } = itemEl;

        if (offsetTop + offsetHeight > scrollTop + clientHeight || offsetTop < scrollTop) {
            itemEl.scrollIntoView({ block: 'nearest' });
        }
    }

    public hideItemTooltip(): void {
        this.highlightedItem?.tooltipFeature?.attemptToHideTooltip();
    }

    public override destroy(): void {
        this.hideItemTooltip();
        super.destroy();
    }

    private reset(silent?: boolean): void {
        this.value = null;
        this.displayValue = null;
        this.clearHighlighted();
        if (!silent) {
            this.fireChangeEvent();
        }
    }

    private clearHighlighted(): void {
        this.highlightedItem?.setHighlighted(false);
        this.highlightedItem = null;
    }

    private renderOption(value: TValue, text: string): void {
        const item = new AgListItem<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TComponentSelectorType,
            TValue
        >(this.cssIdentifier, text, value);
        item.setParentComponent(this);
        const listItem = this.createManagedBean(item);

        this.listItems.push(listItem);
        this.getGui().appendChild(listItem.getGui());
    }

    private navigate(key: 'ArrowUp' | 'ArrowDown'): void {
        const isDown = key === KeyCode.DOWN;
        let itemToHighlight;

        const { listItems, highlightedItem } = this;
        if (!highlightedItem) {
            itemToHighlight = isDown ? listItems[0] : _last(listItems);
        } else {
            const currentIdx = listItems.indexOf(highlightedItem);
            let nextPos = currentIdx + (isDown ? 1 : -1);
            nextPos = Math.min(Math.max(nextPos, 0), listItems.length - 1);
            itemToHighlight = listItems[nextPos];
        }
        this.highlightItem(itemToHighlight);
    }

    private navigateToPage(key: 'PageUp' | 'PageDown' | 'Home' | 'End'): void {
        const { listItems, highlightedItem } = this;
        if (!highlightedItem || listItems.length === 0) {
            return;
        }

        const currentIdx = listItems.indexOf(highlightedItem);
        const rowCount = this.options.length - 1;
        const itemHeight = listItems[0].getHeight();
        const pageSize = Math.floor(this.getGui().clientHeight / itemHeight);

        let newIndex = -1;

        if (key === KeyCode.PAGE_HOME) {
            newIndex = 0;
        } else if (key === KeyCode.PAGE_END) {
            newIndex = rowCount;
        } else if (key === KeyCode.PAGE_DOWN) {
            newIndex = Math.min(currentIdx + pageSize, rowCount);
        } else if (key === KeyCode.PAGE_UP) {
            newIndex = Math.max(currentIdx - pageSize, 0);
        }

        if (newIndex === -1) {
            return;
        }

        this.highlightItem(listItems[newIndex]);
    }

    private refreshAriaRole(): void {
        _setAriaRole(this.getGui(), this.options.length === 0 ? 'presentation' : 'listbox');
    }

    private updateIndices(): void {
        this.refreshAriaRole();

        const listItems = this.listItems;
        const len = listItems.length;

        listItems.forEach((item, idx) => {
            item.setIndex(idx + 1, len);
        });
    }

    private fireChangeEvent(): void {
        this.dispatchLocalEvent({ type: 'fieldValueChanged' });
        this.fireItemSelected();
    }

    private fireItemSelected(): void {
        this.dispatchLocalEvent({ type: 'selectedItem' });
    }
}
