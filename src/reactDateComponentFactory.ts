import {AgReactComponent} from "./agReactComponent";
import {IFilter, IDateComponent, IDateComponentParams} from "ag-grid";
var React = require('react');

// wraps the provided React filter component
export function reactDateComponentFactory(reactComponent: any, parentComponent?: any): {new(): IDateComponent} {

    class ReactDateComponent extends AgReactComponent implements IDateComponent {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public init(params: IDateComponentParams) {
            super.init(<any>params);
        }

        getDate(): Date {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.getDate) {
                return componentRef.getDate();
            } else {
                console.log(`ag-Grid: React dateComponent is missing the mandatory method getDate()`);
                return null;
            }
        }

        setDate(date: Date): void {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.setDate) {
                return componentRef.setDate(date);
            } else {
                console.log(`ag-Grid: React dateComponent is missing the mandatory method setDate(date)`);
                return null;
            }

        }


    }

    return ReactDateComponent;
}
