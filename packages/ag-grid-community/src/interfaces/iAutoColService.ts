import type { ColKey, ColumnCollections } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColumnEventType } from '../events';

export interface IAutoColService {
    autoCols: ColumnCollections | null;

    addAutoCols(cols: ColumnCollections): void;

    createAutoCols(
        cols: ColumnCollections,
        updateOrders: (callback: (cols: AgColumn[] | null) => AgColumn[] | null) => void
    ): void;

    updateAutoCols(source: ColumnEventType): void;

    balanceTreeForAutoCols(autoCols: AgColumn[], depth: number): (AgColumn | AgProvidedColumnGroup)[];

    getAutoCol(key: ColKey): AgColumn | null;

    getAutoCols(): AgColumn[] | null;
}
