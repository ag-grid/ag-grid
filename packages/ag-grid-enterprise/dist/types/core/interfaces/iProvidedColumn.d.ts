import { ColumnInstanceId } from "../entities/column";
import { ColumnGroupShowType } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
export interface IProvidedColumn {
    isVisible(): boolean;
    getInstanceId(): ColumnInstanceId;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    getId(): string;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
}
