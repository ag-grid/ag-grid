import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
import fontFactory, { Font } from './font';

const fontsFactory: ExcelOOXMLTemplate = {
    getTemplate(fonts: Font[]) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: _.map(fonts, fontFactory.getTemplate)
        };
    }
};

export default fontsFactory;
