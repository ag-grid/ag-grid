import column from './column';
import row from './row';
const worksheet = {
    getTemplate(ws) {
        const { table, name } = ws;
        const { columns, rows } = table;
        const c = columns.map(it => column.getTemplate(it));
        const r = rows.map(it => row.getTemplate(it));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC93b3Jrc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFDO0FBQzlCLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQztBQUV4QixNQUFNLFNBQVMsR0FBcUI7SUFDaEMsV0FBVyxDQUFDLEVBQWtCO1FBQzFCLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQzNCLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRWhDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU5QyxPQUFPO1lBQ0gsSUFBSSxFQUFFLFdBQVc7WUFDakIsUUFBUSxFQUFDLENBQUM7b0JBQ04sSUFBSSxFQUFFLE9BQU87b0JBQ2IsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUN4QixDQUFDO1lBQ0YsVUFBVSxFQUFDO2dCQUNQLGtCQUFrQixFQUFFLENBQUM7d0JBQ2pCLE1BQU0sRUFBRSxLQUFLO3dCQUNiLEdBQUcsRUFBRTs0QkFDRCxJQUFJLEVBQUUsSUFBSTt5QkFDYjtxQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFNBQVMsQ0FBQyJ9