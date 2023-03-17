import fontFactory from './font';
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
