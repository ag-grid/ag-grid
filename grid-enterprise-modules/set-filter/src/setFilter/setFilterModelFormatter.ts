import { SetFilterModel } from "@ag-grid-community/core";
import { SetFilter } from "./setFilter";

export class SetFilterModelFormatter {
    public getModelAsString<V>(model: SetFilterModel | null | undefined, setFilter: SetFilter<V>): string {
        const { values } = model || setFilter.getModel() || {};
        const valueModel = setFilter.getValueModel();

        if (values == null || valueModel == null) {
            return '';
        }

        const availableKeys = values.filter(v => valueModel.isKeyAvailable(v));
        const numValues = availableKeys.length;

        const formattedValues = availableKeys.slice(0, 10).map(key => setFilter.getFormattedValue(key));

        return `(${numValues}) ${formattedValues.join(',')}${numValues > 10 ? ',...' : ''}`;
    }
}