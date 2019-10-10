import {ColDef, ColGroupDef} from "../entities/colDef";

export interface IColumnToolPanel {
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
}

