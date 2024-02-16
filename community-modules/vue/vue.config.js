module.exports = {
    chainWebpack: config => {
        config
            .externals({
                'ag-grid-community': 'agGrid'
            })
            .performance
            .hints(false)
    }
}
