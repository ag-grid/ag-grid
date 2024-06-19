let env = 'unknown';
if (process.env.CI != null) {
    env = 'ci';
} else if (process.env.NX_TASK_TARGET_PROJECT != null) {
    env = 'nx-task';
}

module.exports = {
    extends: ['../../.eslintrc.json', 'plugin:sonarjs/recommended'],
    ignorePatterns: ['!**/*', '.dependency-cruiser.js', '.eslintrc.js'],
    rules: {},
    overrides: [
        {
            files: ['*.test.ts', '*.test.tsx', '**/test/*.ts'],
            rules: {
                'sonarjs/no-duplicate-string': 0,
            },
        },
    ],
};
