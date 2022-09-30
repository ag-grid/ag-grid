var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { _, Autowired, DragAndDropService, Events, PostConstruct } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
var PivotDropZonePanel = /** @class */ (function (_super) {
    __extends(PivotDropZonePanel, _super);
    function PivotDropZonePanel(horizontal) {
        return _super.call(this, horizontal, 'pivot') || this;
    }
    PivotDropZonePanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        var title = localeTextFunc('pivots', 'Column Labels');
        _super.prototype.init.call(this, {
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('pivotPanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));
        this.refresh();
    };
    PivotDropZonePanel.prototype.getAriaLabel = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var label = translate('ariaPivotDropZonePanelLabel', 'Column Labels');
        return label;
    };
    PivotDropZonePanel.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'pivotColumnsList';
        return res;
    };
    PivotDropZonePanel.prototype.refresh = function () {
        this.checkVisibility();
        this.refreshGui();
    };
    PivotDropZonePanel.prototype.checkVisibility = function () {
        var pivotMode = this.columnModel.isPivotMode();
        if (this.isHorizontal()) {
            // what we do for horizontal (ie the pivot panel at the top) depends
            // on the user property as well as pivotMode.
            switch (this.gridOptionsWrapper.getPivotPanelShow()) {
                case 'always':
                    this.setDisplayed(pivotMode);
                    break;
                case 'onlyWhenPivoting':
                    var pivotActive = this.columnModel.isPivotActive();
                    this.setDisplayed(pivotMode && pivotActive);
                    break;
                default:
                    // never show it
                    this.setDisplayed(false);
                    break;
            }
        }
        else {
            // in toolPanel, the pivot panel is always shown when pivot mode is on
            this.setDisplayed(pivotMode);
        }
    };
    PivotDropZonePanel.prototype.isColumnDroppable = function (column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsWrapper.isFunctionsReadOnly() || !column.isPrimary()) {
            return false;
        }
        return column.isAllowPivot() && !column.isPivotActive();
    };
    PivotDropZonePanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            var event_1 = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event_1);
        }
        else {
            this.columnModel.setPivotColumns(columns, "toolPanelUi");
        }
    };
    PivotDropZonePanel.prototype.getIconName = function () {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_PIVOT : DragAndDropService.ICON_NOT_ALLOWED;
    };
    PivotDropZonePanel.prototype.getExistingColumns = function () {
        return this.columnModel.getPivotColumns();
    };
    __decorate([
        Autowired('columnModel')
    ], PivotDropZonePanel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('loggerFactory')
    ], PivotDropZonePanel.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], PivotDropZonePanel.prototype, "dragAndDropService", void 0);
    __decorate([
        PostConstruct
    ], PivotDropZonePanel.prototype, "passBeansUp", null);
    return PivotDropZonePanel;
}(BaseDropZonePanel));
export { PivotDropZonePanel };
