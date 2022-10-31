"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sheetFactory = {
    getTemplate(name, idx) {
        const sheetId = (idx + 1).toString();
        return {
            name: "sheet",
            properties: {
                rawMap: {
                    "name": name,
                    "sheetId": sheetId,
                    "r:id": `rId${sheetId}`
                }
            }
        };
    }
};
exports.default = sheetFactory;
