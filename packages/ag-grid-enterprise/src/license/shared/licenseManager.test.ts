/* eslint no-console: 0 */
import type { Mock } from 'vitest';

import { LicenseManager } from './licenseManager';

function createMockDocument(hostname: string, pathname = '/'): Document {
    return {
        defaultView: {
            location: { hostname, pathname },
        },
    } as unknown as Document;
}

describe('LicenseManager', () => {
    const warnLog = console.warn;
    const errorLog = console.error;
    beforeEach(() => {
        console.warn = vi.fn();
        // Filter out license banner messages (single string of '*' padding, length 124)
        // while still forwarding any unexpected console.error calls.
        console.error = (...args: unknown[]) => {
            if (
                args.length === 1 &&
                typeof args[0] === 'string' &&
                args[0].startsWith('*') &&
                args[0].endsWith('*') &&
                args[0].length === 124
            ) {
                return;
            }
            errorLog.apply(console, args);
        };
    });
    afterAll(() => {
        console.warn = warnLog;
        console.error = errorLog;
    });

    test('empty key no message', () => {
        LicenseManager.setLicenseKey(null as any);

        expect(console.warn).not.toHaveBeenCalled();
    });

    test('key set once no message', () => {
        LicenseManager.setLicenseKey('test key');

        expect(console.warn).not.toHaveBeenCalled();
    });

    test('key set twice with different values warning message', () => {
        LicenseManager.setLicenseKey('test key 1');
        LicenseManager.setLicenseKey('test key 2');

        expect((console.warn as Mock).mock.calls[0][0]).toContain('AG Grid: warning #291');
    });

    describe('isWebsiteUrl (via isDisplayWatermark)', () => {
        function createManagerWithWatermark(hostname: string): LicenseManager {
            const manager = new LicenseManager(createMockDocument(hostname));
            // Trigger validateLicense to set a watermark message (no license key set)
            manager.validateLicense();
            return manager;
        }

        test.each(['ag-grid.com', 'www.ag-grid.com', 'sub.ag-grid.com'])('suppresses watermark on %s', (hostname) => {
            const manager = createManagerWithWatermark(hostname);
            expect(manager.isDisplayWatermark()).toBe(false);
        });

        test.each(['bryntum.com', 'www.bryntum.com', 'sub.bryntum.com'])('suppresses watermark on %s', (hostname) => {
            const manager = createManagerWithWatermark(hostname);
            expect(manager.isDisplayWatermark()).toBe(false);
        });

        test.each(['example.com', 'not-ag-grid.com', 'ag-grid.com.evil.com', 'fake-bryntum.com'])(
            'does not suppress watermark on %s',
            (hostname) => {
                const manager = createManagerWithWatermark(hostname);
                expect(manager.isDisplayWatermark()).toBe(true);
            }
        );
    });
});
