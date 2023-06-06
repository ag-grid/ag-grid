var BatchRemover = /** @class */ (function () {
    function BatchRemover() {
        this.allSets = {};
        this.allParents = [];
    }
    BatchRemover.prototype.removeFromChildrenAfterGroup = function (parent, child) {
        var set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id] = true;
    };
    BatchRemover.prototype.isRemoveFromAllLeafChildren = function (parent, child) {
        var set = this.getSet(parent);
        return !!set.removeFromAllLeafChildren[child.id];
    };
    BatchRemover.prototype.preventRemoveFromAllLeafChildren = function (parent, child) {
        var set = this.getSet(parent);
        delete set.removeFromAllLeafChildren[child.id];
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
export { BatchRemover };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmF0Y2hSZW1vdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2JhdGNoUmVtb3Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpQkE7SUFBQTtRQUVZLFlBQU8sR0FBMkMsRUFBRSxDQUFDO1FBQ3JELGVBQVUsR0FBYyxFQUFFLENBQUM7SUF5RHZDLENBQUM7SUF2RFUsbURBQTRCLEdBQW5DLFVBQW9DLE1BQWUsRUFBRSxLQUFjO1FBQy9ELElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdkQsQ0FBQztJQUVNLGtEQUEyQixHQUFsQyxVQUFtQyxNQUFlLEVBQUUsS0FBYztRQUM5RCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsRUFBRyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLHVEQUFnQyxHQUF2QyxVQUF3QyxNQUFlLEVBQUUsS0FBYztRQUNuRSxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sR0FBRyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU0sZ0RBQXlCLEdBQWhDLFVBQWlDLE1BQWUsRUFBRSxLQUFjO1FBQzVELElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDcEQsQ0FBQztJQUVPLDZCQUFNLEdBQWQsVUFBZSxNQUFlO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFHLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFHLENBQUMsR0FBRztnQkFDdkIseUJBQXlCLEVBQUUsRUFBRTtnQkFDN0IsNEJBQTRCLEVBQUUsRUFBRTthQUNuQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEM7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxvQ0FBYSxHQUFwQjtRQUNJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0sNEJBQUssR0FBWjtRQUFBLGlCQW1CQztRQWxCRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07WUFDMUIsSUFBTSxXQUFXLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRyxDQUFDLENBQUM7WUFFN0MsTUFBTSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQyxNQUFNLENBQ3pELFVBQUEsS0FBSyxJQUFJLE9BQUEsQ0FBQyxXQUFXLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLEVBQUcsQ0FBQyxFQUFwRCxDQUFvRCxDQUNoRSxDQUFDO1lBQ0YsTUFBTSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FDbEQsVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsRUFBRyxDQUFDLEVBQWpELENBQWlELENBQzdELENBQUM7WUFDRixNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUzQixJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO2dCQUM5RCxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO2FBQzNEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0FBQyxBQTVERCxJQTREQyJ9