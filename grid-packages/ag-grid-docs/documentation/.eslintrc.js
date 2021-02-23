/**
 * Gatsby comes pre-configured with linting rules which are useful to use
 * (https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/eslint-config.ts)
 * However, IDEs e.g. VS Code do not pick these up automatically, so we have this config file in the root directory
 * which provides some linting rules to be used in the IDE. They are not exactly the same as the Gatsby ones as there
 * does not seem to be any simple way to just import the rules from Gatsby, and we would rather not just copy them into
 * our repo and have to maintain them here, but this imports the same react-app template that the Gatsby rules build upon.
 *
 * This file is hidden from Gatsby when the process starts, so that Gatsby will use its default linting rules. You will
 * therefore sometimes see warnings in the Gatsby process that do not appear inline in your IDE.
 */
module.exports = {
    globals: {
        __PATH_PREFIX__: true,
    },
    extends: `react-app`,
};