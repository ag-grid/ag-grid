/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindArguments} from '../common/utils';

let fs;
try {
  fs = require('fs');
} catch (err) {
}

// TODO(alxhub): Patch `watch` and `unwatchFile`.
const TO_PATCH = [
  'access',  'appendFile', 'chmod',    'chown',    'close',     'exists',    'fchmod',
  'fchown',  'fdatasync',  'fstat',    'fsync',    'ftruncate', 'futimes',   'lchmod',
  'lchown',  'link',       'lstat',    'mkdir',    'mkdtemp',   'open',      'read',
  'readdir', 'readFile',   'readlink', 'realpath', 'rename',    'rmdir',     'stat',
  'symlink', 'truncate',   'unlink',   'utimes',   'write',     'writeFile',
];

if (fs) {
  TO_PATCH.filter(name => !!fs[name] && typeof fs[name] === 'function').forEach(name => {
    fs[name] = ((delegate: Function) => {
      return function() {
        return delegate.apply(this, bindArguments(<any>arguments, 'fs.' + name));
      };
    })(fs[name]);
  });
}
