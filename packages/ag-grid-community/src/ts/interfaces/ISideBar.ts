import { IComponent } from "./iComponent";
import { GridPanel } from "../gridPanel/gridPanel";

export interface ISideBar extends IComponent<any> {
    refresh(): void;
    setVisible(show:boolean): void;
    isToolPanelShowing(): boolean;
    openToolPanel(key:string): void;
    close(): void;
    reset(): void;
    openedItem(): string | null;
}