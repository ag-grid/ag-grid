import { IComponent } from "./iComponent";

export interface ISideBar extends IComponent<any> {
    refresh(): void;
    setVisible(show:boolean): void;
    isToolPanelShowing(): boolean;
    openToolPanel(key:string): void;
    close(): void;
    reset(): void;
    openedItem(): string | null;
}