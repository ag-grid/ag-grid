export const getPageName = path => {
    const parts = path.split('/').filter(p => p !== '');
    const pageName = parts[parts.length - 1];

    return parts.length > 0 && parts[0].endsWith('-charts') ? `charts-${pageName}` : pageName;
};
