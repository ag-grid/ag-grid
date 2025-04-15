import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditTrigger } from './baseEditTrigger';

export class CustomEditTrigger extends BaseEditTrigger {
    beanName = 'customEditTrigger' as const;
}
