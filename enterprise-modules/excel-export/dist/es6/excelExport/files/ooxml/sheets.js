import sheetFactory from './sheet';
var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: names.map(sheetFactory.getTemplate)
        };
    }
};
export default sheetsFactory;
