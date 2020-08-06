import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { escapeString } from "../utils/string";
import { addCssClass, removeCssClass } from "../utils/dom";
import { findIndex } from "../utils/array";
import { KeyCode } from '../constants/keyCode';
import { setAriaSelected } from '../utils/aria';

export interface ListOption {
    value: string;
    text?: string;
}

export class AgList extends Component {
    public static EVENT_ITEM_SELECTED = 'selectedItem';
    private static ACTIVE_CLASS = 'ag-active-item';

    private options: ListOption[] = [];
    private itemEls: HTMLElement[] = [];
    private highlightedEl: HTMLElement;
    private value: string | null;
    private displayValue: string | null;

    constructor(private readonly cssIdentifier = 'default') {
        super(/* html */`<div class="ag-list ag-${cssIdentifier}-list" role="listbox"></div>`);
    }

    @PostConstruct
    private init(): void {
        this.addManagedListener(this.getGui(), 'keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        const key = e.keyCode;
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
                const isDown = key === KeyCode.DOWN;
                let itemToHighlight: HTMLElement;

                e.preventDefault();

                if (!this.highlightedEl) {
                    itemToHighlight = this.itemEls[isDown ? 0 : this.itemEls.length - 1];
                } else {
                    const currentIdx = this.itemEls.indexOf(this.highlightedEl);
                    let nextPos = currentIdx + (isDown ? 1 : -1);
                    nextPos = Math.min(Math.max(nextPos, 0), this.itemEls.length - 1);
                    itemToHighlight = this.itemEls[nextPos];
                }
                this.highlightItem(itemToHighlight);
                break;
        }
    }

    public addOptions(listOptions: ListOption[]): this {
        listOptions.forEach(listOption => this.addOption(listOption));
        return this;
    }

    public addOption(listOption: ListOption): this {
        const { value, text } = listOption;
        const sanitisedText = escapeString(text || value);

        this.options.push({ value, text: sanitisedText });
        this.renderOption(value, sanitisedText);

        return this;
    }

    private renderOption(value: string, text: string): void {
        const itemEl = document.createElement('div');
        itemEl.setAttribute('role', 'option');

        addCssClass(itemEl, 'ag-list-item');
        addCssClass(itemEl, `ag-${this.cssIdentifier}-list-item`);

        itemEl.innerHTML = text;
        itemEl.tabIndex = -1;

        this.itemEls.push(itemEl);

        this.addManagedListener(itemEl, 'mouseover', () => this.highlightItem(itemEl));
        this.addManagedListener(itemEl, 'mouseleave', () => this.clearHighlighted());
        this.addManagedListener(itemEl, 'click', () => this.setValue(value));

        this.getGui().appendChild(itemEl);
    }

    public setValue(value?: string, silent?: boolean): this {
        if (this.value === value) {
            this.fireItemSelected();
            return this;
        }

        if (value == null) {
            this.reset();
            return this;
        }

        const idx = findIndex(this.options, option => option.value === value);

        if (idx !== -1) {
            const option = this.options[idx];

            this.value = option.value;
            this.displayValue = option.text != null ? option.text : option.value;
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

    public getValue(): string | null {
        return this.value;
    }

    public getDisplayValue(): string | null {
        return this.displayValue;
    }

    public refreshHighlighted(): void {
        this.clearHighlighted();
        const idx = findIndex(this.options, option => option.value === this.value);

        if (idx !== -1) {
            this.highlightItem(this.itemEls[idx]);
        }
    }

    private reset(): void {
        this.value = null;
        this.displayValue = null;
        this.clearHighlighted();
        this.fireChangeEvent();
    }

    private highlightItem(el: HTMLElement): void {
        if (!el.offsetParent) { return; }

        this.clearHighlighted();
        this.highlightedEl = el;

        addCssClass(this.highlightedEl, AgList.ACTIVE_CLASS);
        setAriaSelected(this.highlightedEl, true);

        this.highlightedEl.focus();
    }

    private clearHighlighted(): void {
        if (!this.highlightedEl || !this.highlightedEl.offsetParent) { return; }

        removeCssClass(this.highlightedEl, AgList.ACTIVE_CLASS);
        setAriaSelected(this.highlightedEl, false);

        this.highlightedEl = null;
    }

    private fireChangeEvent(): void {
        this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        this.fireItemSelected();
    }

    private fireItemSelected(): void {
        this.dispatchEvent({ type: AgList.EVENT_ITEM_SELECTED });
    }
}
