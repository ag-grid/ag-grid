// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid-community/main");
var toolPanelColumnGroupComp_1 = require("./toolPanelColumnGroupComp");
var toolPanelColumnComp_1 = require("./toolPanelColumnComp");
var primaryColsHeaderPanel_1 = require("./primaryColsHeaderPanel");
var PrimaryColsListPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsListPanel, _super);
    function PrimaryColsListPanel() {
        return _super.call(this, PrimaryColsListPanel.TEMPLATE) || this;
    }
    PrimaryColsListPanel.prototype.init = function () {
        this.addDestroyableEventListener(this.globalEventService, main_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        this.expandGroupsByDefault = !this.props.params.contractColumnSelection;
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    };
    PrimaryColsListPanel.prototype.onColumnsChanged = function () {
        this.destroyColumnComps();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        var groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.updateVisibilityOfRows();
    };
    PrimaryColsListPanel.prototype.destroyColumnComps = function () {
        main_1.Utils.removeAllChildren(this.getGui());
        if (this.columnComps) {
            main_1.Utils.iterateObject(this.columnComps, function (key, renderedItem) { return renderedItem.destroy(); });
        }
        this.columnComps = {};
    };
    PrimaryColsListPanel.prototype.recursivelyAddGroupComps = function (columnGroup, dept, groupsExist) {
        // only render group if user provided the definition
        var newDept;
        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) {
            return;
        }
        if (!columnGroup.isPadding()) {
            var renderedGroup = new toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp(columnGroup, dept, this.onGroupExpanded.bind(this), this.props.allowDragging, this.expandGroupsByDefault);
            this.context.wireBean(renderedGroup);
            this.getGui().appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;
            this.columnComps[columnGroup.getId()] = renderedGroup;
        }
        else {
            // no children, so no indent
            newDept = dept;
        }
        this.recursivelyAddComps(columnGroup.getChildren(), newDept, groupsExist);
    };
    PrimaryColsListPanel.prototype.onGroupExpanded = function () {
        this.updateVisibilityOfRows();
        this.fireExpandedEvent();
    };
    PrimaryColsListPanel.prototype.fireExpandedEvent = function () {
        var _this = this;
        var expandedCount = 0;
        var notExpandedCount = 0;
        var recursiveFunc = function (items) {
            items.forEach(function (item) {
                // only interested in groups
                if (item instanceof main_1.OriginalColumnGroup) {
                    var comp = _this.columnComps[item.getId()];
                    if (comp) {
                        if (comp.isExpanded()) {
                            expandedCount++;
                        }
                        else {
                            notExpandedCount++;
                        }
                    }
                    var columnGroup = item;
                    var groupChildren = columnGroup.getChildren();
                    recursiveFunc(groupChildren);
                }
            });
        };
        recursiveFunc(this.columnTree);
        var state;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = primaryColsHeaderPanel_1.SELECTED_STATE.INDETERMINIATE;
        }
        else if (notExpandedCount > 0) {
            state = primaryColsHeaderPanel_1.SELECTED_STATE.UNCHECKED;
        }
        else {
            state = primaryColsHeaderPanel_1.SELECTED_STATE.CHECKED;
        }
        this.dispatchEvent({ type: 'groupExpanded', state: state });
    };
    PrimaryColsListPanel.prototype.recursivelyAddColumnComps = function (column, dept, groupsExist) {
        if (column.getColDef() && column.getColDef().suppressToolPanel) {
            return;
        }
        var renderedColumn = new toolPanelColumnComp_1.ToolPanelColumnComp(column, dept, this.props.allowDragging, groupsExist);
        this.context.wireBean(renderedColumn);
        this.getGui().appendChild(renderedColumn.getGui());
        this.columnComps[column.getId()] = renderedColumn;
    };
    PrimaryColsListPanel.prototype.recursivelyAddComps = function (tree, dept, groupsExist) {
        var _this = this;
        tree.forEach(function (child) {
            if (child instanceof main_1.OriginalColumnGroup) {
                _this.recursivelyAddGroupComps(child, dept, groupsExist);
            }
            else {
                _this.recursivelyAddColumnComps(child, dept, groupsExist);
            }
        });
    };
    PrimaryColsListPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.destroyColumnComps();
    };
    PrimaryColsListPanel.prototype.doSetExpandedAll = function (value) {
        main_1._.iterateObject(this.columnComps, function (key, renderedItem) {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpanded(value);
            }
        });
    };
    PrimaryColsListPanel.prototype.setFilterText = function (filterText) {
        this.filterText = main_1._.exists(filterText) ? filterText.toLowerCase() : null;
        this.updateVisibilityOfRows();
    };
    PrimaryColsListPanel.prototype.updateVisibilityOfRows = function () {
        // we have to create the filter results first as that requires dept first search, then setting
        // the visibility requires breadth first search. this is because a group passes filter if CHILDREN
        // pass filter, a column passes group open/closed visibility if a PARENT is open. so we need to do
        // two recursions. we pass the result of the first recursion to the second.
        var filterResults = main_1._.exists(this.filterText) ? this.createFilterResults() : null;
        this.recursivelySetVisibility(this.columnTree, true, filterResults);
    };
    PrimaryColsListPanel.prototype.createFilterResults = function () {
        var _this = this;
        var filterResults = {};
        // we recurse dept first - as the item should show if any of the children are showing
        var recursivelyCheckFilter = function (items) {
            var atLeastOneThisLevelPassed = false;
            items.forEach(function (item) {
                var atLeastOneChildPassed = false;
                if (item instanceof main_1.OriginalColumnGroup) {
                    var columnGroup = item;
                    var groupChildren = columnGroup.getChildren();
                    atLeastOneChildPassed = recursivelyCheckFilter(groupChildren);
                }
                var filterPasses;
                if (atLeastOneChildPassed) {
                    filterPasses = true;
                }
                else {
                    var comp = _this.columnComps[item.getId()];
                    if (comp && _this.filterText) {
                        filterPasses = comp.getDisplayName().toLowerCase().indexOf(_this.filterText) >= 0;
                    }
                    else {
                        filterPasses = true;
                    }
                }
                filterResults[item.getId()] = filterPasses;
                if (filterPasses) {
                    atLeastOneThisLevelPassed = true;
                }
            });
            return atLeastOneThisLevelPassed;
        };
        recursivelyCheckFilter(this.columnTree);
        return filterResults;
    };
    PrimaryColsListPanel.prototype.recursivelySetVisibility = function (columnTree, parentGroupsOpen, filterResults) {
        var _this = this;
        columnTree.forEach(function (child) {
            var comp = _this.columnComps[child.getId()];
            if (comp) {
                var passesFilter = filterResults ? filterResults[child.getId()] : true;
                comp.setVisible(parentGroupsOpen && passesFilter);
            }
            if (child instanceof main_1.OriginalColumnGroup) {
                var columnGroup = child;
                var childrenOpen = void 0;
                if (comp) {
                    var expanded = comp.isExpanded();
                    childrenOpen = parentGroupsOpen ? expanded : false;
                }
                else {
                    childrenOpen = parentGroupsOpen;
                }
                var children = columnGroup.getChildren();
                _this.recursivelySetVisibility(children, childrenOpen, filterResults);
            }
        });
    };
    PrimaryColsListPanel.prototype.doSetSelectedAll = function (checked) {
        main_1._.iterateObject(this.columnComps, function (key, column) {
            column.onSelectAllChanged(checked);
        });
    };
    PrimaryColsListPanel.TEMPLATE = "<div class=\"ag-primary-cols-list-panel\"></div>";
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], PrimaryColsListPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], PrimaryColsListPanel.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], PrimaryColsListPanel.prototype, "globalEventService", void 0);
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], PrimaryColsListPanel.prototype, "context", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PrimaryColsListPanel.prototype, "init", null);
    return PrimaryColsListPanel;
}(main_1.Component));
exports.PrimaryColsListPanel = PrimaryColsListPanel;
