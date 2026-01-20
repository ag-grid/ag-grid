import { execSync } from 'child_process';

const removeNewlineRegex = /\n/gm;

export const getGitHash = () => execSync('git rev-parse HEAD').toString().replace(removeNewlineRegex, '');

export const getGitShortHash = () =>
    execSync('git rev-parse --short=8 HEAD').toString().replace(removeNewlineRegex, '');

export const getGitDate = () =>
    execSync('git --no-pager log -1 --format="%ai"').toString().replace(removeNewlineRegex, '');
