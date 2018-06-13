exports.config = {
    baseUrl: 'http://localhost:8085/src',

    framework: 'jasmine',

    chromeDriver: "../../node_modules/webdriver-manager/selenium/chromedriver_2.31",
    seleniumServerJar: "../../node_modules/webdriver-manager/selenium/selenium-server-standalone-3.5.2.jar",

    specs: [
        '../e2e/javascript-getting-started/example-js.spec.js',
        '../e2e/javascript-grid-tool-panel/toolPanelExample.spec.js'
    ]
};
