"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualListDragFeature = void 0;
const autoScrollService_1 = require("../autoScrollService");
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const dom_1 = require("../utils/dom");
const dragAndDropService_1 = require("./dragAndDropService");
const LIST_ITEM_HOVERED = 'ag-list-item-hovered';
class VirtualListDragFeature extends beanStub_1.BeanStub {
    constructor(comp, virtualList, params) {
        super();
        this.comp = comp;
        this.virtualList = virtualList;
        this.params = params;
        this.currentDragValue = null;
        this.lastHoveredListItem = null;
    }
    postConstruct() {
        this.addManagedListener(this.params.eventSource, this.params.listItemDragStartEvent, this.listItemDragStart.bind(this));
        this.addManagedListener(this.params.eventSource, this.params.listItemDragEndEvent, this.listItemDragEnd.bind(this));
        this.createDropTarget();
        this.createAutoScrollService();
    }
    listItemDragStart(event) {
        this.currentDragValue = this.params.getCurrentDragValue(event);
        this.moveBlocked = this.params.isMoveBlocked(this.currentDragValue);
    }
    listItemDragEnd() {
        window.setTimeout(() => {
            this.currentDragValue = null;
            this.moveBlocked = false;
        }, 10);
    }
    createDropTarget() {
        const dropTarget = {
            isInterestedIn: (type) => type === this.params.dragSourceType,
            getIconName: () => dragAndDropService_1.DragAndDropService[this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE'],
            getContainer: () => this.comp.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: () => this.onDragStop(),
            onDragLeave: () => this.onDragLeave()
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    }
    createAutoScrollService() {
        const virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new autoScrollService_1.AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: () => virtualListGui.scrollTop,
            setVerticalPosition: (position) => virtualListGui.scrollTop = position
        });
    }
    onDragging(e) {
        if (!this.currentDragValue || this.moveBlocked) {
            return;
        }
        const hoveredListItem = this.getListDragItem(e);
        const comp = this.virtualList.getComponentAt(hoveredListItem.rowIndex);
        if (!comp) {
            return;
        }
        const el = comp.getGui().parentElement;
        if (this.lastHoveredListItem &&
            this.lastHoveredListItem.rowIndex === hoveredListItem.rowIndex &&
            this.lastHoveredListItem.position === hoveredListItem.position) {
            return;
        }
        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredListItem = hoveredListItem;
        (0, dom_1.radioCssClass)(el, LIST_ITEM_HOVERED);
        (0, dom_1.radioCssClass)(el, `ag-item-highlight-${hoveredListItem.position}`);
    }
    getListDragItem(e) {
        const virtualListGui = this.virtualList.getGui();
        const paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        const rowHeight = this.virtualList.getRowHeight();
        const scrollTop = this.virtualList.getScrollTop();
        const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        const maxLen = this.params.getNumRows(this.comp) - 1;
        const normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex)
        };
    }
    onDragStop() {
        if (this.moveBlocked) {
            return;
        }
        this.params.moveItem(this.currentDragValue, this.lastHoveredListItem);
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }
    onDragLeave() {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }
    clearHoveredItems() {
        const virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll(`.${LIST_ITEM_HOVERED}`).forEach(el => {
            [
                LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(cls => {
                el.classList.remove(cls);
            });
        });
        this.lastHoveredListItem = null;
    }
}
__decorate([
    (0, context_1.Autowired)('dragAndDropService')
], VirtualListDragFeature.prototype, "dragAndDropService", void 0);
__decorate([
    context_1.PostConstruct
], VirtualListDragFeature.prototype, "postConstruct", null);
exports.VirtualListDragFeature = VirtualListDragFeature;
