"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const column_1 = require("./column");
const row_1 = require("./row");
const worksheet = {
    getTemplate(ws) {
        const { table, name } = ws;
        const { columns, rows } = table;
        const c = columns.map(it => column_1.default.getTemplate(it));
        const r = rows.map(it => row_1.default.getTemplate(it));
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
exports.default = worksheet;
