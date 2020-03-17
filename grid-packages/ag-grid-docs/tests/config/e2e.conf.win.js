exports.config = {
    baseUrl: 'http://localhost:8085/src',

    framework: 'jasmine',

    chromeDriver: "../../node_modules/webdriver-manager/selenium/chromedriver_2.32.exe",
    seleniumServerJar: "../../node_modules/webdriver-manager/selenium/selenium-server-standalone-3.5.3.jar",

    specs: [
        '../e2e/javascript-grid/example-js.spec.js',
        '../e2e/javascript-grid-tool-panel/toolPanelExample.spec.js'
    ]
};
