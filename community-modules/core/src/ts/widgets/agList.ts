import { Component } from "./component";
import { _ } from "../utils";

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
    private static TEMPLATE = `<div class="ag-list"></div>`;

    constructor() {
        super(AgList.TEMPLATE);
    }

    public addOptions(listOptions: ListOption[]): this {
        listOptions.forEach(listOption => this.addOption(listOption));
        return this;
    }

    public addOption(listOption: ListOption): this {
        const { value, text } = listOption;
        const sanitisedText = _.escape(text === undefined ? value : text);

        this.options.push({ value, text: sanitisedText });
        this.renderOption(sanitisedText);

        return this;
    }

    private renderOption(innerText: string): void {
        const itemEl = document.createElement('div');
        _.addCssClass(itemEl, 'ag-list-item');
        itemEl.innerHTML = innerText;

        this.itemEls.push(itemEl);
        this.addDestroyableEventListener(itemEl, 'mouseover', (e: MouseEvent) => this.highlightItem((e.target as HTMLElement)));
        this.addDestroyableEventListener(itemEl, 'click', (e: MouseEvent) => {
            const idx = this.itemEls.indexOf(itemEl);
            this.setValueByIndex(idx);
        });
        this.getGui().appendChild(itemEl);
    }

    public setValue(value?: string, silent?: boolean): this {
        if (this.value === value) { return this; }

        if (value == null) {
            this.reset();
            return this;
        }

        const idx = _.findIndex(this.options, option => option.value === value);

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

    private reset(): void {
        this.value = null;
        this.displayValue = null;
        this.clearHighlighted();
        this.fireChangeEvent();
    }

    private highlightItem(el: HTMLElement): void {
        if (!el.offsetParent) { return; }
        _.radioCssClass(el, 'ag-active-item');
        this.highlightedEl = el;
    }

    private clearHighlighted(): void {
        _.removeCssClass(this.highlightedEl, 'ag-active-item');
    }

    private fireChangeEvent(): void {
        this.dispatchEvent({ type: 'valueChange' });
    }
}