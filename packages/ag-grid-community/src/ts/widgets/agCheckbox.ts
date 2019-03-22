import { Component } from "./component";
import { Listener, QuerySelector } from "./componentAnnotations";
import { Autowired, PostConstruct, PreConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { _ } from "../utils";

export interface ChangeEvent extends AgEvent {
    selected: boolean;
}

export class AgCheckbox extends Component {

    public static EVENT_CHANGED = 'change';

    private static TEMPLATE =
        '<span class="ag-checkbox" role="presentation">' +
        '  <span class="ag-checkbox-checked" role="presentation"></span>' +
        '  <span class="ag-checkbox-unchecked" role="presentation"></span>' +
        '  <span class="ag-checkbox-indeterminate" role="presentation"></span>' +
        '  <span class="ag-checkbox-label" role="presentation"></span>' +
        '</span>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @QuerySelector('.ag-checkbox-checked') private eChecked: HTMLElement;
    @QuerySelector('.ag-checkbox-unchecked') private eUnchecked: HTMLElement;
    @QuerySelector('.ag-checkbox-indeterminate') private eIndeterminate: HTMLElement;
    @QuerySelector('.ag-checkbox-label') private eLabel: HTMLElement;

    private selected = false;
    private readOnly = false;
    private passive = false;

    constructor() {
        super();
    }

    @PreConstruct
    private preConstruct(): void {
        this.setTemplate(AgCheckbox.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.loadIcons();
        this.updateIcons();
    }

    public setLabel(label: string): void {
        this.eLabel.innerText = label;
    }

    private loadIcons(): void {
        _.clearElement(this.eChecked);
        _.clearElement(this.eUnchecked);
        _.clearElement(this.eIndeterminate);
        if (this.readOnly) {
            this.eChecked.appendChild(_.createIconNoSpan('checkboxCheckedReadOnly', this.gridOptionsWrapper, null));
            this.eUnchecked.appendChild(_.createIconNoSpan('checkboxUncheckedReadOnly', this.gridOptionsWrapper, null));
            this.eIndeterminate.appendChild(_.createIconNoSpan('checkboxIndeterminateReadOnly', this.gridOptionsWrapper, null));
        } else {
            this.eChecked.appendChild(_.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null));
            this.eUnchecked.appendChild(_.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null));
            this.eIndeterminate.appendChild(_.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null));
        }
    }

    @Listener('click')
    private onClick(event: MouseEvent): void {
        // if we don't set the path, then won't work in Edge, as once the <span> is removed from the dom,
        // it's not possible to calculate the path by following the parent's chain. in other browser (eg
        // chrome) there is event.path for this purpose, but missing in Edge.
        _.addAgGridEventPath(event);

        if (!this.readOnly) {
            this.toggle();
        }
    }

    public getNextValue(): boolean {
        if (this.selected === undefined) {
            return true;
        } else {
            return !this.selected;
        }
    }

    public setPassive(passive: boolean): void {
        this.passive = passive;
    }

    public setReadOnly(readOnly: boolean): void {
        this.readOnly = readOnly;
        this.loadIcons();
    }

    public isReadOnly(): boolean {
        return this.readOnly;
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public toggle(): void {
        const nextValue = this.getNextValue();

        if (this.passive) {
            const event: ChangeEvent = {
                type: AgCheckbox.EVENT_CHANGED,
                selected: nextValue
            };
            this.dispatchEvent(event);
        } else {
            this.setSelected(nextValue);
        }
    }

    public setSelected(selected: boolean | null): void {
        if (this.selected === selected) {
            return;
        }

        if (selected === true) {
            this.selected = true;
        } else if (selected === false) {
            this.selected = false;
        } else {
            this.selected = undefined;
        }

        this.updateIcons();

        const event: ChangeEvent = {
            type: AgCheckbox.EVENT_CHANGED,
            selected: this.selected
        };
        this.dispatchEvent(event);
    }

    private updateIcons(): void {
        _.setVisible(this.eChecked, this.selected === true);
        _.setVisible(this.eUnchecked, this.selected === false);
        _.setVisible(this.eIndeterminate, this.selected === undefined);
    }
}
