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
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { SelectionService } from "../selectionService";
import { ChangedPath } from "../utils/changedPath";
var SelectableService = /** @class */ (function (_super) {
    __extends(SelectableService, _super);
    function SelectableService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectableService.prototype.init = function () {
        var _this = this;
        this.addManagedPropertyListener('isRowSelectable', function () { return _this.updateSelectable(); });
    };
    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    SelectableService.prototype.updateSelectableAfterGrouping = function () {
        this.updateSelectable(true);
    };
    SelectableService.prototype.updateSelectable = function (skipLeafNodes) {
        if (skipLeafNodes === void 0) { skipLeafNodes = false; }
        var isGroupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
        var isRowSelectable = this.gridOptionsService.get('isRowSelectable');
        var isCsrmGroupSelectsChildren = this.rowModel.getType() === 'clientSide' && isGroupSelectsChildren;
        var nodesToDeselect = [];
        var nodeCallback = function (node) {
            if (skipLeafNodes && !node.group) {
                return;
            }
            // Only in the CSRM, we allow group node selection if a child has a selectable=true when using groupSelectsChildren
            if (isCsrmGroupSelectsChildren && node.group) {
                var hasSelectableChild = node.childrenAfterGroup.some(function (rowNode) { return rowNode.selectable === true; });
                node.setRowSelectable(hasSelectableChild, true);
                return;
            }
            var rowSelectable = isRowSelectable ? isRowSelectable(node) : true;
            node.setRowSelectable(rowSelectable, true);
            if (!rowSelectable && node.isSelected()) {
                nodesToDeselect.push(node);
            }
        };
        // Needs to be depth first in this case, so that parents can be updated based on child.
        if (isCsrmGroupSelectsChildren) {
            var csrm = this.rowModel;
            var changedPath = new ChangedPath(false, csrm.getRootNode());
            changedPath.forEachChangedNodeDepthFirst(nodeCallback, true, true);
        }
        else {
            // Normal case, update all rows
            this.rowModel.forEachNode(nodeCallback);
        }
        if (nodesToDeselect.length) {
            this.selectionService.setNodesSelected({ nodes: nodesToDeselect, newValue: false, source: 'selectableChanged' });
        }
        // if csrm and group selects children, update the groups after deselecting leaf nodes.
        if (isCsrmGroupSelectsChildren && this.selectionService instanceof SelectionService) {
            this.selectionService.updateGroupsFromChildrenSelections('selectableChanged');
        }
    };
    __decorate([
        Autowired('rowModel')
    ], SelectableService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('selectionService')
    ], SelectableService.prototype, "selectionService", void 0);
    __decorate([
        PostConstruct
    ], SelectableService.prototype, "init", null);
    SelectableService = __decorate([
        Bean('selectableService')
    ], SelectableService);
    return SelectableService;
}(BeanStub));
export { SelectableService };
