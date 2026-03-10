import type { AgColumn } from '../entities/agColumn';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAggColumnNameService {
    getHeaderName(column: AgColumn, headerName: string | null): string | null;
}
