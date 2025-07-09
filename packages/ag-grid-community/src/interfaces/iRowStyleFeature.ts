import type { AgSingletonBean } from '../agStack/interfaces/iBean';
import type { BeanCollection, BeanName } from '../context/context';

export interface IRowStyleFeature extends AgSingletonBean<BeanName, BeanCollection> {
    applyRowStyles(): void;
}
