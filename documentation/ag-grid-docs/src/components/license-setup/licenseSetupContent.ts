// Static copy for the licence setup tool, shared by the interactive page component and the
// markdown twin of /license-install (see utils/markdoc/renderLicenseSetup.ts) so the two
// cannot drift. Sentences carrying inline markup are stored as parts, and links as paths, so
// each renderer builds its own markup and resolves URLs for its own environment.

export const LICENSE_SETUP_HEADINGS = {
    validate: { id: 'validate-your-license', text: 'Validate Your Licence' },
    configure: { id: 'configure-your-application', text: 'Configure Your Application' },
    dependencies: { id: 'add-your-dependencies', text: 'Add Your Dependencies' },
    bootstrap: { id: 'set-up-your-application', text: 'Set Up Your Application' },
    seedRepos: { id: 'seed-repos', text: 'Seed Repositories' },
};

export const LICENSE_SETUP_COPY = {
    dependenciesLead: {
        before: 'Copy the following dependencies into your',
        code: 'package.json',
        after: ':',
    },
    npmLead: 'Or install using npm:',
    bootstrapLead: 'An example of how to set up your AG Grid Enterprise License Key:',
    selectingModulesNote: {
        before: 'To minimise bundle size, only register the modules you want to use. See the',
        link: { text: 'Selecting Modules', url: './modules/#selecting-modules' },
        after: 'docs for more information.',
        // JavaScript only — the UMD bundle registers the modules for you.
        javascriptOnly: "If you're using the UMD bundle, you do not need to import or register the modules.",
    },
    olderVersionNote: {
        before: 'If you are using an AG Grid version before 33.0.0, please see the documentation for your',
        link: { text: 'version', url: '/documentation-archive/' },
        after: 'for help on installing your license key.',
    },
    seedReposLead: 'Here are some seed code repositories to get you started:',
    seedReposHeaders: ['GitHub Repo', 'Framework', 'Development Environment'],
};
