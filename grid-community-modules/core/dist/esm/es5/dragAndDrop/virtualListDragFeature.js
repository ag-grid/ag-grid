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
import { AutoScrollService } from "../autoScrollService";
import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { radioCssClass } from "../utils/dom";
import { DragAndDropService } from "./dragAndDropService";
var LIST_ITEM_HOVERED = 'ag-list-item-hovered';
var VirtualListDragFeature = /** @class */ (function (_super) {
    __extends(VirtualListDragFeature, _super);
    function VirtualListDragFeature(comp, virtualList, params) {
        var _this = _super.call(this) || this;
        _this.comp = comp;
        _this.virtualList = virtualList;
        _this.params = params;
        _this.currentDragValue = null;
        _this.lastHoveredListItem = null;
        return _this;
    }
    VirtualListDragFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.params.eventSource, this.params.listItemDragStartEvent, this.listItemDragStart.bind(this));
        this.addManagedListener(this.params.eventSource, this.params.listItemDragEndEvent, this.listItemDragEnd.bind(this));
        this.createDropTarget();
        this.createAutoScrollService();
    };
    VirtualListDragFeature.prototype.listItemDragStart = function (event) {
        this.currentDragValue = this.params.getCurrentDragValue(event);
        this.moveBlocked = this.params.isMoveBlocked(this.currentDragValue);
    };
    VirtualListDragFeature.prototype.listItemDragEnd = function () {
        var _this = this;
        window.setTimeout(function () {
            _this.currentDragValue = null;
            _this.moveBlocked = false;
        }, 10);
    };
    VirtualListDragFeature.prototype.createDropTarget = function () {
        var _this = this;
        var dropTarget = {
            isInterestedIn: function (type) { return type === _this.params.dragSourceType; },
            getIconName: function () { return DragAndDropService[_this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE']; },
            getContainer: function () { return _this.comp.getGui(); },
            onDragging: function (e) { return _this.onDragging(e); },
            onDragStop: function () { return _this.onDragStop(); },
            onDragLeave: function () { return _this.onDragLeave(); }
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    };
    VirtualListDragFeature.prototype.createAutoScrollService = function () {
        var virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: function () { return virtualListGui.scrollTop; },
            setVerticalPosition: function (position) { return virtualListGui.scrollTop = position; }
        });
    };
    VirtualListDragFeature.prototype.onDragging = function (e) {
        if (!this.currentDragValue || this.moveBlocked) {
            return;
        }
        var hoveredListItem = this.getListDragItem(e);
        var comp = this.virtualList.getComponentAt(hoveredListItem.rowIndex);
        if (!comp) {
            return;
        }
        var el = comp.getGui().parentElement;
        if (this.lastHoveredListItem &&
            this.lastHoveredListItem.rowIndex === hoveredListItem.rowIndex &&
            this.lastHoveredListItem.position === hoveredListItem.position) {
            return;
        }
        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredListItem = hoveredListItem;
        radioCssClass(el, LIST_ITEM_HOVERED);
        radioCssClass(el, "ag-item-highlight-".concat(hoveredListItem.position));
    };
    VirtualListDragFeature.prototype.getListDragItem = function (e) {
        var virtualListGui = this.virtualList.getGui();
        var paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        var rowHeight = this.virtualList.getRowHeight();
        var scrollTop = this.virtualList.getScrollTop();
        var rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        var maxLen = this.params.getNumRows(this.comp) - 1;
        var normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex)
        };
    };
    VirtualListDragFeature.prototype.onDragStop = function () {
        if (this.moveBlocked) {
            return;
        }
        this.params.moveItem(this.currentDragValue, this.lastHoveredListItem);
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    };
    VirtualListDragFeature.prototype.onDragLeave = function () {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    };
    VirtualListDragFeature.prototype.clearHoveredItems = function () {
        var virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll(".".concat(LIST_ITEM_HOVERED)).forEach(function (el) {
            [
                LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(function (cls) {
                el.classList.remove(cls);
            });
        });
        this.lastHoveredListItem = null;
    };
    __decorate([
        Autowired('dragAndDropService')
    ], VirtualListDragFeature.prototype, "dragAndDropService", void 0);
    __decorate([
        PostConstruct
    ], VirtualListDragFeature.prototype, "postConstruct", null);
    return VirtualListDragFeature;
}(BeanStub));
export { VirtualListDragFeature };
