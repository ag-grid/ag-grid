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
