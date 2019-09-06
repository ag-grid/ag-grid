/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList = /** @class */ (function () {
    function LinkedList() {
        this.first = null;
        this.last = null;
    }
    LinkedList.prototype.add = function (item) {
        var entry = {
            item: item,
            next: null
        };
        if (this.last) {
            this.last.next = entry;
        }
        else {
            this.first = entry;
        }
        this.last = entry;
    };
    LinkedList.prototype.remove = function () {
        var result = this.first;
        if (result) {
            this.first = result.next;
            if (!this.first) {
                this.last = null;
            }
        }
        return result.item;
    };
    LinkedList.prototype.isEmpty = function () {
        return !this.first;
    };
    return LinkedList;
}());
exports.LinkedList = LinkedList;
var LinkedListItem = /** @class */ (function () {
    function LinkedListItem() {
    }
    return LinkedListItem;
}());
