module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json'
        }
    },
    transform: {
        '^.+\\.(t|j)sx?$': '<rootDir>/jest-preprocess.js',
    },
    moduleNameMapper: {
        '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
        '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/file-mock.js',
        "^gatsby-core-utils/(.*)$": `gatsby-core-utils/dist/$1`, // Workaround for https://github.com/facebook/jest/issues/9771
        "^gatsby-plugin-utils/(.*)$": [
            `gatsby-plugin-utils/dist/$1`,
            `gatsby-plugin-utils/$1`,
        ], // Workaround for https://github.com/facebook/jest/issues/9771
        "^gatsby-page-utils/(.*)$": `gatsby-page-utils/dist/$1`, // Workaround for https://github.com/facebook/jest/issues/9771
    },
    moduleDirectories: ['src', 'node_modules'],
    testPathIgnorePatterns: ['node_modules', '\\.cache', '<rootDir>.*/public', '<rootDir>.*/doc-pages'],
    transformIgnorePatterns: ['node_modules/(?!(gatsby)/)'],
    globals: {
        __PATH_PREFIX__: '',
    },
    setupFiles: ['<rootDir>/loadershim.js'],
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    modulePathIgnorePatterns: ['<rootDir>/doc-pages', '<rootDir>/public/examples']
}
