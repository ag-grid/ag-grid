
// Implemented by Column and OriginalColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
export interface OriginalColumnGroupChild {
    isVisible(): boolean;
    getColumnGroupShow(): string;
    getId(): string;
}
