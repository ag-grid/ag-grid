/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LinkedList {
    constructor() {
        this.first = null;
        this.last = null;
    }
    add(item) {
        const entry = {
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
    }
    remove() {
        const result = this.first;
        if (result) {
            this.first = result.next;
            if (!this.first) {
                this.last = null;
            }
        }
        return result.item;
    }
    isEmpty() {
        return !this.first;
    }
}
exports.LinkedList = LinkedList;
class LinkedListItem {
}
