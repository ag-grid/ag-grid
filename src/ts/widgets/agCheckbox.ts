
import {Component} from "./component";
import {QuerySelector, Listener} from "./componentAnnotations";
import {Utils as _} from "../utils";
import {PostConstruct, Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SvgFactory} from "../svgFactory";

var svgFactory = SvgFactory.getInstance();

export class AgCheckbox extends Component {

    public static EVENT_CHANGED = 'change';

    private static TEMPLATE =
        '<span class="ag-checkbox">' +
        '  <span class="ag-checkbox-checked"></span>' +
        '  <span class="ag-checkbox-unchecked"></span>' +
        '  <span class="ag-checkbox-indeterminate"></span>' +
        '  <span class="ag-checkbox-label"></span>' +
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
        var label = this.getAttribute('label');
        if (label) {
            this.eLabel.innerText = label;
        }
    }

    private loadIcons(): void {
        _.removeAllChildren(this.eChecked);
        _.removeAllChildren(this.eUnchecked);
        _.removeAllChildren(this.eIndeterminate);
        if (this.readOnly) {
            this.eChecked.appendChild(_.createIconNoSpan('checkboxCheckedReadOnly', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedReadOnlyIcon));
            this.eUnchecked.appendChild(_.createIconNoSpan('checkboxUncheckedReadOnly', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedReadOnlyIcon));
            this.eIndeterminate.appendChild(_.createIconNoSpan('checkboxIndeterminateReadOnly', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateReadOnlyIcon));
        } else {
            this.eChecked.appendChild(_.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedIcon));
            this.eUnchecked.appendChild(_.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedIcon));
            this.eIndeterminate.appendChild(_.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateIcon));
        }
    }

    @Listener('click')
    private onClick(): void {
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
        var nextValue = this.getNextValue();

        if (this.passive) {
            this.dispatchEvent(AgCheckbox.EVENT_CHANGED, {selected: nextValue});
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

        this.dispatchEvent(AgCheckbox.EVENT_CHANGED, {selected: this.selected});
    }

    private updateIcons(): void {
        _.setVisible(this.eChecked, this.selected === true);
        _.setVisible(this.eUnchecked, this.selected === false);
        _.setVisible(this.eIndeterminate, this.selected === undefined);
    }
}