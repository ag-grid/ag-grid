export class SetFilterModelFormatter {
    getModelAsString(model, setFilter) {
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
