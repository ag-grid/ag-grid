module.exports = (pagePath, framework) => {
    const url = pagePath.startsWith('/charts-') ?
        `/${framework}-charts${pagePath.replace('/charts-', '/')}` :
        `/${framework}-table${pagePath}`;

    return url.endsWith('/') ? url : `${url}/`;
};
