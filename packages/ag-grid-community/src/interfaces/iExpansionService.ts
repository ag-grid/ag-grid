import type { RowNode } from '../entities/rowNode';
import type { RowCtrl } from '../rendering/row/rowCtrl';

export interface IExpansionService {
    addExpandedCss(classes: string[], rowNode: RowNode): void;

    getRowExpandedListeners(rowCtrl: RowCtrl): {
        expandedChanged: () => void;
        hasChildrenChanged: () => void;
    };

    expandRows(rowIds: string[]): void;

    expandAll(value: boolean): void;

    onGroupExpandedOrCollapsed(): void;
}
