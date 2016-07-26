/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("../context/context");
var filterManager_1 = require("../filter/filterManager");
var utils_1 = require("../utils");
var popupService_1 = require("../widgets/popupService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var StandardMenuFactory = (function () {
    function StandardMenuFactory() {
    }
    StandardMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent) {
        var _this = this;
        this.showPopup(column, function (eMenu) {
            _this.popupService.positionPopupUnderMouseEvent({
                mouseEvent: mouseEvent,
                ePopup: eMenu
            });
        });
    };
    StandardMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource) {
        var _this = this;
        this.showPopup(column, function (eMenu) {
            _this.popupService.positionPopupUnderComponent({ eventSource: eventSource, ePopup: eMenu, keepWithinBounds: true });
        });
    };
    StandardMenuFactory.prototype.showPopup = function (column, positionCallback) {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column);
        var eMenu = document.createElement('div');
        utils_1.Utils.addCssClass(eMenu, 'ag-menu');
        eMenu.appendChild(filterWrapper.gui);
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenu, true);
        positionCallback(eMenu);
        if (filterWrapper.filter.afterGuiAttached) {
            var params = {
                hidePopup: hidePopup
            };
            filterWrapper.filter.afterGuiAttached(params);
        }
    };
    StandardMenuFactory.prototype.isMenuEnabled = function (column) {
        // for standard, we show menu if filter is enabled, and he menu is not suppressed
        return this.gridOptionsWrapper.isEnableFilter() && column.isFilterAllowed();
    };
    __decorate([
        context_1.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], StandardMenuFactory.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('popupService'), 
        __metadata('design:type', popupService_1.PopupService)
    ], StandardMenuFactory.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], StandardMenuFactory.prototype, "gridOptionsWrapper", void 0);
    StandardMenuFactory = __decorate([
        context_1.Bean('menuFactory'), 
        __metadata('design:paramtypes', [])
    ], StandardMenuFactory);
    return StandardMenuFactory;
})();
exports.StandardMenuFactory = StandardMenuFactory;
