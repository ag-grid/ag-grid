import xfFactory from './xf';
const cellStylesXfsFactory = {
    getTemplate(xfs) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(xf => xfFactory.getTemplate(xf))
        };
    }
};
export default cellStylesXfsFactory;
