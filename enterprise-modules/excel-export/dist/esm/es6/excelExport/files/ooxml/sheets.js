import sheetFactory from './sheet';
const sheetsFactory = {
    getTemplate(names) {
        return {
            name: "sheets",
            children: names.map((sheet, idx) => sheetFactory.getTemplate(sheet, idx))
        };
    }
};
export default sheetsFactory;
