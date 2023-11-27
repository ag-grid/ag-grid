import fillFactory from './fill.mjs';
const fillsFactory = {
    getTemplate(fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(fill => fillFactory.getTemplate(fill))
        };
    }
};
export default fillsFactory;
