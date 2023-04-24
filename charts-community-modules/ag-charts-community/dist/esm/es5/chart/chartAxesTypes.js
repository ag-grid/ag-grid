var types = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
export var CHART_AXES_TYPES = {
    has: function (axisType) {
        return Object.prototype.hasOwnProperty.call(types, axisType);
    },
    get axesTypes() {
        return Object.keys(types);
    },
};
