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
var ExpandListener = /** @class */ (function (_super) {
    __extends(ExpandListener, _super);
    function ExpandListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpandListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    };
    ExpandListener.prototype.onRowGroupOpened = function (event) {
        var rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (core_1._.missing(rowNode.childStore)) {
                var storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && core_1._.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        var storeUpdatedEvent = { type: core_1.Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    };
    ExpandListener.prototype.createDetailNode = function (masterNode) {
        if (core_1._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new core_1.RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (core_1._.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        var defaultDetailRowHeight = 200;
        var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate([
        core_1.Autowired('rowModel')
    ], ExpandListener.prototype, "serverSideRowModel", void 0);
    __decorate([
        core_1.Autowired('ssrmStoreFactory')
    ], ExpandListener.prototype, "storeFactory", void 0);
    __decorate([
        core_1.Autowired('beans')
    ], ExpandListener.prototype, "beans", void 0);
    __decorate([
        core_1.PostConstruct
    ], ExpandListener.prototype, "postConstruct", null);
    ExpandListener = __decorate([
        core_1.Bean('ssrmExpandListener')
    ], ExpandListener);
    return ExpandListener;
}(core_1.BeanStub));
exports.ExpandListener = ExpandListener;
