const borderFactory = {
    getTemplate(cellStyle) {
        const { builtinId, name, xfId } = cellStyle;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId,
                    name,
                    xfId
                }
            }
        };
    }
};
export default borderFactory;
