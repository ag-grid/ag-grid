export class BatchRemover {
    constructor() {
        this.allSets = {};
        this.allParents = [];
    }
    removeFromChildrenAfterGroup(parent, child) {
        const set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id] = true;
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
