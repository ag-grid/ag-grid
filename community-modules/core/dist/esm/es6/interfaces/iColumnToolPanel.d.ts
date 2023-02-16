// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef, ColGroupDef } from '../entities/colDef';
import { IToolPanel } from './iToolPanel';
export interface IColumnToolPanel extends IToolPanel {
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
    setPivotModeSectionVisible(visible: boolean): void;
    setRowGroupsSectionVisible(visible: boolean): void;
    setValuesSectionVisible(visible: boolean): void;
    setPivotSectionVisible(visible: boolean): void;
}
