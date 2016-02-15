import Column from "../entities/column";

export interface IRenderedHeaderElement {
    destroy(): void;
    refreshFilterIcon(): void;
    refreshSortIcon(): void;
    onIndividualColumnResized(column: Column): void;
    getGui(): HTMLElement;
}
