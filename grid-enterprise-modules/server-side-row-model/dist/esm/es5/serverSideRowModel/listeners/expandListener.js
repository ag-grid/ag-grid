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
import { _, Autowired, BeanStub, Events, PostConstruct, RowNode, Bean } from "@ag-grid-community/core";
var ExpandListener = /** @class */ (function (_super) {
    __extends(ExpandListener, _super);
    function ExpandListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpandListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    };
    ExpandListener.prototype.onRowGroupOpened = function (event) {
        var rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (_.missing(rowNode.childStore)) {
                var storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsService.is('purgeClosedRowNodes') && _.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        var storeUpdatedEvent = { type: Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    };
    ExpandListener.prototype.createDetailNode = function (masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        var defaultDetailRowHeight = 200;
        var rowHeight = this.gridOptionsService.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate([
        Autowired('rowModel')
    ], ExpandListener.prototype, "serverSideRowModel", void 0);
    __decorate([
        Autowired('ssrmStoreFactory')
    ], ExpandListener.prototype, "storeFactory", void 0);
    __decorate([
        Autowired('beans')
    ], ExpandListener.prototype, "beans", void 0);
    __decorate([
        PostConstruct
    ], ExpandListener.prototype, "postConstruct", null);
    ExpandListener = __decorate([
        Bean('ssrmExpandListener')
    ], ExpandListener);
    return ExpandListener;
}(BeanStub));
export { ExpandListener };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL2xpc3RlbmVycy9leHBhbmRMaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxRQUFRLEVBRVIsTUFBTSxFQUNOLGFBQWEsRUFFYixPQUFPLEVBQ1AsSUFBSSxFQUdQLE1BQU0seUJBQXlCLENBQUM7QUFLakM7SUFBb0Msa0NBQVE7SUFBNUM7O0lBeURBLENBQUM7SUFsRFcsc0NBQWEsR0FBckI7UUFDSSw4RkFBOEY7UUFDOUYsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFdEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoSCxDQUFDO0lBRU8seUNBQWdCLEdBQXhCLFVBQXlCLEtBQTBCO1FBQy9DLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFlLENBQUM7UUFFdEMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2xDO2lCQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3RDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzdGO1NBQ0o7YUFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMxRixPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBRSxDQUFDO1NBQzlEO1FBRUQsSUFBTSxpQkFBaUIsR0FBeUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDckcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU8seUNBQWdCLEdBQXhCLFVBQXlCLFVBQW1CO1FBQ3hDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFBRSxPQUFPLFVBQVUsQ0FBQyxVQUFVLENBQUM7U0FBRTtRQUV0RSxJQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0MsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDekIsVUFBVSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDOUIsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7UUFFL0IsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUN6QixVQUFVLENBQUMsRUFBRSxHQUFHLFNBQVMsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDO1NBQzdDO1FBRUQsVUFBVSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFeEMsSUFBTSxzQkFBc0IsR0FBRyxHQUFHLENBQUM7UUFDbkMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUVqRixVQUFVLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQztRQUN0RSxVQUFVLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUVuQyxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBckRzQjtRQUF0QixTQUFTLENBQUMsVUFBVSxDQUFDOzhEQUFnRDtJQUN2QztRQUE5QixTQUFTLENBQUMsa0JBQWtCLENBQUM7d0RBQW9DO0lBQzlDO1FBQW5CLFNBQVMsQ0FBQyxPQUFPLENBQUM7aURBQXNCO0lBR3pDO1FBREMsYUFBYTt1REFNYjtJQVpRLGNBQWM7UUFEMUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDO09BQ2QsY0FBYyxDQXlEMUI7SUFBRCxxQkFBQztDQUFBLEFBekRELENBQW9DLFFBQVEsR0F5RDNDO1NBekRZLGNBQWMifQ==