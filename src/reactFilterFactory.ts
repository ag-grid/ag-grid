import {AgReactComponent} from "./agReactComponent";
import {IFilterComp, IFilter, IFilterParams} from "ag-grid";

// wraps the provided React filter component
export function reactFilterFactory(reactComponent: any, parentComponent?: any): {new(): IFilterComp} {

    class ReactFilter extends AgReactComponent implements IFilter {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public init(params: IFilterParams) {
            super.init(params);
        }

        public isFilterActive(): boolean {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isFilterActive) {
                return componentRef.isFilterActive();
            } else {
                console.error(`ag-Grid: React filter is missing the mandatory method isFilterActive()`);
                return false;
            }
        }

        public doesFilterPass(params: any): boolean {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.doesFilterPass) {
                return componentRef.doesFilterPass(params);
            } else {
                console.error(`ag-Grid: React filter is missing the mandatory method doesFilterPass()`);
                return false;
            }
        }

        public getModel(): any {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.getModel) {
                return componentRef.getModel();
            } else {
                console.error(`ag-Grid: React filter is missing the mandatory method getModel()`);
                return null;
            }
        }

        /** Restores the filter state. */
        public setModel(model: any): void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.setModel) {
                componentRef.setModel(model);
            } else {
                console.error(`ag-Grid: React filter is missing the mandatory method setModel()`);
            }
        }

        public afterGuiAttached(params: {hidePopup?: ()=>void}): void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.afterGuiAttached) {
                componentRef.afterGuiAttached(params);
            }
        }

        public onNewRowsLoaded(): void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.onNewRowsLoaded) {
                componentRef.onNewRowsLoaded();
            }
        }

    }

    return ReactFilter;
}