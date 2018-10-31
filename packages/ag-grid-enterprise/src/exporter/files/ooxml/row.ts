import {ExcelOOXMLTemplate, ExcelRow, _} from 'ag-grid-community';
import cellFactory from './cell';

const rowFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelRow) {
        const {index, collapsed, hidden, height, outlineLevel, s, cells = []} = config;
        const children = _.map(cells, cellFactory.getTemplate);
        return {
            name: "row",
            properties: {
                rawMap: {
                    r: index,
                    collapsed,
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    s,
                    customFormat: s != null ? '1' : '0'
                }
            },
            children
        };
    }
};

export default rowFactory;