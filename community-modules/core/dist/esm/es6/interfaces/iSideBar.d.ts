// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IToolPanel } from "./iToolPanel";
export interface ISideBar {
    refresh(): void;
    setDisplayed(show: boolean): void;
    setSideBarPosition(position?: 'left' | 'right'): void;
    isToolPanelShowing(): boolean;
    openToolPanel(key: string): void;
    getToolPanelInstance(key: string): IToolPanel | undefined;
    close(): void;
    openedItem(): string | null;
    isDisplayed(): boolean;
}
