import { execSync } from 'child_process';
import fetch from 'node-fetch';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
    .usage(
        'Usage: $0 --auth-token [auth-token] -grid-channel [grid-channel] --charts-channel [charts-channel] --website-status-channel [website-status-channel] --slack-bot-oauth-token [slack-bot-oauth-token] --debug-channel [debug-channel] --run-context [run-context]'
    )
    .options({
        'auth-token': {
            demandOption: true,
        },
        'grid-channel': {
            demandOption: true,
        },
        'charts-channel': {
            demandOption: true,
        },
        'website-status-channel': {
            demandOption: true,
        },
        'debug-channel': {
            demandOption: true,
        },
        'run-context': {
            demandOption: true,
        },
    })
    .parse();

const SLACK_BOT_OAUTH_TOKEN = args.authToken;
const GRID_TEAM_CITY_CHANNEL = args.debugChannel; //args.gridChannel;
const CHARTS_TEAM_CITY_CHANNEL = args.debugChannel; //args.chartsChannel;
const WEBSITE_STATUS_CHANNEL = args.debugChannel; //args.websiteStatusChannel;
const SLACK_DEBUG_CHANNEL = args.debugChannel;

type GH_MAPPING = {
    id: string;
    name: string;
    email: string[];
    real_name: string;
    github: string;
    directNotification?: boolean;
};

type JobStatus = 'success' | 'failure' | 'n/a';

type RunContext = {
    runId: number;
    workflow: string;
    ref: string;
    currentSha: string;
    lastSuccessfulSha: string;
    status: 'success' | 'failure';
    project: AgProject;
    reportUrl: number;
    jobStatuses: { [key: string]: JobStatus };
    deployToStaging: boolean;
};

type AgProject = 'AgGrid' | 'AgCharts' | 'Blog';

