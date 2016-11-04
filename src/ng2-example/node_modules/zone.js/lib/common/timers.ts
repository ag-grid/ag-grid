/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {patchMethod} from './utils';

interface TimerOptions extends TaskData {
  handleId: number;
  args: any[];
}

export function patchTimer(window: any, setName: string, cancelName: string, nameSuffix: string) {
  var setNative = null;
  var clearNative = null;
  setName += nameSuffix;
  cancelName += nameSuffix;

  const tasksByHandleId: {[id: number]: Task} = {};

  function scheduleTask(task: Task) {
    const data = <TimerOptions>task.data;
    data.args[0] = function() {
      task.invoke.apply(this, arguments);
      delete tasksByHandleId[data.handleId];
    };
    data.handleId = setNative.apply(window, data.args);
    tasksByHandleId[data.handleId] = task;
    return task;
  }

  function clearTask(task: Task) {
    delete tasksByHandleId[(<TimerOptions>task.data).handleId];
    return clearNative((<TimerOptions>task.data).handleId);
  }

  setNative =
      patchMethod(window, setName, (delegate: Function) => function(self: any, args: any[]) {
        if (typeof args[0] === 'function') {
          var zone = Zone.current;
          var options: TimerOptions = {
            handleId: null,
            isPeriodic: nameSuffix === 'Interval',
            delay: (nameSuffix === 'Timeout' || nameSuffix === 'Interval') ? args[1] || 0 : null,
            args: args
          };
          var task = zone.scheduleMacroTask(setName, args[0], options, scheduleTask, clearTask);
          if (!task) {
            return task;
          }
          // Node.js must additionally support the ref and unref functions.
          var handle = (<TimerOptions>task.data).handleId;
          if ((<any>handle).ref && (<any>handle).unref) {
            (<any>task).ref = (<any>handle).ref.bind(handle);
            (<any>task).unref = (<any>handle).unref.bind(handle);
          }
          return task;
        } else {
          // cause an error by calling it directly.
          return delegate.apply(window, args);
        }
      });

  clearNative =
      patchMethod(window, cancelName, (delegate: Function) => function(self: any, args: any[]) {
        var task: Task = typeof args[0] === 'number' ? tasksByHandleId[args[0]] : args[0];
        if (task && typeof task.type === 'string') {
          if (task.cancelFn && task.data.isPeriodic || task.runCount === 0) {
            // Do not cancel already canceled functions
            task.zone.cancelTask(task);
          }
        } else {
          // cause an error by calling it directly.
          delegate.apply(window, args);
        }
      });
}
