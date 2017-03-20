exports.config = {
    baseUrl: 'http://localhost:8090',

    framework: 'jasmine',

    chromeDriver: "../../node_modules/webdriver-manager/selenium/chromedriver_2.28",
    seleniumServerJar: "../../node_modules/webdriver-manager/selenium/selenium-server-standalone-3.3.1.jar",

    specs: [
        '../e2e/best-javascript-data-grid/example-js.spec.js',
        '../e2e/best-javascript-data-grid/html5grid.spec.js'
    ]
};