/* eslint no-console: 0 */
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
    beforeEach(() => {
        console.warn = jest.fn();
    });
    afterAll(() => {
        console.warn = warnLog;
    });

    test('empty key no message', () => {
        LicenseManager.setLicenseKey(null);

        expect(console.warn).not.toHaveBeenCalled();
    });

    test('key set once no message', () => {
        LicenseManager.setLicenseKey('test key');

        expect(console.warn).not.toHaveBeenCalled();
    });

    test('key set twice with different values warning message', () => {
        LicenseManager.setLicenseKey('test key 1');
        LicenseManager.setLicenseKey('test key 2');

        expect(console.warn.mock.calls[0][0]).toContain('AG Grid: warning #291');
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
