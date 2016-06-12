
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
        '</span>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @QuerySelector('.ag-checkbox-checked') private eChecked: HTMLElement;
    @QuerySelector('.ag-checkbox-unchecked') private eUnchecked: HTMLElement;
    @QuerySelector('.ag-checkbox-indeterminate') private eIndeterminate: HTMLElement;

    private selected = false;

    constructor() {
        super(AgCheckbox.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.eChecked.appendChild(_.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedIcon));
        this.eUnchecked.appendChild(_.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedIcon));
        this.eIndeterminate.appendChild(_.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateIcon));
        
        this.updateIcons();
    }
    
    @Listener('click')
    private onClick(): void {
        if (this.selected === undefined) {
            this.setSelected(true);
        } else {
            this.setSelected(!this.selected);
        }
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public toggle(): void {
        this.setSelected(!this.selected);
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