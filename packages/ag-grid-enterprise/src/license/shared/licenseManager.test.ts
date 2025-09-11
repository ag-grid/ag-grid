/* eslint no-console: 0 */
import { LicenseManager } from './licenseManager';

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

        expect(console.warn.mock.calls[0][0]).toContain('warning #291');
    });
});
