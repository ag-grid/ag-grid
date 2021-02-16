import xfFactory from './xf';
var cellXfsFactory = {
    getTemplate: function (xf) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: xf.map(xfFactory.getTemplate)
        };
    }
};
export default cellXfsFactory;
