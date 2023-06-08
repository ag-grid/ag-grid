import fillFactory from './fill';
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
