import { ExcelOOXMLTemplate } from '@ag-grid-community/grid-core';
import xfFactory, { Xf } from './xf';

const cellStylesXfsFactory: ExcelOOXMLTemplate = {
    getTemplate(xf: Xf[]) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: xf.map(xfFactory.getTemplate)
        };
    }
};

export default cellStylesXfsFactory;
