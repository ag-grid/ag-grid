module.exports = (pagePath, framework) => {
    const url = pagePath.startsWith('/charts-') ?
        `/${framework}-charts${pagePath.replace('/charts-', '/')}` :
        `/${framework}-grid${pagePath}`;

    return url.endsWith('/') || url.includes('#') ? url : `${url}/`;
};
