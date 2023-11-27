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
import { Autowired, Bean, Events, ExpansionService } from "@ag-grid-community/core";
var ServerSideExpansionService = /** @class */ (function (_super) {
    __extends(ServerSideExpansionService, _super);
    function ServerSideExpansionService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.queuedRowIds = new Set();
        return _this;
    }
    ServerSideExpansionService.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () {
            _this.queuedRowIds.clear();
        });
    };
    ServerSideExpansionService.prototype.checkOpenByDefault = function (rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        var expandRowNode = function () {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(function () { return rowNode.setExpanded(true); }, 0);
        };
        if (this.queuedRowIds.has(rowNode.id)) {
            this.queuedRowIds.delete(rowNode.id);
            expandRowNode();
            return;
        }
        var userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }
        var params = {
            data: rowNode.data,
            rowNode: rowNode
        };
        var userFuncRes = userFunc(params);
        if (userFuncRes) {
            expandRowNode();
        }
    };
    ServerSideExpansionService.prototype.expandRows = function (rowIds) {
        var _this = this;
        rowIds.forEach(function (rowId) {
            var rowNode = _this.serverSideRowModel.getRowNode(rowId);
            if (rowNode) {
                rowNode.setExpanded(true);
            }
            else {
                _this.queuedRowIds.add(rowId);
            }
        });
    };
    ServerSideExpansionService.prototype.expandAll = function (value) {
        this.serverSideRowModel.expandAll(value);
    };
    ServerSideExpansionService.prototype.onGroupExpandedOrCollapsed = function () {
        // do nothing
    };
    __decorate([
        Autowired('rowModel')
    ], ServerSideExpansionService.prototype, "serverSideRowModel", void 0);
    ServerSideExpansionService = __decorate([
        Bean('expansionService')
    ], ServerSideExpansionService);
    return ServerSideExpansionService;
}(ExpansionService));
export { ServerSideExpansionService };
