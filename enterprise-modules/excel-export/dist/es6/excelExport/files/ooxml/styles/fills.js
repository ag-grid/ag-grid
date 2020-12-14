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
            children: fills.map(fillFactory.getTemplate)
        };
    }
};
export default fillsFactory;
