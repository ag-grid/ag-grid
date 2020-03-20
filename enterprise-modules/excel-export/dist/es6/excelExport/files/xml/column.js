var column = {
    getTemplate: function (c) {
        var width = c.width;
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: width
                        }
                    }]
            }
        };
    }
};
export default column;
