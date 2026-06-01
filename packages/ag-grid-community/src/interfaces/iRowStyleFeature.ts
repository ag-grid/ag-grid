import type { AgBaseBean } from 'ag-stack';

import type { BeanCollection } from '../context/context';

export interface IRowStyleFeature extends AgBaseBean<BeanCollection> {
    applyRowStyles(): void;
}
