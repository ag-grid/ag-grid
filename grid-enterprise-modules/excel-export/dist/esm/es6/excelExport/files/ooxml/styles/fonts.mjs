import fontFactory from './font.mjs';
const fontsFactory = {
    getTemplate(fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(font => fontFactory.getTemplate(font))
        };
    }
};
export default fontsFactory;
