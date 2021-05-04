import xfFactory from './xf';
var cellStylesXfsFactory = {
    getTemplate: function (xf) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: xf.map(xfFactory.getTemplate)
        };
    }
};
export default cellStylesXfsFactory;
