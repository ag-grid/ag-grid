import {App} from "octokit";
import * as fs from 'fs';
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';

// node ./scripts/release/createRelease.mjs --app-id=$AG_AUTOMATED_RELEASE_APP_ID --installation-id=$AG_AUTOMATED_RELEASE_INSTALLATION_ID --private-key-path=$AG_AUTOMATED_RELEASE_PRIVATE_KEY --release-version=100.0.0 --release-branch=AG-12422 --artifacts-path=/Users/seanlandsman/dev/ag-grid/latest/dist/artifacts

const args = yargs(hideBin(process.argv))
    .usage('Usage: $0 [package path] --private-key-path <path>')
    .demandOption(['app-id', 'installation-id', 'private-key-path'])
    .demandOption(['release-version', 'release-branch', 'artifacts-path'])
    .parse();


const CREATED_STATUS = 201;

const AG_GRID_APP_ID = args.appId;
const PRIVATE_KEY = fs.readFileSync(args.privateKeyPath, 'utf-8');
const INSTALLATION_ID = args.installationId;

// github releases can't be a number so all of our releases are prefixed with a "v"
const releaseVersion = args.releaseVersion;
const ghReleaseVersion = `v${releaseVersion}`;

const releaseBranch = args.releaseBranch;
const artifactsPath = args.artifactsPath;

const artifactFolders = ['community-modules', 'enterprise-modules', 'packages'];

const app = new App({
    appId: AG_GRID_APP_ID,
    privateKey: PRIVATE_KEY,
});

const octokit = await app.getInstallationOctokit(INSTALLATION_ID);

async function validateRelease() {
    console.log("Validating Release Information");

    const semverRegex = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

    if(!semverRegex.test(ghReleaseVersion)) {
        console.error(`ERROR: ${releaseVersion} is not a valid release - format is xx.xx.xx`);
        process.exit(1);
    }

    for(const artifactFolder of artifactFolders) {
        if(!fs.existsSync(`${artifactsPath}/${artifactFolder}`)) {
            console.error(`ERROR: Expected artifact directory not present: ${artifactsPath}/${artifactFolder}`);
            process.exit(1);
        }
    }

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
}

async function createGitHubReleaseAttachArtifacts() {
    console.log(`Creating GitHub Release ${ghReleaseVersion}`);

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

    if (creationResult.status !== CREATED_STATUS) {
        console.log(`ERROR: GitHub Release Creation Failed for Version ${releaseVersion}`);
        console.log(creationResult);
        process.exit(1);
    }

    return {releaseId: creationResult.data.id, uploadUrl: creationResult.data.upload_url};
}

async function uploadArtifactsForRelease(release) {
    console.log(`Uploading Release Artifacts for release ${ghReleaseVersion}`);

    const mapFilename = (folder, filename) => {
        switch (folder) {
            case 'community-modules':
                return `@ag-grid-community-${filename}`;
            case 'enterprise-modules':
                return `@ag-grid-enterprise-${filename}`;
            default:
                return filename;
        }
    }

    let uploadError = false;
    for (const artifactFolder of artifactFolders) {
        const fileEntries = fs.readdirSync(`${artifactsPath}/${artifactFolder}`, {withFileTypes: true})
            .filter(item => !item.isDirectory());

        for (const file of fileEntries) {
            const {name, path} = file;

            const fullPath = `${path}/${name}`;
            const stats = fs.statSync(fullPath);
            try {
                await octokit.request(`POST /repos/ag-grid/ag-grid/releases/${release.releaseId}/assets`, {
                    owner: 'ag-grid',
                    repo: 'ag-grid',
                    url: release.uploadUrl,
                    accept: 'application/vnd.github.v3+json',
                    release_id: release.releaseId,
                    name: mapFilename(artifactFolder, name),
                    data: fs.createReadStream(fullPath),
                    headers: {
                        'content-type': 'binary/octet-stream',
                        'content-length': stats.size,
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                })

                console.log(`${fullPath} successfully uploaded`);
            } catch (error) {
                console.error(`ERROR: ${fullPath} not uploaded`);
                console.error(error.response.data.message);
                console.error(error.response.data.errors);
                uploadError = true;
            }
        }
    }

    if (uploadError) {
        console.error("ERROR: One or more artifacts could not be uploaded");
        process.exit(1);
    }
}

await validateRelease();
const release = await createGitHubReleaseAttachArtifacts();
await uploadArtifactsForRelease(release);
