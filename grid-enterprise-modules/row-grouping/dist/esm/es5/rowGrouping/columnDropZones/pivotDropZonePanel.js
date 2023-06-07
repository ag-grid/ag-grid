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
import { _, Autowired, DragAndDropService, Events, PostConstruct } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
var PivotDropZonePanel = /** @class */ (function (_super) {
    __extends(PivotDropZonePanel, _super);
    function PivotDropZonePanel(horizontal) {
        return _super.call(this, horizontal, 'pivot') || this;
    }
    PivotDropZonePanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        var title = localeTextFunc('pivots', 'Column Labels');
        _super.prototype.init.call(this, {
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('pivotPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));
        this.refresh();
    };
    PivotDropZonePanel.prototype.getAriaLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
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
            switch (this.gridOptionsService.get('pivotPanelShow')) {
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
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowPivot() && !column.isPivotActive();
    };
    PivotDropZonePanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGl2b3REcm9wWm9uZVBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2NvbHVtbkRyb3Bab25lcy9waXZvdERyb3Bab25lUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBSVQsa0JBQWtCLEVBQ2xCLE1BQU0sRUFHTixhQUFhLEVBRWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFeEQ7SUFBd0Msc0NBQWlCO0lBT3JELDRCQUFZLFVBQW1CO2VBQzNCLGtCQUFNLFVBQVUsRUFBRSxPQUFPLENBQUM7SUFDOUIsQ0FBQztJQUdPLHdDQUFXLEdBQW5CO1FBQ0ksaUJBQU0sUUFBUSxZQUFDO1lBQ1gsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtZQUMzQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDMUIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2xHLElBQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFeEQsaUJBQU0sSUFBSSxZQUFDO1lBQ1AsZUFBZSxFQUFFLGtCQUFrQixDQUFDLFVBQVU7WUFDOUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxD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