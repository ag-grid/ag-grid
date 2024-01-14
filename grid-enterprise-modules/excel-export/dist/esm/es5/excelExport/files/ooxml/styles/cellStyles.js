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
            children: cellStyles.map(function (cellStyle) { return cellStyleFactory.getTemplate(cellStyle); })
        };
    }
};
export default cellStylesFactory;
