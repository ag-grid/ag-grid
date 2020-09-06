var monthlyCalendarOptions = {
    startOfPeriod: function (date, offset) {
        return new Date(date.getFullYear(), date.getMonth() + offset, 1);
    },
    roundToValue: function (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },
    valueInPeriod: function (first, offset) {
        return new Date(first.getFullYear(), first.getMonth(), first.getDate() + offset);
    },
    periodLength: function (first) {
        var lastDayOfMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0);
        return lastDayOfMonth.getDate();
    },
    entryLabel: function (value) {
        return new Intl.DateTimeFormat('default', { day: 'numeric' }).format(value);
    },
    columnCount: function () {
        return 7;
    },
    columnForValue: function (value) {
        return (value.getDay() + 6) % 7;
    },
    columnTitle: function (value) {
        return new Intl.DateTimeFormat('default', { weekday: 'narrow' }).format(value);
    },
};
var DateTimeListModel = /** @class */ (function () {
    function DateTimeListModel(options) {
        if (options === void 0) { options = monthlyCalendarOptions; }
        this.options = options;
    }
    DateTimeListModel.prototype.getPage = function (date, offset) {
        var options = this.options;
        var entries = [];
        var firstValue = options.startOfPeriod(date, offset);
        var columnCount = options.columnCount(firstValue);
        // TODO call columnForValue for every value and stack them into arbitrary columns
        var paddingAtStart = modulo(options.columnForValue(firstValue), columnCount); // adds padding at start
        var periodLength = options.periodLength(firstValue);
        var lastValue = options.valueInPeriod(firstValue, periodLength - 1);
        var itemsInLastColumn = modulo(options.columnForValue(lastValue), columnCount) + 1;
        var paddingAtEnd = columnCount - itemsInLastColumn;
        var lastOffset = periodLength - 1 + paddingAtEnd;
        for (var i = -paddingAtStart; i <= lastOffset; i++) {
            var value = options.valueInPeriod(firstValue, i);
            entries.push({
                value: value,
                label: options.entryLabel(value),
                isPadding: i < 0 || i >= periodLength,
            });
        }
        var columns = Array(options.columnCount(firstValue))
            .fill(null)
            .map(function (_, i) { return ({
            label: options.columnTitle(entries[i].value),
        }); });
        var titleFormat = new Intl.DateTimeFormat('default', { month: 'long', year: 'numeric' });
        return {
            entries: splitArray(entries, columns.length),
            columns: columns,
            title: titleFormat.format(firstValue),
        };
    };
    DateTimeListModel.prototype.roundToValue = function (date) {
        return this.options.roundToValue(date);
    };
    return DateTimeListModel;
}());
export { DateTimeListModel };
// modulo function that, unline the JS % operator, is safe for negative numbers
var modulo = function (value, modulo) { return ((value % modulo) + modulo) % modulo; };
var splitArray = function (array, chunkSize) {
    var chunks = [];
    array.forEach(function (value, i) {
        var chunkIndex = Math.floor(i / chunkSize);
        chunks[chunkIndex] = chunks[chunkIndex] || [];
        chunks[chunkIndex].push(value);
    });
    return chunks;
};
