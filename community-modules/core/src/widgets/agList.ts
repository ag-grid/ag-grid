import { KeyCode } from '../constants/keyCode';
import { Events } from '../eventKeys';
import { _setAriaPosInSet, _setAriaRole, _setAriaSelected, _setAriaSetSize } from '../utils/aria';
import { _isVisible, _removeFromParent } from '../utils/dom';
import { Component } from './component';
import { TooltipFeature } from './tooltipFeature';

export interface ListOption<TValue = string> {
    value: TValue;
    text?: string;
}

export class AgList<TValue = string> extends Component {
    public static EVENT_ITEM_SELECTED = 'selectedItem';
    private static ACTIVE_CLASS = 'ag-active-item';

    private options: ListOption<TValue>[] = [];
    private itemEls: HTMLElement[] = [];
    private highlightedEl: HTMLElement | null;
    private value: TValue | null;
    private displayValue: string | null;

    constructor(
        private readonly cssIdentifier = 'default',
        private readonly unFocusable: boolean = false
    ) {
        super(/* html */ `<div class="ag-list ag-${cssIdentifier}-list" role="listbox"></div>`);
    }

    public override postConstruct(): void {
        super.postConstruct();
        const eGui = this.getGui();
        this.addManagedListener(eGui, 'mouseleave', () => this.clearHighlighted());
        if (this.unFocusable) {
            return;
        }
        this.addManagedListener(eGui, 'keydown', this.handleKeyDown.bind(this));
    }

    public handleKeyDown(e: KeyboardEvent): void {
        const key = e.key;
        switch (key) {
            case KeyCode.ENTER:
                if (!this.highlightedEl) {
                    this.setValue(this.getValue());
                } else {
                    const pos = this.itemEls.indexOf(this.highlightedEl);
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

    private navigate(key: 'ArrowUp' | 'ArrowDown'): void {
        const isDown = key === KeyCode.DOWN;
        let itemToHighlight: HTMLElement;

        if (!this.highlightedEl) {
            itemToHighlight = this.itemEls[isDown ? 0 : this.itemEls.length - 1];
        } else {
            const currentIdx = this.itemEls.indexOf(this.highlightedEl);
            let nextPos = currentIdx + (isDown ? 1 : -1);
            nextPos = Math.min(Math.max(nextPos, 0), this.itemEls.length - 1);
            itemToHighlight = this.itemEls[nextPos];
        }
        this.highlightItem(itemToHighlight);
    }

    private navigateToPage(key: 'PageUp' | 'PageDown' | 'Home' | 'End'): void {
        if (!this.highlightedEl || this.itemEls.length === 0) {
            return;
        }

        const currentIdx = this.itemEls.indexOf(this.highlightedEl);
        const rowCount = this.options.length - 1;
        const itemHeight = this.itemEls[0].clientHeight;
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

        this.highlightItem(this.itemEls[newIndex]);
    }

    public addOptions(listOptions: ListOption<TValue>[]): this {
        listOptions.forEach((listOption) => this.addOption(listOption));
        return this;
    }

    public addOption(listOption: ListOption<TValue>): this {
        const { value, text } = listOption;
        const valueToRender = text || (value as any);

        this.options.push({ value, text: valueToRender });
        this.renderOption(value, valueToRender);

        this.updateIndices();

        return this;
    }

    public clearOptions(): void {
        this.options = [];
        this.reset(true);
        this.itemEls.forEach((itemEl) => {
            _removeFromParent(itemEl);
        });
        this.itemEls = [];
    }

    private updateIndices(): void {
        const options = this.getGui().querySelectorAll('.ag-list-item');
        options.forEach((option: HTMLElement, idx) => {
            _setAriaPosInSet(option, idx + 1);
            _setAriaSetSize(option, options.length);
        });
    }

    private renderOption(value: TValue, text: string): void {
        const eDocument = this.gos.getDocument();
        const itemEl = eDocument.createElement('div');

        _setAriaRole(itemEl, 'option');
        itemEl.classList.add('ag-list-item', `ag-${this.cssIdentifier}-list-item`);
        const span = eDocument.createElement('span');
        itemEl.appendChild(span);
        span.textContent = text;

        if (!this.unFocusable) {
            itemEl.tabIndex = -1;
        }

        this.itemEls.push(itemEl);

        this.addManagedListener(itemEl, 'mousemove', () => this.highlightItem(itemEl));
        this.addManagedListener(itemEl, 'mousedown', (e: MouseEvent) => {
            e.preventDefault();
            // `setValue` will already close the list popup, without stopPropagation
            // the mousedown event will close popups that own AgSelect
            e.stopPropagation();
            this.setValue(value);
        });
        this.createManagedBean(
            new TooltipFeature({
                getTooltipValue: () => text,
                getGui: () => itemEl,
                getLocation: () => 'UNKNOWN',
                // only show tooltips for items where the text cannot be fully displayed
                shouldDisplayTooltip: () => span.scrollWidth > span.clientWidth,
            })
        );

        this.getGui().appendChild(itemEl);
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
            this.highlightItem(this.itemEls[idx]);

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
            this.highlightItem(this.itemEls[idx]);
        }
    }

    private reset(silent?: boolean): void {
        this.value = null;
        this.displayValue = null;
        this.clearHighlighted();
        if (!silent) {
            this.fireChangeEvent();
        }
    }

    private highlightItem(el: HTMLElement): void {
        if (!_isVisible(el)) {
            return;
        }

        this.clearHighlighted();
        this.highlightedEl = el;

        this.highlightedEl.classList.add(AgList.ACTIVE_CLASS);
        _setAriaSelected(this.highlightedEl, true);

        const eGui = this.getGui();

        const { scrollTop, clientHeight } = eGui;
        const { offsetTop, offsetHeight } = el;

        if (offsetTop + offsetHeight > scrollTop + clientHeight || offsetTop < scrollTop) {
            this.highlightedEl.scrollIntoView({ block: 'nearest' });
        }

        if (!this.unFocusable) {
            this.highlightedEl.focus();
        }
    }

    private clearHighlighted(): void {
        if (!this.highlightedEl || !_isVisible(this.highlightedEl)) {
            return;
        }

        this.highlightedEl.classList.remove(AgList.ACTIVE_CLASS);
        _setAriaSelected(this.highlightedEl, false);

        this.highlightedEl = null;
    }

    private fireChangeEvent(): void {
        this.dispatchEvent({ type: Events.EVENT_FIELD_VALUE_CHANGED });
        this.fireItemSelected();
    }

    private fireItemSelected(): void {
        this.dispatchEvent({ type: AgList.EVENT_ITEM_SELECTED });
    }
}
