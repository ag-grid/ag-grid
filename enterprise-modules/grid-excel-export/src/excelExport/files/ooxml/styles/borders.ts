import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
import borderFactory, { BorderSet } from './border';

const bordersFactory: ExcelOOXMLTemplate = {
    getTemplate(borders: BorderSet[]) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(borderFactory.getTemplate)
        };
    }
};

export default bordersFactory;
