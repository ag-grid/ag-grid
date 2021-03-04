import numberFormatFactory from './numberFormat';
var numberFormatsFactory = {
    getTemplate: function (numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(numberFormatFactory.getTemplate)
        };
    }
};
export default numberFormatsFactory;
