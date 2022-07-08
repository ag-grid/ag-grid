import fontFactory from './font';
var fontsFactory = {
    getTemplate: function (fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(function (font) { return fontFactory.getTemplate(font); })
        };
    }
};
export default fontsFactory;