const SLACK_GITHUB_MAPPING: GH_MAPPING[] = [
    {
        id: 'U51ANDH2P',
        name: 'sean',
        email: ['sean@thelandsmans.com'],
        real_name: 'Sean Landsman',
        github: 'seanlandsman',
    },
    {
        id: 'U52QGCPHV',
        name: 'niall',
        email: ['niall.crosby@ag-grid.com'],
        real_name: 'Niall Crosby',
        github: 'ceolter',
    },
    {
        id: 'U5M13C4H0',
        name: 'robert.clarke',
        email: ['rmc.software.consultancy@gmail.com'],
        real_name: 'Robert Clarke',
        github: 'rmc-software',
    },
    {
        id: 'UB6TDQ8NN',
        name: 'guilherme.lopes',
        email: ['guilherme@gwm-solutions.com'],
        real_name: 'Guilherme Lopes',
        github: 'gportela85',
    },
    {
        id: 'UP1LLU532',
        name: 'viqas.hussain',
        real_name: 'Viqas Hussain',
        email: ['viqashussain@hotmail.co.uk'],
        github: 'viqashussain',
    },
    {
        id: 'U026R2EUPSA',
        name: 'mana.jalali',
        email: ['mana.jalali.15@ucl.ac.uk'],
        real_name: 'Mana Jalali',
        github: 'manapeirov',
        directNotification: true,
    },
    {
        id: 'U027TLR9R4G',
        name: 'stephen.cooper',
        email: ['scooperdev@gmail.com'],
        real_name: 'Stephen Cooper',
        github: 'StephenCooper',
        directNotification: true,
    },
    {
        id: 'U02GZ8PH678',
        name: 'alan.treadway',
        email: ['alan.treadway@ag-grid.com', 'alantreadway@users.noreply.github.com'],
        real_name: 'Alan Treadway',
        github: 'alantreadway',
        directNotification: true,
    },
    {
        id: 'U034PGFVAAW',
        name: 'andrew.glazier',
        email: ['andrew.glazier@ag-grid.com'],
        real_name: 'Andrew Glazier',
        github: 'AndrewGlazier',
    },
    {
        id: 'U03CRKJN7LK',
        name: 'bernard.sumption',
        email: ['bernie@berniecode.com'],
        real_name: 'Bernie Sumption',
        github: 'BernieSumption',
    },
    {
        id: 'U040RJNEV63',
        name: 'tak.tran',
        email: ['contact@tutaktran.com'],
        real_name: 'Tak Tran',
        github: 'taktran',
        directNotification: true,
    },
    {
        id: 'U048BCNDQJV',
        name: 'peter.reynolds',
        email: ['40919976+peterjrreynolds@users.noreply.github.com', 'peterjrreynolds@gmail.com'],
        real_name: 'Peter Reynolds',
        github: 'peterjrreynolds',
        directNotification: true,
    },
    {
        id: 'U04D4E6JY73',
        name: 'david.glickman',
        email: ['121935568+AG-DavidG@users.noreply.github.com'],
        real_name: 'David Glickman',
        github: 'AG-DavidG',
        directNotification: true,
    },
    {
        id: 'U04DWL7114H',
        name: 'mark.durrant',
        email: ['mark.j.durrant@gmail.com'],
        real_name: 'Mark Durrant',
        github: 'markdurrant',
        directNotification: true,
    },
    {
        id: 'U04PCGQSV62',
        name: 'laurence.roberts',
        email: ['laurence.roberts@ag-grid.com'],
        real_name: 'Laurence Roberts',
        github: 'lsjroberts',
    },
    {
        id: 'U054HRAAL21',
        name: 'zoheil.khaleqi',
        email: ['132376454+AG-Zoheil@users.noreply.github.com'],
        real_name: 'Zoheil Khaleqi',
        github: 'AG-Zoheil',
    },
    {
        id: 'U05QWSB8ZN0',
        name: 'olivier.legat',
        email: ['olegat@users.noreply.github.com', 'olivier.legat@ag-grid.com'],
        real_name: 'Oli Legat',
        github: 'olegat',
    },
    {
        id: 'U05PDUVNKB2',
        name: 'ido.moshe',
        email: ['ido.moshe@ag-grid.com'],
        real_name: 'Ido Moshe',
        github: 'iMoses',
        directNotification: true,
    },
    {
        id: 'U05QQV4KHE3',
        name: 'adam.wang',
        email: ['adam.wang@ag-grid.com'],
        real_name: 'Adam Wang',
        github: 'adam-wang-uk',
    },
    {
        id: 'U05QWR6UE2Y',
        name: 'james.swinton-bland',
        email: ['40694714+JamesSwinton@users.noreply.github.com', 'james_swinton@hotmail.co.uk'],
        real_name: 'James Swinton-Bland',
        github: 'JamesSwinton',
    },
    {
        id: 'U061A165HRR',
        name: 'kyler.phillips',
        email: ['kylerphillips@MacBook-Pro.local', 'kylerphillips@hotmail.co.uk'],
        real_name: 'Kyler Phillips',
        github: 'kylerphillips',
    },
    {
        id: 'U063CF7TRGT',
        name: 'jacob.parker',
        email: ['jacobparker1992@gmail.com'],
        real_name: 'jacob.parker',
        github: 'jacobp100',
    },
    {
        id: 'U0738CFPT6Z',
        name: 'elias.malik',
        email: ['elias.malik@ag-grid.com', 'elias0789@gmail.com'],
        real_name: 'Elias Malik',
        github: 'eliasmalik',
        directNotification: true,
    },
    {
        id: 'U078E51LUM9',
        name: 'salvatore.previti',
        email: ['salvatore.previti@ag-grid.com'],
        real_name: 'Salvatore Previti',
        github: 'SalvatorePreviti',
    },
    {
        id: 'U07KLFGNKS8',
        name: 'steph.meslin-weber',
        email: ['steph@tangency.co.uk '],
        real_name: 'Steph Meslin-Weber',
        github: 'Stephanemw',
        directNotification: true,
    },
    // {
    //     "id": "U0833KVHLJG",
    //     "name": "shadid.haque",
    //     "real_name": "shadid.haque",
    //     "github": "Shadid12"
    // }
];

