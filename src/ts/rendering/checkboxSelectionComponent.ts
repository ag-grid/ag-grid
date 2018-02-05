
import {Component} from "../widgets/component";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from '../utils';
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Column} from "../entities/column";
import {Events} from "../events";
import {EventService} from "../eventService";
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";

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

    constructor() {
        super(`<span class="ag-selection-checkbox"/>`);
    }

    private createAndAddIcons(): void {
        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column);
        this.eIndeterminateIcon = _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.column);

        let element = this.getGui();
        element.appendChild(this.eCheckedIcon);
        element.appendChild(this.eUncheckedIcon);
        element.appendChild(this.eIndeterminateIcon);
    }

    private onDataChanged(): void {
        // when rows are loaded for the second time, this can impact the selection, as a row
        // could be loaded as already selected (if user scrolls down, and then up again).
        this.onSelectionChanged();
    }

    private onSelectionChanged(): void {
        let state = this.rowNode.isSelected();
        _.setVisible(this.eCheckedIcon, state === true);
        _.setVisible(this.eUncheckedIcon, state === false);
        _.setVisible(this.eIndeterminateIcon, typeof state !== 'boolean');
    }

    private onCheckedClicked(): number {
        let groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        let updatedCount = this.rowNode.setSelectedParams({newValue: false, groupSelectsFiltered: groupSelectsFiltered});
        return updatedCount;
    }

    private onUncheckedClicked(event: MouseEvent): number {
        let groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        let updatedCount = this.rowNode.setSelectedParams({newValue: true, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered});
        return updatedCount;
    }

    private onIndeterminateClicked(event: MouseEvent): void {
        let result = this.onUncheckedClicked(event);
        if (result===0) {
            this.onCheckedClicked();
        }
    }

    public init(params: any): void {

        this.rowNode = params.rowNode;
        this.column = params.column;

        this.createAndAddIcons();

        this.onSelectionChanged();

        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', event => _.stopPropagationForAgGrid(event) );
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', event => _.stopPropagationForAgGrid(event) );

        this.addDestroyableEventListener(this.eCheckedIcon, 'click', this.onCheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eUncheckedIcon, 'click', this.onUncheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eIndeterminateIcon, 'click', this.onIndeterminateClicked.bind(this));

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));

        if (typeof this.column.getColDef().checkboxSelection === 'function') {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelect.bind(this));
            this.showOrHideSelect();
        }
    }

    private showOrHideSelect(): void {
        let visible = this.column.isCellCheckboxSelection(this.rowNode);
        this.setVisible(visible);
    }
}
