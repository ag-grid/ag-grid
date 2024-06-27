export const parseVersion = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch, isMajor: !minor && !patch };
};
