## ag-grid behavioural unit testing

In this project ag-grid is tested as a black box, we test the grid at the edges, instantiating the full grid to test complex behaviours and features.

The unit under test here is a behaviour, not a function, a class, a method, or a file.

Mocking is to be avoided as much as possible here, and the use of fakes is preferred (for example this project uses fake DOM).

## Running tests

To execute all test, run in the root folder:

```sh
nx test ag-behavioural-testing
```

To execute a single test file

```sh
nx test ag-behavioural-testing -- --testFile=src/folder/filename.test.ts
```

To run in watch mode

```sh
nx test ag-behavioural-testing -- -w
```

## References:

-   https://www.youtube.com/watch?v=EZ05e7EMOLM
-   https://docs.google.com/presentation/d/1bEK7sOindHAMIyzFK59VMdjuSzC-NFG3hlUZkwLeGT8
-   https://martinfowler.com/articles/mocksArentStubs.html
-   https://agilewarrior.wordpress.com/2015/04/18/classical-vs-mockist-testing/
