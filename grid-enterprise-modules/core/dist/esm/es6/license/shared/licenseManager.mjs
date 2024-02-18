import { MD5 } from './md5.mjs';
// move to general utils
function missingOrEmpty(value) {
    return value == null || value.length === 0;
}
const LICENSE_TYPES = {
    '01': 'GRID',
    '02': 'CHARTS',
    '0102': 'BOTH'
};
export class LicenseManager {
    constructor(document) {
        this.watermarkMessage = undefined;
        this.totalMessageLength = 124;
        this.document = document;
        this.md5 = new MD5();
        this.md5.init();
    }
    validateLicense() {
        const licenseDetails = this.getLicenseDetails(LicenseManager.licenseKey);
        const currentLicenseName = `AG Grid ${licenseDetails.currentLicenseType === 'BOTH' ? 'and AG Charts ' : ''}Enterprise`;
        const suppliedLicenseName = licenseDetails.suppliedLicenseType === undefined ? '' : `AG ${licenseDetails.suppliedLicenseType === 'BOTH' ? 'Grid and AG Charts' : licenseDetails.suppliedLicenseType === 'GRID' ? 'Grid' : 'Charts'} Enterprise`;
        if (licenseDetails.missing) {
            if (!this.isWebsiteUrl() || this.isForceWatermark()) {
                this.outputMissingLicenseKey(currentLicenseName);
            }
        }
        else if (licenseDetails.expired) {
            const gridReleaseDate = LicenseManager.getGridReleaseDate();
            const formattedReleaseDate = LicenseManager.formatDate(gridReleaseDate);
            this.outputExpiredKey(licenseDetails.expiry, formattedReleaseDate, currentLicenseName, suppliedLicenseName);
        }
        else if (!licenseDetails.valid) {
            this.outputInvalidLicenseKey(!!licenseDetails.incorrectLicenseType, currentLicenseName, suppliedLicenseName);
        }
        else if (licenseDetails.isTrial && licenseDetails.trialExpired) {
            this.outputExpiredTrialKey(licenseDetails.expiry, currentLicenseName, suppliedLicenseName);
        }
    }
    static extractExpiry(license) {
        const restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
        return new Date(parseInt(LicenseManager.decode(restrictionHashed), 10));
    }
    static extractLicenseComponents(licenseKey) {
        // when users copy the license key from a PDF extra zero width characters are sometimes copied too
        // carriage returns and line feeds are problematic too
        // all of which causes license key validation to fail - strip these out
        let cleanedLicenseKey = licenseKey.replace(/[\u200B-\u200D\uFEFF]/g, '');
        cleanedLicenseKey = cleanedLicenseKey.replace(/\r?\n|\r/g, '');
        // the hash that follows the key is 32 chars long
        if (licenseKey.length <= 32) {
            return { md5: null, license: licenseKey, version: null, isTrial: null };
        }
        const hashStart = cleanedLicenseKey.length - 32;
        const md5 = cleanedLicenseKey.substring(hashStart);
        const license = cleanedLicenseKey.substring(0, hashStart);
        const [version, isTrial, type] = LicenseManager.extractBracketedInformation(cleanedLicenseKey);
        return { md5, license, version, isTrial, type };
    }
    getLicenseDetails(licenseKey) {
        const currentLicenseType = LicenseManager.chartsLicenseManager ? 'BOTH' : 'GRID';
        if (missingOrEmpty(licenseKey)) {
            return {
                licenseKey,
                valid: false,
                missing: true,
                currentLicenseType
            };
        }
        const gridReleaseDate = LicenseManager.getGridReleaseDate();
        const { md5, license, version, isTrial, type } = LicenseManager.extractLicenseComponents(licenseKey);
        let valid = (md5 === this.md5.md5(license)) && licenseKey.indexOf("For_Trialing_ag-Grid_Only") === -1;
        let trialExpired = undefined;
        let expired = undefined;
        let expiry = null;
        let incorrectLicenseType = false;
        let suppliedLicenseType = undefined;
        function handleTrial() {
            const now = new Date();
            trialExpired = (expiry < now);
            expired = undefined;
        }
        if (valid) {
            expiry = LicenseManager.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
            if (valid) {
                expired = (gridReleaseDate > expiry);
                switch (version) {
                    case "legacy":
                    case "2": {
                        if (isTrial) {
                            handleTrial();
                        }
                        break;
                    }
                    case "3": {
                        if (missingOrEmpty(type)) {
                            valid = false;
                        }
                        else {
                            suppliedLicenseType = type;
                            if ((type !== LICENSE_TYPES['01'] && type !== LICENSE_TYPES['0102']) ||
                                (currentLicenseType === 'BOTH' && suppliedLicenseType !== 'BOTH')) {
                                valid = false;
                                incorrectLicenseType = true;
                            }
                            else if (isTrial) {
                                handleTrial();
                            }
                        }
                    }
                }
            }
        }
        if (!valid) {
            return {
                licenseKey,
                valid,
                incorrectLicenseType,
                currentLicenseType,
                suppliedLicenseType
            };
        }
        return {
            licenseKey,
            valid,
            expiry: LicenseManager.formatDate(expiry),
            expired,
            version,
            isTrial,
            trialExpired,
            incorrectLicenseType,
            currentLicenseType,
            suppliedLicenseType
        };
    }
    isDisplayWatermark() {
        return this.isForceWatermark() || (!this.isLocalhost() && !this.isWebsiteUrl() && !missingOrEmpty(this.watermarkMessage));
    }
    getWatermarkMessage() {
        return this.watermarkMessage || '';
    }
    getHostname() {
        const win = (this.document.defaultView || window);
        const loc = win.location;
        const { hostname = '' } = loc;
        return hostname;
    }
    isForceWatermark() {
        const win = (this.document.defaultView || window);
        const loc = win.location;
        const { pathname } = loc;
        return pathname ? pathname.indexOf('forceWatermark') !== -1 : false;
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
        return new Date(parseInt(LicenseManager.decode(LicenseManager.RELEASE_INFORMATION), 10));
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
        t = LicenseManager.utf8_decode(t);
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
    static setChartsLicenseManager(dependantLicenseManager) {
        this.chartsLicenseManager = dependantLicenseManager;
    }
    static setLicenseKey(licenseKey) {
        this.licenseKey = licenseKey;
        if (this.chartsLicenseManager) {
            this.chartsLicenseManager.setLicenseKey(licenseKey, true);
        }
    }
    static extractBracketedInformation(licenseKey) {
        // legacy no trial key
        if (!licenseKey.includes("[")) {
            return ["legacy", false, undefined];
        }
        const matches = licenseKey.match(/\[(.*?)\]/g).map(match => match.replace("[", "").replace("]", ""));
        if (!matches || matches.length === 0) {
            return ["legacy", false, undefined];
        }
        const isTrial = matches.filter(match => match === 'TRIAL').length === 1;
        const rawVersion = matches.filter(match => match.indexOf("v") === 0)[0];
        const version = rawVersion ? rawVersion.replace('v', '') : 'legacy';
        const type = LICENSE_TYPES[matches.filter(match => LICENSE_TYPES[match])[0]];
        return [version, isTrial, type];
    }
    centerPadAndOutput(input) {
        const paddingRequired = this.totalMessageLength - input.length;
        console.error(input.padStart(paddingRequired / 2 + input.length, '*').padEnd(this.totalMessageLength, '*'));
    }
    padAndOutput(input, padding = '*', terminateWithPadding = '') {
        console.error(input.padEnd(this.totalMessageLength - terminateWithPadding.length, padding) + terminateWithPadding);
    }
    outputInvalidLicenseKey(incorrectLicenseType, currentLicenseName, suppliedLicenseName) {
        if (incorrectLicenseType) {
            // TC4, TC5,TC10
            this.centerPadAndOutput('');
            this.centerPadAndOutput(` ${currentLicenseName} License `);
            this.centerPadAndOutput(' Incompatible License Key ');
            this.padAndOutput(`* Your license key is for ${suppliedLicenseName} only and does not cover you for ${currentLicenseName}.`, ' ', '*');
            this.padAndOutput('* Please contact info@ag-grid.com to obtain a combined license key.', ' ', '*');
            this.centerPadAndOutput('');
            this.centerPadAndOutput('');
        }
        else {
            // TC3, TC9
            this.centerPadAndOutput('');
            this.centerPadAndOutput(` ${currentLicenseName} License `);
            this.centerPadAndOutput(' Invalid License Key ');
            this.padAndOutput(`* Your license key is not valid - please contact info@ag-grid.com to obtain a valid license.`, ' ', '*');
            this.centerPadAndOutput('');
            this.centerPadAndOutput('');
        }
        this.watermarkMessage = "Invalid License";
    }
    outputExpiredTrialKey(formattedExpiryDate, currentLicenseName, suppliedLicenseName) {
        // TC14
        this.centerPadAndOutput('');
        this.centerPadAndOutput(` ${currentLicenseName} License `);
        this.centerPadAndOutput(' Trial Period Expired. ');
        this.padAndOutput(`* Your trial only license for ${suppliedLicenseName} expired on ${formattedExpiryDate}.`, ' ', '*');
        this.padAndOutput('* Please email info@ag-grid.com to purchase a license.', ' ', '*');
        this.centerPadAndOutput('');
        this.centerPadAndOutput('');
        this.watermarkMessage = "Trial Period Expired";
    }
    outputMissingLicenseKey(currentLicenseName) {
        // TC6, TC12
        this.centerPadAndOutput('');
        this.centerPadAndOutput(` ${currentLicenseName} License `);
        this.centerPadAndOutput(' License Key Not Found ');
        this.padAndOutput(`* All ${currentLicenseName} features are unlocked for trial.`, ' ', '*');
        this.padAndOutput('* If you want to hide the watermark please email info@ag-grid.com for a trial license key.', ' ', '*');
        this.centerPadAndOutput('');
        this.centerPadAndOutput('');
        this.watermarkMessage = "For Trial Use Only";
    }
    outputExpiredKey(formattedExpiryDate, formattedReleaseDate, currentLicenseName, suppliedLicenseName) {
        // TC2
        this.centerPadAndOutput('');
        this.centerPadAndOutput(` ${currentLicenseName} License `);
        this.centerPadAndOutput(' Incompatible Software Version ');
        this.padAndOutput(`* Your license key works with versions of ${suppliedLicenseName} released before ${formattedExpiryDate}.`, ' ', '*');
        this.padAndOutput(`* The version you are trying to use was released on ${formattedReleaseDate}.`, ' ', '*');
        this.padAndOutput('* Please contact info@ag-grid.com to renew your license key.', ' ', '*');
        this.centerPadAndOutput('');
        this.centerPadAndOutput('');
        this.watermarkMessage = "License Expired";
    }
}
LicenseManager.RELEASE_INFORMATION = 'MTcwODI3NzkwNjI5Nw==';
