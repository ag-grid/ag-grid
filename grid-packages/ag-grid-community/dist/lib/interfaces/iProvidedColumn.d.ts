import { ColumnGroupShowType } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
export interface IProvidedColumn {
    isVisible(): boolean;
    getInstanceId(): number;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    getId(): string;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
}
