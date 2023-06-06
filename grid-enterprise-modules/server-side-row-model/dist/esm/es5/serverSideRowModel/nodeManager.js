var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, PreDestroy } from "@ag-grid-community/core";
var NodeManager = /** @class */ (function () {
    function NodeManager() {
        this.rowNodes = {};
    }
    NodeManager.prototype.addRowNode = function (rowNode) {
        var id = rowNode.id;
        if (this.rowNodes[id]) {
            console.warn("AG Grid: Duplicate node id " + rowNode.id + ". Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.");
            console.warn('first instance', this.rowNodes[id].data);
            console.warn('second instance', rowNode.data);
        }
        this.rowNodes[id] = rowNode;
    };
    NodeManager.prototype.removeNode = function (rowNode) {
        var id = rowNode.id;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    };
    NodeManager.prototype.clear = function () {
        this.rowNodes = {};
    };
    __decorate([
        PreDestroy
    ], NodeManager.prototype, "clear", null);
    NodeManager = __decorate([
        Bean('ssrmNodeManager')
    ], NodeManager);
    return NodeManager;
}());
export { NodeManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL25vZGVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQVcsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHcEU7SUFBQTtRQUVZLGFBQVEsR0FBeUMsRUFBRSxDQUFDO0lBeUJoRSxDQUFDO0lBdkJVLGdDQUFVLEdBQWpCLFVBQWtCLE9BQWdCO1FBQzlCLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFHLENBQUM7UUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQThCLE9BQU8sQ0FBQyxFQUFFLHFJQUFrSSxDQUFDLENBQUM7WUFDekwsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDaEMsQ0FBQztJQUVNLGdDQUFVLEdBQWpCLFVBQWtCLE9BQWdCO1FBQzlCLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFHLENBQUM7UUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUdNLDJCQUFLLEdBQVo7UUFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRkQ7UUFEQyxVQUFVOzRDQUdWO0lBekJRLFdBQVc7UUFEdkIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO09BQ1gsV0FBVyxDQTJCdkI7SUFBRCxrQkFBQztDQUFBLEFBM0JELElBMkJDO1NBM0JZLFdBQVcifQ==