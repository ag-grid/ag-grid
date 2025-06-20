import type { NamedBean } from '../context/bean';
import type { Column } from './iColumn';
import type { IRowNode } from './iRowNode';

export type ChangeDetectionParams = {
    suppressFlash?: boolean;
    force?: boolean;
    onlyChangedColumns?: boolean;
};

export type ChangeDetectionPosition = {
    node: IRowNode;
    column: Column | null;
};

export interface IChangeDetectionService extends NamedBean {
    refreshRows(position: ChangeDetectionPosition, params?: ChangeDetectionParams): void;
}
