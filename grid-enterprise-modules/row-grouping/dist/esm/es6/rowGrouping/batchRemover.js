export class BatchRemover {
    constructor() {
        this.allSets = {};
        this.allParents = [];
    }
    removeFromChildrenAfterGroup(parent, child) {
        const set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id] = true;
    }
    isRemoveFromAllLeafChildren(parent, child) {
        const set = this.getSet(parent);
        return !!set.removeFromAllLeafChildren[child.id];
    }
    preventRemoveFromAllLeafChildren(parent, child) {
        const set = this.getSet(parent);
        delete set.removeFromAllLeafChildren[child.id];
    }
    removeFromAllLeafChildren(parent, child) {
        const set = this.getSet(parent);
        set.removeFromAllLeafChildren[child.id] = true;
    }
    getSet(parent) {
        if (!this.allSets[parent.id]) {
            this.allSets[parent.id] = {
                removeFromAllLeafChildren: {},
                removeFromChildrenAfterGroup: {}
            };
            this.allParents.push(parent);
        }
        return this.allSets[parent.id];
    }
    getAllParents() {
        return this.allParents;
    }
    flush() {
        this.allParents.forEach(parent => {
            const nodeDetails = this.allSets[parent.id];
            parent.childrenAfterGroup = parent.childrenAfterGroup.filter(child => !nodeDetails.removeFromChildrenAfterGroup[child.id]);
            parent.allLeafChildren = parent.allLeafChildren.filter(child => !nodeDetails.removeFromAllLeafChildren[child.id]);
            parent.updateHasChildren();
            if (parent.sibling) {
                parent.sibling.childrenAfterGroup = parent.childrenAfterGroup;
                parent.sibling.allLeafChildren = parent.allLeafChildren;
            }
        });
        this.allSets = {};
        this.allParents.length = 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmF0Y2hSZW1vdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2JhdGNoUmVtb3Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpQkEsTUFBTSxPQUFPLFlBQVk7SUFBekI7UUFFWSxZQUFPLEdBQTJDLEVBQUUsQ0FBQztRQUNyRCxlQUFVLEdBQWMsRUFBRSxDQUFDO0lBeUR2QyxDQUFDO0lBdkRVLDRCQUE0QixDQUFDLE1BQWUsRUFBRSxLQUFjO1FBQy9ELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdkQsQ0FBQztJQUVNLDJCQUEyQixDQUFDLE1BQWUsRUFBRSxLQUFjO1FBQzlELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sZ0NBQWdDLENBQUMsTUFBZSxFQUFFLEtBQWM7UUFDbkUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxPQUFPLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsRUFBRyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLHlCQUF5QixDQUFDLE1BQWUsRUFBRSxLQUFjO1FBQzVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDcEQsQ0FBQztJQUVPLE1BQU0sQ0FBQyxNQUFlO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFHLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFHLENBQUMsR0FBRztnQkFDdkIseUJBQXlCLEVBQUUsRUFBRTtnQkFDN0IsNEJBQTRCLEVBQUUsRUFBRTthQUNuQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEM7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxhQUFhO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUcsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsa0JBQW1CLENBQUMsTUFBTSxDQUN6RCxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsQ0FDaEUsQ0FBQztZQUNGLE1BQU0sQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQ2xELEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLEVBQUcsQ0FBQyxDQUM3RCxDQUFDO1lBQ0YsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFM0IsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNoQixNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztnQkFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQzthQUMzRDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7Q0FDSiJ9