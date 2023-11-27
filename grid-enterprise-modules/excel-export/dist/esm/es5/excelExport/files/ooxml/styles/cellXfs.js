import xfFactory from './xf';
var cellXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xfFactory.getTemplate(xf); })
        };
    }
};
export default cellXfsFactory;
