import type { AgSingletonBean } from '../agStack/interfaces/iBean';
import type { BeanCollection } from '../context/context';

export interface IRowStyleFeature extends AgSingletonBean<BeanCollection> {
    applyRowStyles(): void;
}
