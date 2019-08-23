import { ExcelOOXMLTemplate, ExcelRelationship, _ } from 'ag-grid-community';
import relationshipFactory from './relationship';

const relationshipsFactory: ExcelOOXMLTemplate = {
    getTemplate(c: ExcelRelationship[]) {
        const children = _.map(c, relationshipFactory.getTemplate);

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
