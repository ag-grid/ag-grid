import { OriginalColumnGroup } from "./originalColumnGroup";
export interface OriginalColumnGroupChild {
    isVisible(): boolean;
    getColumnGroupShow(): string | undefined;
    getId(): string;
    setOriginalParent(originalParent: OriginalColumnGroup | null): void;
}
