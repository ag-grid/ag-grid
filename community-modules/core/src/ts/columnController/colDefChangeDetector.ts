import { Autowired, Bean } from "../context/context";
import { PropertyChangeDetector } from "./propertyChangeDetector";
import { ColDef, ColGroupDef } from "../entities/colDef";
import { attrToBoolean, attrToNumber } from "../utils/generic";
import { Constants } from "../constants/constants";
import { ColumnController } from "./columnController";
import { ColumnFactory } from "./columnFactory";
import { Column } from "../entities/column";

@Bean('colDefChangeDetector')
export class ColDefChangeDetector {

    @Autowired('propertyChangeDetector') private propertyChangeDetector: PropertyChangeDetector;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;

    private timestampSameDefsLastSet = 0;
    private infiniteLoopCount = 0;

    private getColDefsFromTree(tree: (ColDef | ColGroupDef)[]): ColDef[] {
        const res: ColDef[] = [];
        const recurse = (list: (ColDef | ColGroupDef)[]) => {
            list.forEach(item => {
                if ((item as ColGroupDef).children) {
                    recurse((item as ColGroupDef).children);
                } else {
                    res.push(item as ColDef);
                }
            });
        };

        recurse(tree);

        return res;
    }

    public areChangesInColDefs(incomingColDefs: (ColDef | ColGroupDef)[], currentColDefs: (ColDef | ColGroupDef)[]): boolean {

        // if the defs are different, they we have changes
        const defsAreEqual = this.propertyChangeDetector.areEqual(incomingColDefs, currentColDefs);
        if (!defsAreEqual) {
            this.infiniteLoopCount = 0;
            return true;
        }

        // if we are getting called within 200ms 5 or more times in a row,
        // then skip the update. this stops a potential infinite loop with
        // frameworks where the application is constantly binding column defs,
        // as the app is listening on a grid event for Columns Loaded, and then
        // setting columns again. the grid should NOT apply the change as it should
        // recognise there is no state change, however it can happen if e.g. application
        // is providing sortIndex=4, sortIndex=5, which gets translated into
        // sortIndex=0, sortIndex=1, thus the colDefs never match the column state.
        const nowMillis = new Date().getTime();
        const millisSinceLastCall = nowMillis - this.timestampSameDefsLastSet;
        this.timestampSameDefsLastSet = nowMillis;
        if (millisSinceLastCall < 200) {
            this.infiniteLoopCount++;
            if (this.infiniteLoopCount>5) {
                return false;
            }
        } else {
            this.infiniteLoopCount = 0;
        }

        // however if defs are the same, we need to verify against the state, because the state may of changed.
        // eg a column's width can be colDef.width=200, and the new cols defs can still have width=200 but
        // the user could of change the width of a column since last setting colDefs which means we need to
        // set the width back to 200 again.
        const justColDefsNoGroups = this.getColDefsFromTree(incomingColDefs);

        // we match columns in the same way the ColumnFactory matches columns. this makes sure we get the
        // same matches.
        const currentColumnsCopy = this.columnController.getAllPrimaryColumns().slice();

        for (let i = 0; i < justColDefsNoGroups.length; i++) {
            const colDef = justColDefsNoGroups[i];
            const col = this.columnFactory.findExistingColumn(colDef, currentColumnsCopy);
            if (col && this.doesColDefChangeColumnState(colDef, col)) {
                return true;
            }
        }

        // if we got this far, all state items in all identifiable columns passed, so we say all cols are equal
        return false;
    }

