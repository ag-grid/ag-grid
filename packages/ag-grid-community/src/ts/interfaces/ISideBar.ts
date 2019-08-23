import { IComponent } from "./iComponent";

export interface ISideBar extends IComponent<any> {
    refresh(): void;
    setDisplayed(show:boolean): void;
    isToolPanelShowing(): boolean;
    openToolPanel(key:string): void;
    close(): void;
    reset(): void;
    openedItem(): string | null;
}