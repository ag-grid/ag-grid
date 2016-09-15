import {AgFrameworkComponent} from "./agFrameworkComponent";

export interface AgRendererComponent extends AgFrameworkComponent {
    agInit(params:any) : void;                  // for clarity
    refresh?(params:any) : void;
}