const JIRA_BASE_URL = 'https://ag-grid.atlassian.net/jira/software/c/projects/AG';

const SLACK_POST_MESSAGE_URL = 'https://slack.com/api/chat.postMessage';
const SLACK_POST_EPHEMERAL_URL = 'https://slack.com/api/chat.postEphemeral';
const THREAD_TEAMCITY_RESPONSE = true;
const MANY_CHANGES_LIMIT = 10;

interface GitChange {
    id?: string;
    version: string;
    username: string;
    comment: string;
}

interface User {
    id: string;
    name: string;
    real_name?: string;
    github: string;
    directNotification?: boolean;
}

type UserDisplayType = 'slack' | 'name' | 'debug';

function sendSlackMessage({ isEphemeral, data }: { isEphemeral?: boolean; data: object }) {
    const url = isEphemeral ? SLACK_POST_EPHEMERAL_URL : SLACK_POST_MESSAGE_URL;
    return fetch(url, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${SLACK_BOT_OAUTH_TOKEN}`,
        },
        method: 'POST',
        body: JSON.stringify(data),
    });
}

function getGithubBaseUrl(project: AgProject) {
    let baseUrl = 'https://github.com/ag-grid/ag-grid';
    if (project === 'Blog') {
        baseUrl = 'https://github.com/ag-grid/ag-blog-content';
    } else if (project === 'AgCharts') {
        baseUrl = 'https://github.com/ag-grid/ag-charts';
    }

    return baseUrl;
}

function getEmoji(project: AgProject) {
    return project === 'AgGrid' ? ':bento:' : project === 'AgCharts' ? ':bar_chart:' : '';
}

function getStagingUrl(project: AgProject) {
    let url = 'https://grid-staging.ag-grid.com';
    if (project === 'AgCharts') {
        url = 'https://charts-staging.ag-grid.com';
    }

    return url;
}

function getBranchLink(runContext: RunContext) {
    const branchName = runContext.ref;
    const baseUrl = getGithubBaseUrl(runContext.project);

    if (branchName === undefined) {
        return '';
    } else if (branchName === 'refs/heads/latest') {
        return `<${baseUrl}/tree/latest|latest>`;
    } else if (branchName.startsWith('pull/')) {
        return `<${baseUrl}/${branchName}|PR #${branchName.slice('pull/'.length)}>`;
    } else if (branchName.startsWith('refs/tags/')) {
        const tagName = branchName.slice('refs/tags/'.length);
        return `<${baseUrl}/tree/${tagName}|${tagName}>`;
    }
    return branchName;
}

function getUser(username: string): User | undefined {
    return SLACK_GITHUB_MAPPING.find(({ github }: { github: string }) => github === username);
}

function getUserDisplay(username: string, userDisplayType: UserDisplayType) {
    const user = getUser(username);
    const slackUserId = user?.id;

    let userDisplay = user?.real_name || username;
    if (slackUserId) {
        if (userDisplayType === 'name') {
            userDisplay = user.real_name || user.name;
        } else if (userDisplayType === 'slack') {
            userDisplay = `<@${slackUserId}>`;
        } else if (userDisplayType === 'debug') {
            userDisplay = `${userDisplay} (${slackUserId})`;
        }
    }

    return userDisplay;
}

function updateWithJiraUrl(str: string) {
    const regex = /(AG-[0-9]+)(.*)/gm;
    const subst = `<${JIRA_BASE_URL}/$1|$1>$2`;

    return str.replace(regex, subst);
}

function updateWithGithubPRUrl({ str, baseGithubUrl }: { str: string; baseGithubUrl: string }) {
    const regex = /#(\d+)/gm;
    const subst = `<${baseGithubUrl}/pull/$1 | #$1>`;

    return str.replace(regex, subst);
}

