import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { RowNode } from '../entities/rowNode';

/** Shows records as columns and fields as rows, over the untouched client-side row model.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ITransposeService {
    /** Generated columns while transposed (field-name column + one per record); `null` otherwise. */
    readonly cols: AgColumn[] | null;
    readonly tree: (AgColumn | AgProvidedColumnGroup)[];
    readonly treeDepth: number;
    readonly groupsById: Map<string, AgProvidedColumnGroup>;
    readonly allGroups: AgProvidedColumnGroup[];

    isActive(): boolean;

    /** Regenerates the record columns from `records` and returns the field rows to display instead. */
    transposeRows(records: RowNode[]): RowNode[];
}
