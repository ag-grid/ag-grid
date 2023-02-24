const fs=require('fs')

const LICENSE_MANAGER_FILE='grid-enterprise-modules/core/src/licenseManager.ts';

if (process.argv.length !== 3) {
    console.log("Usage: node scripts/release/updateLicenseManager.js NEW_LICENSE");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, licenseKey] = process.argv;

const licenseManagerSrc = fs.readFileSync(LICENSE_MANAGER_FILE, 'utf8');
const releaseInfoIndex = licenseManagerSrc.indexOf('private static RELEASE_INFORMATION');
const startOfValue = licenseManagerSrc.indexOf("'", releaseInfoIndex) + 1;
const endOfValue = licenseManagerSrc.indexOf("'", startOfValue);
const existingLicenseKey = licenseManagerSrc.substring(startOfValue, endOfValue);

const newLicenseManagerSrc = licenseManagerSrc.replace(existingLicenseKey, licenseKey);

fs.writeFileSync(LICENSE_MANAGER_FILE,
    newLicenseManagerSrc,
    "utf8");

