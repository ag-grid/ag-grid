const mergeCellFactory = {
    getTemplate(ref) {
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
