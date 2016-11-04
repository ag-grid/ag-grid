/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var NEWLINE = '\n';
var SEP = '  -------------  ';
var IGNORE_FRAMES = [];
var creationTrace = '__creationTrace__';
var LongStackTrace = (function () {
    function LongStackTrace() {
        this.error = getStacktrace();
        this.timestamp = new Date();
    }
    return LongStackTrace;
}());
function getStacktraceWithUncaughtError() {
    return new Error('STACKTRACE TRACKING');
}
function getStacktraceWithCaughtError() {
    try {
        throw getStacktraceWithUncaughtError();
    }
    catch (e) {
        return e;
    }
}
// Some implementations of exception handling don't create a stack trace if the exception
// isn't thrown, however it's faster not to actually throw the exception.
var error = getStacktraceWithUncaughtError();
var coughtError = getStacktraceWithCaughtError();
var getStacktrace = error.stack ?
    getStacktraceWithUncaughtError :
    (coughtError.stack ? getStacktraceWithCaughtError : getStacktraceWithUncaughtError);
function getFrames(error) {
    return error.stack ? error.stack.split(NEWLINE) : [];
}
function addErrorStack(lines, error) {
    var trace = getFrames(error);
    for (var i = 0; i < trace.length; i++) {
        var frame = trace[i];
        // Filter out the Frames which are part of stack capturing.
        if (!(i < IGNORE_FRAMES.length && IGNORE_FRAMES[i] === frame)) {
            lines.push(trace[i]);
        }
    }
}
function renderLongStackTrace(frames, stack) {
    var longTrace = [stack];
    if (frames) {
        var timestamp = new Date().getTime();
        for (var i = 0; i < frames.length; i++) {
            var traceFrames = frames[i];
            var lastTime = traceFrames.timestamp;
            longTrace.push(SEP + " Elapsed: " + (timestamp - lastTime.getTime()) + " ms; At: " + lastTime + " " + SEP);
            addErrorStack(longTrace, traceFrames.error);
            timestamp = lastTime.getTime();
        }
    }
    return longTrace.join(NEWLINE);
}
Zone['longStackTraceZoneSpec'] = {
    name: 'long-stack-trace',
    longStackTraceLimit: 10,
    onScheduleTask: function (parentZoneDelegate, currentZone, targetZone, task) {
        var currentTask = Zone.currentTask;
        var trace = currentTask && currentTask.data && currentTask.data[creationTrace] || [];
        trace = [new LongStackTrace()].concat(trace);
        if (trace.length > this.longStackTraceLimit) {
            trace.length = this.longStackTraceLimit;
        }
        if (!task.data)
            task.data = {};
        task.data[creationTrace] = trace;
        return parentZoneDelegate.scheduleTask(targetZone, task);
    },
    onHandleError: function (parentZoneDelegate, currentZone, targetZone, error) {
        var parentTask = Zone.currentTask || error.task;
        if (error instanceof Error && parentTask) {
            var stackSetSucceded = null;
            try {
                var descriptor = Object.getOwnPropertyDescriptor(error, 'stack');
                if (descriptor && descriptor.configurable) {
                    var delegateGet_1 = descriptor.get;
                    var value_1 = descriptor.value;
                    descriptor = {
                        get: function () {
                            return renderLongStackTrace(parentTask.data && parentTask.data[creationTrace], delegateGet_1 ? delegateGet_1.apply(this) : value_1);
                        }
                    };
                    Object.defineProperty(error, 'stack', descriptor);
                    stackSetSucceded = true;
                }
            }
            catch (e) {
            }
            var longStack = stackSetSucceded ?
                null :
                renderLongStackTrace(parentTask.data && parentTask.data[creationTrace], error.stack);
            if (!stackSetSucceded) {
                try {
                    stackSetSucceded = error.stack = longStack;
                }
                catch (e) {
                }
            }
            if (!stackSetSucceded) {
                try {
                    stackSetSucceded = error.longStack = longStack;
                }
                catch (e) {
                }
            }
        }
        return parentZoneDelegate.handleError(targetZone, error);
    }
};
function captureStackTraces(stackTraces, count) {
    if (count > 0) {
        stackTraces.push(getFrames((new LongStackTrace()).error));
        captureStackTraces(stackTraces, count - 1);
    }
}
function computeIgnoreFrames() {
    var frames = [];
    captureStackTraces(frames, 2);
    var frames1 = frames[0];
    var frames2 = frames[1];
    for (var i = 0; i < frames1.length; i++) {
        var frame1 = frames1[i];
        var frame2 = frames2[i];
        if (frame1 === frame2) {
            IGNORE_FRAMES.push(frame1);
        }
        else {
            break;
        }
    }
}
computeIgnoreFrames();

})));
