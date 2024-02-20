var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgDialog, Autowired, Bean, BeanStub, Events } from "@ag-grid-community/core";
import { PrimaryColsPanel } from "@ag-grid-enterprise/column-tool-panel";
let ColumnChooserFactory = class ColumnChooserFactory extends BeanStub {
    createColumnSelectPanel(parent, column, draggable, params) {
        var _a, _b;
        const columnSelectPanel = parent.createManagedBean(new PrimaryColsPanel());
        const columnChooserParams = (_b = (_a = params !== null && params !== void 0 ? params : column === null || column === void 0 ? void 0 : column.getColDef().columnChooserParams) !== null && _a !== void 0 ? _a : column === null || column === void 0 ? void 0 : column.getColDef().columnsMenuParams) !== null && _b !== void 0 ? _b : {};
        const { contractColumnSelection, suppressColumnExpandAll, suppressColumnFilter, suppressColumnSelectAll, suppressSyncLayoutWithGrid, columnLayout } = columnChooserParams;
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
            onStateUpdated: () => { }
        }), 'columnMenu');
        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }
        return columnSelectPanel;
    }
    showColumnChooser({ column, chooserParams, eventSource }) {
        this.hideActiveColumnChooser();
        const columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
        const translate = this.localeService.getLocaleTextFunc();
        const columnIndex = this.columnModel.getAllDisplayedColumns().indexOf(column);
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
                var _a;
                (_a = this.focusService.findNextFocusableElement(columnSelectPanel.getGui())) === null || _a === void 0 ? void 0 : _a.focus();
                this.dispatchVisibleChangedEvent(true, column);
            },
            closedCallback: (event) => {
                const eComp = this.activeColumnChooser.getGui();
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
    hideActiveColumnChooser() {
        if (this.activeColumnChooserDialog) {
            this.destroyBean(this.activeColumnChooserDialog);
        }
    }
    dispatchVisibleChangedEvent(visible, column) {
        const event = {
            type: Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible,
            switchingTab: false,
            key: 'columnChooser',
            column: column !== null && column !== void 0 ? column : null
        };
        this.eventService.dispatchEvent(event);
    }
};
__decorate([
    Autowired('focusService')
], ColumnChooserFactory.prototype, "focusService", void 0);
__decorate([
    Autowired('menuUtils')
], ColumnChooserFactory.prototype, "menuUtils", void 0);
__decorate([
    Autowired('columnModel')
], ColumnChooserFactory.prototype, "columnModel", void 0);
ColumnChooserFactory = __decorate([
    Bean('columnChooserFactory')
], ColumnChooserFactory);
export { ColumnChooserFactory };
