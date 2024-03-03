module.exports = {
    configureWebpack: {
        output: {
            library: "agGridVue"
        },
        externals: {
            'ag-grid-community': 'agGrid',
            vue: {
                commonjs: 'vue',
                commonjs2: 'vue',
                root: 'Vue',
                amd: 'vue'
            }
        }
    }
}
