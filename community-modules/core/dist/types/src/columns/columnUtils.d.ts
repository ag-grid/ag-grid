import type { Context } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
export declare const GROUP_AUTO_COLUMN_ID: "ag-Grid-AutoColumn";
export declare function getColumnsFromTree(rootColumns: (AgColumn | AgProvidedColumnGroup)[]): AgColumn[];
export declare function getWidthOfColsInList(columnList: AgColumn[]): number;
export declare function destroyColumnTree(context: Context, oldTree: (AgColumn | AgProvidedColumnGroup)[] | null | undefined, newTree?: (AgColumn | AgProvidedColumnGroup)[] | null): void;
export declare function isColumnGroupAutoCol(col: AgColumn): boolean;
export declare function convertColumnTypes(type: string | string[]): string[];
