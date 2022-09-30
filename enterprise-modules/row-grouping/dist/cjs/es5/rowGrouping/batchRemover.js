"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BatchRemover = /** @class */ (function () {
    function BatchRemover() {
        this.allSets = {};
        this.allParents = [];
    }
    BatchRemover.prototype.removeFromChildrenAfterGroup = function (parent, child) {
        var set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id] = true;
    };
    BatchRemover.prototype.removeFromAllLeafChildren = function (parent, child) {
        var set = this.getSet(parent);
        set.removeFromAllLeafChildren[child.id] = true;
    };
    BatchRemover.prototype.getSet = function (parent) {
        if (!this.allSets[parent.id]) {
            this.allSets[parent.id] = {
                removeFromAllLeafChildren: {},
                removeFromChildrenAfterGroup: {}
            };
            this.allParents.push(parent);
        }
        return this.allSets[parent.id];
    };
    BatchRemover.prototype.getAllParents = function () {
        return this.allParents;
    };
    BatchRemover.prototype.flush = function () {
        var _this = this;
        this.allParents.forEach(function (parent) {
            var nodeDetails = _this.allSets[parent.id];
            parent.childrenAfterGroup = parent.childrenAfterGroup.filter(function (child) { return !nodeDetails.removeFromChildrenAfterGroup[child.id]; });
            parent.allLeafChildren = parent.allLeafChildren.filter(function (child) { return !nodeDetails.removeFromAllLeafChildren[child.id]; });
            parent.updateHasChildren();
            if (parent.sibling) {
                parent.sibling.childrenAfterGroup = parent.childrenAfterGroup;
                parent.sibling.allLeafChildren = parent.allLeafChildren;
            }
        });
        this.allSets = {};
        this.allParents.length = 0;
    };
    return BatchRemover;
}());
exports.BatchRemover = BatchRemover;
