import type { IAgEventEmitter, IEventEmitter } from 'ag-stack';
import { bench, suite } from 'vitest';

import type {
    AgColumn,
    AgColumnGroup,
    AgProvidedColumnGroup,
    Column,
    ColumnGroup,
    GridApi,
    IRowNode,
    ProvidedColumnGroup,
    RowNode,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowApiModule } from 'ag-grid-community';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const LISTENERS = 256;

suite('entity listeners — add, remove and raise on row nodes, columns and column groups', () => {
    const gridsManager = new BenchGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule, RowApiModule] });

    let api!: GridApi;
    let rowNode!: IRowNode;
    let column!: Column;
    let group!: ColumnGroup;
    let providedGroup!: ProvidedColumnGroup;
    let calls = 0;
    const listeners: (() => void)[] = [];
    for (let i = 0; i < LISTENERS; ++i) {
        listeners.push(() => {
            ++calls;
        });
    }

    const setup = async () => {
        await gridsManager.reset();
        api = await new Promise<GridApi>((resolve) => {
            gridsManager.createGrid('entityListeners', {
                columnDefs: [{ groupId: 'g', children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }] }],
                rowData: [{ a: 0, b: 0 }],
                onGridReady: (event) => resolve(event.api),
            });
        });
        const node = api.getRowNode('0');
        const col = api.getColumn('a');
        const colGroup = api.getColumnGroup('g');
        const provided = api.getProvidedColumnGroup('g');
        if (!node || !col || !colGroup || !provided) {
            throw new Error(
                `missing: ${[!node && 'row node', !col && 'column', !colGroup && 'column group', !provided && 'provided group'].filter(Boolean).join(', ')}`
            );
        }
        rowNode = node;
        column = col;
        group = colGroup;
        providedGroup = provided;
        calls = 0;
    };

    const expectCalls = (expected: number, what: string) => {
        if (calls !== expected) {
            throw new Error(`${what}: ${calls} listener calls, expected ${expected}`);
        }
    };

    /** Adds then removes every listener; setup checks once that an added listener is reached and a removed one is not. */
    const benchAddRemove = (
        name: string,
        add: (listener: () => void) => void,
        remove: (listener: () => void) => void,
        raise: () => void,
        afterSetup?: () => void
    ) => {
        bench(
            name,
            () => {
                for (let i = 0; i < LISTENERS; ++i) {
                    add(listeners[i]);
                }
                for (let i = 0; i < LISTENERS; ++i) {
                    remove(listeners[i]);
                }
            },
            benchDefaults({
                setup: async () => {
                    await setup();
                    afterSetup?.();
                    add(listeners[0]);
                    raise();
                    remove(listeners[0]);
                    raise();
                    await new Promise((resolve) => setTimeout(resolve));
                    expectCalls(1, name);
                    calls = 0;
                },
            })
        );
    };

    /** Raises an event `perCall` listeners receive; each call first checks the previous one reached all of them. */
    const benchRaise = (name: string, addAll: () => void, raise: (iter: number) => void, perCall: number) => {
        let iter = 0;
        bench(
            name,
            () => {
                expectCalls(iter * perCall, name);
                raise(iter++);
            },
            benchDefaults({
                setup: async () => {
                    await setup();
                    iter = 0;
                    addAll();
                },
            })
        );
    };

    /** The grid's path, as `_setupListener` picks it: `__addEventListener` where it exists, else the public pair. */
    const benchInternalAddRemove = (
        name: string,
        getEntity: () => Partial<IAgEventEmitter<string>> & IEventEmitter<string>,
        eventType: string,
        raise: () => void
    ) => {
        let add!: (listener: () => void) => void;
        let remove!: (listener: () => void) => void;
        benchAddRemove(
            name,
            (l) => add(l),
            (l) => remove(l),
            raise,
            () => {
                const entity = getEntity();
                if (entity.__addEventListener && entity.__removeEventListener) {
                    const internal = entity as IAgEventEmitter<string>;
                    add = (l) => internal.__addEventListener(eventType, l);
                    remove = (l) => internal.__removeEventListener(eventType, l);
                } else {
                    add = (l) => entity.addEventListener(eventType, l);
                    remove = (l) => entity.removeEventListener(eventType, l);
                }
            }
        );
    };

    benchInternalAddRemove(
        `row node: internal add and remove ${LISTENERS} listeners`,
        () => rowNode as RowNode,
        'cellChanged',
        () => rowNode.setDataValue('a', calls + 1)
    );
    benchInternalAddRemove(
        `column: internal add and remove ${LISTENERS} listeners`,
        () => column as AgColumn,
        'widthChanged',
        () => api.setColumnWidths([{ key: 'a', newWidth: column.getActualWidth() + 1 }])
    );
    benchInternalAddRemove(
        `column group: internal add and remove ${LISTENERS} listeners`,
        () => group as AgColumnGroup,
        'displayedChildrenChanged',
        () => api.setColumnGroupOpened('g', !providedGroup.isExpanded())
    );
    benchInternalAddRemove(
        `provided column group: internal add and remove ${LISTENERS} listeners`,
        () => providedGroup as AgProvidedColumnGroup,
        'expandedChanged',
        () => api.setColumnGroupOpened('g', !providedGroup.isExpanded())
    );

    benchAddRemove(
        `row node: add and remove ${LISTENERS} listeners`,
        (l) => rowNode.addEventListener('cellChanged', l),
        (l) => rowNode.removeEventListener('cellChanged', l),
        () => rowNode.setDataValue('a', calls + 1)
    );
    benchAddRemove(
        `column: add and remove ${LISTENERS} listeners`,
        (l) => column.addEventListener('widthChanged', l),
        (l) => column.removeEventListener('widthChanged', l),
        () => api.setColumnWidths([{ key: 'a', newWidth: column.getActualWidth() + 1 }])
    );
    for (const isAsync of [false, true]) {
        const mode = isAsync ? 'async' : 'sync';
        benchAddRemove(
            `column group: add and remove ${LISTENERS} ${mode} listeners`,
            (l) => group.addEventListener('displayedChildrenChanged', l, isAsync),
            (l) => group.removeEventListener('displayedChildrenChanged', l, isAsync),
            () => api.setColumnGroupOpened('g', !providedGroup.isExpanded())
        );
        benchAddRemove(
            `provided column group: add and remove ${LISTENERS} ${mode} listeners`,
            (l) => providedGroup.addEventListener('expandedChanged', l, isAsync),
            (l) => providedGroup.removeEventListener('expandedChanged', l, isAsync),
            () => api.setColumnGroupOpened('g', !providedGroup.isExpanded())
        );
    }

    benchRaise(
        `row node: setDataValue raising cellChanged to ${LISTENERS} listeners`,
        () => {
            for (let i = 0; i < LISTENERS; ++i) {
                rowNode.addEventListener('cellChanged', listeners[i]);
            }
        },
        (iter) => rowNode.setDataValue('a', iter + 1),
        LISTENERS
    );
    benchRaise(
        `column: setColumnWidths raising widthChanged to ${LISTENERS} listeners`,
        () => {
            for (let i = 0; i < LISTENERS; ++i) {
                column.addEventListener('widthChanged', listeners[i]);
            }
        },
        (iter) => api.setColumnWidths([{ key: 'a', newWidth: (iter & 1) === 0 ? 250 : 200 }]),
        LISTENERS
    );
    for (const isAsync of [false, true]) {
        benchRaise(
            `column groups: setColumnGroupOpened raising to ${LISTENERS} ${isAsync ? 'async' : 'sync'} listeners on each`,
            () => {
                for (let i = 0; i < LISTENERS; ++i) {
                    group.addEventListener('displayedChildrenChanged', listeners[i], isAsync);
                    providedGroup.addEventListener('expandedChanged', listeners[i], isAsync);
                }
            },
            (iter) => api.setColumnGroupOpened('g', (iter & 1) === 0),
            2 * LISTENERS
        );
    }
});
