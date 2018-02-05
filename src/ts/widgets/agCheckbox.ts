
import {Component} from "./component";
import {QuerySelector, Listener} from "./componentAnnotations";
import {Utils as _} from "../utils";
import {PostConstruct, Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {AgEvent} from "../events";

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

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(AgCheckbox.TEMPLATE);

        this.loadIcons();
        this.updateIcons();
    }

    public attributesSet(): void {
        super.attributesSet();
        let label = this.getAttribute('label');
        if (label) {
            this.eLabel.innerText = label;
        }
    }

    private loadIcons(): void {
        _.removeAllChildren(this.eChecked);
        _.removeAllChildren(this.eUnchecked);
        _.removeAllChildren(this.eIndeterminate);
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
        let nextValue = this.getNextValue();

        if (this.passive) {
            let event: ChangeEvent = {
                type: AgCheckbox.EVENT_CHANGED,
                selected: nextValue
            };
            this.dispatchEvent(event);
        } else {
            this.setSelected(nextValue);
        }
    }
    
    public setSelected(selected: boolean): void {
        if (this.selected === selected) { return; }

        if (selected===true) {
            this.selected = true;
        } else if (selected===false) {
            this.selected = false;
        } else {
            this.selected = undefined;
        }

        this.updateIcons();

        let event: ChangeEvent = {
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
