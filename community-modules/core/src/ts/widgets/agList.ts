import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { escapeString } from "../utils/string";
import { addCssClass, radioCssClass, removeCssClass } from "../utils/dom";
import { findIndex } from "../utils/array";
import { KeyCode } from '../constants/keyCode';

export interface ListOption {
    value: string;
    text?: string;
}

export class AgList extends Component {

    private options: ListOption[] = [];
    private itemEls: HTMLElement[] = [];
    private highlightedEl: HTMLElement;
    private value: string | null;
    private displayValue: string | null;
    public static EVENT_ITEM_SELECTED = 'selectedItem';

    constructor(private cssIdentifier = 'default') {
        super(AgList.getTemplate(cssIdentifier));
    }

    @PostConstruct
    private init(): void {
        this.addManagedListener(this.getGui(), 'keydown', this.handleKeyDown.bind(this));
    }

    private static getTemplate(cssIdentifier: string) {
        return `<div class="ag-list ag-${cssIdentifier}-list"></div>`;
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
        const sanitisedText = escapeString(text === undefined ? value : text);

        this.options.push({ value, text: sanitisedText });
        this.renderOption(sanitisedText);

        return this;
    }

    private renderOption(innerText: string): void {
        const itemEl = document.createElement('div');
        const itemContentEl = document.createElement('span');

        addCssClass(itemEl, 'ag-list-item');
        addCssClass(itemEl, `ag-${this.cssIdentifier}-list-item`);

        itemEl.tabIndex = -1;
        itemContentEl.innerHTML = innerText;
        this.itemEls.push(itemEl);

        this.addManagedListener(itemEl, 'mouseover', (e: MouseEvent) => this.highlightItem(itemEl));
        this.addManagedListener(itemEl, 'mouseleave', () => this.clearHighlighted());
        this.addManagedListener(itemEl, 'click', () => {
            const idx = this.itemEls.indexOf(itemEl);
            this.setValueByIndex(idx);
        });

        itemEl.appendChild(itemContentEl);
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
        radioCssClass(el, 'ag-active-item');
        this.highlightedEl = el;
        this.highlightedEl.focus();
    }

    private clearHighlighted(): void {
        if (!this.highlightedEl || !this.highlightedEl.offsetParent) { return; }
        removeCssClass(this.highlightedEl, 'ag-active-item');
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
