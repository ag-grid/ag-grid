import cell from './cell';
const row = {
    getTemplate(r) {
        const { cells } = r;
        return {
            name: "Row",
            children: cells.map(it => cell.getTemplate(it))
        };
    }
};
export default row;
