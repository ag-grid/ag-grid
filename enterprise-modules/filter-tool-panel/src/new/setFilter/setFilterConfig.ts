import type { SetFilterItem } from '../filterState';

export interface SetFilterConfig {
    values: { key: string | null; text: string }[];
    selectAllItem: SetFilterItem;
    disabled?: boolean;
    applyOnChange: boolean;
}
