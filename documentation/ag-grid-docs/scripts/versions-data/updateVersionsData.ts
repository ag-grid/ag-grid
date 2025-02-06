/* eslint-disable no-console */
import { execSync } from 'child_process';
import * as fs from 'fs/promises';

// Absolute path from the root directory
const VERSIONS_DATA_PATH = 'documentation/ag-grid-docs/src/content/versions/ag-grid-versions.json';
const WEBSITE_ARCHIVE_URL = 'https://www.ag-grid.com/archive';

function sortByVersionAsc(a: string, b: string) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
        }
    }
    return 0;
}

function sortByVersionDesc(a: string, b: string) {
    return sortByVersionAsc(b, a);
}

function extractVersionsFromHref(html: string) {
    const hrefRegex = /<a\s+href="(\d+\.\d+\.\d+)\/">/g;

    const versions = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
        versions.push(match[1]);
    }

    return [...new Set(versions)].sort(sortByVersionAsc);
}

async function getWebsiteVersions() {
    const response = await fetch(WEBSITE_ARCHIVE_URL);
    const html = await response.text();

    return extractVersionsFromHref(html);
}

function getDaySuffix(day: number) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

function formatDate(isoString: string) {
    const date = new Date(isoString);

    const day = date.getUTCDate();
    const suffix = getDaySuffix(day);

    const options = { month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    return `${formattedDate.split(' ')[0]} ${day}${suffix} ${formattedDate.split(' ')[1]}`;
}

function getNpmLibraryVersions(library: string) {
    const results = execSync(`npm view ${library} time --json`);
    return JSON.parse(results.toString());
}

function logInitialReport({ versionsDataFile, agVersions, npmVersions, missingNpmVersions, websiteVersions }) {
    console.log(`${agVersions.length} versions in '${versionsDataFile}'`);
    console.log(`${npmVersions.length} npm versions`);
    console.log(`${websiteVersions.length} website versions`);
    console.log(`${missingNpmVersions.length} missing npm versions${missingNpmVersions.length ? ':' : ''}`);
    if (missingNpmVersions.length) {
        console.log(missingNpmVersions);
    }
}

function logFinalReport({ versionsDataFile, allVersions, noDocsUpdated }) {
    console.log(`Wrote changes to '${versionsDataFile}'`);
    console.log(`${noDocsUpdated} noDocs values updated`);
    console.log(`${allVersions.length} versions written`);
}

function updateNoDocs({ versions, websiteVersions }) {
    let num = 0;
    // Check website to see if version has docs
    const updatedVersions = versions.map((versionData) => {
        const noDocs = !websiteVersions.includes(versionData.version);

        const newData = { ...versionData };

        if (noDocs) {
            newData.noDocs = true;

            if (!versionData.noDocs) {
                num++;
            }
        } else {
            delete newData.noDocs;

            if (versionData.noDocs) {
                num++;
            }
        }

        return newData;
    });

    return {
        num,
        versions: updatedVersions,
    };
}

async function updateVersionsData({ isVerbose }: { isVerbose: boolean }) {
    const versionsDataFile = VERSIONS_DATA_PATH;
    const agVersions = JSON.parse((await fs.readFile(VERSIONS_DATA_PATH)).toString());
    const allNpmVersionMap = getNpmLibraryVersions('ag-grid-community');
    const npmVersions = Object.entries(allNpmVersionMap)
        .map(([version, date]: [string, string]) => {
            const formattedDate = formatDate(date);
            return { version, date: formattedDate };
        })
        .filter(({ version }) => {
            return !version.includes('beta');
        })
        .filter(({ version }) => {
            return version.match(/^\d+\.\d+\.\d+$/);
        });
    const websiteVersions = await getWebsiteVersions();
    const missingNpmVersions = npmVersions.filter(({ version }) => {
        const hasVersion = agVersions.some((agVersion) => version === agVersion.version);
        return !hasVersion;
    });

    if (isVerbose) {
        logInitialReport({ versionsDataFile, agVersions, npmVersions, missingNpmVersions, websiteVersions });
    }

    const combinedVersions = [...agVersions, ...missingNpmVersions].sort((a, b) => {
        return sortByVersionDesc(a.version, b.version);
    });
    const { versions: allVersions, num: noDocsUpdated } = updateNoDocs({ versions: combinedVersions, websiteVersions });

    if (missingNpmVersions.length || noDocsUpdated > 0) {
        const updatedVersions = JSON.stringify(allVersions, null, 4) + '\n';

        // Write versions to file
        await fs.writeFile(VERSIONS_DATA_PATH, updatedVersions);

        if (isVerbose) {
            logFinalReport({ versionsDataFile, allVersions, noDocsUpdated });
        }
    } else {
        if (isVerbose) {
            console.log('No changes needed');
        }
    }
}

const isVerbose = process.argv.includes('--verbose');
updateVersionsData({ isVerbose });
