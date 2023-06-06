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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC93b3Jrc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFDO0FBQzlCLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQztBQUV4QixJQUFNLFNBQVMsR0FBcUI7SUFDaEMsV0FBVyxFQUFYLFVBQVksRUFBa0I7UUFDbEIsSUFBQSxLQUFLLEdBQVcsRUFBRSxNQUFiLEVBQUUsSUFBSSxHQUFLLEVBQUUsS0FBUCxDQUFRO1FBQ25CLElBQUEsT0FBTyxHQUFXLEtBQUssUUFBaEIsRUFBRSxJQUFJLEdBQUssS0FBSyxLQUFWLENBQVc7UUFFaEMsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUNwRCxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBRTlDLE9BQU87WUFDSCxJQUFJLEVBQUUsV0FBVztZQUNqQixRQUFRLEVBQUMsQ0FBQztvQkFDTixJQUFJLEVBQUUsT0FBTztvQkFDYixRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQ3hCLENBQUM7WUFDRixVQUFVLEVBQUM7Z0JBQ1Asa0JBQWtCLEVBQUUsQ0FBQzt3QkFDakIsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsR0FBRyxFQUFFOzRCQUNELElBQUksRUFBRSxJQUFJO3lCQUNiO3FCQUNKLENBQUM7YUFDTDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsU0FBUyxDQUFDIn0=