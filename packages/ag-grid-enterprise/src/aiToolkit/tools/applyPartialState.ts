import type { AiToolResult, BeanCollection, GridState, GridStateKey } from 'ag-grid-community';

/**
 * Applies a single `GridState` slice while leaving every other active state key untouched.
 *
 * `setState` with `source: 'api'` resets any key that is neither present in the passed state nor in
 * `propertiesToIgnore`, so a partial update must ignore all other currently-active keys. Reading
 * them from `getState()` avoids a hand-maintained key list and stays correct across sequential
 * tool calls, since the column/row state keys are re-read into the cache synchronously per apply.
 */
export function applyPartialState(beans: BeanCollection, key: GridStateKey, subState: object): AiToolResult {
    const { stateSvc } = beans;
    if (!stateSvc) {
        return { ok: false, error: 'Grid state is not available' };
    }

    const activeKeys = Object.keys(stateSvc.getState()) as GridStateKey[];
    const propertiesToIgnore = activeKeys.filter((activeKey) => activeKey !== key);

    stateSvc.setState({ [key]: subState } as GridState, propertiesToIgnore);
    return { ok: true };
}
