module.exports = (pagePath, framework) => {
    if (['changelog', 'pipeline', 'whats-new'].some(entry => pagePath.includes(entry))) {
        return pagePath.endsWith('/') || pagePath.includes('#') ? pagePath : `${pagePath}/`;
    }

    const url = pagePath.startsWith('/charts-') ?
        `/${framework}-charts${pagePath.replace('/charts-', '/')}` :
        `/${framework}-data-grid${pagePath}`;

    return url.endsWith('/') || url.includes('#') ? url : `${url}/`;
};
