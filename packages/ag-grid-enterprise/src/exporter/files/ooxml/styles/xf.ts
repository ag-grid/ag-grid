import {ExcelOOXMLTemplate} from 'ag-grid-community';

const xfFactory: ExcelOOXMLTemplate = {
    getTemplate(xf: Xf) {
        const {borderId, fillId, fontId, numFmtId, xfId} = xf;
        return {
            name: "xf",
            properties: {
                rawMap: {
                    borderId,
                    fillId,
                    fontId,
                    numFmtId,
                    xfId
                }
            }
        };
    }
};

export default xfFactory;

export interface Xf {
    borderId: number;
    fillId: number;
    fontId: number;
    numFmtId: number;
    xfId?: number;
}