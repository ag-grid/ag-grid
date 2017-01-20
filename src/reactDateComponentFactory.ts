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
            return undefined;
        }

        setDate(date: Date): void {
        }


    }

    return ReactDateComponent;
}
