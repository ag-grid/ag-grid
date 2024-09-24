import { execSync } from 'child_process';

import { TERMINAL_COLORS as tc } from './terminal-colors';

export const createGetExecValue =
    ({ isVerbose }: { isVerbose?: boolean }) =>
    (cmd: string, label?: string) => {
        if (isVerbose) {
            let msg = '> ';
            if (label) {
                msg += `${tc.grey}# ${label}${tc.reset}`;
                msg += '\n  ';
            }
            msg += `${tc.green}${cmd}${tc.reset}`;

            console.log(msg);
        }

        const value = execSync(cmd).toString().trim();

        if (isVerbose) {
            const msg = `= ${tc.cyan}${value}${tc.reset}`;
            console.log(msg);
        }

        return value;
    };

export const createExec =
    ({ isVerbose }: { isVerbose?: boolean }) =>
    (cmd: string, label?: string) => {
        if (isVerbose) {
            let msg = '> ';
            if (label) {
                msg += `${tc.grey}# ${label}${tc.reset}`;
                msg += '\n  ';
            }
            msg += `${tc.green}${cmd}${tc.reset}`;

            console.log(msg);
        }
        const output = execSync(cmd);

        if (isVerbose) {
            console.log(output.toString());
        }
    };
