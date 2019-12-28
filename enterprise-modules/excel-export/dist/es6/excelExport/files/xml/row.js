import cell from './cell';
var row = {
    getTemplate: function (r) {
        var cells = r.cells;
        return {
            name: "Row",
            children: cells.map(function (it) { return cell.getTemplate(it); })
        };
    }
};
export default row;
