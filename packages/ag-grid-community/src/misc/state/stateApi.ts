import type { BeanCollection } from '../../context/context';
import type { GridState, GridStateKey } from '../../interfaces/gridState';

export function getState(beans: BeanCollection): GridState {
    return beans.stateSvc?.getState() ?? {};
}

export function setState(beans: BeanCollection, state: GridState, propertiesToIgnore?: GridStateKey[]): void {
    return beans.stateSvc?.setState(state, propertiesToIgnore);
}