    private doesColDefChangeColumnState(colDef: ColDef, col: Column): boolean {
        // flex
        const flex = attrToNumber(colDef.flex);
        if (flex !== undefined) {
            const currentFlex = col.getFlex();
            const incomingFlex = flex || 0;
            if (incomingFlex != currentFlex) {
                return true;
            }
        }

        // width - only check it if flex not active. if flex provided in incoming colDef, then we look
        // at that flex value, otherwise look at the current flex value in col
        let flexWillBeOffAfterUpdate: boolean;
        if (flex===undefined) {// if update is NOT changing flex
            // then we check flex on the column
            flexWillBeOffAfterUpdate = col.getFlex() <= 0;
        } else {
            // else we check flex in the incoming state
            flexWillBeOffAfterUpdate = flex==null || flex <= 0;
        }
        if (flexWillBeOffAfterUpdate) {
            const newWidth = attrToNumber(colDef.width);
            const currentWidth = col.getActualWidth();
            // unlike other attributes, null and undefined are equivalent for width, both mean "do not set"
            if (newWidth != null && newWidth != currentWidth) {
                return true;
            }
        }

        // sort
        let sort = colDef.sort;
        if (sort !== undefined) {
            // in case user puts anything other than 'asc' or 'desc', this means 'no sort'
            if (sort != Constants.SORT_ASC && sort != Constants.SORT_DESC) {
                sort = null;
            }
            const currentSort = col.getSort();
            if (sort != currentSort) {
                return true;
            }
        }

        // sort index = only valid if sorting will exist after new cols applied
        const isSortActive = (sort: string) => sort == Constants.SORT_ASC || sort == Constants.SORT_DESC;
        const checkSortIndex = sort === undefined ? isSortActive(col.getSort()) : isSortActive(sort);
        const newSortIndex = attrToNumber(colDef.sortIndex);
        if (checkSortIndex && newSortIndex !== undefined) {
            const currentSortIndex = col.getSortIndex();
            if (newSortIndex !== currentSortIndex) {
                return true;
            }
        }

        // hide
        const hide = attrToBoolean(colDef.hide);
        if (hide !== undefined) {
            const newVisible = !hide; // this allows us to check for null, which means 'make it visible'
            const currentVisible = col.isVisible();
            if (newVisible != currentVisible) {
                return true;
            }
        }

        // pinned
        // logic below allows for pinned to be true/false, and converts to string left/right equivalent
        const pinned = colDef.pinned;
        if (pinned !== undefined) {
            let pinnedString: string;
            if (pinned === true || pinned === Constants.PINNED_LEFT) {
                pinnedString = Constants.PINNED_LEFT;
            } else if (pinned === Constants.PINNED_RIGHT) {
                pinnedString = Constants.PINNED_RIGHT;
            } else {
                pinnedString = null;
            }

            const currentPinned = col.getPinned();
            if (pinnedString != currentPinned) {
                return true;
            }
        }

        // aggFunc
        const newAggFunc = colDef.aggFunc;
        if (newAggFunc !== undefined) {
            const currentValueActive = col.isValueActive();
            const turningAggOff = newAggFunc == null && currentValueActive;
            const turningAggOn = newAggFunc != null && !currentValueActive;
            const currentAggFunc = col.getAggFunc();
            const changingAggFunc = newAggFunc != null && newAggFunc != currentAggFunc;
            if (turningAggOff || turningAggOn || changingAggFunc) {
                return true;
            }
        }

        // pivot
        const pivot = attrToBoolean(colDef.pivot);
        const pivotIndex = attrToNumber(colDef.pivotIndex);
        const pivotProvided = pivot !== undefined || pivotIndex !== undefined;
        if (pivotProvided) {
            const pivotActive = pivot !== undefined ? pivot === true : pivotIndex >= 0;
            const currentPivotActive = col.isPivotActive();
            if (pivotActive !== currentPivotActive) {
                return true;
            }
        }

        // row group
        const rowGroup = attrToBoolean(colDef.rowGroup);
        const rowGroupIndex = attrToNumber(colDef.rowGroupIndex);
        const rowGroupProvided = rowGroup !== undefined || rowGroupIndex !== undefined;
        if (rowGroupProvided) {
            const rowGroupActive = rowGroup !== undefined ? rowGroup === true : rowGroupIndex >= 0;
            const currentRowGroupActive = col.isRowGroupActive();
            if (rowGroupActive !== currentRowGroupActive) {
                return true;
            }
        }

        // all checks pass, so return false, this colDef doesn't impact the cols state
        return false;
    }
}