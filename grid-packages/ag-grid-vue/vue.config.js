module.exports = {
    configureWebpack: {
        output: {
            library: "agGridVue"
        },
        externals: {
            'ag-grid-community': 'agGrid'
        }
    }
}
