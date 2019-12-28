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
            children: fonts.map(fontFactory.getTemplate)
        };
    }
};
export default fontsFactory;
