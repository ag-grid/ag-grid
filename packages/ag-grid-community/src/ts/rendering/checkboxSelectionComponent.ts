import { Component } from "../widgets/component";
import { RowNode } from "../entities/rowNode";
import { Autowired } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { Column } from "../entities/column";
import { Events } from "../events";
import { EventService } from "../eventService";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { IsRowSelectable } from "../entities/gridOptions";
import { _ } from '../utils';

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
    private isRowSelectableFunc: IsRowSelectable;

    constructor() {
        super(`<span class="ag-selection-checkbox" unselectable="on"/>`);
    }

    private createAndAddIcons(): void {
        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column);
        this.eIndeterminateIcon = _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.column);

        const element = this.getGui();
        element.appendChild(this.eCheckedIcon);
        element.appendChild(this.eUncheckedIcon);
        element.appendChild(this.eIndeterminateIcon);
    }

    private onDataChanged(): void {
        // when rows are loaded for the second time, this can impact the selection, as a row
        // could be loaded as already selected (if user scrolls down, and then up again).
        this.onSelectionChanged();
    }

    private onSelectableChanged(): void {
        this.showOrHideSelect();
    }

    private onSelectionChanged(): void {
        const state = this.rowNode.isSelected();
        _.setDisplayed(this.eCheckedIcon, state === true);
        _.setDisplayed(this.eUncheckedIcon, state === false);
        _.setDisplayed(this.eIndeterminateIcon, typeof state !== 'boolean');
    }

    private onCheckedClicked(): number {
        const groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        const updatedCount = this.rowNode.setSelectedParams({newValue: false, groupSelectsFiltered: groupSelectsFiltered});
        return updatedCount;
    }

    private onUncheckedClicked(event: MouseEvent): number {
        const groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        const updatedCount = this.rowNode.setSelectedParams({newValue: true, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered});
        return updatedCount;
    }

    private onIndeterminateClicked(event: MouseEvent): void {
        const result = this.onUncheckedClicked(event);
        if (result === 0) {
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
        this.addGuiEventListener('click', event => _.stopPropagationForAgGrid(event));
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', event => _.stopPropagationForAgGrid(event));

        this.addDestroyableEventListener(this.eCheckedIcon, 'click', this.onCheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eUncheckedIcon, 'click', this.onUncheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eIndeterminateIcon, 'click', this.onIndeterminateClicked.bind(this));

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_SELECTABLE_CHANGED, this.onSelectableChanged.bind(this));

        this.isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
        const checkboxVisibleIsDynamic = this.isRowSelectableFunc || this.checkboxCallbackExists();
        if (checkboxVisibleIsDynamic) {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelect.bind(this));
            this.showOrHideSelect();
        }
    }

    private showOrHideSelect(): void {
        // if the isRowSelectable() is not provided the row node is selectable by default
        let selectable = this.rowNode.selectable;

        // checkboxSelection callback is deemed a legacy solution however we will still consider it's result.
        // If selectable, then also check the colDef callback. if not selectable, this it short circuits - no need
        // to call the colDef callback.
        if (selectable && this.checkboxCallbackExists()) {
            selectable = this.column.isCellCheckboxSelection(this.rowNode);
        }

        // show checkbox if both conditions are true
        this.setDisplayed(selectable);
    }

    private checkboxCallbackExists(): boolean {
        // column will be missing if groupUseEntireRow=true
        const colDef = this.column ? this.column.getColDef() : null;
        return colDef && typeof colDef.checkboxSelection === 'function';
    }
}