function findUserByEmail(testEmail: string): GH_MAPPING | undefined {
    return SLACK_GITHUB_MAPPING.find(({ email }) => email.some((email) => email === testEmail));
}

function getGitChanges(currentSha: string, lastSuccessfulSha: string): GitChange[] {
    const rawChanges = execSync(`git log ${currentSha}...${lastSuccessfulSha} --format="%ae||%an||%h||%s"`, {
        stdio: 'pipe',
        encoding: 'utf-8',
    });

    return rawChanges
        .split('\n')
        .filter((change) => change.length > 0)
        .map((change) => change.split('||'))
        .map((change) => ({
            username: findUserByEmail(change[0])?.github || change[1],
            id: findUserByEmail(change[0])?.id,
            version: change[2],
            comment: change[3],
        }));
}

function getChangesData(
    currentSha: string,
    lastSuccessfulSha: string,
    project: AgProject,
    gitChanges: GitChange[],
    userDisplayTypeSetting: UserDisplayType
) {
    const firstChangeSha = lastSuccessfulSha;
    const lastChangeSha = currentSha;

    const baseGithubUrl = getGithubBaseUrl(project);
    const githubUrl =
        gitChanges.length > 1
            ? `${baseGithubUrl}/compare/${lastChangeSha}~1...${firstChangeSha}`
            : `${baseGithubUrl}/commit/${firstChangeSha}`;

    const changesLimit = MANY_CHANGES_LIMIT;
    const tooManyChanges = gitChanges.length > changesLimit;
    const changes = tooManyChanges ? gitChanges.slice(0, changesLimit) : gitChanges;

    const allUsers = gitChanges.map(({ username }: GitChange) => username);
    const allOtherUsers = allUsers.slice(changesLimit);
    const uniqueUsers: string[] = [...new Set(allUsers)] as string[];

    uniqueUsers.push('seanlandsman');
    // Only show the name if there are too many changes, display setting is `slack` and there is more than 1 user with changes
    const userDisplayType =
        tooManyChanges && userDisplayTypeSetting === 'slack' && uniqueUsers.length > 1
            ? 'name'
            : userDisplayTypeSetting;
    const otherUsers = [...new Set(allOtherUsers)]
        .map((username) => {
            return getUserDisplay(username, userDisplayType);
        })
        .join(', ');

    let changeDetails = changes
        .map(({ username, comment, version }: GitChange) => {
            const commentFirstLine = comment.split('\n')[0];
            const firstLine = updateWithGithubPRUrl({ str: updateWithJiraUrl(commentFirstLine), baseGithubUrl });
            const shortSha = version.slice(0, 7);
            const userDisplay = getUserDisplay(username, userDisplayType);

            return `• ${userDisplay}: ${firstLine} (<${baseGithubUrl}/commit/${version}|${shortSha}>)`;
        })
        .join('\n');
    if (tooManyChanges) {
        changeDetails += `\n• ...(${gitChanges.length - changesLimit} more changes from ${otherUsers})`;
    }

    const changesText =
        gitChanges.length === 0 ? '_No changes_' : `Changes (<${githubUrl}|Github diff>):\n${changeDetails}`;

    return {
        uniqueUsers,
        changesText,
    };
}

function getJobStatusSummary(runContext: RunContext) {
    const getStatus = (status: JobStatus) => `${status === 'success' ? '✅' : status === 'failure' ? '❌' : '➖'}`;
    return `${Object.entries(runContext.jobStatuses)
        .map(([job, status]) => `${job}: ${getStatus(status)}`)
        .join(' | ')}`;
}

