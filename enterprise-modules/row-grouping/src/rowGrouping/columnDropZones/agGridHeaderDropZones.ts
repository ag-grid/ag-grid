import {
    AgComponentSelector,
    Autowired,
    ColumnModel,
    Component,
    Events,
    FuncColsService,
    _setAriaRole,
} from '@ag-grid-community/core';

import { PivotDropZonePanel } from './pivotDropZonePanel';
import { RowGroupDropZonePanel } from './rowGroupDropZonePanel';

export class AgGridHeaderDropZones extends Component {
    static readonly selector: AgComponentSelector = 'AG-GRID-HEADER-DROP-ZONES';

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('funcColsService') private funcColsService: FuncColsService;

    private rowGroupComp: Component;
    private pivotComp: Component;

    constructor() {
        super();
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.setGui(this.createNorthPanel());

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () =>
            this.onRowGroupChanged()
        );
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onRowGroupChanged());
        this.addManagedPropertyListener('rowGroupPanelShow', () => this.onRowGroupChanged());
        this.addManagedPropertyListener('pivotPanelShow', () => this.onPivotPanelShow());

        this.onRowGroupChanged();
    }

    private createNorthPanel(): HTMLElement {
        const topPanelGui = document.createElement('div');

        topPanelGui.classList.add('ag-column-drop-wrapper');
        _setAriaRole(topPanelGui, 'presentation');

        this.rowGroupComp = new RowGroupDropZonePanel(true);
        this.createManagedBean(this.rowGroupComp);

        this.pivotComp = new PivotDropZonePanel(true);
        this.createManagedBean(this.pivotComp);

        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());

        this.addManagedListener(this.rowGroupComp, Component.EVENT_DISPLAYED_CHANGED, () => this.onDropPanelVisible());
        this.addManagedListener(this.pivotComp, Component.EVENT_DISPLAYED_CHANGED, () => this.onDropPanelVisible());

        this.onDropPanelVisible();

        return topPanelGui;
    }

    private onDropPanelVisible(): void {
        const bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
        this.rowGroupComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
        this.pivotComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
    }

    private onRowGroupChanged(): void {
        if (!this.rowGroupComp) {
            return;
        }

        const rowGroupPanelShow = this.gos.get('rowGroupPanelShow');

        if (rowGroupPanelShow === 'always') {
            this.rowGroupComp.setDisplayed(true);
        } else if (rowGroupPanelShow === 'onlyWhenGrouping') {
            const grouping = !this.funcColsService.isRowGroupEmpty();
            this.rowGroupComp.setDisplayed(grouping);
        } else {
            this.rowGroupComp.setDisplayed(false);
        }
    }

    private onPivotPanelShow() {
        if (!this.pivotComp) {
            return;
        }

        const pivotPanelShow = this.gos.get('pivotPanelShow');

        if (pivotPanelShow === 'always') {
            this.pivotComp.setDisplayed(true);
        } else if (pivotPanelShow === 'onlyWhenPivoting') {
            const pivoting = this.columnModel.isPivotActive();
            this.pivotComp.setDisplayed(pivoting);
        } else {
            this.pivotComp.setDisplayed(false);
        }
    }
}
