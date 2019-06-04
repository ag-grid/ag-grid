import { Component } from "./component";
import { Listener, QuerySelector } from "./componentAnnotations";
import { Autowired, PostConstruct, PreConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { _ } from "../utils";

export interface ChangeEvent extends AgEvent {
    selected: boolean;
}

export class AgRadioButton extends Component {

    public static EVENT_CHANGED = 'change';

    private static TEMPLATE =
        '<div class="ag-radio-button" role="presentation">' +
        '  <span class="ag-radio-button-on" role="presentation"></span>' +
        '  <span class="ag-radio-button-off" role="presentation"></span>' +
        '  <span class="ag-radio-button-label" role="presentation"></span>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @QuerySelector('.ag-radio-button-on') private eRadioOn: HTMLElement;
    @QuerySelector('.ag-radio-button-off') private eRadioOff: HTMLElement;
    @QuerySelector('.ag-radio-button-label') private eLabel: HTMLElement;

    private selected = false;

    constructor() {
        super();
    }

    @PreConstruct
    private preConstruct(): void {
        this.setTemplate(AgRadioButton.TEMPLATE);
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
        _.clearElement(this.eRadioOn);
        _.clearElement(this.eRadioOff);

        this.eRadioOn.appendChild(_.createIconNoSpan('radioButtonOn', this.gridOptionsWrapper, null));
        this.eRadioOff.appendChild(_.createIconNoSpan('radioButtonOff', this.gridOptionsWrapper, null));
    }

    @Listener('click')
    private onClick(event: MouseEvent): void {
        // if we don't set the path, then won't work in Edge, as once the <span> is removed from the dom,
        // it's not possible to calculate the path by following the parent's chain. in other browser (eg
        // chrome) there is event.path for this purpose, but missing in Edge.
        _.addAgGridEventPath(event);

        this.toggle();
    }

    public getNextValue(): boolean {
        if (this.selected === undefined) {
            return true;
        } else {
            return !this.selected;
        }
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public toggle(): void {
        const nextValue = this.getNextValue();
        this.setSelected(nextValue);
    }

    public select(selected: boolean): void {
        if (this.selected === selected) {
            return;
        }
        this.selected = selected;
        this.updateIcons();
    }

    public setSelected(selected: boolean | null): void {
        if (this.selected === selected) {
            return;
        }

        this.selected = selected;

        this.updateIcons();

        const event: ChangeEvent = {
            type: AgRadioButton.EVENT_CHANGED,
            selected: this.selected
        };
        this.dispatchEvent(event);
    }

    private updateIcons(): void {
        _.setVisible(this.eRadioOn, this.selected === true);
        _.setVisible(this.eRadioOff, this.selected === false);

    }
}
