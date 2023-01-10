var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LicenseManager_1;
import { _, Autowired, Bean, BeanStub, PreConstruct } from '@ag-grid-community/core';
let LicenseManager = LicenseManager_1 = class LicenseManager extends BeanStub {
    constructor() {
        super(...arguments);
        this.watermarkMessage = undefined;
    }
    validateLicense() {
        if (_.missingOrEmpty(LicenseManager_1.licenseKey)) {
            if (!this.isWebsiteUrl()) {
                this.outputMissingLicenseKey();
            }
        }
        else if (LicenseManager_1.licenseKey.length > 32) {
            const { md5, license, version, isTrial } = LicenseManager_1.extractLicenseComponents(LicenseManager_1.licenseKey);
            if (md5 === this.md5.md5(license)) {
                if (_.exists(version) && version) {
                    this.validateLicenseKeyForVersion(version, !!isTrial, license);
                }
                else {
                    this.validateLegacyKey(license);
                }
            }
            else {
                this.outputInvalidLicenseKey();
            }
        }
        else {
            this.outputInvalidLicenseKey();
        }
    }
    static extractExpiry(license) {
        const restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
        return new Date(parseInt(LicenseManager_1.decode(restrictionHashed), 10));
    }
    static extractLicenseComponents(licenseKey) {
        // when users copy the license key from a PDF extra zero width characters are sometimes copied too
        // carriage returns and line feeds are problematic too
        // all of which causes license key validation to fail - strip these out
        let cleanedLicenseKey = licenseKey.replace(/[\u200B-\u200D\uFEFF]/g, '');
        cleanedLicenseKey = cleanedLicenseKey.replace(/\r?\n|\r/g, '');
        const hashStart = cleanedLicenseKey.length - 32;
        const md5 = cleanedLicenseKey.substring(hashStart);
        const license = cleanedLicenseKey.substring(0, hashStart);
        const [version, isTrial] = LicenseManager_1.extractBracketedInformation(cleanedLicenseKey);
        return { md5, license, version, isTrial };
    }
    getLicenseDetails(licenseKey) {
        const { md5, license, version, isTrial } = LicenseManager_1.extractLicenseComponents(licenseKey);
        let valid = (md5 === this.md5.md5(license));
        let expiry = null;
        if (valid) {
            expiry = LicenseManager_1.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
        }
        return {
            licenseKey,
            valid,
            expiry: valid ? LicenseManager_1.formatDate(expiry) : null,
            version: version ? version : 'legacy',
            isTrial
        };
    }
    isDisplayWatermark() {
        return !this.isLocalhost() && !this.isWebsiteUrl() && !_.missingOrEmpty(this.watermarkMessage);
    }
    getWatermarkMessage() {
        return this.watermarkMessage || '';
    }
    getHostname() {
        const eDocument = this.gridOptionsService.getDocument();
        const win = (eDocument.defaultView || window);
        const loc = win.location;
        const { hostname = '' } = loc;
        return hostname;
    }
    isWebsiteUrl() {
        const hostname = this.getHostname();
        return hostname.match(/^((?:\w+\.)?ag-grid\.com)$/) !== null;
    }
    isLocalhost() {
        const hostname = this.getHostname();
        return hostname.match(/^(?:127\.0\.0\.1|localhost)$/) !== null;
    }
    static formatDate(date) {
        const monthNames = [
            'January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October',
            'November', 'December'
        ];
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }
    static getGridReleaseDate() {
        return new Date(parseInt(LicenseManager_1.decode(LicenseManager_1.RELEASE_INFORMATION), 10));
    }
    static decode(input) {
        const keystr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let t = '';
        let n, r, i;
        let s, o, u, a;
        let f = 0;
        const e = input.replace(/[^A-Za-z0-9+/=]/g, '');
        while (f < e.length) {
            s = keystr.indexOf(e.charAt(f++));
            o = keystr.indexOf(e.charAt(f++));
            u = keystr.indexOf(e.charAt(f++));
            a = keystr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r);
            }
            if (a != 64) {
                t = t + String.fromCharCode(i);
            }
        }
        t = LicenseManager_1.utf8_decode(t);
        return t;
    }
    static utf8_decode(input) {
        input = input.replace(/rn/g, 'n');
        let t = '';
        for (let n = 0; n < input.length; n++) {
            const r = input.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
            }
            else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128);
            }
            else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128);
            }
        }
        return t;
    }
    static setLicenseKey(licenseKey) {
        LicenseManager_1.licenseKey = licenseKey;
    }
    static extractBracketedInformation(licenseKey) {
        const matches = licenseKey.split('[')
            .filter(function (v) {
            return v.indexOf(']') > -1;
        })
            .map(function (value) {
            return value.split(']')[0];
        });
        if (!matches || matches.length === 0) {
            return [null, null];
        }
        const isTrial = matches.filter(match => match === 'TRIAL').length === 1;
        const version = matches.filter(match => match.indexOf("v") === 0).map(match => match.replace(/^v/, ""))[0];
        return [version, isTrial];
    }
    validateLicenseKeyForVersion(version, isTrial, license) {
        if (version !== '2') {
            return;
        }
        if (isTrial) {
            this.validateForTrial(license);
        }
        else {
            this.validateLegacyKey(license);
        }
    }
    validateLegacyKey(license) {
        const gridReleaseDate = LicenseManager_1.getGridReleaseDate();
        const expiry = LicenseManager_1.extractExpiry(license);
        let valid = false;
        let current = false;
        if (!isNaN(expiry.getTime())) {
            valid = true;
            current = (gridReleaseDate < expiry);
        }
        if (!valid) {
            this.outputInvalidLicenseKey();
        }
        else if (!current) {
            const formattedExpiryDate = LicenseManager_1.formatDate(expiry);
            const formattedReleaseDate = LicenseManager_1.formatDate(gridReleaseDate);
            this.outputIncompatibleVersion(formattedExpiryDate, formattedReleaseDate);
        }
    }
    validateForTrial(license) {
        const expiry = LicenseManager_1.extractExpiry(license);
        const now = new Date();
        let valid = false;
        let current = false;
        if (!isNaN(expiry.getTime())) {
            valid = true;
            current = (expiry > now);
        }
        if (!valid) {
            this.outputInvalidLicenseKey();
        }
        else if (!current) {
            const formattedExpiryDate = LicenseManager_1.formatDate(expiry);
            this.outputExpiredTrialKey(formattedExpiryDate);
        }
    }
    outputInvalidLicenseKey() {
        console.error('*****************************************************************************************************************');
        console.error('***************************************** AG Grid Enterprise License ********************************************');
        console.error('********************************************* Invalid License ***************************************************');
        console.error('* Your license for AG Grid Enterprise is not valid - please contact info@ag-grid.com to obtain a valid license. *');
        console.error('*****************************************************************************************************************');
        console.error('*****************************************************************************************************************');
        this.watermarkMessage = "Invalid License";
    }
    outputExpiredTrialKey(formattedExpiryDate) {
        console.error('****************************************************************************************************************');
        console.error('***************************************** AG Grid Enterprise License *******************************************');
        console.error('*****************************************   Trial Period Expired.    *******************************************');
        console.error(`* Your license for AG Grid Enterprise expired on ${formattedExpiryDate}.                                                *`);
        console.error('* Please email info@ag-grid.com to purchase a license.                                                         *');
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
        this.watermarkMessage = "Trial Period Expired";
    }
    outputMissingLicenseKey() {
        console.error('****************************************************************************************************************');
        console.error('***************************************** AG Grid Enterprise License *******************************************');
        console.error('****************************************** License Key Not Found ***********************************************');
        console.error('* All AG Grid Enterprise features are unlocked.                                                                *');
        console.error('* This is an evaluation only version, it is not licensed for development projects intended for production.     *');
        console.error('* If you want to hide the watermark, please email info@ag-grid.com for a trial license.                        *');
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
        this.watermarkMessage = "For Trial Use Only";
    }
    outputIncompatibleVersion(formattedExpiryDate, formattedReleaseDate) {
        console.error('****************************************************************************************************************************');
        console.error('****************************************************************************************************************************');
        console.error('*                                             AG Grid Enterprise License                                                   *');
        console.error('*                           License not compatible with installed version of AG Grid Enterprise.                           *');
        console.error('*                                                                                                                          *');
        console.error(`* Your AG Grid License entitles you to all versions of AG Grid that we release within the time covered by your license     *`);
        console.error(`* - typically we provide one year licenses which entitles you to all releases / updates of AG Grid within that year.       *`);
        console.error(`* Your license has an end (expiry) date which stops the license key working with versions of AG Grid released after the    *`);
        console.error(`* license end date. The license key that you have expires on ${formattedExpiryDate}, however the version of AG Grid you    *`);
        console.error(`* are trying to use was released on ${formattedReleaseDate}.                                                               *`);
        console.error('*                                                                                                                          *');
        console.error('* Please contact info@ag-grid.com to renew your subscription to new versions and get a new license key to work with this   *');
        console.error('* version of AG Grid.                                                                                                      *');
        console.error('****************************************************************************************************************************');
        console.error('****************************************************************************************************************************');
        this.watermarkMessage = "License Expired";
    }
};
LicenseManager.RELEASE_INFORMATION = 'MTY3MzM3ODMwNzAyMA==';
__decorate([
    Autowired('md5')
], LicenseManager.prototype, "md5", void 0);
__decorate([
    PreConstruct
], LicenseManager.prototype, "validateLicense", null);
LicenseManager = LicenseManager_1 = __decorate([
    Bean('licenseManager')
], LicenseManager);
export { LicenseManager };
