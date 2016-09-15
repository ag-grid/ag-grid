import {AgFrameworkComponent} from "./agFrameworkComponent";

export interface AgRendererComponent extends AgFrameworkComponent {
    agInit(params:any) : void;                  // for clarity
    getFrameworkComponentInstance() : any;      // for clarity
    refresh?(params:any) : void;
}