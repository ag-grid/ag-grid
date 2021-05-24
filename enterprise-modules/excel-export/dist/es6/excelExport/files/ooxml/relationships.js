import relationshipFactory from './relationship';
var relationshipsFactory = {
    getTemplate: function (c) {
        var children = c.map(relationshipFactory.getTemplate);
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children: children
        };
    }
};
export default relationshipsFactory;
