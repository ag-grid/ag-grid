var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, PreDestroy } from "@ag-grid-community/core";
let NodeManager = class NodeManager {
    constructor() {
        this.rowNodes = {};
    }
    addRowNode(rowNode) {
        const id = rowNode.id;
        if (this.rowNodes[id]) {
            console.warn(`AG Grid: Duplicate node id ${rowNode.id}. Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.`);
            console.warn('first instance', this.rowNodes[id].data);
            console.warn('second instance', rowNode.data);
        }
        this.rowNodes[id] = rowNode;
    }
    removeNode(rowNode) {
        const id = rowNode.id;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    }
    clear() {
        this.rowNodes = {};
    }
};
__decorate([
    PreDestroy
], NodeManager.prototype, "clear", null);
NodeManager = __decorate([
    Bean('ssrmNodeManager')
], NodeManager);
export { NodeManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL25vZGVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQVcsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHcEUsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztJQUF4QjtRQUVZLGFBQVEsR0FBeUMsRUFBRSxDQUFDO0lBeUJoRSxDQUFDO0lBdkJVLFVBQVUsQ0FBQyxPQUFnQjtRQUM5QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRyxDQUFDO1FBQ3ZCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixPQUFPLENBQUMsRUFBRSxrSUFBa0ksQ0FBQyxDQUFDO1lBQ3pMLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqRDtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxVQUFVLENBQUMsT0FBZ0I7UUFDOUIsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUcsQ0FBQztRQUN2QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBR00sS0FBSztRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7Q0FFSixDQUFBO0FBSkc7SUFEQyxVQUFVO3dDQUdWO0FBekJRLFdBQVc7SUFEdkIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0dBQ1gsV0FBVyxDQTJCdkI7U0EzQlksV0FBVyJ9