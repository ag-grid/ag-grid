import column from './column';
import row from './row';
var worksheet = {
    getTemplate: function (ws) {
        var table = ws.table, name = ws.name;
        var columns = table.columns, rows = table.rows;
        var c = columns.map(function (it) { return column.getTemplate(it); });
        var r = rows.map(function (it) { return row.getTemplate(it); });
        return {
            name: "Worksheet",
            children: [{
                    name: "Table",
                    children: c.concat(r)
                }],
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Name: name
                        }
                    }]
            }
        };
    }
};
export default worksheet;
