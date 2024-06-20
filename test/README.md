## ag-grid behavioural unit testing

In this project ag-grid is tested as a black box, we test the behaviour at the edges.
We use emulated DOM and we instantiate the full grid as it is to test complex behaviours.

The unit under test here is a behaviour, not a function, a class, a method, or a file.

Mocking is to be avoided as much as possible here, and the use of fakes is preferred (for example this project uses fake DOM).

## Running tests

To execute test, run in the root folder:

```sh
npx jest -c ./test/jest.config.js
```

## More about behavioural unit testing - classicist vs mockist

-   https://www.youtube.com/watch?v=EZ05e7EMOLM
-   https://martinfowler.com/articles/mocksArentStubs.html
