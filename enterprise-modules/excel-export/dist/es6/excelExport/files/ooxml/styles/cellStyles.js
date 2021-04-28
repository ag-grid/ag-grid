import cellStyleFactory from './cellStyle';
var cellStylesFactory = {
    getTemplate: function (cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyleFactory.getTemplate)
        };
    }
};
export default cellStylesFactory;
