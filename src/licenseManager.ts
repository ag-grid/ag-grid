import {Bean, Autowired, PostConstruct} from "ag-grid/main";
import {Utils as _} from "ag-grid/main";
import {MD5} from "./license/md5";

@Bean('licenseManager')
export class LicenseManager {
    private static licenseKey:string;

    @Autowired('md5') private md5: MD5;

    public validateLicense():void {
        console.log("validating license: " + LicenseManager.licenseKey);
        if(!_.missingOrEmpty(LicenseManager.licenseKey) && LicenseManager.licenseKey.length > 32) {
            var prefix = LicenseManager.licenseKey.substring(LicenseManager.licenseKey.length - 32);
            var hash = LicenseManager.licenseKey.substring(32);

            var hashed = this.md5.md5(prefix);

            console.log(hashed);
        }
    }

    static setLicenseKey(licenseKey:string):void {
        LicenseManager.licenseKey = licenseKey;
    }
}