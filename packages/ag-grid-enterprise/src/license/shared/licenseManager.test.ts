/* eslint no-console: 0 */
import { _doOnce } from 'ag-stack';
import type { Mock } from 'vitest';

import { LicenseManager } from './licenseManager';
import { MD5 } from './md5';

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
        // Two pieces of process-wide state decide what these tests see, so each must start from a clean
        // one: the key itself is a static (a leftover makes the next `setLicenseKey` warn), and warning
        // 291 goes through `_warnOnce`, which prints it for the first test to trigger it and no other.
        // Assigned rather than set through the API, since resetting via `setLicenseKey` warns in its own right.
        // Clearing the whole set is local despite being process-wide state: isolation is on for unit projects,
        // so each test file owns its own module registry and no other suite's entries are in here.
        (LicenseManager as unknown as { licenseKey?: string }).licenseKey = undefined;
        _doOnce._set.clear();
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

    test('a key with an unclosed bracket is invalid rather than throwing', () => {
        const manager = new LicenseManager(createMockDocument('example.com'));

        expect(manager.getLicenseDetails(`[v3_${'x'.repeat(40)}`).valid).toBe(false);
    });

    describe('key version', () => {
        function createKey(licence: string): string {
            const md5 = new MD5();
            md5.init();
            const expiry = btoa(String(Date.UTC(2100, 0, 1)));
            return `${licence}_${expiry}${md5.md5(`${licence}_${expiry}`)}`;
        }

        test.each([
            ['legacy', 'Example_Ltd_Example_App_1Devs1_SaaS_1_January_2100'],
            ['v2', 'CompanyName=Example Ltd,LicensedApplication=Example App,ExpiryDate=1_January_2100_[v2]'],
            ['v2 trial', 'For_Trialing_AG_Grid_Only-Valid_Until-1_January_2100_[TRIAL]_[v2]'],
            ['v3 grid', 'Example_Ltd_is_granted_a_{Single_Application}_[v3]_[01]'],
            ['v3 grid and charts', 'Example_Ltd_is_granted_a_{Single_Application}_[v3]_[0102]'],
            ['v3 trial', '[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_[v3]_[0102]'],
        ])('accepts a %s key', (_name, licence) => {
            const manager = new LicenseManager(createMockDocument('example.com'));

            expect(manager.getLicenseDetails(createKey(licence)).valid).toBe(true);
        });

        test.each([
            ['v0102', 'AgGridLicense_[NORMAL]_[v0102]'],
            ['v4', 'Example_Ltd_is_granted_a_{Single_Application}_[v4]_[01]'],
        ])('rejects a %s key', (_name, licence) => {
            const manager = new LicenseManager(createMockDocument('example.com'));

            expect(manager.getLicenseDetails(createKey(licence)).valid).toBe(false);
        });
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
