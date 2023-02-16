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
            children: numberFormats.map(function (numberFormat) { return numberFormatFactory.getTemplate(numberFormat); })
        };
    }
};
export default numberFormatsFactory;
