let ag_grid_utils = require("ag-grid-testing");

describe('javascript-grid-tool-panel/exampleStatusBar.spec.js', function () {
    // not an angular application
    browser.ignoreSynchronization = true;

    beforeEach(() => {
        browser.get(browser.baseUrl + "/javascript-grid-tool-panel/toolPanelExample.html");
    });

    it('should have expected column headers', () => {
        ag_grid_utils.allElementsTextMatch(by.css(".ag-header-cell-text"), ['Athlete', 'Age', 'H Country', 'Year', 'Date', 'Sport', 'Total']);
    });

    it('should have expected grid data', () => {
        ag_grid_utils.verifyRowDataMatchesGridData(
            [
                {
                    "athlete": "Michael Phelps",
                    "age": "23",
                    "country": "United States",
                    "year": "2008",
                    "date": "24/08/2008",
                    "sport": "Swimming",
                    "totalAgg": "8"
                },
                {
                    "athlete": "Michael Phelps",
                    "age": "19",
                    "country": "United States",
                    "year": "2004",
                    "date": "29/08/2004",
                    "sport": "Swimming",
                    "totalAgg": "8"
                },
                {
                    "athlete": "Michael Phelps",
                    "age": "27",
                    "country": "United States",
                    "year": "2012",
                    "date": "12/08/2012",
                    "sport": "Swimming",
                    "totalAgg": "6"
                }
            ]
        );
    });

    it('tool panel should be present', () => {
        ag_grid_utils.verifyElementIsPresent(by.css(".ag-tool-panel"));
    });

    it('should have expected tool panel entries', () => {
        ag_grid_utils.allElementsTextMatch(by.css(".ag-tool-panel .ag-column-select-panel .ag-column-select-column .ag-column-select-label"), ['Athlete', 'Age', 'TP Country', 'Year', 'Date', 'Sport', 'Gold', 'Silver', 'Bronze', 'Total']);
    });
});