// removes the complexity of async component creation from the date panel. while the component does not
// exist, the wrapper keeps the value that was set and returns this value when queried. when the component
// is finally created, it gets the temp value if set.
import { IDateComp, IDateParams } from "../../../rendering/dateComponent";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
import {BeanStub} from "../../../context/beanStub";
import {Context} from "../../../context/context";

/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export class DateCompWrapper {

    private dateComp: IDateComp;
    private tempValue: Date;
    private alive = true;
    private context: Context;

    constructor(context: Context, userComponentFactory: UserComponentFactory, dateComponentParams: IDateParams, eParent: HTMLElement) {
        this.context = context;

        userComponentFactory.newDateComponent(dateComponentParams).then(dateComp => {
            // because async, check the filter still exists after component comes back
            if (!this.alive) {
                context.destroyBean(dateComp);
                return;
            }

            this.dateComp = dateComp;
            eParent.appendChild(dateComp.getGui());

            if (dateComp.afterGuiAttached) {
                dateComp.afterGuiAttached();
            }

            if (this.tempValue) {
                dateComp.setDate(this.tempValue);
            }
        });
    }

    public destroy(): void {
        this.alive = false;
        this.dateComp = this.context.destroyBean(this.dateComp);
    }

    public getDate(): Date {
        return this.dateComp ? this.dateComp.getDate() : this.tempValue;
    }

    public setDate(value: Date): void {
        if (this.dateComp) {
            this.dateComp.setDate(value);
        } else {
            this.tempValue = value;
        }
    }

    public setInputPlaceholder(placeholder: string): void {
        if (this.dateComp && this.dateComp.setInputPlaceholder) {
            this.dateComp.setInputPlaceholder(placeholder);
        }
    }
}
