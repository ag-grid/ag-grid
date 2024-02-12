import { ExcelOOXMLTemplate, ExcelRelationship } from '@ag-grid-community/core';
import relationshipFactory from './relationship';

const relationshipsFactory: ExcelOOXMLTemplate = {
    getTemplate(c: ExcelRelationship[]) {
        const children = c.map(relationship => relationshipFactory.getTemplate(relationship));

        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children
        };
    }
};

export default relationshipsFactory;
