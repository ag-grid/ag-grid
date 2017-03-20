let ag_grid_utils = require("ag-grid-testing");

describe('best-javascript-data-grid/html5grid.spec.js', function () {
    // not an angular application
    browser.ignoreSynchronization = true;

    beforeEach(() => {
        browser.get(browser.baseUrl + "/best-javascript-data-grid/html5grid.html");
    });

    it('should have expected column headers', () => {
        ag_grid_utils.allElementsTextMatch(by.css(".ag-header-cell-text"),
            ['#', 'Name', 'Country', 'Skills', 'Proficiency', 'Mobile', 'Land-line']);
    });

    it('should have expected grid data with no (default) sort', () => {
        ag_grid_utils.verifyRowDataMatchesGridData(
            [
                {
                    "name": "Sophie Beckham",
                    "proficiency": "6%",
                    "country": "Ireland",
                    "mobile": "+245 994 845 816",
                    "landline": "+113 263 581 621"
                },
                {
                    "name": "Isabelle Black",
                    "country": "Spain",
                    "mobile": "+444 1008 263 2910",
                    "landline": "+733 572 664 294"
                },
                {
                    "name": "Emily Braxton",
                    "country": "United Kingdom",
                    "mobile": "+824 288 579 1024",
                    "landline": "+993 304 648 456"
                }
            ]
        );

        ag_grid_utils.verifyCellContentAttributesContains(0, "3", "src", ['android', 'windows'], "img");
        ag_grid_utils.verifyCellContentAttributesContains(1, "3", "src", ['css', 'windows'], "img");
        ag_grid_utils.verifyCellContentAttributesContains(2, "3", "src", ['html5', 'windows'], "img");
    });

    it('should have expected grid data with asc sort', () => {
        ag_grid_utils.clickOnHeader("Name");

        // with animation, sometimes the test executes before animation is complete
        // wait a bit for the animation to finish
        browser.sleep(250);

        ag_grid_utils.verifyRowDataMatchesGridData(
            [
                {
                    "name": "Amelia Braxton",
                    "proficiency": "42%",
                    "country": "Germany",
                    "mobile": "+960 018 686 075",
                    "landline": "+743 1027 698 318"
                },
                {
                    "name": "Amelia Cadwell",
                    "proficiency": "35%",
                    "country": "Malta",
                    "mobile": "+797 658 638 753",
                    "landline": "+241 502 748 659"
                },
                {
                    "name": "Amelia Cage",
                    "proficiency": "60%",
                    "country": "Italy",
                    "mobile": "+037 361 841 217",
                    "landline": "+5100 758 339 185"
                }
            ]
        );

        ag_grid_utils.verifyCellContentAttributesContains(0, "3", "src", [], "img");
        ag_grid_utils.verifyCellContentAttributesContains(1, "3", "src", ['android', 'mac', 'css'], "img");
        ag_grid_utils.verifyCellContentAttributesContains(2, "3", "src", ['html5', 'windows'], "img");
    });

    it('should have expected grid data with desc sort', () => {
        ag_grid_utils.clickOnHeader("Name");
        ag_grid_utils.clickOnHeader("Name");

        // with animation, sometimes the test executes before animation is complete
        // wait a bit for the animation to finish
        browser.sleep(250);

        ag_grid_utils.verifyRowDataMatchesGridData(
            [
                {
                    "name": "Sophie Kobe",
                    "proficiency": "53%",
                    "country": "Germany",
                    "mobile": "+122 556 031 907",
                    "landline": "+775 714 611 048"
                },
                {
                    "name": "Sophie Kane",
                    "proficiency": "37%",
                    "country": "Peru",
                    "mobile": "+297 224 890 646",
                    "landline": "+1032 572 501 782"
                },
                {
                    "name": "Sophie Jacoby",
                    "proficiency": "18%",
                    "country": "Brazil",
                    "mobile": "+870 696 248 343",
                    "landline": "+820 806 128 452"
                }
            ]
        );

        ag_grid_utils.verifyCellContentAttributesContains(0, "3", "src", [], "img");
        ag_grid_utils.verifyCellContentAttributesContains(1, "3", "src", ['mac'], "img");
        ag_grid_utils.verifyCellContentAttributesContains(2, "3", "src", ['mac', 'windows'], "img");
    });
});