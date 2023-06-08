import xfFactory from './xf';
const cellXfsFactory = {
    getTemplate(xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(xf => xfFactory.getTemplate(xf))
        };
    }
};
export default cellXfsFactory;
