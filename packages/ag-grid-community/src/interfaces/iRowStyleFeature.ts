import type { BeanCollection, BeanName } from '../context/context';
import type { GenericBean } from '../context/genericBean';
import type { IRowComp } from '../rendering/row/rowCtrl';

export interface IRowStyleFeature extends GenericBean<BeanName, BeanCollection> {
    setComp(comp: IRowComp): void;
    applyRowStyles(): void;
}
