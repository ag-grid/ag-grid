// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
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
