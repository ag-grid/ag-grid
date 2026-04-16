import type { Column, ColumnGroup } from 'ag-grid-community';

import type { GridColumns } from '../gridColumns';
import type { GridColumnsErrors } from './gridColumnsErrors';

/**
 * Validates internal column model invariants.
 * This is the column-side equivalent of GridRowsValidator.
 */
export class GridColumnsValidator {
    public constructor(public readonly errors: GridColumnsErrors) {}

    public validate(gridColumns: GridColumns): void {
        const { api, leftCols, centerCols, rightCols, allDisplayedCols, leftTree, centerTree, rightTree } = gridColumns;
        const isRtl = api.getGridOption?.('enableRtl') ?? false;

        // ── Global: allDisplayedColumns matches left + center + right (or right + center + left in RTL) ──
        const expectedAll = isRtl
            ? [...rightCols, ...centerCols, ...leftCols]
            : [...leftCols, ...centerCols, ...rightCols];
        if (allDisplayedCols.length !== expectedAll.length) {
            this.errors.default.add(
                `getAllDisplayedColumns() returned ${allDisplayedCols.length} columns, but left(${leftCols.length}) + center(${centerCols.length}) + right(${rightCols.length}) = ${expectedAll.length}.`
            );
        } else {
            for (let i = 0; i < allDisplayedCols.length; i++) {
                if (allDisplayedCols[i] !== expectedAll[i]) {
                    this.errors.default.add(
                        `getAllDisplayedColumns()[${i}] col "${allDisplayedCols[i].getColId()}" does not match expected "${expectedAll[i].getColId()}" from section arrays.`
                    );
                    break;
                }
            }
        }

        // ── ColId uniqueness ────────────────────────────────────────────────
        const colIdCounts = new Map<string, number>();
        for (const col of allDisplayedCols) {
            const id = col.getColId();
            colIdCounts.set(id, (colIdCounts.get(id) ?? 0) + 1);
        }
        for (const [id, count] of colIdCounts) {
            if (count > 1) {
                this.errors.default.add(`Duplicate colId "${id}" found ${count} times in displayed columns.`);
            }
        }

        // ── Displayed columns subset of all grid columns ────────────────────
        const allGridCols = api.getAllGridColumns?.() ?? [];
        if (allGridCols.length > 0) {
            const gridColSet = new Set(allGridCols);
            for (const col of allDisplayedCols) {
                if (!gridColSet.has(col)) {
                    this.errors.get(col).add('Column is in getAllDisplayedColumns() but NOT in getAllGridColumns().');
                }
            }
        }

        // ── Per-section validation ──────────────────────────────────────────
        this.validateSection(leftCols, 'left', leftTree, isRtl);
        this.validateSection(centerCols, null, centerTree, isRtl);
        this.validateSection(rightCols, 'right', rightTree, isRtl);

        // ── Sort index consistency ──────────────────────────────────────────
        this.validateSortIndices(allDisplayedCols);

        // ── Pinned boundary markers ─────────────────────────────────────────
        this.validatePinnedBoundaryMarkers(leftCols, rightCols);

        // ── Row group / pivot / value column list consistency ────────────────
        this.validateFunctionColumns(gridColumns);

        // ── Column state snapshot consistency ────────────────────────────────
        this.validateColumnState(gridColumns);

        // ── isColumn type discriminator ─────────────────────────────────────
        for (const col of allDisplayedCols) {
            if (!col.isColumn) {
                this.errors.get(col).add('isColumn is false on a Column object.');
            }
        }
    }

    // ── Section-level validation ────────────────────────────────────────────

    private validateSection(
        cols: Column[],
        expectedPinned: 'left' | 'right' | null,
        tree: (Column | ColumnGroup)[],
        isRtl: boolean
    ): void {
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            this.validateColumn(col, expectedPinned, cols, i, isRtl);
        }

