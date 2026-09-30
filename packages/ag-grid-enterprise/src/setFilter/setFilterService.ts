import type { ISetFilterService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { SetFilterHandler } from './setFilterHandler';

/** Every Set Filter handler by column, as a column's filter, Multi Filter children and the Advanced Filter each keep values. */
export class SetFilterService extends BeanStub implements NamedBean, ISetFilterService {
    readonly beanName = 'setFilterSvc' as const;

    private readonly handlersByColId = new Map<string, Set<SetFilterHandler<any>>>();

    public addHandler(colId: string, handler: SetFilterHandler<any>): void {
        const handlersByColId = this.handlersByColId;
        let handlers = handlersByColId.get(colId);
        if (!handlers) {
            handlers = new Set();
            handlersByColId.set(colId, handlers);
        }
        handlers.add(handler);
    }

    public removeHandler(colId: string, handler: SetFilterHandler<any>): void {
        const handlers = this.handlersByColId.get(colId);
        if (!handlers) {
            return;
        }
        handlers.delete(handler);
        if (!handlers.size) {
            this.handlersByColId.delete(colId);
        }
    }

    public clearPreservedValues(colId: string | string[] | undefined, onlyUnselected: boolean): void {
        const handlersByColId = this.handlersByColId;
        if (!colId) {
            for (const handlers of handlersByColId.values()) {
                clearHandlers(handlers, onlyUnselected);
            }
        } else if (typeof colId === 'string') {
            clearHandlers(handlersByColId.get(colId), onlyUnselected);
        } else {
            for (let i = 0, len = colId.length; i < len; ++i) {
                clearHandlers(handlersByColId.get(colId[i]), onlyUnselected);
            }
        }
    }

    public override destroy(): void {
        this.handlersByColId.clear();
        super.destroy();
    }
}

const clearHandlers = (handlers: Set<SetFilterHandler<any>> | undefined, onlyUnselected: boolean): void => {
    if (!handlers) {
        return;
    }
    for (const handler of handlers) {
        handler.clearOwnPreservedValues(onlyUnselected);
    }
};
