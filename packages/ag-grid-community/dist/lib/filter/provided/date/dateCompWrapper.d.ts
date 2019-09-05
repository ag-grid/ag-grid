// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IDateParams } from "../../../rendering/dateComponent";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export declare class DateCompWrapper {
    private dateComp;
    private tempValue;
    private alive;
    constructor(userComponentFactory: UserComponentFactory, dateComponentParams: IDateParams, eParent: HTMLElement);
    destroy(): void;
    getDate(): Date;
    setDate(value: Date): void;
}
