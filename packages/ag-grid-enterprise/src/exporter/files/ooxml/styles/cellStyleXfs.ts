import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
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
            children: _.map(xf, xfFactory.getTemplate)
        };
    }
};

export default cellStylesXfsFactory;