function buildFailureSlackMessageBlocks(
    changes: GitChange[],
    runContext: RunContext,
    userDisplayType: UserDisplayType
) {
    const branchLink = getBranchLink(runContext);
    const branchDetails = branchLink ? ` (on ${branchLink})` : '';
    const { currentSha, lastSuccessfulSha, runId, project, workflow, reportUrl } = runContext;
    const { changesText } = getChangesData(currentSha, lastSuccessfulSha, project, changes, userDisplayType);

    const testReportUrl = reportUrl ? `(<${reportUrl}|Test Results>)` : '';
    const emoji = getEmoji(project);
    const webUrl = `https://github.com/ag-grid/ag-grid/actions/runs/${runId}`;
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:x: ${emoji} ${project} / <${webUrl} | ${workflow} #${runId}>${branchDetails} *failed* ${testReportUrl}
${getJobStatusSummary(runContext)}`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: changesText,
            },
        },
    ];
}

async function sendFailureSlackMessage(
    changes: GitChange[],
    runContext: RunContext,
    channel: string,
    userDisplayType: UserDisplayType
) {
    const blocks = buildFailureSlackMessageBlocks(changes, runContext, userDisplayType);
    const res = await sendSlackMessage({
        data: {
            channel,
            blocks,
            unfurl_links: false,
        },
    });

    return res.json();
}

async function sendSuccessSlackMessage(
    changes: GitChange[],
    runContext: RunContext,
    channel: string,
    userDisplayType: UserDisplayType
) {
    const branchLink = getBranchLink(runContext);
    const branchDetails = branchLink ? ` (on ${branchLink})` : '';

    const { currentSha, lastSuccessfulSha, runId, project, workflow } = runContext;
    const { changesText } = getChangesData(currentSha, lastSuccessfulSha, project, changes, userDisplayType);
    const emoji = getEmoji(project);
    const webUrl = `https://github.com/ag-grid/ag-grid/actions/runs/${runId}`;
    const text =
        `:white_check_mark: ${emoji} ${project} / <${webUrl} | ${workflow} #${runId}>${branchDetails} successful
${getJobStatusSummary(runContext)}` + `\n${changesText}`;

    const res = await sendSlackMessage({
        data: {
            channel,
            text,
            unfurl_links: false,
        },
    });

    return res.json();
}

async function sendCodeSlackMessage({ channel, code, threadTs }: { channel: string; code: string; threadTs: string }) {
    const text = `Generated from teamcity response:\n\`\`\`${code}\n\`\`\``;

    const res = await sendSlackMessage({
        data: {
            channel,
            text,
            thread_ts: threadTs,
        },
    });

    return res.json();
}

function getUserSlackId(username: string) {
    return getUser(username)?.id;
}

async function notifyIndividualStagingDeploy(
    runContext: RunContext,
    changes: GitChange[],
    userDisplayType: UserDisplayType
) {
    const { currentSha, lastSuccessfulSha, runId, project, deployToStaging } = runContext;
    const { uniqueUsers, changesText } = getChangesData(
        currentSha,
        lastSuccessfulSha,
        project,
        changes,
        userDisplayType
    );

    const usersToCheck = SLACK_GITHUB_MAPPING.filter((mapping) => !!mapping.directNotification);
    const slackUsers = uniqueUsers.map((userName) => getUserSlackId(userName));

    const usersWithChanges = usersToCheck
        .map((mapping) => {
            const userHasChange = slackUsers.includes(mapping.id);

            if (deployToStaging && userHasChange) {
                return mapping.id;
            }
        })
        .filter(Boolean);

    const promises = usersWithChanges.map(async (slackId) => {
        const webUrl = `https://github.com/ag-grid/ag-grid/actions/runs/${runId}`;
        const stagingUrl = getStagingUrl(project);
        const emoji = getEmoji(project);
        const text = `:rocket: ${emoji} Your recent changes were deployed to ${stagingUrl} (<${webUrl}|#${runId}>)\n${changesText}`;

        const slackResp = await sendSlackMessage({ data: { channel: slackId, text, unfurl_links: false } });
        return await slackResp.json();
    });

    return await Promise.all(promises);
}

