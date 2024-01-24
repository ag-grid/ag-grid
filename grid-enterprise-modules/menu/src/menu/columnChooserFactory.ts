import { AgDialog, Bean, BeanStub, Column, ColumnsMenuParams, IColumnChooserFactory } from "@ag-grid-community/core";
import { PrimaryColsPanel } from "@ag-grid-enterprise/column-tool-panel";

@Bean('columnChooserFactory')
export class ColumnChooserFactory extends BeanStub implements IColumnChooserFactory {
    private activeColumnChooser: PrimaryColsPanel | undefined;
    private activeColumnChooserDialog: AgDialog | undefined;

    public createColumnSelectPanel(
        parent: BeanStub, column?: Column | null, draggable?: boolean, params?: ColumnsMenuParams
    ): PrimaryColsPanel {
        const columnSelectPanel = parent.createManagedBean(new PrimaryColsPanel());
    
        const columnsMenuParams = params ?? column?.getColDef().columnsMenuParams ?? {};
    
        const {
            contractColumnSelection, suppressColumnExpandAll, suppressColumnFilter,
            suppressColumnSelectAll, suppressSyncLayoutWithGrid, columnLayout
        } = columnsMenuParams;
    
        columnSelectPanel.init(!!draggable, this.gridOptionsService.addGridCommonParams({
            suppressColumnMove: false,
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: !!contractColumnSelection,
            suppressColumnExpandAll: !!suppressColumnExpandAll,
            suppressColumnFilter: !!suppressColumnFilter,
            suppressColumnSelectAll: !!suppressColumnSelectAll,
            suppressSyncLayoutWithGrid: !!columnLayout || !!suppressSyncLayoutWithGrid,
            onStateUpdated: () => {}
        }), 'columnMenu');
    
        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }
    
        return columnSelectPanel;
    }

    public showColumnChooser({ column, params }: { column?: Column | null, params?: ColumnsMenuParams }): void {
        this.hideActiveColumnChooser();

        const columnSelectPanel = this.createColumnSelectPanel(this, column, true, params);
        const translate = this.localeService.getLocaleTextFunc();

        this.activeColumnChooserDialog = this.createBean(new AgDialog({
            title: translate('chooseColumns', 'Choose Columns'),
            component: columnSelectPanel,
            width: 300,
            height: 300,
            resizable: true,
            movable: true,
            centered: true,
            closable: true,
        }));

        this.activeColumnChooser = columnSelectPanel;

        this.activeColumnChooserDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => {
            this.destroyBean(this.activeColumnChooser);
            this.activeColumnChooser = undefined;
            this.activeColumnChooserDialog = undefined;
        });
    }

    public hideActiveColumnChooser(): void {
        if (this.activeColumnChooserDialog) {
            this.destroyBean(this.activeColumnChooserDialog);
        }
    }
}
