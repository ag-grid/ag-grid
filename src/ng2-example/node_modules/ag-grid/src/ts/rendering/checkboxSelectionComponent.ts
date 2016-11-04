
import {Component} from "../widgets/component";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from '../utils';
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SvgFactory} from "../svgFactory";

var svgFactory = SvgFactory.getInstance();

export class CheckboxSelectionComponent extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;
    private eIndeterminateIcon: HTMLElement;

    private rowNode: RowNode;

    constructor() {
        super(`<span class="ag-selection-checkbox"/>`);
    }

    private createAndAddIcons(): void {
        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedIcon);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedIcon);
        this.eIndeterminateIcon = _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateIcon);

        var eGui = this.getGui();
        eGui.appendChild(this.eCheckedIcon);
        eGui.appendChild(this.eUncheckedIcon);
        eGui.appendChild(this.eIndeterminateIcon);
    }

    private onSelectionChanged(): void {
        var state = this.rowNode.isSelected();
        _.setVisible(this.eCheckedIcon, state === true);
        _.setVisible(this.eUncheckedIcon, state === false);
        _.setVisible(this.eIndeterminateIcon, typeof state !== 'boolean');
    }

    private onCheckedClicked(): void {
        this.rowNode.setSelected(false);
    }

    private onUncheckedClicked(event: MouseEvent): void {
        this.rowNode.setSelectedParams({newValue: true, rangeSelect: event.shiftKey});
    }

    private onIndeterminateClicked(event: MouseEvent): void {
        this.rowNode.setSelectedParams({newValue: true, rangeSelect: event.shiftKey});
    }

    public init(params: any): void {

        this.createAndAddIcons();

        this.rowNode = params.rowNode;

        this.onSelectionChanged();

        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', event => event.stopPropagation() );
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', event => event.stopPropagation() );

        this.addDestroyableEventListener(this.eCheckedIcon, 'click', this.onCheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eUncheckedIcon, 'click', this.onUncheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eIndeterminateIcon, 'click', this.onIndeterminateClicked.bind(this));

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
    }
}
