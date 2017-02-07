
import {Component} from "../widgets/component";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from '../utils';
import {Autowired, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SvgFactory} from "../svgFactory";
import {Column} from "../entities/column";
import {Events} from "../events";
import {EventService} from "../eventService";
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnController";

var svgFactory = SvgFactory.getInstance();

export class CheckboxSelectionComponent extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;
    private eIndeterminateIcon: HTMLElement;

    private rowNode: RowNode;
    private column: Column;

    private visibleFunc: Function;

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

    private onCheckedClicked(): number {
        var groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        var updatedCount = this.rowNode.setSelectedParams({newValue: false, groupSelectsFiltered: groupSelectsFiltered});
        return updatedCount;
     }

    private onUncheckedClicked(event: MouseEvent): number {
        var groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        var updatedCount = this.rowNode.setSelectedParams({newValue: true, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered});
        return updatedCount;
    }

    private onIndeterminateClicked(event: MouseEvent): void {
        var result = this.onUncheckedClicked(event);
        if (result===0) {
            this.onCheckedClicked();
        }
    }

    public init(params: any): void {

        this.createAndAddIcons();

        this.rowNode = params.rowNode;
        this.column = params.column;
        this.visibleFunc = params.visibleFunc;

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

        if (this.visibleFunc) {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelect.bind(this));
            this.showOrHideSelect();
        }
    }

    private showOrHideSelect(): void {
        let params = this.createParams();
        let visible = this.visibleFunc(params);
        this.setVisible(visible);
    }

    private createParams(): any {
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        return params;
    }
}
