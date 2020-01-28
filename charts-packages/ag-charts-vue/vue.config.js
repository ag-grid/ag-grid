module.exports = {
    chainWebpack: config => {
        config.externals({
            'ag-charts-community': 'agCharts'
        })
    }
};
