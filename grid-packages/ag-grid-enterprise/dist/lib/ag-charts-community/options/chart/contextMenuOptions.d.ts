import type { AgChartCallbackParams } from './callbackOptions';
export interface AgContextMenuOptions {
    enabled?: boolean;
    extraActions?: AgContextMenuAction[];
    extraNodeActions?: AgContextMenuAction[];
}
export interface AgContextMenuAction {
    label: string;
    action: (params: AgContextMenuActionParams) => void;
}
export interface AgContextMenuActionParams<TDatum = any> extends AgChartCallbackParams<TDatum> {
    event: MouseEvent;
}
