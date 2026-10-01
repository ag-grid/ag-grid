import { describe, expect, it } from 'vitest';

import { storageKeyPrefix } from './JSONStorage';

describe('storageKeyPrefix', () => {
    it('names the site each builder is served under', () => {
        // The grid and charts builders share www.ag-grid.com, so they share a
        // localStorage - and `param.backgroundColor` means a different thing to
        // each, while the version check wipes every key it does not recognise.
        expect(storageKeyPrefix('/charts/')).not.toBe(storageKeyPrefix('/'));
    });

    it('leaves the root unqualified, where the grid builder is', () => {
        // Qualifying it would orphan the themes its users already have stored.
        expect(storageKeyPrefix('/')).toBe('theme-builder.atom.');
        expect(storageKeyPrefix(undefined)).toBe('theme-builder.atom.');
    });

    it('takes the site with or without its slashes', () => {
        expect(storageKeyPrefix('/charts/')).toBe('theme-builder.charts.atom.');
        expect(storageKeyPrefix('charts')).toBe('theme-builder.charts.atom.');
    });
});
