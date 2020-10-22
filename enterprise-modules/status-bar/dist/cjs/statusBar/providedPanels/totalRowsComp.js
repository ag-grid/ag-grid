"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var nameValueComp_1 = require("./nameValueComp");
var TotalRowsComp = /** @class */ (function (_super) {
    __extends(TotalRowsComp, _super);
    function TotalRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TotalRowsComp.prototype.postConstruct = function () {
        this.setLabel('totalRows', 'Total Rows');
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn("ag-Grid: agTotalRowCountComponent should only be used with the client side row model.");
            return;
        }
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');
        this.setDisplayed(true);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    };
    TotalRowsComp.prototype.onDataChanged = function () {
        this.setValue(core_1._.formatNumberCommas(this.getRowCountValue()));
    };
    TotalRowsComp.prototype.getRowCountValue = function () {
        var totalRowCount = 0;
        this.gridApi.forEachLeafNode(function (node) { return totalRowCount += 1; });
        return totalRowCount;
    };
    TotalRowsComp.prototype.init = function () {
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    TotalRowsComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    __decorate([
        core_1.Autowired('gridApi')
    ], TotalRowsComp.prototype, "gridApi", void 0);
    __decorate([
        core_1.PostConstruct
    ], TotalRowsComp.prototype, "postConstruct", null);
    return TotalRowsComp;
}(nameValueComp_1.NameValueComp));
exports.TotalRowsComp = TotalRowsComp;
//# sourceMappingURL=totalRowsComp.js.map