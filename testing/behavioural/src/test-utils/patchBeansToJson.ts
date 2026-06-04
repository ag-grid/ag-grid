import type { GridApi } from 'ag-grid-community';
import { ROOT_NODE_ID } from 'ag-grid-community';

// Test-only: AG Grid beans (columns, column groups, row nodes, services) form a densely
// connected, cyclic object graph — every bean reaches the shared bean collection, which reaches
// every service, column and row, and back. When a failing `expect(beanA).toBe(beanB)` /
// `toEqual(...)` makes a test framework serialise them for a diff, that graph is walked
// combinatorially and exhausts memory (OOM / "Invalid string length").
//
// Rather than touch production code, the tests install a compact `toJSON` on the relevant
// prototypes once, reached from the grid's root row node (no internal imports). A unique id per
// object keeps descriptors distinct, so the diff never falls back to walking the graph.

let patched = false;

let nextId = 0;
let ids: WeakMap<object, number> | undefined;
function debugId(obj: object): number {
    ids ??= new WeakMap<object, number>();
    let id = ids.get(obj);
    if (id === undefined) {
        id = nextId++;
        ids.set(obj, id);
    }
    return id;
}

/** Compact, per-instance-unique descriptor. The bean type is detected by class name so one
 *  function can serve every prototype it is installed on. */
function beanToJson(this: any): string {
    try {
        const self = this;
        const id = debugId(self);
        switch (self?.constructor?.name) {
            case 'AgColumn':
                return `Column#${self.getColId?.() ?? self.colId}#${id}`;
            case 'AgColumnGroup':
                return `ColumnGroup#${self.getUniqueId?.()}#${id}`;
            case 'AgProvidedColumnGroup':
                return `ProvidedColumnGroup#${self.getGroupId?.() ?? self.groupId}#${id}`;
            case 'RowNode':
                return `RowNode#${self.id ?? self.key ?? '?'}@${self.rowIndex ?? '?'}#${id}`;
            default:
                return `${self?.beanName ?? self?.constructor?.name ?? 'Bean'}#${id}`;
        }
    } catch {
        return `Bean#${debugId(this)}`;
    }
}

/** The prototype directly below `Object.prototype` for `obj` (its root class prototype). */
function rootPrototypeOf(obj: object): any {
    let proto = Object.getPrototypeOf(obj);
    while (proto && Object.getPrototypeOf(proto) && Object.getPrototypeOf(proto) !== Object.prototype) {
        proto = Object.getPrototypeOf(proto);
    }
    return proto;
}

function installToJson(proto: any): void {
    if (proto && !Object.prototype.hasOwnProperty.call(proto, 'toJSON')) {
        Object.defineProperty(proto, 'toJSON', {
            value: beanToJson,
            configurable: true,
            writable: true,
            enumerable: false,
        });
    }
}

/** Reaches the shared bean collection via whichever bean-returning API is registered. Any bean
 *  exposes it as `bean.beans`, so the row-node API is preferred, falling back to the column API. */
function getBeanCollection(api: GridApi): any {
    if (api.isModuleRegistered('RowApiModule')) {
        return (api.getRowNode(ROOT_NODE_ID) as any)?.beans;
    }
    if (api.isModuleRegistered('ColumnApiModule')) {
        return (api.getAllGridColumns()?.[0] as any)?.beans;
    }
    return undefined;
}

/**
 * Installs a compact `toJSON` on the bean base prototype (covering columns, groups and services
 * via class-name detection) and on the row-node prototype. Both are reached from the shared bean
 * collection, so any one bean-returning API (row or column) is enough. Idempotent.
 */
export function patchBeansToJson(api: GridApi): void {
    if (patched) {
        return;
    }

    // rowModel is always present in the collection and is a bean, so its root prototype is the
    // shared bean base that every column/group/service descends from. Row nodes are not beans,
    // so the root node's prototype is patched separately.
    const rowModel = getBeanCollection(api)?.rowModel;
    const rootNode = rowModel?.rootNode;
    if (!rootNode) {
        return; // No bean collection yet (no row/column API) — retry on the next grid.
    }

    installToJson(rootPrototypeOf(rowModel));
    installToJson(rootPrototypeOf(rootNode));

    patched = true;
}
