// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "./iComponent";
export interface ISideBar extends IComponent<any> {
    refresh(): void;
    setDisplayed(show: boolean): void;
    isToolPanelShowing(): boolean;
    openToolPanel(key: string): void;
    close(): void;
    reset(): void;
    openedItem(): string | null;
}
