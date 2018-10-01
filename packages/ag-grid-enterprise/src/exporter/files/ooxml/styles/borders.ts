import {ExcelOOXMLTemplate, _} from 'ag-grid-community';
import borderFactory, {Border} from './border';

const bordersFactory: ExcelOOXMLTemplate = {
    getTemplate(borders: Border[]) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: _.map(borders, borderFactory.getTemplate)
        };
    }
};

export default bordersFactory;