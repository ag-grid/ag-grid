# AG Grid Playwright End To End Tests

[Playwright](https://playwright.dev/) can be used to run End-to-End tests on applications that use AG Grid.

In this folder there are some examples of how you might use Playwright to test different features of AG Grid.

## Playwright AG Grid Utils

The file [utils.ts](./utils.ts) contains some common helper methods that make testing AG Grid via Playwright a lot easier by enabling you to re-use common features. For example, waiting for cells to be renderer, or returning the value rendered in a particular cell.

## Example Tests

The tests in this folder can be run with the command `npm run test:playwright` and they will run against a number of examples from the ag-grid.com website. 

Some of the tests ([Custom Filter](./custom-filter.spec.ts)) run against every framework variation of the provided example. This highlights the advantage of e2e testing in that it is completely independent of the actual implementation details.

## Disclaimer

The examples and utils provided here are just for inspiration and do not represent a fully supported AG Grid Playwright wrapper at this point in time.