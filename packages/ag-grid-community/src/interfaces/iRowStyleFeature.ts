import type { AgBaseBean } from '../agStack/interfaces/agBean';
import type { BeanCollection } from '../context/context';

export interface IRowStyleFeature extends AgBaseBean<BeanCollection> {
    applyRowStyles(): void;
}
