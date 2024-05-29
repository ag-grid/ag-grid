// Implemented by Column and ProvidedColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
import type { Bean } from '../context/bean';
import type { ColumnInstanceId } from '../entities/column';
import type { ColumnGroupShowType } from '../entities/columnGroup';
import type { ProvidedColumnGroup } from '../entities/providedColumnGroup';

export interface IProvidedColumn extends Bean {
    isVisible(): boolean;
    getInstanceId(): ColumnInstanceId;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    getId(): string;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
}