async function notifySlackDebug(changes: GitChange[], runContext: RunContext, channel: string) {
    const { status } = runContext;

    // NOTE: Don't use slack username, so that it doesn't notify
    const userDisplayType: UserDisplayType = 'debug';
    let slackDebugMessage;

    if (status === 'failure') {
        slackDebugMessage = sendFailureSlackMessage(changes, runContext, channel, userDisplayType);
    } else if (status === 'success') {
        // NOTE: Don't use slack username, so that it doesn't notify
        slackDebugMessage = sendSuccessSlackMessage(changes, runContext, channel, userDisplayType);
    }

    const slackDebugResponse = slackDebugMessage ? await slackDebugMessage : undefined;

    if (THREAD_TEAMCITY_RESPONSE && slackDebugResponse?.ts) {
        await sendCodeSlackMessage({
            channel,
            code: JSON.stringify(runContext, null, 2),
            threadTs: slackDebugResponse.ts,
        });

        await sendCodeSlackMessage({
            channel,
            code: JSON.stringify(changes, null, 2),
            threadTs: slackDebugResponse.ts,
        });
    }
}

async function notifyBuildFailure(
    changes: GitChange[],
    runContext: RunContext,
    channel: string,
    userDisplayType: UserDisplayType
) {
    if (runContext.status === 'failure') {
        await sendFailureSlackMessage(changes, runContext, channel, userDisplayType);
    }
}

async function notifyStagingDeploy(
    runContext: RunContext,
    changes: GitChange[],
    userDisplayType: UserDisplayType,
    channel: string
) {
    const { currentSha, lastSuccessfulSha, runId, project, deployToStaging } = runContext;

    let slackMessage;

    if (deployToStaging) {
        const { changesText } = getChangesData(currentSha, lastSuccessfulSha, project, changes, userDisplayType);
        const webUrl = `https://github.com/ag-grid/ag-grid/actions/runs/${runId}`;
        const stagingUrl = getStagingUrl(project);
        const emoji = getEmoji(project);

        const text = `:rocket: ${emoji} ${project} changes were deployed to ${stagingUrl} (<${webUrl}|#${runId}>)\n${changesText}`;

        const res = await sendSlackMessage({
            data: {
                channel,
                text,
                unfurl_links: false,
            },
        });

        slackMessage = res.json();
    }

    return slackMessage ? await slackMessage : undefined;
}

async function processChanges(runContext: RunContext, userDisplayType: UserDisplayType) {
    try {
        const { project, currentSha, lastSuccessfulSha, status } = runContext;
        const changes = getGitChanges(currentSha, lastSuccessfulSha);

        // Notify slack debugging
        await notifySlackDebug(changes, runContext, SLACK_DEBUG_CHANNEL);

        // Notify slack of build failures
        let buildStatusChannel = GRID_TEAM_CITY_CHANNEL;
        if (project === 'AgCharts') {
            buildStatusChannel = CHARTS_TEAM_CITY_CHANNEL;
        }

        // we'll update slack regardless of whether state has changed
        // the calling context (ie in the CI github action) will detemine if this needs to be called, typically
        // on a build state change (ie success to failure or vice versa)
        if (status === 'failure') {
            await sendFailureSlackMessage(changes, runContext, buildStatusChannel, userDisplayType);
        } else if (status === 'success') {
            await sendSuccessSlackMessage(changes, runContext, buildStatusChannel, userDisplayType);
        }

        // Notify user when deployment to staging is done
        await notifyIndividualStagingDeploy(runContext, changes, userDisplayType);

        // Notify website status when staging deploy is finished
        await notifyStagingDeploy(runContext, changes, userDisplayType, WEBSITE_STATUS_CHANNEL);
    } catch (e) {
        console.log(e);
    }
}

(async () => {
    const runContext: RunContext = JSON.parse(args.runContext);
    runContext.status = Object.values(runContext.jobStatuses).every((status) => status === 'success')
        ? 'success'
        : 'failure';

    await processChanges(runContext, 'slack');
})();
