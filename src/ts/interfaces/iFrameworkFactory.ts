import {ColDef} from "../entities/colDef";
import {IFilterComp} from "./iFilter";

export interface IFrameworkFactory {

    /** Because Angular 2 uses Zones, you should not use setTimout(). So to get around this, we allow the framework
     * to specify how to execute setTimeout. The default is to just call the browser setTimeout(). */
    setTimeout(action: any, timeout?: any): void;
}