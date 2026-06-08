import { _pushToMapArray } from 'ag-stack';

import type { AgColumn, AgProvidedColumnGroup, ColumnTreeBuild, ColumnTreeEdit } from 'ag-grid-community';

type ColNode = { col: AgColumn; prev: ColNode; next: ColNode };

/** Concrete edit session: circular leaf list for O(1) splices + deferred {@link ColumnTreeEdit.commit}.
 *  Community sees only the opaque {@link ColumnTreeEdit}. */
interface ColumnTreeEditState extends ColumnTreeEdit {
    /** Self-linked sentinel: `.next` = first leaf, `.prev` = last; splices skip head/tail null-checks. */
    readonly node: ColNode;
    readonly byId: Map<string, ColNode>;
    /** Parents a splice touched (`null` = the forest); bounds the {@link commitEdit} rebuild. */
    readonly affectedParents: Set<AgProvidedColumnGroup | null>;
}

/** Materialise spliced `columns` from the list; at depth > 0 also rebuild touched parents' `.children`.
 *  The in-order walk yields each parent's children already ordered, so no sort; others keep theirs. */
const commitEdit = (build: ColumnTreeBuild): void => {
    // Enterprise is the sole writer of `build.edit`, so widening back to the concrete state is sound.
    const edit = build.edit as ColumnTreeEditState;
    const sentinel = edit.node;
    const columns: AgColumn[] = [];
    if (build.treeDepth === 0) {
        for (let node = sentinel.next; node !== sentinel; node = node.next) {
            columns.push(node.col);
        }
        build.columns = columns;
        build.columnTree = columns;
        return;
    }

    const childrenByParent = new Map<AgProvidedColumnGroup | null, (AgColumn | AgProvidedColumnGroup)[]>();
    const seenGroups = new Set<AgProvidedColumnGroup>();
    for (let node = sentinel.next; node !== sentinel; node = node.next) {
        const col = node.col;
        columns.push(col);
        let group = col.originalParent;
        while (group !== null && !seenGroups.has(group)) {
            seenGroups.add(group);
            _pushToMapArray(childrenByParent, group.originalParent, group);
            group = group.originalParent;
        }
        _pushToMapArray(childrenByParent, col.originalParent, col);
    }

    let tree = build.columnTree;
    for (const parent of edit.affectedParents) {
        const children = childrenByParent.get(parent) ?? [];
        if (parent !== null) {
            parent.children = children;
        } else {
            tree = children;
        }
    }
    build.columns = columns;
    build.columnTree = tree;
};

/** Open the edit session, seeding the circular list + colId index from the build's current leaves. */
const openEdit = (build: ColumnTreeBuild): ColumnTreeEditState => {
    const sentinel: ColNode = { col: null!, prev: null!, next: null! };
    const nodeById = new Map<string, ColNode>();
    const columns = build.columns;
    let prev: ColNode = sentinel;
    for (let i = 0, len = columns.length; i < len; ++i) {
        const node: ColNode = { col: columns[i], prev, next: sentinel };
        prev.next = node;
        nodeById.set(columns[i].colId, node);
        prev = node;
    }
    prev.next = sentinel;
    sentinel.prev = prev;
    const edit: ColumnTreeEditState = {
        node: sentinel,
        byId: nodeById,
        affectedParents: new Set(),
        commit: commitEdit,
    };
    build.edit = edit;
    return edit;
};

/** Append `col` after `afterColId` (inheriting its group) if present, else at top-level end. O(1), lazily
 *  opens the session. NB: several cols sharing ONE anchor must be appended in reverse of desired order. */
export const appendColumnToTree = (build: ColumnTreeBuild, col: AgColumn, afterColId?: string): void => {
    const edit = (build.edit as ColumnTreeEditState | null) ?? openEdit(build);
    const sentinel = edit.node;
    const nodeById = edit.byId;
    const anchor = afterColId != null ? nodeById.get(afterColId) : undefined;
    const prev = anchor ?? sentinel.prev;
    const next = prev.next;
    const node: ColNode = { col, prev, next };
    prev.next = node;
    next.prev = node;
    nodeById.set(col.colId, node);
    const parent = anchor ? anchor.col.originalParent : null;
    col.originalParent = parent;
    if (build.treeDepth > 0) {
        edit.affectedParents.add(parent);
    }
};

/** Prepend service/hierarchy `cols`, each wrapped to current depth so a bare leaf renders at leaf level.
 *  Back-to-front so the list ends in `cols` order; lazily opens the session, no-op when empty. */
export const prependWrappedColumnsToTree = (build: ColumnTreeBuild, cols: AgColumn[]): void => {
    const len = cols.length;
    if (len === 0) {
        return;
    }
    const edit = (build.edit as ColumnTreeEditState | null) ?? openEdit(build);
    const sentinel = edit.node;
    const nodeById = edit.byId;
    const wrapperCache = build.wrapperCache!;
    const depth = build.treeDepth;
    const buildToken = build.buildToken;
    for (let i = len - 1; i >= 0; --i) {
        const col = cols[i];
        col.buildToken = buildToken;
        wrapperCache.wrap(col, depth, buildToken);
        const head = sentinel.next;
        const node: ColNode = { col, prev: sentinel, next: head };
        sentinel.next = node;
        head.prev = node;
        nodeById.set(col.colId, node);
    }
    // Only root gains a front child (the top wrapper); inner padding children are self-set by `wrapOrReuse`.
    if (depth > 0) {
        edit.affectedParents.add(null);
    }
};
