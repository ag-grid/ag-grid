import borderFactory from './border';
var bordersFactory = {
    getTemplate: function (borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(borderFactory.getTemplate)
        };
    }
};
export default bordersFactory;
