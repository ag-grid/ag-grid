"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnChooserFactory = void 0;
var core_1 = require("@ag-grid-community/core");
var column_tool_panel_1 = require("@ag-grid-enterprise/column-tool-panel");
var ColumnChooserFactory = /** @class */ (function (_super) {
    __extends(ColumnChooserFactory, _super);
    function ColumnChooserFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnChooserFactory.prototype.createColumnSelectPanel = function (parent, column, draggable, params) {
        var _a, _b;
        var columnSelectPanel = parent.createManagedBean(new column_tool_panel_1.PrimaryColsPanel());
        var columnChooserParams = (_b = (_a = params !== null && params !== void 0 ? params : column === null || column === void 0 ? void 0 : column.getColDef().columnChooserParams) !== null && _a !== void 0 ? _a : column === null || column === void 0 ? void 0 : column.getColDef().columnsMenuParams) !== null && _b !== void 0 ? _b : {};
        var contractColumnSelection = columnChooserParams.contractColumnSelection, suppressColumnExpandAll = columnChooserParams.suppressColumnExpandAll, suppressColumnFilter = columnChooserParams.suppressColumnFilter, suppressColumnSelectAll = columnChooserParams.suppressColumnSelectAll, suppressSyncLayoutWithGrid = columnChooserParams.suppressSyncLayoutWithGrid, columnLayout = columnChooserParams.columnLayout;
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
            onStateUpdated: function () { }
        }), 'columnMenu');
        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }
        return columnSelectPanel;
    };
    ColumnChooserFactory.prototype.showColumnChooser = function (_a) {
        var _this = this;
        var column = _a.column, chooserParams = _a.chooserParams, eventSource = _a.eventSource;
        this.hideActiveColumnChooser();
        var columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
        var translate = this.localeService.getLocaleTextFunc();
        var columnIndex = this.columnModel.getAllDisplayedColumns().indexOf(column);
        var headerPosition = column ? this.focusService.getFocusedHeader() : null;
        this.activeColumnChooserDialog = this.createBean(new core_1.AgDialog({
            title: translate('chooseColumns', 'Choose Columns'),
            component: columnSelectPanel,
            width: 300,
            height: 300,
            resizable: true,
            movable: true,
            centered: true,
            closable: true,
            afterGuiAttached: function () {
                var _a;
                (_a = _this.focusService.findNextFocusableElement(columnSelectPanel.getGui())) === null || _a === void 0 ? void 0 : _a.focus();
                _this.dispatchVisibleChangedEvent(true, column);
            },
            closedCallback: function (event) {
                var eComp = _this.activeColumnChooser.getGui();
                _this.destroyBean(_this.activeColumnChooser);
                _this.activeColumnChooser = undefined;
                _this.activeColumnChooserDialog = undefined;
                _this.dispatchVisibleChangedEvent(false, column);
                if (column) {
                    _this.menuUtils.restoreFocusOnClose({ column: column, headerPosition: headerPosition, columnIndex: columnIndex, eventSource: eventSource }, eComp, event, true);
                }
            }
        }));
        this.activeColumnChooser = columnSelectPanel;
    };
    ColumnChooserFactory.prototype.hideActiveColumnChooser = function () {
        if (this.activeColumnChooserDialog) {
            this.destroyBean(this.activeColumnChooserDialog);
        }
    };
    ColumnChooserFactory.prototype.dispatchVisibleChangedEvent = function (visible, column) {
        var event = {
            type: core_1.Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible: visible,
            switchingTab: false,
            key: 'columnChooser',
            column: column !== null && column !== void 0 ? column : null
        };
        this.eventService.dispatchEvent(event);
    };
    __decorate([
        (0, core_1.Autowired)('focusService')
    ], ColumnChooserFactory.prototype, "focusService", void 0);
    __decorate([
        (0, core_1.Autowired)('menuUtils')
    ], ColumnChooserFactory.prototype, "menuUtils", void 0);
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], ColumnChooserFactory.prototype, "columnModel", void 0);
    ColumnChooserFactory = __decorate([
        (0, core_1.Bean)('columnChooserFactory')
    ], ColumnChooserFactory);
    return ColumnChooserFactory;
}(core_1.BeanStub));
exports.ColumnChooserFactory = ColumnChooserFactory;
