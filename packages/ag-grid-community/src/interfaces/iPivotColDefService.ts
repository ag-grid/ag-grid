import type { ColDef, ColGroupDef } from '../entities/colDef';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotColDefService {
    createColDefsFromFields: (fields: string[]) => (ColDef | ColGroupDef)[];
    recreateColDef(colDef: ColDef): ColDef;
}
