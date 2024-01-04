module.exports = {
    chainWebpack: config => {
        config
            .externals({
                'ag-grid-community': 'agGrid',
                vue: {
                    commonjs: 'vue',
                    commonjs2: 'vue',
                    root: 'Vue',
                    amd: 'vue'
                }
            })
            .performance
            .hints(false)
    }
}

