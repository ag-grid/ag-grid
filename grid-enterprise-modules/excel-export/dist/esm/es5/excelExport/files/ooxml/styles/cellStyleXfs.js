import xfFactory from './xf';
var cellStylesXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xfFactory.getTemplate(xf); })
        };
    }
};
export default cellStylesXfsFactory;
