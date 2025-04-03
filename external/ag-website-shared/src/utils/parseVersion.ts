export interface ParsedVersion {
    major: number;
    minor: number;
    patch: string;
    patchNum: number;
    patchBeta: string;
    versionType: string;
    isMajor: boolean;
}

export const parseVersion = (version: string): ParsedVersion => {
    const versionSplit = version.split('.');
    const major = Number(versionSplit[0]);
    const minor = Number(versionSplit[1]);
    const patch = version.slice(`${major}.${minor}.`.length);
    const patchSplit = patch.split('-');
    const patchNum = Number(patchSplit[0]);
    const patchBeta = patchSplit[1];
    const versionType = patchNum !== 0 ? 'Patch' : minor !== 0 ? 'Minor' : 'Major';
    const isMajor = !minor && patch === '0';

    return { major, minor, patch, patchNum, patchBeta, versionType, isMajor };
};
