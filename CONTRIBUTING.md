Contributing to Angular Grid
========================

Hello, welcome to Angular Grid.

The author is busy developing out the core features of the grid. There is a big
design in his head and he is trying to bang it into code as quickly as he can!!

While this is happening, tests are non existent in the project. This is because
the style of programming being used is 'evolutionary prototyping'. That means
that large areas of the code are being re-factored constantly. While the overall
design is in large flux, maintaining tests is more difficult.

Once the core areas are fleshed out, with design settled, then the author will be
introducing tests.

A few words on other design choices:
+ No JQuery, underscore or lodash. These is to keep with minimal footprint of the project
  and make sure the code performs super fast.
+ Use of AngularJS is not used internally in the project. This is only an option for
  client provided renderers. This is on purpose to a) keep the grid and b) allow
  the grid to be used in other environments (either vanilla Javascript, or with other
  frameworks such as Angular 2 and Web Components).
+ jshint and jslint are not to be used right now. The author intends code reviewing
  manually any pull requests.

Using issues
------------

The [issue tracker](https://github.com/ceolter/angular-grid/issues) is the preferred channel for reporting bugs, requesting new features and submitting pull requests.

Reporting bugs
--------------

Well structured, detailed bug reports are hugely valuable for the project.

Guidelines for reporting bugs:

 - Check the issue search to see if it has already been reported
 - Isolate the problem to a simple test case
 - Provide a demonstration of the problem on [JS Bin](http://jsbin.com) or similar

Please provide any additional details associated with the bug, if it's browser or screen density specific, or only happens with a certain configuration or data.


Pull requests
-------------

Clear, concise pull requests are excellent at continuing the project's community driven growth. But please review [these guidelines](https://github.com/blog/1943-how-to-write-the-perfect-pull-request) and the guidelines below before starting work on the project.

Guidelines:

 - Please create an issue first:
   - For bugs, we can discuss the fixing approach
   - For enhancements, we can discuss if it is within the project scope and avoid duplicate effort
 - Please make changes to the files in [`/src`](https://github.com/ceolter/angular-grid/tree/master/src), not `Angular Grid` or `angularGrid.min.js` in the repo root directory, this avoids merge conflicts
 - If adding new functionality, please also update the relevant `.md` file in [`/docs`](https://github.com/ceolter/angular-grid/tree/master/docs)
 - Please make your commits in logical sections with clear commit messages

License
-------

By contributing your code, you agree to license your contribution under the [MIT license](https://github.com/ceolter/angular-grid/blob/master/LICENSE.md).