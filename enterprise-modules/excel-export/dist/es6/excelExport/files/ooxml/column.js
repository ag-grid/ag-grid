// https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-column-widths
var getExcelCellWidth = function (width) { return Math.ceil((width - 12) / 7 + 1); };
var columnFactory = {
    getTemplate: function (config) {
        var min = config.min, max = config.max, s = config.s, width = config.width, hidden = config.hidden, bestFit = config.bestFit;
        var excelWidth = 1;
        var customWidth = '0';
        if (width > 1) {
            excelWidth = getExcelCellWidth(width);
            customWidth = '1';
        }
        return {
            name: 'col',
            properties: {
                rawMap: {
                    min: min,
                    max: max,
                    width: excelWidth,
                    style: s,
                    hidden: hidden ? '1' : '0',
                    bestFit: bestFit ? '1' : '0',
                    customWidth: customWidth
                }
            }
        };
    }
};
export default columnFactory;
