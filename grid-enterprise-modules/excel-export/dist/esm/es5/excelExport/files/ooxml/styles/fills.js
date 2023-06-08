import fillFactory from './fill';
var fillsFactory = {
    getTemplate: function (fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(function (fill) { return fillFactory.getTemplate(fill); })
        };
    }
};
export default fillsFactory;
