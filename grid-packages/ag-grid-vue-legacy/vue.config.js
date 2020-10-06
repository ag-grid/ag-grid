module.exports = {
    chainWebpack: config => {
        config.externals({
            'ag-grid-community': 'agGrid'
        })
    }
}