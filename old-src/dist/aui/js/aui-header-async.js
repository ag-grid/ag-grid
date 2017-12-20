/*!
 * @atlassian/aui - Atlassian User Interface Framework
 * @version v6.0.4
 * @link https://docs.atlassian.com/aui/latest/
 * @license Apache-2.0
 * @author [object Object]
 */
// node_modules/@atlassian/aui/src/js/aui/header-async.js
(typeof window === 'undefined' ? global : window).__b85c25eb273a1b11a40084d04bbc6270 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _createHeader = __906ea2ee8af7ec57662c322a720a678d;
  
  var _createHeader2 = _interopRequireDefault(_createHeader);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var Header = (0, _skate2.default)('aui-header', {
      type: _skate2.default.type.CLASSNAME,
      created: function created(element) {
          (0, _createHeader2.default)(element);
      }
  });
  
  exports.default = Header;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui-header-async.js
(typeof window === 'undefined' ? global : window).__cd42d52e686ff2556c1817c4b6ada6a2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  __b85c25eb273a1b11a40084d04bbc6270;
  
  exports.default = window.AJS;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/js/aui-header-async.js
(typeof window === 'undefined' ? global : window).__942dfd3d537dce4977739dad471cd009 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _auiHeaderAsync = __cd42d52e686ff2556c1817c4b6ada6a2;
  
  var _auiHeaderAsync2 = _interopRequireDefault(_auiHeaderAsync);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _auiHeaderAsync2.default;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);