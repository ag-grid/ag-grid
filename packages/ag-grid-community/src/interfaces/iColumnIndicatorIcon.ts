import type { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { IconName } from '../utils/icon';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ColumnIndicatorIcon {
    /** Whether the icon sits before or after the column name. */
    position: 'before' | 'after';
    iconName: IconName;
    cls: string;
    /** Calls `refresh` whenever the icon may change for `column`, with listeners owned by `bean`. */
    addRefreshListeners(bean: BeanStub, column: AgColumn, refresh: () => void): void;
    /** Updates `eIcon` for `column` and returns whether it shows. */
    refresh(column: AgColumn, eIcon: HTMLElement): boolean;
}
