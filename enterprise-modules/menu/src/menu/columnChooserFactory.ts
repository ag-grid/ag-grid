import {
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnChooserParams,
    ColumnMenuVisibleChangedEvent,
    Events,
    FocusService,
    IColumnChooserFactory,
    ShowColumnChooserParams,
    VisibleColsService,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { AgPrimaryCols } from '@ag-grid-enterprise/column-tool-panel';
import { AgDialog } from '@ag-grid-enterprise/core';

import { MenuUtils } from './menuUtils';

@Bean('columnChooserFactory')
export class ColumnChooserFactory extends BeanStub implements IColumnChooserFactory {
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('menuUtils') private readonly menuUtils: MenuUtils;
    @Autowired('visibleColsService') private readonly visibleColsService: VisibleColsService;

    private activeColumnChooser: AgPrimaryCols | undefined;
    private activeColumnChooserDialog: AgDialog | undefined;

    public createColumnSelectPanel(
        parent: BeanStub,
        column?: Column | null,
        draggable?: boolean,
        params?: ColumnChooserParams
    ): AgPrimaryCols {
        const columnSelectPanel = parent.createManagedBean(new AgPrimaryCols());

        const columnChooserParams =
            params ?? column?.getColDef().columnChooserParams ?? column?.getColDef().columnsMenuParams ?? {};

        const {
            contractColumnSelection,
            suppressColumnExpandAll,
            suppressColumnFilter,
            suppressColumnSelectAll,
            suppressSyncLayoutWithGrid,
            columnLayout,
        } = columnChooserParams;

        columnSelectPanel.init(
            !!draggable,
            this.gos.addGridCommonParams({
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
                onStateUpdated: () => {},
            }),
            'columnMenu'
        );

        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }

        return columnSelectPanel;
    }

    public showColumnChooser({ column, chooserParams, eventSource }: ShowColumnChooserParams): void {
        this.hideActiveColumnChooser();

        const columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
        const translate = this.localeService.getLocaleTextFunc();
        const columnIndex = this.visibleColsService.getAllCols().indexOf(column!);
        const headerPosition = column ? this.focusService.getFocusedHeader() : null;

        this.activeColumnChooserDialog = this.createBean(
            new AgDialog({
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
                        this.menuUtils.restoreFocusOnClose(
                            { column, headerPosition, columnIndex, eventSource },
                            eComp,
                            event,
                            true
                        );
                    }
                },
            })
        );

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
            column: column ?? null,
        };
        this.eventService.dispatchEvent(event);
    }
}
