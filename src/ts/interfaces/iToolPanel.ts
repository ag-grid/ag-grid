
import {IComponent} from "./iComponent";

export interface IToolPanel extends IComponent<any> {
    refresh(): void;
}
