import cellStyleFactory from './cellStyle.mjs';
const cellStylesFactory = {
    getTemplate(cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyle => cellStyleFactory.getTemplate(cellStyle))
        };
    }
};
export default cellStylesFactory;
