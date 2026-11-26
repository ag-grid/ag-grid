import { _addManagedElementListeners } from 'ag-stack';

import type { ColumnMoveService } from '../../columnMove/columnMoveService';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { FocusService } from '../../focusService';
import type { ScrollPartner } from '../../gridBodyComp/gridBodyScrollFeature';
import {
    HEADER_CHANGE_FLAG_COLUMN_CELL_OPTIONS,
    HEADER_CHANGE_FLAG_COL_DEFS,
    HEADER_CHANGE_FLAG_ENABLE_ADVANCED_FILTER,
} from '../../gridChanges';
import type { HeaderChanges } from '../../gridChanges';
import type { HeaderPosition } from '../../interfaces/iHeaderPosition';
import type { AbstractHeaderCellCtrl } from '../cells/abstractCell/abstractHeaderCellCtrl';
import type { HeaderFilterCellCtrl } from '../cells/floatingFilter/headerFilterCellCtrl';
import { getColumnHeaderRowHeight, getGroupRowsHeight } from '../headerUtils';
import type { HeaderRowType } from '../row/headerRowComp';
import { HeaderRowCtrl } from '../row/headerRowCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IHeaderRowsComp {
    setViewportScrollLeft(left: number): void;
    setCtrls(ctrls: HeaderRowCtrl[]): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class HeaderRowContainerCtrl extends BeanStub implements ScrollPartner {
    public comp: IHeaderRowsComp;

    private filtersRowCtrl: HeaderRowCtrl | undefined;
    /** Whether the column headers show their formula reference: a formula cell is being edited. Read by new cells. */
    public formulaRefsShown = false;
    private columnsRowCtrl: HeaderRowCtrl | undefined;
    private groupsRowCtrls: HeaderRowCtrl[] = [];
    /** The rows in display order (groups, columns, filters), rebuilt by `refresh`. */
    private rowCtrls: HeaderRowCtrl[] = [];
    /** The last width pushed here, so a group or floating-filter row arriving later can size itself from
     *  it rather than ask the grid body to recompute. `null` until the first push. */
    public rowWidth: number | null = null;
    public eViewport: HTMLElement;

    public setComp(comp: IHeaderRowsComp, eGui: HTMLElement, eScrollViewport: HTMLElement = eGui): void {
        this.comp = comp;
        this.eViewport = eScrollViewport;

        const { ctrlsSvc, colModel, colMoves } = this.beans;

        this.setupDragAndDrop(colMoves, eGui);

        ctrlsSvc.register('headerRowContainerCtrl', this);

        if (colModel.ready) {
            this.refresh();
        }
    }

    /** Pushed by `GridBodyCtrl.updateWidths`. */
    public setRowWidths(width: number): void {
        // `updateWidths` can push the same width again, and a row created later reads `rowWidth` itself.
        if (width === this.rowWidth) {
            return;
        }
        this.rowWidth = width;
        const rowCtrls = this.rowCtrls;
        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            rowCtrls[i].setRowWidth(width);
        }
    }

    /** Called by the visible columns once per column layout; `displayedChanged` false: only the rendered columns
     *  changed, else each row's walk also follows `changes`. */
    public layOutHeaderCells(displayedChanged: boolean, afterScroll: boolean, changes: HeaderChanges): void {
        const rowCtrls = this.rowCtrls;
        if (!displayedChanged) {
            for (let i = 0, len = rowCtrls.length; i < len; ++i) {
                rowCtrls[i].onVirtualColumnsChanged(afterScroll);
            }
            return;
        }
        this.refresh(true);
        if (changes !== 0) {
            this.applyContainerChanges(changes);
        }
        const groupsRowCtrls = this.groupsRowCtrls;
        for (let i = 0, groupsLen = groupsRowCtrls.length; i < groupsLen; ++i) {
            groupsRowCtrls[i].onDisplayedColumnsChanged(null, 0, changes);
        }
        // read once the group rows hold their cells: the column row's spanning cells take them in its one walk
        const beans = this.beans;
        const groupRowsHeight = getGroupRowsHeight(beans);
        const headerHeight = getColumnHeaderRowHeight(beans);
        this.columnsRowCtrl?.onDisplayedColumnsChanged(groupRowsHeight, headerHeight, changes);
        this.filtersRowCtrl?.onDisplayedColumnsChanged(null, 0, changes);
        const allRowCtrls = this.rowCtrls; // replaced by the refresh when a row came or went
        for (let i = 0, len = allRowCtrls.length; i < len; ++i) {
            allRowCtrls[i].onRowHeightChanged(groupRowsHeight, headerHeight);
        }
    }

    /** Called by the visible columns; `sectionWidthsChanged`: a centre width can change with no row width moving. */
    public refreshCellPositions(sectionWidthsChanged: boolean): void {
        const rowCtrls = this.rowCtrls;
        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            rowCtrls[i].refreshCellPositions(sectionWidthsChanged);
        }
    }

    /** Called by the visible columns with the columns that left or reached a pinned edge, null where none did. */
    public refreshPinnedEdgeCells(
        fromLastLeft: AgColumn | null,
        toLastLeft: AgColumn | null,
        fromFirstRight: AgColumn | null,
        toFirstRight: AgColumn | null
    ): void {
        const columnsRowCtrl = this.columnsRowCtrl;
        if (columnsRowCtrl) {
            columnsRowCtrl.refreshPinnedEdges(fromLastLeft);
            columnsRowCtrl.refreshPinnedEdges(toLastLeft);
            columnsRowCtrl.refreshPinnedEdges(fromFirstRight);
            columnsRowCtrl.refreshPinnedEdges(toFirstRight);
        }
    }

    /** Follows what an update changed for the header, when no layout walks the rows for it. */
    public applyGridChanges(changes: HeaderChanges): void {
        if ((changes & HEADER_CHANGE_FLAG_ENABLE_ADVANCED_FILTER) !== 0) {
            this.refresh(true); // the floating filter row comes or goes
        }
        this.applyContainerChanges(changes);
        const rowCtrls = this.rowCtrls;
        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            rowCtrls[i].onGridChanges(changes);
        }
    }

    /** The container-wide part of `changes`, before the rows walk theirs: the changed columns. */
    private applyContainerChanges(changes: HeaderChanges): void {
        const columnsRowCtrl = this.columnsRowCtrl;
        const filtersRowCtrl = this.filtersRowCtrl;
        if ((changes & HEADER_CHANGE_FLAG_COL_DEFS) !== 0) {
            // options redrawing every column cell redraw a redefined one too: it is not redrawn twice
            const redrawn =
                (changes & (HEADER_CHANGE_FLAG_COLUMN_CELL_OPTIONS | HEADER_CHANGE_FLAG_ENABLE_ADVANCED_FILTER)) !== 0
                    ? undefined
                    : columnsRowCtrl;
            const cols = this.beans.colModel.getAllCols();
            for (let i = 0, len = cols.length; i < len; ++i) {
                const col = cols[i];
                const redefined = col.takeHeaderChange();
                if (redefined !== null) {
                    redrawn?.getMountedCellCtrl(col)?.refresh?.(redefined);
                    filtersRowCtrl?.getMountedCellCtrl(col)?.refresh?.(redefined);
                }
            }
        }
    }

    /** The calls below come from each owner as it changes what the header cells show, before its event. */
    public onHeaderHeightChanged(groupRowsHeight: number[], headerHeight: number): void {
        this.columnsRowCtrl?.refreshSpanHeaderHeights(groupRowsHeight, headerHeight);
    }

    /** The column's header and floating filter cells re-apply its header classes. */
    public onHeaderClassesChanged(column: AgColumn): void {
        this.columnsRowCtrl?.getMountedCellCtrl(column)?.refreshHeaderClasses?.();
        this.filtersRowCtrl?.getMountedCellCtrl(column)?.refreshHeaderClasses?.();
    }

    /** A cell edit started or stopped: column headers show their formula reference while a formula cell is edited. */
    public onCellEditingChanged(started: boolean): void {
        const shown =
            started &&
            !!this.beans.editModelSvc
                ?.getEditPositions()
                ?.some((position) => (position.column as AgColumn).allowFormula);
        // the cells are walked only when the answer flips: an edit of a plain cell walks none
        if (shown === this.formulaRefsShown) {
            return;
        }
        this.formulaRefsShown = shown;
        this.columnsRowCtrl?.setFormulaRefsShown(shown);
    }

    /** The header cells of the column or group the header name editor opened or closed on re-apply its highlight. */
    public onEditHighlightChanged(target: AgColumn | AgProvidedColumnGroup): void {
        if (isProvidedColumnGroup(target)) {
            const groupId = target.groupId;
            const groupsRowCtrls = this.groupsRowCtrls;
            for (let i = 0, len = groupsRowCtrls.length; i < len; ++i) {
                groupsRowCtrls[i].refreshGroupEditHighlight(groupId);
            }
        } else {
            this.columnsRowCtrl?.getMountedCellCtrl(target)?.refreshEditHighlight?.();
        }
    }

    /** Each row takes its top and height again: a header height option, style or measured height changed. */
    public placeRows(): void {
        const beans = this.beans;
        const groupRowsHeight = getGroupRowsHeight(beans);
        const headerHeight = getColumnHeaderRowHeight(beans);
        const rowCtrls = this.rowCtrls;
        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            rowCtrls[i].onRowHeightChanged(groupRowsHeight, headerHeight);
        }
    }

    public onOverlayExclusiveChanged(): void {
        const rowCtrls = this.rowCtrls;
        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            rowCtrls[i].refreshFocusable();
        }
    }

    public getAllCtrls(): HeaderRowCtrl[] {
        return this.rowCtrls;
    }

    public refresh(keepColumns = false): void {
        const { focusSvc, filterManager, visibleCols } = this.beans;
        const focusedHeaderPosition = focusSvc.getFocusHeaderToUseAfterRefresh();

        const groupRowCount = visibleCols.headerGroupRowCount;
        if (!keepColumns) {
            this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);
        }
        const groupsRowCtrls = this.groupsRowCtrls;
        const currentGroupCount = groupsRowCtrls.length;
        if (currentGroupCount > groupRowCount) {
            for (let i = groupRowCount; i < currentGroupCount; i++) {
                this.destroyBean(groupsRowCtrls[i]);
            }
            groupsRowCtrls.length = groupRowCount;
        } else {
            for (let i = currentGroupCount; i < groupRowCount; i++) {
                groupsRowCtrls.push(this.createBean(new HeaderRowCtrl(i, 'group')));
            }
        }

        const oldColumnsRowCtrl = this.columnsRowCtrl;
        let columnsRowCtrl = oldColumnsRowCtrl;
        if (columnsRowCtrl == null || !keepColumns) {
            this.columnsRowCtrl = this.destroyBean(columnsRowCtrl);
            columnsRowCtrl = this.createBean(new HeaderRowCtrl(groupRowCount, 'column'));
            this.columnsRowCtrl = columnsRowCtrl;
        } else if (columnsRowCtrl.rowIndex !== groupRowCount) {
            columnsRowCtrl.setRowIndex(groupRowCount);
        }

        const includeFloatingFilter = !!filterManager?.hasFloatingFilters();
        const oldFiltersRowCtrl = this.filtersRowCtrl;
        let filtersRowCtrl = oldFiltersRowCtrl;
        if (filtersRowCtrl !== undefined && (!includeFloatingFilter || !keepColumns)) {
            filtersRowCtrl = this.destroyBean(filtersRowCtrl);
            this.filtersRowCtrl = filtersRowCtrl;
        }
        const filterRowIndex = groupRowCount + 1;
        if (includeFloatingFilter && filtersRowCtrl === undefined) {
            filtersRowCtrl = this.createBean(new HeaderRowCtrl(filterRowIndex, 'filter'));
            this.filtersRowCtrl = filtersRowCtrl;
        } else if (filtersRowCtrl !== undefined && filtersRowCtrl.rowIndex !== filterRowIndex) {
            filtersRowCtrl.setRowIndex(filterRowIndex);
        }

        // the comp holds the rows' array, replaced only when a row changed (a group rebuild recreates the columns row)
        const oldCtrls = this.rowCtrls;
        if (
            currentGroupCount !== groupRowCount ||
            columnsRowCtrl !== oldColumnsRowCtrl ||
            filtersRowCtrl !== oldFiltersRowCtrl
        ) {
            const allCtrls = groupsRowCtrls.slice();
            allCtrls.push(columnsRowCtrl);
            if (filtersRowCtrl !== undefined) {
                allCtrls.push(filtersRowCtrl);
            }
            this.rowCtrls = allCtrls;
            this.comp.setCtrls(allCtrls);
        }

        this.restoreFocusOnHeader(focusSvc, focusedHeaderPosition);

        // Re-size the header when the row types change, not only their count (e.g. [column, filter] -> [group, column])
        const allCtrls = this.rowCtrls;
        if (
            allCtrls !== oldCtrls &&
            (oldCtrls.length !== allCtrls.length || oldCtrls.some((ctrl, i) => ctrl.type !== allCtrls[i].type))
        ) {
            this.beans.ctrlsSvc.get('gridHeaderCtrl')?.setHeaderHeight();
            this.beans.eventSvc.dispatchEvent({
                type: 'headerRowsChanged',
            });
        }
    }

    /** By id in each row's map: autosize asks for every column. */
    public getHeaderCtrlForColumn(column: AgColumn | AgColumnGroup): AbstractHeaderCellCtrl | undefined {
        if (column.isColumn) {
            return this.columnsRowCtrl?.getHeaderCellCtrl(column);
        }
        const groupsRowCtrls = this.groupsRowCtrls;
        for (let i = 0, len = groupsRowCtrls.length; i < len; ++i) {
            const ctrl = groupsRowCtrls[i].getHeaderCellCtrl(column);
            if (ctrl) {
                return ctrl;
            }
        }
        return undefined;
    }

    public getFloatingFilterCtrlForColumn(column: AgColumn): HeaderFilterCellCtrl | undefined {
        return this.filtersRowCtrl?.getHeaderCellCtrl(column) as HeaderFilterCellCtrl | undefined;
    }

    public getHtmlElementForColumnHeader(column: AgColumn | AgColumnGroup): HTMLElement | null {
        return this.getHeaderCtrlForColumn(column)?.eGui ?? null;
    }

    public getRowType(rowIndex: number): HeaderRowType | undefined {
        return this.rowCtrls[rowIndex]?.type;
    }

    public focusHeader(rowIndex: number, column: AgColumn | AgColumnGroup, event?: KeyboardEvent): boolean {
        const ctrl = this.rowCtrls[rowIndex];
        if (!ctrl) {
            return false;
        }

        return ctrl.focusHeader(column, event);
    }

    public getGroupRowCount(): number {
        return this.groupsRowCtrls.length;
    }

    public getGroupRowCtrlAtIndex(index: number): HeaderRowCtrl {
        return this.groupsRowCtrls[index];
    }

    public getRowCount(): number {
        return this.rowCtrls.length;
    }

    public setHorizontalScroll(offset: number): void {
        this.comp.setViewportScrollLeft(offset);
    }

    public onScrollCallback(fn: () => void): void {
        _addManagedElementListeners(this, this.eViewport, { scroll: fn });
    }

    public override destroy(): void {
        this.filtersRowCtrl = this.destroyBean(this.filtersRowCtrl);

        this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);

        this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);
        this.rowCtrls = [];

        super.destroy();
    }

    private setupDragAndDrop(colMoves: ColumnMoveService | undefined, dropContainer: HTMLElement): void {
        const bodyDropTarget = colMoves?.createBodyDropTarget(dropContainer);
        if (bodyDropTarget) {
            this.createManagedBean(bodyDropTarget);
        }
    }

    private restoreFocusOnHeader(focusSvc: FocusService, position: HeaderPosition | null): void {
        if (!position) {
            return;
        }

        focusSvc.focusHeaderPosition({ headerPosition: position, scroll: false });
    }
}
