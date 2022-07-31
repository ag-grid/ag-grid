import borderFactory from './border';
const bordersFactory = {
    getTemplate(borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(border => borderFactory.getTemplate(border))
        };
    }
};
export default bordersFactory;
