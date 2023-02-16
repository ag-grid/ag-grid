var mergeCellFactory = {
    getTemplate: function (ref) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref
                }
            }
        };
    }
};
export default mergeCellFactory;
