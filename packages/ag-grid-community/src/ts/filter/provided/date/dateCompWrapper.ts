// removes the complexity of async component creation from the date panel. while the component does not
// exist, the wrapper keeps the value that was set and returns this value when queried. when the component
// is finally created, it gets the temp value if set.
import { IDateComp, IDateParams } from "../../../rendering/dateComponent";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";

/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export class DateCompWrapper {

    private dateComp: IDateComp;

    private tempValue: Date;

    private alive = true;

    constructor(userComponentFactory: UserComponentFactory, dateComponentParams: IDateParams, eParent: HTMLElement) {

        userComponentFactory.newDateComponent(dateComponentParams).then (dateComp => {

            // because async, check the filter still exists after component comes back
            if (!this.alive) {
                if (dateComp.destroy) {
                    dateComp.destroy();
                }
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
        if (this.dateComp && this.dateComp.destroy) {
            this.dateComp.destroy();
        }
    }

    public getDate(): Date {
        if (this.dateComp) {
            return this.dateComp.getDate();
        } else {
            return this.tempValue;
        }
    }

    public setDate(value: Date): void {
        if (this.dateComp) {
            this.dateComp.setDate(value);
        } else {
            this.tempValue = value;
        }
    }

}
