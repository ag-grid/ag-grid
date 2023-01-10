/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowDragComp = void 0;
const component_1 = require("../../widgets/component");
const context_1 = require("../../context/context");
const rowNode_1 = require("../../entities/rowNode");
const dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
const eventKeys_1 = require("../../eventKeys");
const beanStub_1 = require("../../context/beanStub");
const icon_1 = require("../../utils/icon");
const function_1 = require("../../utils/function");
class RowDragComp extends component_1.Component {
    constructor(cellValueFn, rowNode, column, customGui, dragStartPixels, suppressVisibilityChange) {
        super();
        this.cellValueFn = cellValueFn;
        this.rowNode = rowNode;
        this.column = column;
        this.customGui = customGui;
        this.dragStartPixels = dragStartPixels;
        this.suppressVisibilityChange = suppressVisibilityChange;
        this.dragSource = null;
    }
    isCustomGui() {
        return this.customGui != null;
    }
    postConstruct() {
        if (!this.customGui) {
            this.setTemplate(/* html */ `<div class="ag-drag-handle ag-row-drag" aria-hidden="true"></div>`);
            this.getGui().appendChild(icon_1.createIconNoSpan('rowDrag', this.beans.gridOptionsService, null));
            this.addDragSource();
        }
        else {
            this.setDragElement(this.customGui, this.dragStartPixels);
        }
        this.checkCompatibility();
        if (!this.suppressVisibilityChange) {
            const strategy = this.beans.gridOptionsService.is('rowDragManaged') ?
                new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column) :
                new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column);
            this.createManagedBean(strategy, this.beans.context);
        }
    }
    setDragElement(dragElement, dragStartPixels) {
        this.setTemplateFromElement(dragElement);
        this.addDragSource(dragStartPixels);
    }
    getSelectedNodes() {
        const isRowDragMultiRow = this.beans.gridOptionsService.is('rowDragMultiRow');
        if (!isRowDragMultiRow) {
            return [this.rowNode];
        }
        const selection = this.beans.selectionService.getSelectedNodes();
        return selection.indexOf(this.rowNode) !== -1 ? selection : [this.rowNode];
    }
    // returns true if all compatibility items work out
    checkCompatibility() {
        const managed = this.beans.gridOptionsService.is('rowDragManaged');
        const treeData = this.beans.gridOptionsService.isTreeData();
        if (treeData && managed) {
            function_1.doOnce(() => console.warn('AG Grid: If using row drag with tree data, you cannot have rowDragManaged=true'), 'RowDragComp.managedAndTreeData');
        }
    }
    getDragItem() {
        return {
            rowNode: this.rowNode,
            rowNodes: this.getSelectedNodes(),
            columns: this.column ? [this.column] : undefined,
            defaultTextValue: this.cellValueFn(),
        };
    }
    getRowDragText(column) {
        if (column) {
            const colDef = column.getColDef();
            if (colDef.rowDragText) {
                return colDef.rowDragText;
            }
        }
        return this.gridOptionsService.get('rowDragText');
    }
    addDragSource(dragStartPixels = 4) {
        // if this is changing the drag element, delete the previous dragSource
        if (this.dragSource) {
            this.removeDragSource();
        }
        const rowDragText = this.getRowDragText(this.column);
        const translate = this.localeService.getLocaleTextFunc();
        this.dragSource = {
            type: dragAndDropService_1.DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: () => {
                var _a;
                const dragItem = this.getDragItem();
                const dragItemCount = ((_a = dragItem.rowNodes) === null || _a === void 0 ? void 0 : _a.length) || 1;
                if (rowDragText) {
                    return rowDragText(dragItem, dragItemCount);
                }
                return dragItemCount === 1 ? this.cellValueFn() : `${dragItemCount} ${translate('rowDragRows', 'rows')}`;
            },
            getDragItem: () => this.getDragItem(),
            dragStartPixels,
            dragSourceDomDataKey: this.beans.gridOptionsService.getDomDataKey()
        };
        this.beans.dragAndDropService.addDragSource(this.dragSource, true);
    }
    removeDragSource() {
        if (this.dragSource) {
            this.beans.dragAndDropService.removeDragSource(this.dragSource);
        }
        this.dragSource = null;
    }
}
__decorate([
    context_1.Autowired('beans')
], RowDragComp.prototype, "beans", void 0);
__decorate([
    context_1.PostConstruct
], RowDragComp.prototype, "postConstruct", null);
__decorate([
    context_1.PreDestroy
], RowDragComp.prototype, "removeDragSource", null);
exports.RowDragComp = RowDragComp;
class VisibilityStrategy extends beanStub_1.BeanStub {
    constructor(parent, rowNode, column) {
        super();
        this.parent = parent;
        this.rowNode = rowNode;
        this.column = column;
    }
    setDisplayedOrVisible(neverDisplayed) {
        const displayedOptions = { skipAriaHidden: true };
        if (neverDisplayed) {
            this.parent.setDisplayed(false, displayedOptions);
        }
        else {
            let shown = true;
            let isShownSometimes = false;
            if (this.column) {
                shown = this.column.isRowDrag(this.rowNode) || this.parent.isCustomGui();
                isShownSometimes = function_1.isFunction(this.column.getColDef().rowDrag);
            }
            // if shown sometimes, them some rows can have drag handle while other don't,
            // so we use setVisible to keep the handles horizontally aligned (as setVisible
            // keeps the empty space, whereas setDisplayed looses the space)
            if (isShownSometimes) {
                this.parent.setDisplayed(true, displayedOptions);
                this.parent.setVisible(shown, displayedOptions);
            }
            else {
                this.parent.setDisplayed(shown, displayedOptions);
                this.parent.setVisible(true, displayedOptions);
            }
        }
    }
}
// when non managed, the visibility depends on suppressRowDrag property only
class NonManagedVisibilityStrategy extends VisibilityStrategy {
    constructor(parent, beans, rowNode, column) {
        super(parent, rowNode, column);
        this.beans = beans;
    }
    postConstruct() {
        this.addManagedPropertyListener('suppressRowDrag', this.onSuppressRowDrag.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.workOutVisibility.bind(this));
        this.workOutVisibility();
    }
    onSuppressRowDrag() {
        this.workOutVisibility();
    }
    workOutVisibility() {
        // only show the drag if both sort and filter are not present
        const neverDisplayed = this.beans.gridOptionsService.is('suppressRowDrag');
        this.setDisplayedOrVisible(neverDisplayed);
    }
}
__decorate([
    context_1.PostConstruct
], NonManagedVisibilityStrategy.prototype, "postConstruct", null);
// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
class ManagedVisibilityStrategy extends VisibilityStrategy {
    constructor(parent, beans, rowNode, column) {
        super(parent, rowNode, column);
        this.beans = beans;
    }
    postConstruct() {
        // we do not show the component if sort, filter or grouping is active
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_FILTER_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.workOutVisibility.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedPropertyListener('suppressRowDrag', this.onSuppressRowDrag.bind(this));
        this.workOutVisibility();
    }
    onSuppressRowDrag() {
        this.workOutVisibility();
    }
    workOutVisibility() {
        // only show the drag if both sort and filter are not present
        const gridBodyCon = this.beans.ctrlsService.getGridBodyCtrl();
        const rowDragFeature = gridBodyCon.getRowDragFeature();
        const shouldPreventRowMove = rowDragFeature && rowDragFeature.shouldPreventRowMove();
        const suppressRowDrag = this.beans.gridOptionsService.is('suppressRowDrag');
        const hasExternalDropZones = this.beans.dragAndDropService.hasExternalDropZones();
        const neverDisplayed = (shouldPreventRowMove && !hasExternalDropZones) || suppressRowDrag;
        this.setDisplayedOrVisible(neverDisplayed);
    }
}
__decorate([
    context_1.PostConstruct
], ManagedVisibilityStrategy.prototype, "postConstruct", null);
