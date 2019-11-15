import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
import xfFactory, { Xf } from './xf';

const cellXfsFactory: ExcelOOXMLTemplate = {
    getTemplate(xf: Xf[]) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: xf.map(xfFactory.getTemplate)
        };
    }
};

export default cellXfsFactory;
