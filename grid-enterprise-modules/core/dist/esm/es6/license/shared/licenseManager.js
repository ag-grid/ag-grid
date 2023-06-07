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
            if (!this.isWebsiteUrl()) {
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
        return !this.isLocalhost() && !this.isWebsiteUrl() && !missingOrEmpty(this.watermarkMessage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGljZW5zZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGljZW5zZS9zaGFyZWQvbGljZW5zZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUUxQix3QkFBd0I7QUFDeEIsU0FBUyxjQUFjLENBQUksS0FBMkI7SUFDbEQsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxLQUFVLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSztJQUNoRCxPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUFJLGdCQUFnQixDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUVELE1BQU0sT0FBTyxjQUFjO0lBUXZCLFlBQVksUUFBa0I7UUFMdEIscUJBQWdCLEdBQXVCLFNBQVMsQ0FBQztRQU1yRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU0sZUFBZTtRQUNsQixJQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7YUFDbEM7U0FDSjthQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO1lBQzlDLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdkUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7YUFDbEM7aUJBQU07Z0JBQ0gsTUFBTSxFQUNGLEdBQUcsRUFDSCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDVixHQUFHLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXZFLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMvQixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLEVBQUU7d0JBQzVCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDbEU7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUNuQztpQkFDSjtxQkFBTTtvQkFDSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztpQkFDbEM7YUFDSjtTQUNKO2FBQU07WUFDSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQWU7UUFDeEMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRixPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU8sTUFBTSxDQUFDLHdCQUF3QixDQUFDLFVBQWtCO1FBQ3RELGtHQUFrRztRQUNsRyxzREFBc0Q7UUFDdEQsdUVBQXVFO1FBQ3ZFLElBQUksaUJBQWlCLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEQsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxjQUFjLENBQUMsMkJBQTJCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN6RixPQUFPLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLGlCQUFpQixDQUFDLFVBQWtCO1FBQ3ZDLE1BQU0sRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUMsR0FBRyxjQUFjLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEcsSUFBSSxZQUFZLEdBQW1CLElBQUksQ0FBQztRQUV4QyxJQUFJLE1BQU0sR0FBZ0IsSUFBSSxDQUFDO1FBQy9CLElBQUksS0FBSyxFQUFFO1lBQ1AsTUFBTSxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWpDLElBQUcsT0FBTyxFQUFFO2dCQUNSLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3ZCLFlBQVksR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzthQUNqQztTQUNKO1FBRUQsT0FBTztZQUNILFVBQVU7WUFDVixLQUFLO1lBQ0wsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUN4RCxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVE7WUFDckMsT0FBTztZQUNQLFlBQVk7U0FDZixDQUFDO0lBQ04sQ0FBQztJQUVNLGtCQUFrQjtRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFTSxtQkFBbUI7UUFDdEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxXQUFXO1FBQ2YsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3pCLE1BQU0sRUFBQyxRQUFRLEdBQUcsRUFBRSxFQUFDLEdBQUcsR0FBRyxDQUFDO1FBRTVCLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxZQUFZO1FBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDakUsQ0FBQztJQUVPLFdBQVc7UUFDZixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLEtBQUssSUFBSSxDQUFDO0lBQ25FLENBQUM7SUFFTyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVM7UUFDL0IsTUFBTSxVQUFVLEdBQWE7WUFDekIsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPO1lBQzlCLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU07WUFDOUIsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTO1lBQ2hDLFVBQVUsRUFBRSxVQUFVO1NBQ3pCLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVoQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7SUFDM0QsQ0FBQztJQUVPLE1BQU0sQ0FBQyxrQkFBa0I7UUFDN0IsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFTyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWE7UUFDL0IsTUFBTSxNQUFNLEdBQVcsbUVBQW1FLENBQUM7UUFDM0YsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1gsSUFBSSxDQUFNLEVBQUUsQ0FBTSxFQUFFLENBQU0sQ0FBQztRQUMzQixJQUFJLENBQU0sRUFBRSxDQUFNLEVBQUUsQ0FBTSxFQUFFLENBQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsR0FBVyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ2pCLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1QsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO1lBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNULENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQztTQUNKO1FBQ0QsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFhO1FBQ3BDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDWCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtnQkFDVCxDQUFDLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRTtnQkFDNUIsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUMxQztpQkFBTTtnQkFDSCxDQUFDLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUMxQztTQUNKO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFrQjtRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBRU8sTUFBTSxDQUFDLDJCQUEyQixDQUFDLFVBQWtCO1FBQ3pELE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2FBQ2hDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDZixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDO2FBQ0QsR0FBRyxDQUFDLFVBQVUsS0FBSztZQUNoQixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFDeEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzRyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTyw0QkFBNEIsQ0FBQyxPQUFlLEVBQUUsT0FBZ0IsRUFBRSxPQUFlO1FBQ25GLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtZQUNqQixPQUFPO1NBQ1Y7UUFFRCxJQUFJLE9BQU8sRUFBRTtZQUNULElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNsQzthQUFNO1lBQ0gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ25DO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQixDQUFDLE9BQWU7UUFDckMsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDNUQsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyRCxJQUFJLEtBQUssR0FBWSxLQUFLLENBQUM7UUFDM0IsSUFBSSxPQUFPLEdBQVksS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNiLE9BQU8sR0FBRyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQzthQUFNLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlELE1BQU0sb0JBQW9CLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV4RSxJQUFJLENBQUMseUJBQXlCLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztTQUM3RTtJQUNMLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxPQUFlO1FBQ3BDLE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUV2QixJQUFJLEtBQUssR0FBWSxLQUFLLENBQUM7UUFDM0IsSUFBSSxPQUFPLEdBQVksS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNiLE9BQU8sR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUVELElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQzthQUFNLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ25EO0lBQ0wsQ0FBQztJQUVPLHVCQUF1QjtRQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLG1IQUFtSCxDQUFDLENBQUM7UUFDbkksT0FBTyxDQUFDLEtBQUssQ0FBQyxtSEFBbUgsQ0FBQyxDQUFDO1FBQ25JLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUhBQW1ILENBQUMsQ0FBQztRQUNuSSxPQUFPLENBQUMsS0FBSyxDQUFDLG1IQUFtSCxDQUFDLENBQUM7UUFDbkksT0FBTyxDQUFDLEtBQUssQ0FBQyxtSEFBbUgsQ0FBQyxDQUFDO1FBQ25JLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUhBQW1ILENBQUMsQ0FBQztRQUVuSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7SUFDOUMsQ0FBQztJQUVPLHFCQUFxQixDQUFDLG1CQUEyQjtRQUNyRCxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxtQkFBbUIsb0RBQW9ELENBQUMsQ0FBQztRQUMzSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUVsSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUM7SUFDbkQsQ0FBQztJQUVPLHVCQUF1QjtRQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBQ2xJLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0hBQWtILENBQUMsQ0FBQztRQUNsSSxPQUFPLENBQUMsS0FBSyxDQUFDLGtIQUFrSCxDQUFDLENBQUM7UUFDbEksT0FBTyxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxDQUFDO1FBRWxJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQztJQUNqRCxDQUFDO0lBRU8seUJBQXlCLENBQUMsbUJBQTJCLEVBQUUsb0JBQTRCO1FBQ3ZGLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyxnRUFBZ0UsbUJBQW1CLDJDQUEyQyxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsb0JBQW9CLG1FQUFtRSxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUM5SSxPQUFPLENBQUMsS0FBSyxDQUFDLDhIQUE4SCxDQUFDLENBQUM7UUFDOUksT0FBTyxDQUFDLEtBQUssQ0FBQyw4SEFBOEgsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUU5SSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7SUFDOUMsQ0FBQzs7QUF0VGMsa0NBQW1CLEdBQVcsc0JBQXNCLENBQUMifQ==