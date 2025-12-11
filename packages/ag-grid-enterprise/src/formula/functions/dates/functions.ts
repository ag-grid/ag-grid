export const NOW = (): Date => new Date();

export const TODAY = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
