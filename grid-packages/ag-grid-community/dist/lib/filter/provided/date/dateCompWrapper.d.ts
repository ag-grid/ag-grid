import { IDateParams } from '../../../rendering/dateComponent';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { Context } from '../../../context/context';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export declare class DateCompWrapper {
    private dateComp;
    private tempValue;
    private disabled;
    private displayed;
    private alive;
    private context;
    private eParent;
    constructor(context: Context, userComponentFactory: UserComponentFactory, dateComponentParams: IDateParams, eParent: HTMLElement);
    destroy(): void;
    getDate(): Date | null;
    setDate(value: Date | null): void;
    setDisabled(disabled: boolean): void;
    setDisplayed(displayed: boolean): void;
    setInputPlaceholder(placeholder: string): void;
    setInputAriaLabel(label: string): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    private setDateCompDisabled;
}
