import type { BeanCollection } from '../context/context';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import { DefaultColumnTypes } from '../entities/defaultColumnTypes';
import { _isColumnsSortingCoupledToGroup } from '../gridOptionsUtils';
import { _mergeDeep } from '../utils/mergeDeep';
import { convertColumnTypes } from './columnUtils';

/** Constructs + registers a primary ('user'-kind) column from a user colDef: merges defaults/types,
 *  stamps the build token, registers the bean. Sole birthplace for build/calc columns.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createUserColumn(
    beans: BeanCollection,
    userColDef: ColDef,
    colId: string,
    isPrimary: boolean,
    buildToken: number
): AgColumn {
    const merged = _addColumnDefaultAndTypes(beans, userColDef, colId);
    const column = new AgColumn(merged, userColDef, colId, isPrimary, 'user');
    column.buildToken = buildToken;
    beans.context.createBean(column);
    return column;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addColumnDefaultAndTypes(
    beans: BeanCollection,
    colDef: ColDef,
    colId: string,
    isAutoCol?: boolean
): ColDef {
    const { gos, dataTypeSvc } = beans;
    const res: ColDef = {} as ColDef;

    const defaultColDef = gos.get('defaultColDef');
    _mergeDeep(res, defaultColDef, false, true);

    const dataTypeDefinitionColumnType = dataTypeSvc?.updateColDefAndGetColumnType(res, colDef, colId);
    const columnTypes = colDef.type ?? dataTypeDefinitionColumnType ?? res.type;
    res.type = columnTypes;
    if (columnTypes) {
        assignColumnTypes(beans, convertColumnTypes(columnTypes), res);
    }

    const cellDataType = res.cellDataType;

    _mergeDeep(res, colDef, false, true);

    if (cellDataType !== undefined) {
        // `cellDataType: true` in provided def would overwrite inferred result type otherwise
        res.cellDataType = cellDataType;
    }

    const autoGroupColDef = gos.get('autoGroupColumnDef');
    if (autoGroupColDef && colDef.rowGroup && _isColumnsSortingCoupledToGroup(gos)) {
        _mergeDeep(
            res,
            { sort: autoGroupColDef.sort, initialSort: autoGroupColDef.initialSort } satisfies Partial<ColDef>,
            false,
            true
        );
    }

    dataTypeSvc?.postProcess(res);
    dataTypeSvc?.validateColDef(res, colDef, defaultColDef, colId);
    gos.validateColDef(res, colId, isAutoCol);

    return res;
}

function assignColumnTypes(beans: BeanCollection, typeKeys: string[], colDefMerged: ColDef): void {
    const typeKeysLen = typeKeys.length;
    if (typeKeysLen === 0) {
        return;
    }
    const userTypes = beans.gos.get('columnTypes');
    // Fast path: no user types — read `DefaultColumnTypes` directly, skipping the merged-map copy and validation walk.
    if (userTypes == null) {
        mergeTypeKeys(beans, colDefMerged, typeKeys, typeKeysLen, DefaultColumnTypes);
        return;
    }
    const allColumnTypes = { ...DefaultColumnTypes };
    const userKeys = Object.keys(userTypes);
    for (let i = 0, len = userKeys.length; i < len; ++i) {
        const key = userKeys[i];
        const value = userTypes[key];
        if (key in allColumnTypes) {
            beans.log.warn(34, { key }); // default column types cannot be overridden
        } else {
            if ((value as any).type) {
                beans.log.warn(35); // type should not be defined in column types
            }
            allColumnTypes[key] = value;
        }
    }
    mergeTypeKeys(beans, colDefMerged, typeKeys, typeKeysLen, allColumnTypes);
}

function mergeTypeKeys(
    beans: BeanCollection,
    colDefMerged: ColDef,
    typeKeys: string[],
    typeKeysLen: number,
    typeMap: { [key: string]: ColDef }
): void {
    for (let i = 0; i < typeKeysLen; ++i) {
        const t = typeKeys[i].trim();
        const typeColDef = typeMap[t];
        if (typeColDef) {
            _mergeDeep(colDefMerged, typeColDef, false, true);
        } else {
            beans.log.warn(36, { t });
        }
    }
}
