import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { escapeString } from "../utils/string";
import { KeyCode } from '../constants/keyCode';
import { setAriaPosInSet, setAriaRole, setAriaSelected, setAriaSetSize } from '../utils/aria';
import { Events } from "../eventKeys";
import { getInnerWidth, isVisible } from "../utils/dom";
import { TooltipFeature } from "./tooltipFeature";

export interface ListOption<TValue = string> {
    value: TValue;
    text?: string;
}

export class AgList extends Component {
    public static EVENT_ITEM_SELECTED = 'selectedItem';
    private static ACTIVE_CLASS = 'ag-active-item';

    private options: ListOption[] = [];
    private itemEls: HTMLElement[] = [];
    private highlightedEl: HTMLElement | null;
    private value: string | null;
    private displayValue: string | null;

    constructor(private readonly cssIdentifier = 'default', private readonly unFocusable: boolean = false) {
        super(/* html */`<div class="ag-list ag-${cssIdentifier}-list" role="listbox"></div>`);
    }

    @PostConstruct
    private init(): void {
        const eGui = this.getGui();
        this.addManagedListener(eGui, 'mouseleave', () => this.clearHighlighted());
        if (this.unFocusable) { return; }
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

        this.options.push({ value, text: sanitisedText! });
        this.renderOption(value, sanitisedText!);

        this.updateIndices();

        return this;
    }

    private updateIndices(): void {
        const options = this.getGui().querySelectorAll('.ag-list-item');
        options.forEach((option: HTMLElement, idx) => {
            setAriaPosInSet(option, idx + 1);
            setAriaSetSize(option, options.length);
        });
    }

    private renderOption(value: string, text: string): void {
        const eDocument = this.gridOptionsService.getDocument();
        const itemEl = eDocument.createElement('div');

        setAriaRole(itemEl, 'option');
        itemEl.classList.add('ag-list-item', `ag-${this.cssIdentifier}-list-item`);
        const span = eDocument.createElement('span');
        itemEl.appendChild(span);
        span.innerText = text;

        if (!this.unFocusable) {
            itemEl.tabIndex = -1;
        }

        this.itemEls.push(itemEl);

        this.addManagedListener(itemEl, 'mousemove', () => this.highlightItem(itemEl));
        this.addManagedListener(itemEl, 'mousedown', (e) => { e.preventDefault(); this.setValue(value) });
        this.createManagedBean(new TooltipFeature({
            getTooltipValue: () => text,
            getGui:  () => itemEl,
            getLocation: () => 'UNKNOWN',
            // only show tooltips for items where the text cannot be fully displayed
            shouldShowTooltip: () => span.scrollWidth > getInnerWidth(itemEl)
        }));

        this.getGui().appendChild(itemEl);
    }

    public setValue(value?: string | null, silent?: boolean): this {
        if (this.value === value) {
            this.fireItemSelected();
            return this;
        }

        if (value == null) {
            this.reset();
            return this;
        }

        const idx = this.options.findIndex(option => option.value === value);

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
        const idx = this.options.findIndex(option => option.value === this.value);

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
        if (!isVisible(el)) { return; }

        this.clearHighlighted();
        this.highlightedEl = el;

        this.highlightedEl.classList.add(AgList.ACTIVE_CLASS);
        setAriaSelected(this.highlightedEl, true);

        const eGui = this.getGui();
        const rect = eGui.getBoundingClientRect();

        const currentTop = rect.top + eGui.scrollTop;
        const height = rect.height;
        const { offsetTop, offsetHeight } = el;

        if (((offsetTop + offsetHeight) > currentTop + height) || (offsetTop < currentTop)) {
            this.highlightedEl.scrollIntoView({ block: 'nearest' })
        }

        if (!this.unFocusable) {
            this.highlightedEl.focus();
        }
    }

    private clearHighlighted(): void {
        if (!this.highlightedEl || !isVisible(this.highlightedEl)) { return; }

        this.highlightedEl.classList.remove(AgList.ACTIVE_CLASS);
        setAriaSelected(this.highlightedEl, false);

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
