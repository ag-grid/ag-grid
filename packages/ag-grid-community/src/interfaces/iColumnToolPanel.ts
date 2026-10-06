import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnToolPanelState } from './gridState';
import type { IToolPanel } from './iToolPanel';

export interface IColumnToolPanel extends IToolPanel {
    /** Expands the column groups with the supplied `groupIds`, or all column groups if not supplied. */
    expandColumnGroups(groupIds?: string[]): void;
    /** Collapses the column groups with the supplied `groupIds`, or all column groups if not supplied. */
    collapseColumnGroups(groupIds?: string[]): void;
    /** Sets a custom layout of columns and column groups for the Columns section. Every referenced column must already exist in the grid. */
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
    /** Shows or hides the Pivot Mode section. */
    setPivotModeSectionVisible(visible: boolean): void;
    /** Shows or hides the Row Groups section. */
    setRowGroupsSectionVisible(visible: boolean): void;
    /** Shows or hides the Values section. */
    setValuesSectionVisible(visible: boolean): void;
    /** Shows or hides the Column Labels (pivot) section. */
    setPivotSectionVisible(visible: boolean): void;
    getState(): ColumnToolPanelState;
}
