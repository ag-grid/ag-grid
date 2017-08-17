import {platformBrowser} from "@angular/platform-browser";
import {AppModuleNgFactory} from "../aot/app/app.module.ngfactory";

// for enterprise customers
// import {LicenseManager} from "ag-grid-enterprise/main";
// LicenseManager.setLicenseKey("your license key");

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
