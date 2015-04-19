Contributing to Angular Grid
========================

The purpose of Angular Grid originally was to assist the author with his work. Having the project on Github was
done as part of releasing the project as Open Soruce. Placing the project on Github was not done with the
intention of accumulating contributors.

However having said that, the author welcomes those who wish to contribute who are very strong developers, by which
is meant:
1) Understanding of clean code concepts including encapsulation and loose coupling.
2) Understanding why the code in Angular Grid is easy to understand and be able to write similar code.
3) Appreciation of the full stack . . . if you have 10+ years writing code end to end, then you will be like minded to the author.
4) Be able to work in an environment that doesn't have unit tests. This a skill!!

Currently there are no tests in the project. This was done on purpose for the following reasons:
1. Only one developer working on the project, so he knows where the dependencies are. Tests are more important when more than one developer.
2. Major re-factoring being done constantly to the core project structure - which would constantly break tests.
3. Manual tests are in place (via the documentation examples) - and manual tests can pick up things (broken layout for example) that automated tests find difficult.

No unnecessary dependencies should be introduced. Angular Grid should be kept as accessible to everyone. The more
'cool libraries' that are introduced, the higher the learning curve for others.

The usage of AngularJS should be kept at an absolute bare minimum. Currently it's only optionally used by
user defined cell renderers. This is for two reasons a) AngularJS may not be the right choice in a lot
of areas eg Angular Grid does not use directives internally for speed reasons and b) it is the intent
the grid can work outside any library, or inside Angular 2.0, Web Components or any other future framework.

Similarly no other AngularJS modules should be included in Angular Grid.

No JQuery, underscore or lodash. These is to keep with minimal footprint of the project.

jshint and jslint should not be used. If we need those in the project, then we have the wrong developers.

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