        // Validate tree structure
        this.validateTree(tree, expectedPinned, isRtl);
    }

    // ── Per-column validation ───────────────────────────────────────────────

    private validateColumn(
        col: Column,
        expectedPinned: 'left' | 'right' | null,
        sectionCols: Column[],
        index: number,
        isRtl: boolean
    ): void {
        const colErrors = this.errors.get(col);

        // ── Pinned state consistency ────────────────────────────────────────
        const pinned = col.getPinned();
        const normalizedPinned = pinned === true ? 'left' : pinned || null;
        if (normalizedPinned !== expectedPinned) {
            colErrors.add(
                `Pinned state is "${String(pinned)}" but column is in ${expectedPinned ?? 'center'} section.`
            );
        }

        // isPinned() consistency with getPinned()
        const isPinned = col.isPinned();
        const expectedIsPinned = normalizedPinned === 'left' || normalizedPinned === 'right';
        if (isPinned !== expectedIsPinned) {
            colErrors.add(`isPinned() returns ${isPinned} but getPinned() is "${String(pinned)}".`);
        }

        // ── Visible consistency ─────────────────────────────────────────────
        if (!col.isVisible()) {
            colErrors.add('Column is in displayed columns but isVisible() returns false.');
        }

        // ── Width constraints ───────────────────────────────────────────────
        const width = col.getActualWidth();
        if (width <= 0) {
            colErrors.add(`Width is ${width}, expected positive value.`);
        }

        const minWidth = col.getMinWidth();
        if (width < minWidth) {
            colErrors.add(`Width ${width} is less than minWidth ${minWidth}.`);
        }

        const maxWidth = col.getMaxWidth();
        if (maxWidth !== Number.MAX_SAFE_INTEGER && width > maxWidth) {
            colErrors.add(`Width ${width} exceeds maxWidth ${maxWidth}.`);
        }

        if (minWidth > maxWidth && maxWidth !== Number.MAX_SAFE_INTEGER) {
            colErrors.add(`minWidth ${minWidth} exceeds maxWidth ${maxWidth}.`);
        }

        // ── Left position consistency ───────────────────────────────────────
        // In LTR: first column has left=0, positions increase left-to-right
        // In RTL: last column has left=0, positions increase right-to-left
        const left = col.getLeft();
        if (left == null) {
            colErrors.add('Displayed column has null left position.');
        } else if (isRtl) {
            // RTL: last column has left=0, each preceding column's left = next.left + next.width
            if (index === sectionCols.length - 1) {
                if (left !== 0) {
                    colErrors.add(`Last column in RTL section has left=${left}, expected 0.`);
                }
            } else if (index < sectionCols.length - 1) {
                const nextCol = sectionCols[index + 1];
                const nextLeft = nextCol.getLeft();
                if (nextLeft != null) {
                    const expectedLeft = nextLeft + nextCol.getActualWidth();
                    if (left !== expectedLeft) {
                        colErrors.add(
                            `Left position (RTL) is ${left}, expected ${expectedLeft} (next.left=${nextLeft} + next.width=${nextCol.getActualWidth()}).`
                        );
                    }
                }
            }
        } else if (index === 0) {
            // LTR: first column has left=0
            if (left !== 0) {
                colErrors.add(`First column in section has left=${left}, expected 0.`);
            }
        } else {
            // LTR: each column's left = prev.left + prev.width
            const prevCol = sectionCols[index - 1];
            const prevLeft = prevCol.getLeft();
            if (prevLeft != null) {
                const expectedLeft = prevLeft + prevCol.getActualWidth();
                if (left !== expectedLeft) {
                    colErrors.add(
                        `Left position is ${left}, expected ${expectedLeft} (prev.left=${prevLeft} + prev.width=${prevCol.getActualWidth()}).`
                    );
                }
            }
        }

        // ── Sort consistency ────────────────────────────────────────────────
        const sort = col.getSort();
        const sortDef = col.getSortDef?.();
        if (sort != null && sortDef != null) {
            if (sort !== sortDef.direction) {
                colErrors.add(`getSort() returns "${sort}" but getSortDef().direction is "${sortDef.direction}".`);
            }
        }
        if (sort == null && sortDef != null) {
            colErrors.add(`getSort() is null but getSortDef() returns a non-null value.`);
        }

        // ── Aggregation function consistency ────────────────────────────────
        const aggFunc = col.getAggFunc();
        const isValueActive = col.isValueActive();
        if (isValueActive && aggFunc == null) {
            colErrors.add('isValueActive() is true but getAggFunc() is null.');
        }
        if (!isValueActive && aggFunc != null) {
            colErrors.add(`isValueActive() is false but getAggFunc() is "${String(aggFunc)}".`);
        }

        // ── Filter consistency ──────────────────────────────────────────────
        if (col.isFilterActive() && col.isFilterAllowed?.() === false) {
            colErrors.add('isFilterActive() is true but isFilterAllowed() is false.');
        }

        // ── Parent chain validation ─────────────────────────────────────────
        const parent = col.getParent();
        if (parent) {
            const parentChildren = parent.getChildren();
            const parentDisplayed = parent.getDisplayedChildren();
            if (parentChildren && !parentChildren.some((c) => c === col)) {
                colErrors.add('Column not found in parent.getChildren().');
            }
            if (parentDisplayed && !parentDisplayed.some((c) => c === col)) {
                colErrors.add('Displayed column not found in parent.getDisplayedChildren().');
            }
        }

        // ── isEmptyGroup always false for columns ───────────────────────────
        if (col.isEmptyGroup()) {
            colErrors.add('isEmptyGroup() is true for a leaf column (should always be false).');
        }

        // ── Identity: getId() === getColId() === getUniqueId() ──────────────
        const colId = col.getColId();
        const id = col.getId();
        const uniqueId = col.getUniqueId();
        if (id !== colId) {
            colErrors.add(`getId() "${id}" differs from getColId() "${colId}".`);
        }
        if (String(uniqueId) !== colId) {
            colErrors.add(`getUniqueId() "${String(uniqueId)}" differs from getColId() "${colId}".`);
        }

        // ── getDefinition() === getColDef() ─────────────────────────────────
        if (col.getDefinition() !== col.getColDef()) {
            colErrors.add('getDefinition() is not the same object reference as getColDef().');
        }

        // ── getRight() = getLeft() + getActualWidth() ───────────────────────
        if (left != null) {
            const right = col.getRight();
            const expectedRight = left + width;
            if (right !== expectedRight) {
                colErrors.add(`getRight() is ${right}, expected ${expectedRight} (left=${left} + width=${width}).`);
            }
        }

        // ── isSpanHeaderHeight consistency with colDef ──────────────────────
        const colDef = col.getColDef();
        const spanHeaderHeight = col.isSpanHeaderHeight();
        const suppressSpan = colDef.suppressSpanHeaderHeight;
        if (spanHeaderHeight === !!suppressSpan && suppressSpan !== undefined) {
            colErrors.add(
                `isSpanHeaderHeight() is ${spanHeaderHeight} but suppressSpanHeaderHeight is ${String(suppressSpan)}.`
            );
        }

        // ── getColumnGroupPaddingInfo consistency ───────────────────────────
        const paddingInfo = col.getColumnGroupPaddingInfo();
        if (paddingInfo.numberOfParents < 0) {
            colErrors.add(
                `getColumnGroupPaddingInfo().numberOfParents is ${paddingInfo.numberOfParents}, expected >= 0.`
            );
        }
        if (paddingInfo.numberOfParents === 0 && paddingInfo.isSpanningTotal) {
            colErrors.add('getColumnGroupPaddingInfo().isSpanningTotal is true but numberOfParents is 0.');
        }
        // If numberOfParents > 0, the immediate parent should be a padding group
        if (paddingInfo.numberOfParents > 0 && parent && !parent.isPadding()) {
            colErrors.add(
                `getColumnGroupPaddingInfo().numberOfParents is ${paddingInfo.numberOfParents} but getParent() is not a padding group.`
            );
        }

        // ── isPinnedLeft / isPinnedRight consistency ────────────────────────
        if (col.isPinnedLeft() !== (normalizedPinned === 'left')) {
            colErrors.add(`isPinnedLeft() is ${col.isPinnedLeft()} but pinned is "${String(pinned)}".`);
        }
        if (col.isPinnedRight() !== (normalizedPinned === 'right')) {
            colErrors.add(`isPinnedRight() is ${col.isPinnedRight()} but pinned is "${String(pinned)}".`);
        }

        // ── Permission flags: UI vs API behavior ────────────────────────────
        // isAllowPivot/isAllowRowGroup/isAllowValue control UI drag-and-drop zones.
        // Columns CAN be active via colDef (rowGroup:true) even without enableRowGroup.
        // But if enablePivot/enableRowGroup/enableValue was EXPLICITLY set to true,
        // then the corresponding active flag must be consistent.
        const colDef2 = col.getColDef();
        if (colDef2.enablePivot === true && !col.isAllowPivot()) {
            colErrors.add('colDef.enablePivot is true but isAllowPivot() returns false.');
        }
        if (colDef2.enableRowGroup === true && !col.isAllowRowGroup()) {
            colErrors.add('colDef.enableRowGroup is true but isAllowRowGroup() returns false.');
        }
        if (colDef2.enableValue === true && !col.isAllowValue()) {
            colErrors.add('colDef.enableValue is true but isAllowValue() returns false.');
        }

        // ── getUserProvidedColDef consistency ────────────────────────────────
        // When getUserProvidedColDef() is non-null, the colDef should be a superset of it
        // (merged with defaults). We validate that the reference exists for columns
        // that have explicit field or colId in their colDef.
        const userColDef = col.getUserProvidedColDef();
        if (userColDef) {
            // The merged colDef should have the same field and colId as the user-provided one
            const mergedColDef = col.getColDef();
            if (userColDef.field && mergedColDef.field !== userColDef.field) {
                colErrors.add(
                    `getUserProvidedColDef().field is "${userColDef.field}" but getColDef().field is "${mergedColDef.field}".`
                );
            }
        }

        // ── isSortable consistency with colDef ──────────────────────────────
        // When sortable is explicitly set on colDef, isSortable() should match
        const sortableColDef = col.getColDef().sortable;
        if (sortableColDef === false && col.isSortable()) {
            colErrors.add('colDef.sortable is false but isSortable() returns true.');
        }

        // ── isMoving should be false at rest ────────────────────────────────
        // During tests, columns should not be in moving state unless mid-drag
        if (col.isMoving()) {
            colErrors.add('Column isMoving() is true at validation time (should be false at rest).');
        }

        // ── isAutoHeight consistency ────────────────────────────────────────
        const autoHeight = col.getColDef().autoHeight;
        if (autoHeight === true && !col.isAutoHeight()) {
            colErrors.add('colDef.autoHeight is true but isAutoHeight() returns false.');
        }

        // ── getColumnGroupShow consistency with colDef ──────────────────────
        const cgs = col.getColumnGroupShow();
        const cgsDef = col.getColDef().columnGroupShow;
        if (cgsDef && cgs !== cgsDef) {
            colErrors.add(`colDef.columnGroupShow is "${cgsDef}" but getColumnGroupShow() returns "${cgs}".`);
        }

        // ── isResizable consistency ──────────────────────────────────────────
        const resizableColDef = col.getColDef().resizable;
        if (resizableColDef === false && col.isResizable()) {
            colErrors.add('colDef.resizable is false but isResizable() returns true.');
        }
    }

    // ── Tree structure validation ───────────────────────────────────────────

    private validateTree(
        tree: (Column | ColumnGroup)[],
        expectedPinned: 'left' | 'right' | null,
        isRtl: boolean
    ): void {
        for (const item of tree) {
            if (item.isColumn) {
                continue; // Already validated in per-column checks
            }

            const group = item as ColumnGroup;
            this.validateGroup(group, expectedPinned, isRtl);
        }
    }

    private validateGroup(group: ColumnGroup, expectedPinned: 'left' | 'right' | null, isRtl: boolean): void {
        const groupErrors = this.errors.get(group);

        // ── Type discriminator ──────────────────────────────────────────────
        if (group.isColumn) {
            groupErrors.add('isColumn is true on a ColumnGroup object.');
        }

        // ── Children not null ───────────────────────────────────────────────
        const children = group.getChildren();
        if (!children) {
            groupErrors.add('getChildren() returned null.');
            return;
        }

        // ── DisplayedChildren is a subset of children ───────────────────────
        const displayedChildren = group.getDisplayedChildren();
        if (displayedChildren) {
            const childSet = new Set(children);
            for (const child of displayedChildren) {
                if (!childSet.has(child)) {
                    const id = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(`Displayed child "${id}" is not in getChildren().`);
                }
            }
        }

        // ── Parent back-references ──────────────────────────────────────────
        if (displayedChildren) {
            for (const child of displayedChildren) {
                const parent = child.getParent();
                if (parent !== group) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(`Child "${childId}" parent back-reference does not point to this group.`);
                }
            }
        }

        // ── Group width = sum of displayed children widths ──────────────────
        if (displayedChildren && displayedChildren.length > 0) {
            const expectedWidth = displayedChildren.reduce((sum, c) => sum + c.getActualWidth(), 0);
            const groupWidth = group.getActualWidth();
            if (groupWidth !== expectedWidth) {
                groupErrors.add(
                    `Group width is ${groupWidth}, expected ${expectedWidth} (sum of displayed children widths).`
                );
            }
        }

        // ── Group minWidth = sum of displayed children minWidths ────────────
        if (displayedChildren && displayedChildren.length > 0) {
            const expectedMinWidth = displayedChildren.reduce((sum, c) => sum + c.getMinWidth(), 0);
            const groupMinWidth = group.getMinWidth();
            if (groupMinWidth !== expectedMinWidth) {
                groupErrors.add(
                    `Group minWidth is ${groupMinWidth}, expected ${expectedMinWidth} (sum of displayed children minWidths).`
                );
            }
        }

        // ── isResizable: true if any displayed child is resizable ───────────
        if (displayedChildren && displayedChildren.length > 0) {
            const anyResizable = displayedChildren.some((c) => c.isResizable());
            if (group.isResizable() !== anyResizable) {
                groupErrors.add(
                    `Group isResizable() is ${group.isResizable()}, but ${anyResizable ? 'some' : 'no'} displayed children are resizable.`
                );
            }
        }

        // ── isMoving: true iff any leaf column is moving ────────────────────
        const leafCols = group.getLeafColumns();
        const anyLeafMoving = leafCols.some((c) => c.isMoving());
        if (group.isMoving() !== anyLeafMoving) {
            groupErrors.add(
                `Group isMoving() is ${group.isMoving()}, but ${anyLeafMoving ? 'some' : 'no'} leaf columns are moving.`
            );
        }

        // ── getLeafColumns ⊇ getDisplayedLeafColumns ────────────────────────
        const displayedLeafCols = group.getDisplayedLeafColumns();
        const leafSet = new Set(leafCols);
        for (const displayedLeaf of displayedLeafCols) {
            if (!leafSet.has(displayedLeaf)) {
                groupErrors.add(`Displayed leaf column "${displayedLeaf.getColId()}" is not in getLeafColumns().`);
            }
        }

        // ── columnGroupShow visibility rules ────────────────────────────────
        if (group.isExpandable() && children.length > 0 && displayedChildren) {
            const isExpanded = group.isExpanded();
            const displayedSet = new Set(displayedChildren);

            for (const child of children) {
                const cgs = child.getColumnGroupShow?.();
                const isDisplayed = displayedSet.has(child);

                if (cgs === 'open' && isExpanded && !isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"open" and group is expanded, but is not in displayedChildren.`
                    );
                }
                if (cgs === 'closed' && !isExpanded && !isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"closed" and group is collapsed, but is not in displayedChildren.`
                    );
                }
                if (cgs === 'open' && !isExpanded && isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"open" and group is collapsed, but IS in displayedChildren.`
                    );
                }
                if (cgs === 'closed' && isExpanded && isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"closed" and group is expanded, but IS in displayedChildren.`
                    );
                }
                if (!cgs && !isDisplayed) {
                    // Columns without columnGroupShow should always be displayed, unless:
                    // - The column itself is not visible
                    // - The child is a group whose displayed leaf columns are all empty
                    //   (happens when a padding group's children are all hidden due to columnGroupShow rules)
                    let isChildEffectivelyVisible: boolean;
                    if (child.isColumn) {
                        isChildEffectivelyVisible = child.isVisible();
                    } else {
                        // For groups: check if any displayed leaf columns exist
                        const childGroup = child as ColumnGroup;
                        isChildEffectivelyVisible = childGroup.getDisplayedLeafColumns().length > 0;
                    }
                    if (isChildEffectivelyVisible) {
                        const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                        groupErrors.add(
                            `Child "${childId}" has no columnGroupShow and is visible, but is not in displayedChildren.`
                        );
                    }
                }
            }
        }

        // ── Group left position consistency ─────────────────────────────────
        // In LTR: group left = first displayed child's left
        // In RTL: group left = last displayed child's left
        if (displayedChildren && displayedChildren.length > 0) {
            const refChild = isRtl ? displayedChildren[displayedChildren.length - 1] : displayedChildren[0];
            const groupLeft = group.getLeft();
            const refChildLeft = refChild.getLeft();
            if (groupLeft != null && refChildLeft != null && groupLeft !== refChildLeft) {
                const pos = isRtl ? 'last' : 'first';
                groupErrors.add(`Group left is ${groupLeft}, but ${pos} displayed child left is ${refChildLeft}.`);
            }
        }

        // ── getProvidedColumnGroup() must exist ─────────────────────────────
        const provided = group.getProvidedColumnGroup();
        if (!provided) {
            groupErrors.add('getProvidedColumnGroup() returned null.');
        }

        // ── isEmptyGroup consistency ────────────────────────────────────────
        if (displayedChildren) {
            const isEmpty = displayedChildren.length === 0;
            if (group.isEmptyGroup() !== isEmpty) {
                groupErrors.add(
                    `isEmptyGroup() is ${group.isEmptyGroup()} but displayedChildren.length is ${displayedChildren.length}.`
                );
            }
        }

        // ── getUniqueId format: groupId_partId ──────────────────────────────
        const uniqueId = String(group.getUniqueId());
        const groupId = group.getGroupId();
        if (!uniqueId.startsWith(groupId + '_')) {
            groupErrors.add(`getUniqueId() "${uniqueId}" does not start with getGroupId()+"_" ("${groupId}_").`);
        }

        // ── getDefinition() === getColGroupDef() ────────────────────────────
        if (group.getDefinition() !== group.getColGroupDef()) {
            groupErrors.add('getDefinition() is not the same object reference as getColGroupDef().');
        }

        // ── getPaddingLevel consistency ──────────────────────────────────────
        const paddingLevel = group.getPaddingLevel();
        if (paddingLevel < 0) {
            groupErrors.add(`getPaddingLevel() is ${paddingLevel}, expected >= 0.`);
        }
        if (paddingLevel > 0 && !group.isPadding()) {
            groupErrors.add(`getPaddingLevel() is ${paddingLevel} but isPadding() is false.`);
        }

        // ── Pinned consistency for all leaf columns ─────────────────────────
        const groupPinned = group.getPinned();
        for (const leaf of leafCols) {
            const leafPinned = leaf.getPinned();
            const normalizedGroupPinned = groupPinned === true ? 'left' : groupPinned || null;
            const normalizedLeafPinned = leafPinned === true ? 'left' : leafPinned || null;
            if (normalizedGroupPinned !== normalizedLeafPinned) {
                groupErrors.add(
                    `Group pinned is "${String(groupPinned)}" but leaf "${leaf.getColId()}" pinned is "${String(leafPinned)}".`
                );
                break;
            }
        }

        // ── Recurse into displayed children ─────────────────────────────────
        if (displayedChildren) {
            this.validateTree(displayedChildren, expectedPinned, isRtl);
        }
    }

    // ── Sort validation ─────────────────────────────────────────────────────

    private validateSortIndices(cols: Column[]): void {
        const sortedCols = cols.filter((c) => c.getSort() != null);
        if (sortedCols.length <= 1) {
            return;
        }

        // When multiple columns are sorted and have sortIndex, validate they are sequential (0, 1, 2, ...)
        const indices = sortedCols
            .map((c) => c.getSortIndex())
            .filter((idx): idx is number => idx != null && idx >= 0)
            .sort((a, b) => a - b);

        // Only validate if all sorted columns have sortIndex (some APIs apply sort without sortIndex)
        if (indices.length === 0 || indices.length !== sortedCols.length) {
            return;
        }

        for (let i = 0; i < indices.length; i++) {
            if (indices[i] !== i) {
                this.errors.default.add(
                    `Sort indices are not sequential. Expected [0..${indices.length - 1}], got [${indices.join(', ')}].`
                );
                break;
            }
        }

        // Validate uniqueness
        const uniqueIndices = new Set(indices);
        if (uniqueIndices.size !== indices.length) {
            this.errors.default.add(`Duplicate sortIndex values found among sorted columns.`);
        }
    }

    // ── Pinned boundary markers ─────────────────────────────────────────────

    private validatePinnedBoundaryMarkers(leftCols: Column[], rightCols: Column[]): void {
        // isLastLeftPinned: at most one column, must be last in leftCols
        if (leftCols.length > 0) {
            const lastLeftPinnedCols = leftCols.filter((c) => c.isLastLeftPinned());
            if (lastLeftPinnedCols.length > 1) {
                this.errors.default.add(
                    `${lastLeftPinnedCols.length} columns have isLastLeftPinned()=true, expected at most 1.`
                );
            }
            if (lastLeftPinnedCols.length === 1 && lastLeftPinnedCols[0] !== leftCols[leftCols.length - 1]) {
                this.errors.default.add(
                    `isLastLeftPinned() column "${lastLeftPinnedCols[0].getColId()}" is not the last column in leftCols.`
                );
            }
        }

        // isFirstRightPinned: at most one column, must be first in rightCols
        if (rightCols.length > 0) {
            const firstRightPinnedCols = rightCols.filter((c) => c.isFirstRightPinned());
            if (firstRightPinnedCols.length > 1) {
                this.errors.default.add(
                    `${firstRightPinnedCols.length} columns have isFirstRightPinned()=true, expected at most 1.`
                );
            }
            if (firstRightPinnedCols.length === 1 && firstRightPinnedCols[0] !== rightCols[0]) {
                this.errors.default.add(
                    `isFirstRightPinned() column "${firstRightPinnedCols[0].getColId()}" is not the first column in rightCols.`
                );
            }
        }
    }

    // ── Row group / pivot / value column list consistency ───────────────────

    private validateFunctionColumns(gridColumns: GridColumns): void {
        const { api } = gridColumns;
        const isModuleRegistered = api.isModuleRegistered as (name: string) => boolean;

        // Use colId-based comparison since service columns may be from colDefCols
        // while displayed columns are from the working cols collection (different instances).

        // Row group columns: api list ↔ isRowGroupActive()
        if (isModuleRegistered('SharedRowGrouping')) {
            const rowGroupColIds = new Set(api.getRowGroupColumns().map((c: Column) => c.getColId()));
            for (const col of gridColumns.allDisplayedCols) {
                const active = col.isRowGroupActive();
                const inList = rowGroupColIds.has(col.getColId());
                if (active && !inList) {
                    this.errors.get(col).add('isRowGroupActive() is true but column is not in getRowGroupColumns().');
                }
                if (!active && inList) {
                    this.errors.get(col).add('isRowGroupActive() is false but column IS in getRowGroupColumns().');
                }
            }
        }

        // Pivot columns: api list ↔ isPivotActive()
        if (isModuleRegistered('SharedPivot')) {
            const pivotColIds = new Set(api.getPivotColumns().map((c: Column) => c.getColId()));
            for (const col of gridColumns.allDisplayedCols) {
                const active = col.isPivotActive();
                const inList = pivotColIds.has(col.getColId());
                if (active && !inList) {
                    this.errors.get(col).add('isPivotActive() is true but column is not in getPivotColumns().');
                }
                if (!active && inList) {
                    this.errors.get(col).add('isPivotActive() is false but column IS in getPivotColumns().');
                }
            }
        }

        // Value columns: api list → isValueActive() (one-direction only)
        // Note: isValueActive() can be true from colDef.aggFunc without the column being in getValueColumns(),
        // so we only validate that columns IN the list must have isValueActive()=true.
        if (isModuleRegistered('SharedPivot')) {
            const valueColIds = new Set(api.getValueColumns().map((c: Column) => c.getColId()));
            for (const col of gridColumns.allDisplayedCols) {
                const inList = valueColIds.has(col.getColId());
                if (!col.isValueActive() && inList) {
                    this.errors.get(col).add('isValueActive() is false but column IS in getValueColumns().');
                }
            }
        }
    }

    // ── Column state snapshot consistency ───────────────────────────────────

    private validateColumnState(gridColumns: GridColumns): void {
        const { api } = gridColumns;
        const stateArr = api.getColumnState?.();
        if (!stateArr) {
            return;
        }

        const stateMap = new Map<string, any>();
        for (const s of stateArr) {
            stateMap.set(s.colId, s);
        }

        for (const col of gridColumns.allDisplayedCols) {
            const colId = col.getColId();
            const isSpecialColumn =
                colId.startsWith('ag-Grid-SelectionColumn') || colId.startsWith('ag-Grid-RowNumbersColumn');

            const state = stateMap.get(colId);
            if (!state) {
                // Special columns (selection, row numbers) are not included in getColumnState() — that's expected.
                // Auto-group columns ARE included. Regular columns must be present.
                if (!isSpecialColumn) {
                    this.errors.get(col).add(`Column "${colId}" is displayed but not found in getColumnState().`);
                }
                continue;
            }

            const colErrors = this.errors.get(col);

            // hide: state.hide should match !isVisible()
            const stateHide = state.hide ?? false;
            if (stateHide !== !col.isVisible()) {
                colErrors.add(`getColumnState().hide is ${stateHide} but isVisible() is ${col.isVisible()}.`);
            }

            // width: state.width should match getActualWidth()
            if (state.width != null && state.width !== col.getActualWidth()) {
                colErrors.add(
                    `getColumnState().width is ${state.width} but getActualWidth() is ${col.getActualWidth()}.`
                );
            }

            // pinned: state.pinned should match getPinned()
            const statePinned = state.pinned ?? null;
            const colPinned = col.getPinned() || null;
            if (statePinned !== colPinned) {
                colErrors.add(
                    `getColumnState().pinned is "${String(statePinned)}" but getPinned() is "${String(colPinned)}".`
                );
            }

            // sort: state.sort should match getSort()
            const stateSort = state.sort ?? null;
            const colSort = col.getSort() ?? null;
            if (stateSort !== colSort) {
                colErrors.add(`getColumnState().sort is "${String(stateSort)}" but getSort() is "${String(colSort)}".`);
            }

            // sortIndex: state.sortIndex should match getSortIndex()
            const stateSortIndex = state.sortIndex ?? null;
            const colSortIndex = col.getSortIndex() ?? null;
            if (stateSortIndex !== colSortIndex) {
                colErrors.add(
                    `getColumnState().sortIndex is ${String(stateSortIndex)} but getSortIndex() is ${String(colSortIndex)}.`
                );
            }

            // rowGroup: state.rowGroup should match isRowGroupActive()
            const stateRowGroup = state.rowGroup ?? false;
            if (stateRowGroup !== col.isRowGroupActive()) {
                colErrors.add(
                    `getColumnState().rowGroup is ${stateRowGroup} but isRowGroupActive() is ${col.isRowGroupActive()}.`
                );
            }

            // pivot: state.pivot should match isPivotActive()
            const statePivot = state.pivot ?? false;
            if (statePivot !== col.isPivotActive()) {
                colErrors.add(`getColumnState().pivot is ${statePivot} but isPivotActive() is ${col.isPivotActive()}.`);
            }

            // flex: state.flex should match getFlex()
            const stateFlex = state.flex ?? null;
            const colFlex = col.getFlex() ?? null;
            if (stateFlex !== colFlex) {
                colErrors.add(`getColumnState().flex is ${String(stateFlex)} but getFlex() is ${String(colFlex)}.`);
            }
        }
    }
}
