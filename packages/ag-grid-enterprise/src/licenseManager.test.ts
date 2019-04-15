import { LicenseManager } from "./licenseManager";
import { MD5 } from "./license/md5";

let licenseManager :LicenseManager;
let validationHeader = '';
let validationMessage = '';

beforeAll(() => {
    (LicenseManager as any).RELEASE_INFORMATION = "MTU1MzA4OTQ1Njk3Mw==";

    (LicenseManager as any).outputMessage = (header: string, message: string) => {
        validationHeader = header;
        validationMessage = message;
    }
});

beforeEach(() => {
    validationHeader = '';
    validationMessage = '';

    LicenseManager.setLicenseKey('');

    licenseManager = new LicenseManager();
    (licenseManager as any).md5 = new MD5();
});

test('test legacy key', () => {
    // given
    const keyLegacy = 'My_Co_My_App_5Devs_1_Deployment_License_1_January_2001_OTc4MzA3MjAwMDAwf44f232660ddd7dc3c5f1abeed1ab76c';
    LicenseManager.setLicenseKey(keyLegacy);

    // when
    licenseManager.validateLicense();

    // then
    expect(validationHeader).toEqual("********************* License not compatible with installed version of ag-Grid Enterprise. *********************");
    expect(validationMessage).toEqual("Your license for ag-Grid Enterprise expired on 1 January 2001 but the version installed was released on 20 March 2019. Please contact accounts@ag-grid.com to renew your license.");
});

test('test v2 trial key', () => {
    // given
    const keyV2Trial = 'My_Co_My_App_Single_5_Devs_1_Deployment_License_1_January_2001_[v2]_[TRIAL]_OTc4MzA3MjAwMDAwea7526307655032d39a27e0b6eac2f14';
    LicenseManager.setLicenseKey(keyV2Trial);

    // when
    licenseManager.validateLicense();

    // then
    expect(validationHeader).toEqual("********************* License not compatible with installed version of ag-Grid Enterprise. *********************");
    expect(validationMessage).toEqual("Your license for ag-Grid Enterprise expired on 1 January 2001. Please contact accounts@ag-grid.com to renew your license.");
});

test('test v2 prod key', () => {
    // given
    const keyV2Prod = 'My_Co_My_App_Single_5_Devs_1_Deployment_License_1_January_2001_[v2]_OTc4MzA3MjAwMDAw61c6c9cc57c6bdfc16b8e42b24ba9d90';
    LicenseManager.setLicenseKey(keyV2Prod);

    // when
    licenseManager.validateLicense();

    // then
    expect(validationHeader).toEqual("********************* License not compatible with installed version of ag-Grid Enterprise. *********************");
    expect(validationMessage).toEqual("Your license for ag-Grid Enterprise expired on 1 January 2001 but the version installed was released on 20 March 2019. Please contact accounts@ag-grid.com to renew your license.");
});
