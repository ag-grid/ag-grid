export const getPageName = path => {
    let parts = path.split('/').filter(p => p !== '');

    return parts[parts.length - 1];
};
