import {ColumnController} from "./columnController";
import {Autowired, Bean} from "../context/context";
import {ColumnFactory} from "./columnFactory";

@Bean('propertyChangeDetector')
export class PropertyChangeDetector {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;

    public areEqual(oldColDefs: any, newColDefs: any): boolean {
        const colDefsAreEqual = this.areEquivalent(this.copy(oldColDefs), this.copy(newColDefs));
        return colDefsAreEqual;

        /*if (!colDefsAreEqual) {
            return false;
        }


        const justColDefs: ColDef[] = [];
        const recurse = (list: (ColDef | ColGroupDef)[])=> {
            list.forEach(item => {
                if ((item as ColGroupDef).children) {
                    recurse((item as ColGroupDef).children);
                } else {
                    justColDefs.push(item as ColDef);
                }
            });
        };

        let res = true;
        // compare state items in provided col defs with what we have now
        if (justColDefs) {
            const currentColumnsCopy = this.columnController.getAllPrimaryColumns().slice();
            for (let i = 0; i<justColDefs.length; i++) {
                const colDef = justColDefs[i];
                const col = this.columnFactory.findExistingColumn(colDef, currentColumnsCopy);
                if (col) {
                    // flex
                    const newFlex = attrToNumber(colDef.flex);
                    const flexDifferent = newFlex===undefined ? false : newFlex != col.getFlex();
                    if (flexDifferent) { return false; }

                    // width - only check it if flex not actie
                    const newHasFlex = newFlex!==undefined && newFlex>0;
                    const oldHasFlex = col.getFlex()!=null && col.getFlex()>0;
                    const ignoreWidth = (newHasFlex || (newFlex===undefined && oldHasFlex));

                    const newWidth = attrToNumber(colDef.width);
                    const widthDifferent = ignoreWidth ? false :
                        newWidth==null ? false : newWidth != col.getActualWidth();
                    if (widthDifferent) { return false; }

                    // sort
                    const newSort = colDef.sort;
                    const sortDifferent = newSort===undefined ? false : newSort!=col.getSort();
                    if (sortDifferent) { return false; }

                    // sort index = only valid if sorting
                    const isSortInactive = (sort: string) => sort!=Constants.SORT_ASC && sort!=Constants.SORT_DESC;
                    const sortNotActive = newSort===undefined ? isSortInactive(col.getSort()) : isSortInactive(newSort);

                    const newSortIndex = attrToNumber(colDef.sortIndex);
                    const sortIndexDifferent = sortNotActive ? false :
                        newSortIndex===undefined ? false : newSortIndex != col.getSortIndex();
                    if (sortIndexDifferent) { return false; }

                    // hide
                    const newHide = attrToBoolean(colDef.hide);
                    const newVisible = !newHide; // this allows us to check for null, which means 'make it visible'
                    const hideDifferent = newHide!==undefined && newVisible!=col.isVisible();
                    if (hideDifferent) { return false; }

                    // pinned
                    // logic below allows for pinned to be true/false, and converts to string left/right equivalent
                    const newPinned = colDef.pinned;
                    let newPinnedString: string;
                    if (newPinned === true || newPinned === Constants.PINNED_LEFT) {
                        newPinnedString = Constants.PINNED_LEFT;
                    } else if (newPinned === Constants.PINNED_RIGHT) {
                        newPinnedString = Constants.PINNED_RIGHT;
                    } else {
                        newPinnedString = null;
                    }
                    const pinnedDifferent = newPinned===undefined ? false : newPinnedString!=col.getPinned();
                    if (pinnedDifferent) { return false; }

                    // aggFunc
                    const newAggFunc = colDef.aggFunc;
                    const aggFuncDifferent = newAggFunc===undefined ? false :
                        newAggFunc==null ? col.isValueActive() : newAggFunc!==col.getAggFunc;
                    if (aggFuncDifferent) { return false; }

                    // pivot

                }
            }
        }

        return res;*/
    }

    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    public unwrapStringOrNumber(obj: any) {
        return obj instanceof Number || obj instanceof String ? obj.valueOf() : obj;
    }

    // sigh, here for ie compatibility
    private copy(value: any): any {
        if (!value) {
            return value;
        }

        if (Array.isArray(value)) {
            // shallow copy the array - this will typically be either rowData or columnDefs
            const arrayCopy = [];
            for (let i = 0; i < value.length; i++) {
                arrayCopy.push(this.copy(value[i]));
            }
            return arrayCopy;
        }

        // for anything without keys (boolean, string etc).
        // Object.keys - chrome will swallow them, IE will fail (correctly, imho)
        if (typeof value !== "object") {
            return value;
        }

        return [{}, value].reduce((r, o) => {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    }

    private isNaN(value: any) {
        if(Number.isNaN) {
            return Number.isNaN(value);
        }
        // for ie11...
        return typeof(value) === 'number' && isNaN(value);
    }
    /*
     * slightly modified, but taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * What we're trying to do here is determine if the property being checked has changed in _value_, not just in reference
     *
     * For eg, if a user updates the columnDefs via property binding, but the actual columns defs are the same before and
     * after, then we don't want the grid to re-render
     */
    private areEquivalent(a: any, b: any) {
        a = this.unwrapStringOrNumber(a);
        b = this.unwrapStringOrNumber(b);
        if (a === b) return true; //e.g. a and b both null
        if (a === null || b === null || typeof a !== typeof b) return false;
        if (this.isNaN(a) && this.isNaN(b)) {
            return true;
        }
        if (a instanceof Date) {
            return b instanceof Date && a.valueOf() === b.valueOf();
        }
        if (typeof a === "function") {
            return a.toString() === b.toString();
        }
        if (typeof a !== "object") {
            return a == b; //for boolean, number, string, function, xml
        }

        const newA = a.areEquivPropertyTracking === undefined,
            newB = b.areEquivPropertyTracking === undefined;
        try {
            let prop;
            if (newA) {
                a.areEquivPropertyTracking = [];
            } else if (
                a.areEquivPropertyTracking.some(function (other: any) {
                    return other === b;
                })
            )
                return true;
            if (newB) {
                b.areEquivPropertyTracking = [];
            } else if (b.areEquivPropertyTracking.some((other: any) => other === a)) {
                return true;
            }
            a.areEquivPropertyTracking.push(b);
            b.areEquivPropertyTracking.push(a);

            const tmp = {};
            for (prop in a)
                if (prop != "areEquivPropertyTracking") {
                    (tmp as any)[prop] = null;
                }
            for (prop in b)
                if (prop != "areEquivPropertyTracking") {
                    (tmp as any)[prop] = null;
                }

            for (prop in tmp) {
                if (!this.areEquivalent(a[prop], b[prop])) {
                    return false;
                }
            }
            return true;
        } finally {
            if (newA) delete a.areEquivPropertyTracking;
            if (newB) delete b.areEquivPropertyTracking;
        }
    }
}
