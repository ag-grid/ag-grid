import type { AgElementParams } from '../agStack/utils/dom';
import { _createAgElement } from '../agStack/utils/dom';
import type { AgComponentSelectorType } from '../widgets/component';

export type ElementParams = AgElementParams<AgComponentSelectorType>;

export function _createElement<T extends HTMLElement = HTMLElement>(
    params: AgElementParams<AgComponentSelectorType>
): T {
    return _createAgElement(params);
}
