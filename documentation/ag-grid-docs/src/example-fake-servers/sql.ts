// SQL helpers shared by the example fake servers.
//
// An example imports the helpers it needs from '@example-fake-servers/sql'. The example generator copies
// just those functions, and any helper they call, into the example's own file, so the code viewer and
// exported examples show a single self-contained file.
//
// Every export must be a top-level function declaration that depends only on its arguments and other
// helpers in this file. The generator rejects anything else.

// Throws for a column the data doesn't hold, so only known column names reach the query text.
export function checkColumn(knownColumns, colId) {
    if (!knownColumns.has(colId)) {
        throw new Error('Unknown column: ' + colId);
    }
    return colId;
}

// Combines the conditions of a two-condition filter with its operator, mapping each with `mapper`.
export function combineConditionsSql(mapper, key, item, params) {
    if (item.operator) {
        const conditions = item.conditions.map((condition) => mapper(key, condition, params));
        return '(' + conditions.join(item.operator === 'OR' ? ' OR ' : ' AND ') + ')';
    }
    return mapper(key, item, params);
}

export function textFilterSql(key, item, params) {
    switch (item.type) {
        case 'equals':
            params.push(item.filter);
            return key + ' = ?';
        case 'notEqual':
            params.push(item.filter);
            return key + ' != ?';
        case 'contains':
            params.push('%' + item.filter + '%');
            return key + ' LIKE ?';
        case 'notContains':
            params.push('%' + item.filter + '%');
            return key + ' NOT LIKE ?';
        case 'startsWith':
            params.push(item.filter + '%');
            return key + ' LIKE ?';
        case 'endsWith':
            params.push('%' + item.filter);
            return key + ' LIKE ?';
        case 'blank':
            return '(' + key + ' IS NULL OR ' + key + " = '')";
        case 'notBlank':
            return key + ' IS NOT NULL and ' + key + " != ''";
        default:
            console.log('unknown text filter type: ' + item.type);
    }
}

export function numberFilterSql(key, item, params) {
    switch (item.type) {
        case 'equals':
            params.push(item.filter);
            return key + ' = ?';
        case 'notEqual':
            params.push(item.filter);
            return key + ' != ?';
        case 'greaterThan':
            params.push(item.filter);
            return key + ' > ?';
        case 'greaterThanOrEqual':
            params.push(item.filter);
            return key + ' >= ?';
        case 'lessThan':
            params.push(item.filter);
            return key + ' < ?';
        case 'lessThanOrEqual':
            params.push(item.filter);
            return key + ' <= ?';
        case 'inRange':
            params.push(item.filter, item.filterTo);
            return '(' + key + ' >= ? and ' + key + ' <= ?)';
        case 'blank':
            return key + ' IS NULL';
        case 'notBlank':
            return key + ' IS NOT NULL';
        default:
            console.log('unknown number filter type: ' + item.type);
    }
}

export function setFilterSql(key, item, params) {
    // blanks arrive as `null`; bind '' instead, as AlaSQL never matches null in an IN list
    params.push(...item.values.map((value) => value ?? ''));
    return key + ' IN (' + item.values.map(() => '?').join(', ') + ')';
}

export function orderBySql(sortModel, knownColumns) {
    // sorting on a column the data doesn't hold (e.g. the auto group column) has no effect
    const sorts = sortModel
        .filter((s) => knownColumns.has(s.colId))
        .map((s) => checkColumn(knownColumns, s.colId) + (s.sort === 'desc' ? ' DESC' : ' ASC'));
    if (sorts.length === 0) return '';

    return ' ORDER BY ' + sorts.join(', ');
}

export function limitSql(request) {
    if (request.endRow == undefined || request.startRow == undefined) {
        return '';
    }
    // AlaSQL doesn't accept bound parameters here, so only ever write whole numbers
    const startRow = Math.max(0, Math.floor(Number(request.startRow)) || 0);
    const blockSize = Math.max(0, Math.floor(Number(request.endRow)) - startRow || 0);
    return ' LIMIT ' + blockSize + ' OFFSET ' + startRow;
}
