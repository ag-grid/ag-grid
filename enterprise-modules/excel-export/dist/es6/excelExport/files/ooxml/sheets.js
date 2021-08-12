import sheetFactory from './sheet';
var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: names.map(function (sheet, idx) { return sheetFactory.getTemplate(sheet, idx); })
        };
    }
};
export default sheetsFactory;
