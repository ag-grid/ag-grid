import type { ColDef, ColGroupDef } from '../entities/colDef';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotColDefService {
    createColDefsFromFields: (fields: string[]) => (ColDef | ColGroupDef)[];
    /** Order supplied pivot result colDefs (in place) by the pivot columns' `pivotSort`. */
    sortPivotResultColDefs(colDefs: (ColDef | ColGroupDef)[]): void;
    recreateColDef(colDef: ColDef): ColDef;
}
