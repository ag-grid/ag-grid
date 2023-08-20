var borderFactory = {
    getTemplate: function (cellStyle) {
        var builtinId = cellStyle.builtinId, name = cellStyle.name, xfId = cellStyle.xfId;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId: builtinId,
                    name: name,
                    xfId: xfId
                }
            }
        };
    }
};
export default borderFactory;
