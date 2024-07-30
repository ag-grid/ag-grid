import {App} from "octokit";
import * as fs from 'fs';
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';

const args = yargs(hideBin(process.argv))
    .usage('Usage: $0 [package path] --private-key-path <path>')
    .demandOption(['app-id', 'installation-id', 'private-key-path'])
    .demandOption(['release-version', 'release-branch'])
    .parse();

const AG_GRID_APP_ID = args.appId;
const PRIVATE_KEY = fs.readFileSync(args.privateKeyPath, 'utf-8');
const INSTALLATION_ID = args.installationId;

// github releases can't be a number so all of our releases are prefixed with a "v"
const releaseVersion = args.releaseVersion;
const ghReleaseVersion = `v${releaseVersion}`;
const releaseBranch = args.releaseBranch;

const app = new App({
    appId: AG_GRID_APP_ID,
    privateKey: PRIVATE_KEY,
});

const octokit = await app.getInstallationOctokit(INSTALLATION_ID);

const releases = await octokit.request('GET /repos/ag-grid/ag-grid/releases', {
    owner: 'ag-grid',
    repo: 'ag-grid',
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
})

const releaseVersions = releases.data.map(release => release.name)

if (releaseVersions.some(version => version === ghReleaseVersion)) {
    console.log(`ERROR: Release Version ${releaseVersion} Already Exists`);
    process.exit(1);
}

const creationResult = await octokit.request('POST /repos/ag-grid/ag-grid/releases', {
    owner: 'ag-grid',
    repo: 'ag-grid',
    tag_name: ghReleaseVersion,
    target_commitish: releaseBranch,
    name: ghReleaseVersion,
    body: `https://www.ag-grid.com/changelog/?fixVersion=${releaseVersion}`,
    draft: false,
    prerelease: false,
    generate_release_notes: false,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
})

