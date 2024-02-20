import {
    AgDialog,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnChooserParams,
    ColumnMenuVisibleChangedEvent,
    ColumnModel,
    Events,
    FocusService,
    IColumnChooserFactory,
    ShowColumnChooserParams,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { PrimaryColsPanel } from "@ag-grid-enterprise/column-tool-panel";
import { MenuUtils } from "./menuUtils";

@Bean('columnChooserFactory')
export class ColumnChooserFactory extends BeanStub implements IColumnChooserFactory {
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('menuUtils') private readonly menuUtils: MenuUtils;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private activeColumnChooser: PrimaryColsPanel | undefined;
    private activeColumnChooserDialog: AgDialog | undefined;

    public createColumnSelectPanel(
        parent: BeanStub, column?: Column | null, draggable?: boolean, params?: ColumnChooserParams
    ): PrimaryColsPanel {
        const columnSelectPanel = parent.createManagedBean(new PrimaryColsPanel());
    
        const columnChooserParams = params ?? column?.getColDef().columnChooserParams ?? column?.getColDef().columnsMenuParams ?? {};
    
        const {
            contractColumnSelection, suppressColumnExpandAll, suppressColumnFilter,
            suppressColumnSelectAll, suppressSyncLayoutWithGrid, columnLayout
        } = columnChooserParams;
    
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

    public showColumnChooser({ column, chooserParams, eventSource }: ShowColumnChooserParams): void {
        this.hideActiveColumnChooser();

        const columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
        const translate = this.localeService.getLocaleTextFunc();
        const columnIndex = this.columnModel.getAllDisplayedColumns().indexOf(column!);
        const headerPosition = column ? this.focusService.getFocusedHeader() : null;

        this.activeColumnChooserDialog = this.createBean(new AgDialog({
            title: translate('chooseColumns', 'Choose Columns'),
            component: columnSelectPanel,
            width: 300,
            height: 300,
            resizable: true,
            movable: true,
            centered: true,
            closable: true,
            afterGuiAttached: () => {
                this.focusService.findNextFocusableElement(columnSelectPanel.getGui())?.focus();
                this.dispatchVisibleChangedEvent(true, column);
            },
            closedCallback: (event) => {
                const eComp = this.activeColumnChooser!.getGui();
                this.destroyBean(this.activeColumnChooser);
                this.activeColumnChooser = undefined;
                this.activeColumnChooserDialog = undefined;
                this.dispatchVisibleChangedEvent(false, column);
                if (column) {
                    this.menuUtils.restoreFocusOnClose({ column, headerPosition, columnIndex, eventSource }, eComp, event, true);
                }
            }
        }));

        this.activeColumnChooser = columnSelectPanel;
    }

    public hideActiveColumnChooser(): void {
        if (this.activeColumnChooserDialog) {
            this.destroyBean(this.activeColumnChooserDialog);
        }
    }

    private dispatchVisibleChangedEvent(visible: boolean, column?: Column | null): void {
        const event: WithoutGridCommon<ColumnMenuVisibleChangedEvent> = {
            type: Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible,
            switchingTab: false,
            key: 'columnChooser',
            column: column ?? null
        };
        this.eventService.dispatchEvent(event);
    }
}
