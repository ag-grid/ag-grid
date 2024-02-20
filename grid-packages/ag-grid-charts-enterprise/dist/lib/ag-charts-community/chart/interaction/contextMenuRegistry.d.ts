export type ContextMenuAction = {
    id?: string;
    label: string;
    action: (params: ContextMenuActionParams) => void;
};
export type ContextMenuActionParams = {
    datum?: any;
    itemId?: string;
    seriesId?: string;
    event: MouseEvent;
};
export declare class ContextMenuRegistry {
    private defaultActions;
    private disabledActions;
    copyDefaultAction(): ContextMenuAction[];
    registerDefaultAction(action: ContextMenuAction): void;
    enableAction(actionId: string): void;
    disableAction(actionId: string): void;
    isDisabled(actionId: string): boolean;
}
