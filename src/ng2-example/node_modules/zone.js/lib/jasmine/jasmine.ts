/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';
(() => {
  var __extends = function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  // Patch jasmine's describe/it/beforeEach/afterEach functions so test code always runs
  // in a testZone (ProxyZone). (See: angular/zone.js#91 & angular/angular#10503)
  if (!Zone) throw new Error('Missing: zone.js');
  if (typeof jasmine == 'undefined') throw new Error('Missing: jasmine.js');
  if (jasmine['__zone_patch__'])
    throw new Error('\'jasmine\' has already been patched with \'Zone\'.');
  jasmine['__zone_patch__'] = true;

  const SyncTestZoneSpec: {new (name: string): ZoneSpec} = Zone['SyncTestZoneSpec'];
  const ProxyZoneSpec: {new (): ZoneSpec} = Zone['ProxyZoneSpec'];
  if (!SyncTestZoneSpec) throw new Error('Missing: SyncTestZoneSpec');
  if (!ProxyZoneSpec) throw new Error('Missing: ProxyZoneSpec');

  const ambientZone = Zone.current;
  // Create a synchronous-only zone in which to run `describe` blocks in order to raise an
  // error if any asynchronous operations are attempted inside of a `describe` but outside of
  // a `beforeEach` or `it`.
  const syncZone = ambientZone.fork(new SyncTestZoneSpec('jasmine.describe'));

  // This is the zone which will be used for running individual tests.
  // It will be a proxy zone, so that the tests function can retroactively install
  // different zones.
  // Example:
  //   - In beforeEach() do childZone = Zone.current.fork(...);
  //   - In it() try to do fakeAsync(). The issue is that because the beforeEach forked the
  //     zone outside of fakeAsync it will be able to escope the fakeAsync rules.
  //   - Because ProxyZone is parent fo `childZone` fakeAsync can retroactively add
  //     fakeAsync behavior to the childZone.
  let testProxyZone: Zone = null;

  // Monkey patch all of the jasmine DSL so that each function runs in appropriate zone.
  const jasmineEnv = jasmine.getEnv();
  ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
    let originalJasmineFn: Function = jasmineEnv[methodName];
    jasmineEnv[methodName] = function(description: string, specDefinitions: Function) {
      return originalJasmineFn.call(this, description, wrapDescribeInZone(specDefinitions));
    };
  });
  ['it', 'xit', 'fit'].forEach((methodName) => {
    let originalJasmineFn: Function = jasmineEnv[methodName];
    jasmineEnv[methodName] = function(
        description: string, specDefinitions: Function, timeout: number) {
      arguments[1] = wrapTestInZone(specDefinitions);
      return originalJasmineFn.apply(this, arguments);
    };
  });
  ['beforeEach', 'afterEach'].forEach((methodName) => {
    let originalJasmineFn: Function = jasmineEnv[methodName];
    jasmineEnv[methodName] = function(specDefinitions: Function, timeout: number) {
      arguments[0] = wrapTestInZone(specDefinitions);
      return originalJasmineFn.apply(this, arguments);
    };
  });

  /**
   * Gets a function wrapping the body of a Jasmine `describe` block to execute in a
   * synchronous-only zone.
   */
  function wrapDescribeInZone(describeBody: Function): Function {
    return function() {
      return syncZone.run(describeBody, this, arguments as any as any[]);
    };
  }

  /**
   * Gets a function wrapping the body of a Jasmine `it/beforeEach/afterEach` block to
   * execute in a ProxyZone zone.
   * This will run in `testProxyZone`. The `testProxyZone` will be reset by the `ZoneQueueRunner`
   */
  function wrapTestInZone(testBody: Function): Function {
    // The `done` callback is only passed through if the function expects at least one argument.
    // Note we have to make a function with correct number of arguments, otherwise jasmine will
    // think that all functions are sync or async.
    return (testBody.length == 0) ? function() {
      return testProxyZone.run(testBody, this);
    } : function(done) {
      return testProxyZone.run(testBody, this, [done]);
    };
  }
  interface QueueRunner {
    execute(): void;
  }
  interface QueueRunnerAttrs {
    queueableFns: {fn: Function}[];
    onComplete: () => void;
    clearStack: (fn) => void;
    onException: (error) => void;
    catchException: () => boolean;
    userContext: any;
    timeout: {setTimeout: Function, clearTimeout: Function};
    fail: () => void;
  }

  const QueueRunner = (jasmine as any).QueueRunner as {new (attrs: QueueRunnerAttrs): QueueRunner};
  (jasmine as any).QueueRunner = (function(_super) {
    __extends(ZoneQueueRunner, _super);
    function ZoneQueueRunner(attrs) {
      attrs.onComplete = ((fn) => () => {
        // All functions are done, clear the test zone.
        testProxyZone = null;
        ambientZone.scheduleMicroTask('jasmine.onComplete', fn);
      })(attrs.onComplete);
      _super.call(this, attrs);
    }
    ZoneQueueRunner.prototype.execute = function() {
      if (Zone.current !== ambientZone) throw new Error('Unexpected Zone: ' + Zone.current.name);
      testProxyZone = ambientZone.fork(new ProxyZoneSpec());
      if (!Zone.currentTask) {
        // if we are not running in a task then if someone would register a
        // element.addEventListener and then calling element.click() the
        // addEventListener callback would think that it is the top most task and would
        // drain the microtask queue on element.click() which would be incorrect.
        // For this reason we always force a task when running jasmine tests.
        Zone.current.scheduleMicroTask(
            'jasmine.execute().forceTask', () => QueueRunner.prototype.execute.call(this));
      } else {
        _super.prototype.execute.call(this);
      }
    };
    return ZoneQueueRunner;
  }(QueueRunner));
})();
