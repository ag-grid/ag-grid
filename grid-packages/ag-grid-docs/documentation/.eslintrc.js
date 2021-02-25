module.exports = {
    globals: {
        __PATH_PREFIX__: true
    },
    settings:{
        react: {
            version: 'detect'
        }
    },
    extends: 'react-app',
    rules: {
        'import/no-anonymous-default-export': 'off'
    }
};
