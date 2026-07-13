import { describe, expect, it, vi } from 'vitest';

import type { BeanCollection } from '../context/context';
import { resetRowHeights } from './rowModelSharedApi';

// Regression for AG-11746: resetRowHeights was made a shared row-model API (usable under SSRM), and a guard
// was added so it warns and no-ops when auto row height is active (where recomputing heights makes no sense).
describe('resetRowHeights (shared row-model API)', () => {
    function createBeans(autoHeightActive: boolean | undefined) {
        return {
            rowAutoHeight: autoHeightActive === undefined ? undefined : { active: autoHeightActive },
            log: { warn: vi.fn() },
            rowModel: { resetRowHeights: vi.fn() },
        } as unknown as BeanCollection & {
            log: { warn: ReturnType<typeof vi.fn> };
            rowModel: { resetRowHeights: ReturnType<typeof vi.fn> };
        };
    }

    it('resets heights on the row model when auto height is inactive', () => {
        const beans = createBeans(false);
        resetRowHeights(beans);

        expect(beans.rowModel.resetRowHeights).toHaveBeenCalledTimes(1);
        expect(beans.log.warn).not.toHaveBeenCalled();
    });

    it('resets heights when auto height is not configured at all', () => {
        const beans = createBeans(undefined);
        resetRowHeights(beans);

        expect(beans.rowModel.resetRowHeights).toHaveBeenCalledTimes(1);
        expect(beans.log.warn).not.toHaveBeenCalled();
    });

    it('warns and no-ops when auto row height is active', () => {
        const beans = createBeans(true);
        resetRowHeights(beans);

        expect(beans.log.warn).toHaveBeenCalledWith(3);
        expect(beans.rowModel.resetRowHeights).not.toHaveBeenCalled();
    });
});
