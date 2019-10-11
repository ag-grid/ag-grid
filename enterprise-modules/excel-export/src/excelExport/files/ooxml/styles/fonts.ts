import { ExcelOOXMLTemplate } from 'ag-grid-community';
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
            children: fonts.map(fontFactory.getTemplate)
        };
    }
};

export default fontsFactory;
