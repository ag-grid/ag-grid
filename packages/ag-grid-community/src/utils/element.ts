import type { AgElementParams } from '../agStack/utils/dom';
import { _createAgElement } from '../agStack/utils/dom';
import type { AgComponentSelectorType } from '../widgets/component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type ElementParams = AgElementParams<AgComponentSelectorType>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createElement<T extends HTMLElement = HTMLElement>(
    params: AgElementParams<AgComponentSelectorType>
): T {
    return _createAgElement(params);
}
