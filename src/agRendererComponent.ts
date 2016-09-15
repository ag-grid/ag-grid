import {AgInitable} from "./agInitable";

export interface AgRendererComponent extends AgInitable {
    agInit(params:any) : void;          // for clarity
    refresh?(params:any) : void;
}