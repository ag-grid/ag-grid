import { MD5 } from './md5';
// move to general utils
function missingOrEmpty(value) {
    return value == null || value.length === 0;
}
function exists(value, allowEmptyString = false) {
    return value != null && (value !== '' || allowEmptyString);
}
export class LicenseManager {
    constructor(document) {
        this.watermarkMessage = undefined;
        this.document = document;
        this.md5 = new MD5();
        this.md5.init();
    }
    validateLicense() {
        if (missingOrEmpty(LicenseManager.licenseKey)) {
            if (!this.isWebsiteUrl() || this.isForceWatermark()) {
                this.outputMissingLicenseKey();
            }
        }
        else if (LicenseManager.licenseKey.length > 32) {
            if (LicenseManager.licenseKey.indexOf("For_Trialing_ag-Grid_Only") !== -1) {
                this.outputInvalidLicenseKey();
            }
            else {
                const { md5, license, version, isTrial } = LicenseManager.extractLicenseComponents(LicenseManager.licenseKey);
                if (md5 === this.md5.md5(license)) {
                    if (exists(version) && version) {
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
        }
        else {
            this.outputInvalidLicenseKey();
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
        const hashStart = cleanedLicenseKey.length - 32;
        const md5 = cleanedLicenseKey.substring(hashStart);
        const license = cleanedLicenseKey.substring(0, hashStart);
        const [version, isTrial] = LicenseManager.extractBracketedInformation(cleanedLicenseKey);
        return { md5, license, version, isTrial };
    }
    getLicenseDetails(licenseKey) {
        const { md5, license, version, isTrial } = LicenseManager.extractLicenseComponents(licenseKey);
        let valid = (md5 === this.md5.md5(license)) && licenseKey.indexOf("For_Trialing_ag-Grid_Only") === -1;
        let trialExpired = null;
        let expiry = null;
        if (valid) {
            expiry = LicenseManager.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
            if (isTrial) {
                const now = new Date();
                trialExpired = (expiry < now);
            }
        }
        return {
            licenseKey,
            valid,
            expiry: valid ? LicenseManager.formatDate(expiry) : null,
            version: version ? version : 'legacy',
            isTrial,
            trialExpired
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
    static setLicenseKey(licenseKey) {
        this.licenseKey = licenseKey;
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
        const gridReleaseDate = LicenseManager.getGridReleaseDate();
        const expiry = LicenseManager.extractExpiry(license);
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
            const formattedExpiryDate = LicenseManager.formatDate(expiry);
            const formattedReleaseDate = LicenseManager.formatDate(gridReleaseDate);
            this.outputIncompatibleVersion(formattedExpiryDate, formattedReleaseDate);
        }
    }
    validateForTrial(license) {
        const expiry = LicenseManager.extractExpiry(license);
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
            const formattedExpiryDate = LicenseManager.formatDate(expiry);
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
}
LicenseManager.RELEASE_INFORMATION = 'MTY4NjA2MTA3MDMxNA==';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGljZW5zZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGljZW5zZS9zaGFyZWQvbGljZW5zZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUUxQix3QkFBd0I7QUFDeEIsU0FBUyxjQUFjLENBQUksS0FBMkI7SUFDbEQsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxLQUFVLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSztJQUNoRCxPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUFJLGdCQUFnQixDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUVELE1BQU0sT0FBTyxjQUFjO0lBUXZCLFlBQVksUUFBa0I7UUFMdEIscUJBQWdCLEdBQXVCLFNBQVMsQ0FBQztRQU1yRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU0sZUFBZTtRQUNsQixJQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7YUFDbEM7U0FDSjthQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO1lBQzlDLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdkUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7YUFDbEM7aUJBQU07Z0JBQ0gsTUFBTSxFQUNGLEdBQUcsRUFDSCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDVixHQUFHLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXZFLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMvQixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLEVBQUU7d0JBQzVCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDbEU7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUNuQztpQkFDSjtxQkFBTTtvQkFDSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztpQkFDbEM7YUFDSjtTQUNKO2FBQU07WUFDSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQWU7UUFDeEMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRixPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU8sTUFBTSxDQUFDLHdCQUF3QixDQUFDLFVBQWtCO1FBQ3RELGtHQUFrRztRQUNsRyxzREFBc0Q7UUFDdEQsdUVBQXVFO1FBQ3ZFLElBQUksaUJBQWlCLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEQsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxjQUFjLENBQUMsMkJBQTJCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN6RixPQUFPLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLGlCQUFpQixDQUFDLFVBQWtCO1FBQ3ZDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxjQUFjLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEcsSUFBSSxZQUFZLEdBQW1CLElBQUksQ0FBQztRQUV4QyxJQUFJLE1BQU0sR0FBZ0IsSUFBSSxDQUFDO1FBQy9CLElBQUksS0FBSyxFQUFFO1lBQ1AsTUFBTSxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWpDLElBQUksT0FBTyxFQUFFO2dCQUNULE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3ZCLFlBQVksR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzthQUNqQztTQUNKO1FBRUQsT0FBTztZQUNILFVBQVU7WUFDVixLQUFLO1lBQ0wsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUN4RCxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVE7WUFDckMsT0FBTztZQUNQLFlBQVk7U0FDZixDQUFDO0lBQ04sQ0FBQztJQUVNLGtCQUFrQjtRQUNyQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUM5SCxDQUFDO0lBRU0sbUJBQW1CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRU8sV0FBVztRQUNmLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLENBQUM7UUFDbEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUN6QixNQUFNLEVBQUMsUUFBUSxHQUFHLEVBQUUsRUFBQyxHQUFHLEdBQUcsQ0FBQztRQUU1QixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLENBQUM7UUFDbEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUN6QixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRXpCLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN4RSxDQUFDO0lBRU8sWUFBWTtRQUNoQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEtBQUssSUFBSSxDQUFDO0lBQ2pFLENBQUM7SUFFTyxXQUFXO1FBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLElBQUksQ0FBQztJQUNuRSxDQUFDO0lBRU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFTO1FBQy9CLE1BQU0sVUFBVSxHQUFhO1lBQ3pCLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTztZQUM5QixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNO1lBQzlCLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUztZQUNoQyxVQUFVLEVBQUUsVUFBVTtTQUN6QixDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFaEMsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQzNELENBQUM7SUFFTyxNQUFNLENBQUMsa0JBQWtCO1FBQzdCLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFhO1FBQy9CLE1BQU0sTUFBTSxHQUFXLG1FQUFtRSxDQUFDO1FBQzNGLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNYLElBQUksQ0FBTSxFQUFFLENBQU0sRUFBRSxDQUFNLENBQUM7UUFDM0IsSUFBSSxDQUFNLEVBQUUsQ0FBTSxFQUFFLENBQU0sRUFBRSxDQUFNLENBQUM7UUFDbkMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxHQUFXLEtBQUssQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNqQixDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQixDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNULENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQztZQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDVCxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEM7U0FDSjtRQUNELENBQUMsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVPLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBYTtRQUNwQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUU7Z0JBQ1QsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0I7aUJBQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUU7Z0JBQzVCLENBQUMsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUMsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7YUFDMUM7aUJBQU07Z0JBQ0gsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDeEMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLENBQUMsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7YUFDMUM7U0FDSjtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBa0I7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVPLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxVQUFrQjtRQUN6RCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ2YsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQzthQUNELEdBQUcsQ0FBQyxVQUFVLEtBQUs7WUFDaEIsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRVAsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNsQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0csT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU8sNEJBQTRCLENBQUMsT0FBZSxFQUFFLE9BQWdCLEVBQUUsT0FBZTtRQUNuRixJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBRUQsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQztJQUNMLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxPQUFlO1FBQ3JDLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVELE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckQsSUFBSSxLQUFLLEdBQVksS0FBSyxDQUFDO1FBQzNCLElBQUksT0FBTyxHQUFZLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQzFCLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDYixPQUFPLEdBQUcsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLENBQUM7U0FDeEM7UUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDbEM7YUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pCLE1BQU0sbUJBQW1CLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5RCxNQUFNLG9CQUFvQixHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFeEUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUM7U0FDN0U7SUFDTCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsT0FBZTtRQUNwQyxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFdkIsSUFBSSxLQUFLLEdBQVksS0FBSyxDQUFDO1FBQzNCLElBQUksT0FBTyxHQUFZLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQzFCLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDYixPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDNUI7UUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDbEM7YUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pCLE1BQU0sbUJBQW1CLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUNuRDtJQUNMLENBQUM7SUFFTyx1QkFBdUI7UUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxtSEFBbUgsQ0FBQyxDQUFDO1FBQ25JLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUhBQW1ILENBQUMsQ0FBQztRQUNuSSxPQUFPLENBQUMsS0FBSyxDQUFDLG1IQUFtSCxDQUFDLENBQUM7UUFDbkksT0FBTyxDQUFDLEtBQUssQ0FBQyxtSEFBbUgsQ0FBQyxDQUFDO1FBQ25JLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUhBQW1ILENBQUMsQ0FBQztRQUNuSSxPQUFPLENBQUMsS0FBSyxDQUFDLG1IQUFtSCxDQUFDLENBQUM7UUFFbkksSUFBSSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0lBQzlDLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxtQkFBMkI7UUFDckQsT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsbUJBQW1CLG9EQUFvRCxDQUFDLENBQUM7UUFDM0ksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFFbEksSUFBSSxDQUFDLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDO0lBQ25ELENBQUM7SUFFTyx1QkFBdUI7UUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUVsSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUM7SUFDakQsQ0FBQztJQUVPLHlCQUF5QixDQUFDLG1CQUEyQixFQUFFLG9CQUE0QjtRQUN2RixPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0VBQWdFLG1CQUFtQiwyQ0FBMkMsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLG9CQUFvQixtRUFBbUUsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFFOUksSUFBSSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0lBQzlDLENBQUM7O0FBOVRjLGtDQUFtQixHQUFXLHNCQUFzQixDQUFDIn0=