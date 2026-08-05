import type { ColDef, ColGroupDef } from '../entities/colDef';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotColDefService {
    createColDefsFromFields: (fields: string[]) => (ColDef | ColGroupDef)[];
    /** Order supplied pivot result colDefs by the pivot columns' `pivotSort`, returning a reordered copy - or
     *  `colDefs` itself when nothing moves. Does not mutate the supplied array or defs. */
    orderPivotResultColDefs(colDefs: (ColDef | ColGroupDef)[]): (ColDef | ColGroupDef)[];
    recreateColDef(colDef: ColDef): ColDef;
}
