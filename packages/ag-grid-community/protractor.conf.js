exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
        'e2e/*spec.js'
    ],
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['--headless', '--no-sandbox', '--disable-extensions', '--disable-dev-shm-usage']
        }
    }
};
