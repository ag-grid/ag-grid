import { ColDefUtil } from 'ag-grid-community';
var AgGridColumn = /** @class */ (function () {
    function AgGridColumn() {
    }
    AgGridColumn.hasChildColumns = function (slots) {
        return slots && slots.default && slots.default.length > 0;
    };
    AgGridColumn.mapChildColumnDefs = function (slots) {
        return slots.default.map(function (column) {
            return AgGridColumn.toColDef(column);
        });
    };
    AgGridColumn.toColDef = function (column) {
        var colDef = AgGridColumn.createColDefFromGridColumn(column);
        if (column.children && column.children.length > 0) {
            colDef.children = AgGridColumn.getChildColDefs(column.children);
        }
        return colDef;
    };
    AgGridColumn.getChildColDefs = function (columnChildren) {
        return columnChildren.map(function (column) {
            return AgGridColumn.createColDefFromGridColumn(column);
        });
    };
    AgGridColumn.createColDefFromGridColumn = function (column) {
        var colDef = {};
        AgGridColumn.assign(colDef, column.data.attrs);
        delete colDef.children;
        // booleans passed down just as is are here as property=""
        // convert boolean props to a boolean here
        ColDefUtil.BOOLEAN_PROPERTIES.forEach(function (property) {
            var colDefAsAny = colDef;
            if (colDefAsAny[property] === '') {
                colDefAsAny[property] = true;
            }
        });
        return colDef;
    };
    AgGridColumn.assign = function (colDef, from) {
        // effectively Object.assign - here for IE compatibility
        return [from].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, colDef);
    };
    return AgGridColumn;
}());
export { AgGridColumn };
