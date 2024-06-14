import { readdirSync } from 'fs';
import prompts from 'prompts';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { type Command, type SubrepoCommandParams, runSubRepoCommand } from './lib/runSubRepoCommand';
import { TERMINAL_COLORS as tc } from './lib/terminal-colors';

const SUBREPO_FOLDER = 'external';
const subRepos = readdirSync(SUBREPO_FOLDER, { withFileTypes: true })
    .filter((entry: any) => entry.isDirectory())
    .map((directory: any) => directory.name);

const runCommand = ({ command, subRepoFolder, isVerbose }: SubrepoCommandParams) => {
    try {
        runSubRepoCommand({ command, subRepoFolder, isVerbose });
    } catch (error: any) {
        if (error.stdout) {
            const output = error.stdout.toString() || error.message;
            const msg = `ERROR:\n${tc.red}${output}${tc.reset}`;
            console.error(msg);
        } else {
            console.error(error);
        }
    }
};

const getPromptSubrepo = async ({ command }: { command: string }) => {
    const { promptSubrepo } = await prompts({
        type: 'select',
        name: 'promptSubrepo',
        message: `Which subrepo do you want to run "${command}" on?`,
        choices: [
            {
                title: '- Cancel -',
                value: false,
            },
        ].concat(
            subRepos.map((repo) => {
                return {
                    title: repo,
                    value: repo,
                };
            })
        ),
    });

    return promptSubrepo;
};

yargs(hideBin(process.argv))
    .usage('Usage: <command> [options]')
    .command(
        '$0 <command>',
        'Wrapper for `git subrepo` commands',
        (yargs) => {
            return yargs.positional('command', {
                describe:
                    'Git subrepo command\n\n' +
                    'push: git subrepo push\n' +
                    'pull: git subrepo pull\n' +
                    'check: Check whether .gitrepo is in a valid state\n',
                choices: ['push', 'pull', 'check'],
            });
        },
        async (argv) => {
            let { subrepo, command, verbose } = argv;

            if (!subrepo) {
                const promptSubrepo = await getPromptSubrepo({ command: command! });
                if (!promptSubrepo) {
                    return;
                }

                subrepo = promptSubrepo;
            }

            runCommand({
                command: command as Command,
                subRepoFolder: `${SUBREPO_FOLDER}/${subrepo}`,
                isVerbose: Boolean(verbose),
            });
        }
    )
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
    })
    .option('subrepo', {
        alias: 's',
        choices: subRepos,
        description: 'Subrepo to run the command on',
    })
    .help()
    .parse();
