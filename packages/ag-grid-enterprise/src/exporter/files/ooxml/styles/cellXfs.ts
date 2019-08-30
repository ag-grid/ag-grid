import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
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
            children: _.map(xf, xfFactory.getTemplate)
        };
    }
};

export default cellXfsFactory;
