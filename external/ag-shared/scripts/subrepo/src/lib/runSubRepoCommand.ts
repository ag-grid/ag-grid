import { createExec, createGetExecValue } from './exec';
import { TERMINAL_COLORS as tc } from './terminal-colors';

export type Command = 'push' | 'pull' | 'check';
export interface SubrepoCommandParams {
    command: Command;
    subRepoFolder: string;
    isVerbose?: boolean;
}

export function runSubRepoCommand({ command, subRepoFolder, isVerbose }: SubrepoCommandParams) {
    const getExecValue = createGetExecValue({ isVerbose });
    const exec = createExec({ isVerbose });

    // Check if .gitrepo parent is in sync with repo
    const gitRepoParentValue = getExecValue(
        `git config --file ${subRepoFolder}/.gitrepo subrepo.parent`,
        '.gitrepo parent value'
    );

    let gitRepoParentInSync = true;
    try {
        exec(
            `git merge-base --is-ancestor ${gitRepoParentValue} HEAD`,
            'Check if .gitrepo parent value is valid on this repo'
        );
    } catch (error) {
        gitRepoParentInSync = false;
    }

    if (!gitRepoParentInSync) {
        console.log(`⚠️  .gitrepo parent value (${tc.cyan}${gitRepoParentValue}${tc.reset}) is out of sync with repo`);
    }

    if (command === 'check') {
        if (gitRepoParentInSync) {
            console.log(
                `✅ Subrepo ${tc.cyan}${subRepoFolder}${tc.reset} is in a valid state with .gitrepo parent value ${tc.cyan}${gitRepoParentValue}${tc.reset}`
            );
        }
        return;
    }

    const latestCommit = getExecValue(`git log --format=%H -1`, 'Latest commit');

    // Update `.gitrepo` parent sha, so it is on HEAD and so that
    // `git subrepo` command works.
    // Needed when a rebase/amend has occured after a subrepo command
    // has occurred, which changes the commit shas.
    if (!gitRepoParentInSync) {
        const gitRepoParentsCommit = getExecValue(
            `git log --format=%P --follow -1 ${subRepoFolder}/.gitrepo`,
            'Parent of last .gitrepo file commit'
        );
        // Should only be 1 parent, but in case there are multiple eg, a merge commit, take first parent
        const gitRepoParentCommit = gitRepoParentsCommit.split(' ')[0];

        exec(
            `git config --file ${subRepoFolder}/.gitrepo subrepo.parent ${gitRepoParentCommit}`,
            'Update .gitrepo file with parent'
        );
        exec('git commit -am "Update .gitrepo parent sha"');
        console.log(`✅ .gitrepo parent value updated to ${tc.cyan}${gitRepoParentCommit}${tc.reset}`);
    }

    const subRepoCmdOut = getExecValue(`git subrepo ${command} ${subRepoFolder}`);
    const isUpToDate = subRepoCmdOut.includes('is up to date') || subRepoCmdOut.includes('has no new commits');

    if (isUpToDate) {
        console.log(`✅ Subrepo ${tc.cyan}${subRepoFolder}${tc.reset} is up to date`);
    } else {
        if (!gitRepoParentInSync) {
            const subRepoCmdSha = getExecValue(`git log --format=%H -1`, 'Subrepo command sha');
            exec(`git reset --soft HEAD~2`, 'Soft reset last 2 commits, so that it can be squashed later');

            exec(
                `git config --file ${subRepoFolder}/.gitrepo subrepo.parent ${latestCommit}`,
                'Update `.gitrepo` parent to previous latest commit, so that in the upcoming commit, the parent is still valid'
            );
            exec(`git add ${subRepoFolder}/.gitrepo`);

            exec(`git commit --reuse-message ${subRepoCmdSha}`);
        }

        console.log(`✅ Subrepo ${tc.cyan}${subRepoFolder}${tc.reset} has been ${command}ed and is up to date`);
    }
}
