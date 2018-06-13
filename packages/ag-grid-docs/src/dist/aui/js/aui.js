/*!
 * @atlassian/aui - Atlassian User Interface Framework
 * @version v6.0.4
 * @link https://docs.atlassian.com/aui/latest/
 * @license Apache-2.0
 * @author [object Object]
 */
// node_modules/@atlassian/aui/src/js/aui/jquery.js
(typeof window === 'undefined' ? global : window).__307d3e18fd611f85395c67cddeb1fe24 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = window.jQuery || window.Zepto;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/create-element.js
(typeof window === 'undefined' ? global : window).__fd277fcde858b82a198666a405e85600 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function createElement() {
      var res = null;
  
      if (arguments.length && typeof arguments[0] === 'string') {
          res = (0, _jquery2.default)(document.createElement(arguments[0]));
  
          if (arguments.length === 2) {
              res.html(arguments[1]);
          }
      }
  
      //We can't use the deprecate module or we will introduce a circular dependency
      if (typeof console !== 'undefined' && console.warn) {
          console.warn('AJS\'s create element functionality has been deprecated since 5.9.0.\nNo alternative will be provided.\nUse document.createElement() or jQuery.parseHTML(), or preferably use a templating library.');
      }
  
      return res;
  }
  
  exports.default = createElement;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/object-assign/index.js
(typeof window === 'undefined' ? global : window).__20af9d35c28a1911e53d45bf2b6d5c6f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /* eslint-disable no-unused-vars */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  
  function toObject(val) {
  	if (val === null || val === undefined) {
  		throw new TypeError('Object.assign cannot be called with null or undefined');
  	}
  
  	return Object(val);
  }
  
  module.exports = Object.assign || function (target, source) {
  	var from;
  	var to = toObject(target);
  	var symbols;
  
  	for (var s = 1; s < arguments.length; s++) {
  		from = Object(arguments[s]);
  
  		for (var key in from) {
  			if (hasOwnProperty.call(from, key)) {
  				to[key] = from[key];
  			}
  		}
  
  		if (Object.getOwnPropertySymbols) {
  			symbols = Object.getOwnPropertySymbols(from);
  			for (var i = 0; i < symbols.length; i++) {
  				if (propIsEnumerable.call(from, symbols[i])) {
  					to[symbols[i]] = from[symbols[i]];
  				}
  			}
  		}
  	}
  
  	return to;
  };
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/globalize.js
(typeof window === 'undefined' ? global : window).__4d02fe17b8e885a34493e34af3d145dd = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (name, value) {
      window[NAMESPACE] = (0, _objectAssign2.default)(_createElement2.default, window[NAMESPACE]);
  
      return window[NAMESPACE][name] = value;
  };
  
  var _createElement = __fd277fcde858b82a198666a405e85600;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _objectAssign = __20af9d35c28a1911e53d45bf2b6d5c6f;
  
  var _objectAssign2 = _interopRequireDefault(_objectAssign);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var NAMESPACE = 'AJS';
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/deprecation.js
(typeof window === 'undefined' ? global : window).__c8cfa00f1eba9ac7af89ee3d0d33961d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.getMessageLogger = exports.propertyDeprecationSupported = exports.obj = exports.prop = exports.css = exports.construct = exports.fn = undefined;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var has = Object.prototype.hasOwnProperty;
  var deprecationCalls = [];
  var deprecatedSelectorMap = [];
  
  function toSentenceCase(str) {
      str += '';
  
      if (!str) {
          return '';
      }
  
      return str.charAt(0).toUpperCase() + str.substring(1);
  }
  
  function getDeprecatedLocation(printFrameOffset) {
      var err = new Error();
      var stack = err.stack || err.stacktrace;
      var stackMessage = stack && stack.replace(/^Error\n/, '') || '';
  
      if (stackMessage) {
          stackMessage = stackMessage.split('\n');
          return stackMessage[printFrameOffset + 2];
      }
      return stackMessage;
  }
  
  function logger() {
      if (typeof console !== 'undefined' && console.warn) {
          Function.prototype.apply.call(console.warn, console, arguments);
      }
  }
  
  /**
   * Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
   * It will also print the stack frame of the calling function.
   *
   * @param {string} displayName the name of the thing being deprecated
   * @param {object} options
   * @param {string} options.removeInVersion the version this will be removed in
   * @param {string} options.alternativeName the name of an alternative to use
   * @param {string} options.sinceVersion the version this has been deprecated since
   * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
   * @param {string} options.extraObject an extra object that will be printed at the end
   * @param {string} options.deprecationType type of the deprecation to append to the start of the deprecation message. e.g. JS or CSS
   * @return {Function} that logs the warning and stack frame of the calling function. Takes in an optional parameter for the offset of
   * the stack frame to print, the default is 0. For example, 0 will log it for the line of the calling function,
   * -1 will print the location the logger was called from
   */
  function getShowDeprecationMessage(displayName, options) {
      // This can be used internally to pas in a showmessage fn
      if (typeof displayName === 'function') {
          return displayName;
      }
  
      var called = false;
      options = options || {};
  
      return function (printFrameOffset) {
          var deprecatedLocation = getDeprecatedLocation(printFrameOffset ? printFrameOffset : 1) || '';
          // Only log once if the stack frame doesn't exist to avoid spamming the console/test output
          if (!called || deprecationCalls.indexOf(deprecatedLocation) === -1) {
              deprecationCalls.push(deprecatedLocation);
  
              called = true;
  
              var deprecationType = options.deprecationType + ' ' || '';
  
              var message = 'DEPRECATED ' + deprecationType + '- ' + toSentenceCase(displayName) + ' has been deprecated' + (options.sinceVersion ? ' since ' + options.sinceVersion : '') + ' and will be removed in ' + (options.removeInVersion || 'a future release') + '.';
  
              if (options.alternativeName) {
                  message += ' Use ' + options.alternativeName + ' instead. ';
              }
  
              if (options.extraInfo) {
                  message += ' ' + options.extraInfo;
              }
  
              if (deprecatedLocation === '') {
                  deprecatedLocation = ' \n ' + 'No stack trace of the deprecated usage is available in your current browser.';
              } else {
                  deprecatedLocation = ' \n ' + deprecatedLocation;
              }
  
              if (options.extraObject) {
                  message += '\n';
                  logger(message, options.extraObject, deprecatedLocation);
              } else {
                  logger(message, deprecatedLocation);
              }
          }
      };
  }
  
  function logCssDeprecation(selectorMap, newNode) {
      var displayName = selectorMap.options.displayName;
      displayName = displayName ? ' (' + displayName + ')' : '';
  
      var options = _jquery2.default.extend({
          deprecationType: 'CSS',
          extraObject: newNode
      }, selectorMap.options);
  
      getShowDeprecationMessage('\'' + selectorMap.selector + '\' pattern' + displayName, options)();
  }
  
  /**
  * Returns a wrapped version of the function that logs a deprecation warning when the function is used.
  * @param {Function} fn the fn to wrap
  * @param {string} displayName the name of the fn to be displayed in the message
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  * @return {Function} wrapping the original function
  */
  function deprecateFunctionExpression(fn, displayName, options) {
      options = options || {};
      options.deprecationType = options.deprecationType || 'JS';
  
      var showDeprecationMessage = getShowDeprecationMessage(displayName || fn.name || 'this function', options);
      return function () {
          showDeprecationMessage();
          return fn.apply(this, arguments);
      };
  }
  
  /**
  * Returns a wrapped version of the constructor that logs a deprecation warning when the constructor is instantiated.
  * @param {Function} constructorFn the constructor function to wrap
  * @param {string} displayName the name of the fn to be displayed in the message
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  * @return {Function} wrapping the original function
  */
  function deprecateConstructor(constructorFn, displayName, options) {
      options = options || {};
      options.deprecationType = options.deprecationType || 'JS';
  
      var deprecatedConstructor = deprecateFunctionExpression(constructorFn, displayName, options);
      deprecatedConstructor.prototype = constructorFn.prototype;
      _jquery2.default.extend(deprecatedConstructor, constructorFn); //copy static methods across;
  
      return deprecatedConstructor;
  }
  
  var supportsProperties = false;
  try {
      if (Object.defineProperty) {
          Object.defineProperty({}, 'blam', { get: function get() {}, set: function set() {} });
          exports.propertyDeprecationSupported = supportsProperties = true;
      }
  } catch (e) {}
  /* IE8 doesn't support on non-DOM elements */
  
  
  /**
  * Wraps a "value" object property in a deprecation warning in browsers supporting Object.defineProperty
  * @param {Object} obj the object containing the property
  * @param {string} prop the name of the property to deprecate
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateValueProperty(obj, prop, options) {
      if (supportsProperties) {
          var oldVal = obj[prop];
          options = options || {};
          options.deprecationType = options.deprecationType || 'JS';
  
          var displayNameOrShowMessageFn = options.displayName || prop;
          var showDeprecationMessage = getShowDeprecationMessage(displayNameOrShowMessageFn, options);
          Object.defineProperty(obj, prop, {
              get: function get() {
                  showDeprecationMessage();
                  return oldVal;
              },
              set: function set(val) {
                  oldVal = val;
                  showDeprecationMessage();
                  return val;
              }
          });
      }
  }
  
  /**
  * Wraps an object property in a deprecation warning, if possible. functions will always log warnings, but other
  * types of properties will only log in browsers supporting Object.defineProperty
  * @param {Object} obj the object containing the property
  * @param {string} prop the name of the property to deprecate
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateObjectProperty(obj, prop, options) {
      if (typeof obj[prop] === 'function') {
          options = options || {};
          options.deprecationType = options.deprecationType || 'JS';
  
          var displayNameOrShowMessageFn = options.displayName || prop;
          obj[prop] = deprecateFunctionExpression(obj[prop], displayNameOrShowMessageFn, options);
      } else {
          deprecateValueProperty(obj, prop, options);
      }
  }
  
  /**
  * Wraps all an objects properties in a deprecation warning, if possible. functions will always log warnings, but other
  * types of properties will only log in browsers supporting Object.defineProperty
  * @param {Object} obj the object to be wrapped
  * @param {string} objDisplayPrefix the object's prefix to be used in logs
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.alternativeNamePrefix the name of another object to prefix the deprecated objects properties with
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateAllProperties(obj, objDisplayPrefix, options) {
      options = options || {};
      for (var attr in obj) {
          if (has.call(obj, attr)) {
              options.deprecationType = options.deprecationType || 'JS';
              options.displayName = objDisplayPrefix + attr;
              options.alternativeName = options.alternativeNamePrefix && options.alternativeNamePrefix + attr;
              deprecateObjectProperty(obj, attr, _jquery2.default.extend({}, options));
          }
      }
  }
  
  function matchesSelector(el, selector) {
      return (el.matches || el.msMatchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector || el.oMatchesSelector).call(el, selector);
  }
  
  function handleAddingSelector(options) {
      return function (selector) {
          var selectorMap = {
              selector: selector,
              options: options || {}
          };
  
          deprecatedSelectorMap.push(selectorMap);
  
          // Search if matches have already been added
          var matches = document.querySelectorAll(selector);
          for (var i = 0; i < matches.length; i++) {
              logCssDeprecation(selectorMap, matches[i]);
          }
      };
  }
  
  /**
  * Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
  * It will also print the stack frame of the calling function.
  *
  * @param {string|Array} selectors a selector or list of selectors that match deprecated markup
  * @param {object} options
  * @param {string} options.displayName a name describing these selectors
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.removeInVersion the version these will be removed in
  * @param {string} options.sinceVersion the version these have been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateCSS(selectors, options) {
      if (!window.MutationObserver) {
          logger('CSS could not be deprecated as Mutation Observer was not found.');
          return;
      }
  
      if (typeof selectors === 'string') {
          selectors = [selectors];
      }
  
      selectors.forEach(handleAddingSelector(options));
  }
  
  function testAndHandleDeprecation(newNode) {
      return function (selectorMap) {
          if (matchesSelector(newNode, selectorMap.selector)) {
              logCssDeprecation(selectorMap, newNode);
          }
      };
  }
  
  if (window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
              // TODO - should this also look at class changes, if possible?
              var addedNodes = mutation.addedNodes;
  
              for (var i = 0; i < addedNodes.length; i++) {
                  var newNode = addedNodes[i];
                  if (newNode.nodeType === 1) {
                      deprecatedSelectorMap.forEach(testAndHandleDeprecation(newNode));
                  }
              }
          });
      });
  
      var config = {
          childList: true,
          subtree: true
      };
  
      observer.observe(document, config);
  }
  
  var deprecate = {
      fn: deprecateFunctionExpression,
      construct: deprecateConstructor,
      css: deprecateCSS,
      prop: deprecateObjectProperty,
      obj: deprecateAllProperties,
      propertyDeprecationSupported: supportsProperties,
      getMessageLogger: getShowDeprecationMessage
  };
  
  (0, _globalize2.default)('deprecate', deprecate);
  
  exports.fn = deprecateFunctionExpression;
  exports.construct = deprecateConstructor;
  exports.css = deprecateCSS;
  exports.prop = deprecateObjectProperty;
  exports.obj = deprecateAllProperties;
  exports.propertyDeprecationSupported = supportsProperties;
  exports.getMessageLogger = getShowDeprecationMessage;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/amdify.js
(typeof window === 'undefined' ? global : window).__574ac67f906effeb9d8ec2753b23cf28 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (name, fn) {
      if (window.define) {
          var alias = window.define;
          alias(name, [], function () {
              return fn;
          });
      }
      return fn;
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/log.js
(typeof window === 'undefined' ? global : window).__cf890abdf040e0993fb71f2f839bc972 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.error = exports.warn = exports.log = undefined;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function polyfillConsole(prop) {
      return function () {
          if (typeof console !== 'undefined' && console[prop]) {
              Function.prototype.apply.call(console[prop], console, arguments);
          }
      };
  }
  
  var log = polyfillConsole('log');
  var warn = polyfillConsole('warn');
  var error = polyfillConsole('error');
  
  (0, _globalize2.default)('error', error);
  (0, _globalize2.default)('log', log);
  (0, _globalize2.default)('warn', warn);
  
  exports.log = log;
  exports.warn = warn;
  exports.error = error;
  
  return module.exports;
}).call(this);
// node_modules/css.escape/css.escape.js
(typeof window === 'undefined' ? global : window).__73f814b2b65cefbd33b5011678834019 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__73f814b2b65cefbd33b5011678834019");
  define.amd = true;
  
  /*! https://mths.be/cssescape v1.5.0 by @mathias | MIT license */
  ;(function(root, factory) {
  	// https://github.com/umdjs/umd/blob/master/returnExports.js
  	if (typeof exports == 'object') {
  		// For Node.js.
  		module.exports = factory(root);
  	} else if (typeof define == 'function' && define.amd) {
  		// For AMD. Register as an anonymous module.
  		define([], factory.bind(root, root));
  	} else {
  		// For browser globals (not exposing the function separately).
  		factory(root);
  	}
  }(typeof global != 'undefined' ? global : this, function(root) {
  
  	if (root.CSS && root.CSS.escape) {
  		return root.CSS.escape;
  	}
  
  	// https://drafts.csswg.org/cssom/#serialize-an-identifier
  	var cssEscape = function(value) {
  		var string = String(value);
  		var length = string.length;
  		var index = -1;
  		var codeUnit;
  		var result = '';
  		var firstCodeUnit = string.charCodeAt(0);
  		while (++index < length) {
  			codeUnit = string.charCodeAt(index);
  			// Note: there’s no need to special-case astral symbols, surrogate
  			// pairs, or lone surrogates.
  
  			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
  			// (U+FFFD).
  			if (codeUnit == 0x0000) {
  				result += '\uFFFD';
  				continue;
  			}
  
  			if (
  				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
  				// U+007F, […]
  				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
  				// If the character is the first character and is in the range [0-9]
  				// (U+0030 to U+0039), […]
  				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
  				// If the character is the second character and is in the range [0-9]
  				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
  				(
  					index == 1 &&
  					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
  					firstCodeUnit == 0x002D
  				)
  			) {
  				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
  				result += '\\' + codeUnit.toString(16) + ' ';
  				continue;
  			}
  
  			if (
  				// If the character is the first character and is a `-` (U+002D), and
  				// there is no second character, […]
  				index == 0 &&
  				length == 1 &&
  				codeUnit == 0x002D
  			) {
  				result += '\\' + string.charAt(index);
  				continue;
  			}
  
  			// If the character is not handled by one of the above rules and is
  			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
  			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
  			// U+005A), or [a-z] (U+0061 to U+007A), […]
  			if (
  				codeUnit >= 0x0080 ||
  				codeUnit == 0x002D ||
  				codeUnit == 0x005F ||
  				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
  				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
  				codeUnit >= 0x0061 && codeUnit <= 0x007A
  			) {
  				// the character itself
  				result += string.charAt(index);
  				continue;
  			}
  
  			// Otherwise, the escaped character.
  			// https://drafts.csswg.org/cssom/#escape-a-character
  			result += '\\' + string.charAt(index);
  
  		}
  		return result;
  	};
  
  	if (!root.CSS) {
  		root.CSS = {};
  	}
  
  	root.CSS.escape = cssEscape;
  	return cssEscape;
  
  }));
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/inline-dialog.js
(typeof window === 'undefined' ? global : window).__8a05e920b7d8181524465449ac7de6d2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /*jshint quotmark:false, eqeqeq:false, strict:false */
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _css = __73f814b2b65cefbd33b5011678834019;
  
  var _css2 = _interopRequireDefault(_css);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Creates a new inline dialog.
   *
   * @param items jQuery object - the items that trigger the display of this popup when the user mouses over.
   * @param identifier A unique identifier for this popup. This should be unique across all popups on the page and a valid CSS class.
   * @param url The URL to retrieve popup contents.
   * @param options Custom options to change default behaviour. See InlineDialog.opts for default values and valid options.
   */
  function InlineDialog(items, identifier, url, options) {
      options = options || [];
  
      if (options.hasOwnProperty('onTop')) {
          onTopDeprecationLogger();
          if (options.onTop && options.gravity === undefined) {
              options.gravity = 's';
          }
      }
  
      // attempt to generate a random identifier if it doesn't exist
      if (typeof identifier === 'undefined') {
          identifier = String(Math.random()).replace('.', '');
  
          // if the generated supplied identifier already exists when combined with the prefixes we'll be using, then bail
          if ((0, _jquery2.default)('#inline-dialog-' + identifier + ', #arrow-' + identifier + ', #inline-dialog-shim-' + identifier).length) {
              throw 'GENERATED_IDENTIFIER_NOT_UNIQUE';
          }
      }
  
      var escapedIdentifier = (0, _css2.default)(identifier);
  
      var opts = _jquery2.default.extend(false, InlineDialog.opts, options);
      if (opts.gravity === 'w') {
          // TODO Once support for gravity: 'e' is added, it should also
          //      transpose the defaults for offsetX and offsetY.
          opts.offsetX = options.offsetX === undefined ? 10 : options.offsetX;
          opts.offsetY = options.offsetY === undefined ? 0 : options.offsetY;
      }
  
      var hash;
      var hideDelayTimer;
      var showTimer;
      var beingShown = false;
      var shouldShow = false;
      var contentLoaded = false;
      var mousePosition;
      var targetPosition;
      var popup = (0, _jquery2.default)('<div id="inline-dialog-' + identifier + '" class="aui-inline-dialog"><div class="aui-inline-dialog-contents contents"></div><div id="arrow-' + identifier + '" class="aui-inline-dialog-arrow arrow aui-css-arrow"></div></div>');
  
      var arrow = (0, _jquery2.default)('#arrow-' + escapedIdentifier, popup);
      var contents = popup.find('.contents');
  
      if (!opts.displayShadow) {
          contents.addClass('aui-inline-dialog-no-shadow');
      }
  
      if (opts.autoWidth) {
          contents.addClass('aui-inline-dialog-auto-width');
      } else {
          contents.width(opts.width);
      }
  
      contents.on({
          mouseenter: function mouseenter() {
              clearTimeout(hideDelayTimer);
              popup.unbind('mouseenter');
          },
          mouseleave: function mouseleave() {
              hidePopup();
          }
      });
  
      var getHash = function getHash() {
          if (!hash) {
              hash = {
                  popup: popup,
                  hide: function hide() {
                      hidePopup(0);
                  },
                  id: identifier,
                  show: function show() {
                      showPopup();
                  },
                  persistent: opts.persistent ? true : false,
                  reset: function reset() {
  
                      function drawPopup(popup, positions) {
                          //Position the popup using the left and right parameters
                          popup.css(positions.popupCss);
  
                          arrow.removeClass('aui-bottom-arrow aui-left-arrow aui-right-arrow');
                          if (positions.gravity === 's' && !arrow.hasClass('aui-bottom-arrow')) {
                              arrow.addClass('aui-bottom-arrow');
                          } else if (positions.gravity === 'w') {
                              arrow.addClass('aui-left-arrow');
                          } else if (positions.gravity === 'e') {
                              arrow.addClass('aui-right-arrow');
                          }
                          // Default styles are for 'n' gravity.
  
                          arrow.css(positions.arrowCss);
                      }
  
                      //DRAW POPUP
                      var viewportHeight = (0, _jquery2.default)(window).height();
                      var popupMaxHeight = Math.round(viewportHeight * 0.75);
                      popup.children('.aui-inline-dialog-contents').css('max-height', popupMaxHeight);
  
                      var positions = opts.calculatePositions(popup, targetPosition, mousePosition, opts);
                      if (positions.hasOwnProperty('displayAbove')) {
                          displayAboveDeprecationLogger();
                          positions.gravity = positions.displayAbove ? 's' : 'n';
                      }
  
                      drawPopup(popup, positions);
  
                      // reset position of popup box
                      popup.fadeIn(opts.fadeTime, function () {
                          // once the animation is complete, set the tracker variables
                          // beingShown = false; // is this necessary? Maybe only the shouldShow will have to be reset?
                      });
  
                      if (_jquery2.default.browser.msie && ~~_jquery2.default.browser.version < 10) {
                          // iframeShim, prepend if it doesnt exist
                          var jQueryCache = (0, _jquery2.default)('#inline-dialog-shim-' + escapedIdentifier);
                          if (!jQueryCache.length) {
                              (0, _jquery2.default)(popup).prepend((0, _jquery2.default)('<iframe class = "inline-dialog-shim" id="inline-dialog-shim-' + identifier + '" frameBorder="0" src="javascript:false;"></iframe>'));
                          }
                          // adjust height and width of shim according to the popup
                          jQueryCache.css({
                              width: contents.outerWidth(),
                              height: contents.outerHeight()
                          });
                      }
                  }
              };
          }
          return hash;
      };
  
      var showPopup = function showPopup() {
          if (popup.is(':visible')) {
              return;
          }
          showTimer = setTimeout(function () {
              if (!contentLoaded || !shouldShow) {
                  return;
              }
              opts.addActiveClass && (0, _jquery2.default)(items).addClass('active');
              beingShown = true;
              if (!opts.persistent) {
                  bindHideEvents();
              }
              InlineDialog.current = getHash();
              (0, _jquery2.default)(document).trigger('showLayer', ['inlineDialog', getHash()]);
              // retrieve the position of the click target. The offsets might be different for different types of targets and therefore
              // either have to be customisable or we will have to be smarter about calculating the padding and elements around it
  
              getHash().reset();
          }, opts.showDelay);
      };
  
      var hidePopup = function hidePopup(delay) {
          // do not auto hide the popup if persistent is set as true
          if (typeof delay === 'undefined' && opts.persistent) {
              return;
          }
          if (typeof popup.get(0)._datePickerPopup !== 'undefined') {
              // AUI-2696 - This inline dialog is host to a date picker... so we shouldn't close it.
              return;
          }
  
          shouldShow = false;
          // only exectute the below if the popup is currently being shown
          // and the arbitrator callback gives us the green light
          if (beingShown && opts.preHideCallback.call(popup[0].popup)) {
              delay = delay == null ? opts.hideDelay : delay;
              clearTimeout(hideDelayTimer);
              clearTimeout(showTimer);
              // store the timer so that it can be cleared in the mouseenter if required
              //disable auto-hide if user passes null for hideDelay
              if (delay != null) {
                  hideDelayTimer = setTimeout(function () {
                      unbindHideEvents();
                      opts.addActiveClass && (0, _jquery2.default)(items).removeClass('active');
                      popup.fadeOut(opts.fadeTime, function () {
                          opts.hideCallback.call(popup[0].popup);
                      });
                      beingShown = false;
                      shouldShow = false;
                      (0, _jquery2.default)(document).trigger('hideLayer', ['inlineDialog', getHash()]);
                      InlineDialog.current = null;
                      if (!opts.cacheContent) {
                          //if not caching the content, then reset the
                          //flags to false so as to reload the content
                          //on next mouse hover.
                          contentLoaded = false;
                          contentLoading = false;
                      }
                  }, delay);
              }
          }
      };
  
      // the trigger is the jquery element that is triggering the popup (i.e., the element that the mousemove event is bound to)
      var initPopup = function initPopup(e, trigger) {
          var $trigger = (0, _jquery2.default)(trigger);
  
          opts.upfrontCallback.call({
              popup: popup,
              hide: function hide() {
                  hidePopup(0);
              },
              id: identifier,
              show: function show() {
                  showPopup();
              }
          });
  
          popup.each(function () {
              if (typeof this.popup !== 'undefined') {
                  this.popup.hide();
              }
          });
  
          //Close all other popups if neccessary
          if (opts.closeOthers) {
              (0, _jquery2.default)('.aui-inline-dialog').each(function () {
                  !this.popup.persistent && this.popup.hide();
              });
          }
  
          //handle programmatic showing where there is no event
          targetPosition = { target: $trigger };
          if (!e) {
              mousePosition = { x: $trigger.offset().left, y: $trigger.offset().top };
          } else {
              mousePosition = { x: e.pageX, y: e.pageY };
          }
  
          if (!beingShown) {
              clearTimeout(showTimer);
          }
          shouldShow = true;
          var doShowPopup = function doShowPopup() {
              contentLoading = false;
              contentLoaded = true;
              opts.initCallback.call({
                  popup: popup,
                  hide: function hide() {
                      hidePopup(0);
                  },
                  id: identifier,
                  show: function show() {
                      showPopup();
                  }
              });
              showPopup();
          };
          // lazy load popup contents
          if (!contentLoading) {
              contentLoading = true;
              if (_jquery2.default.isFunction(url)) {
                  // If the passed in URL is a function, execute it. Otherwise simply load the content.
                  url(contents, trigger, doShowPopup);
              } else {
                  //Retrive response from server
                  _jquery2.default.get(url, function (data, status, xhr) {
                      //Load HTML contents into the popup
                      contents.html(opts.responseHandler(data, status, xhr));
                      //Show the popup
                      contentLoaded = true;
                      opts.initCallback.call({
                          popup: popup,
                          hide: function hide() {
                              hidePopup(0);
                          },
                          id: identifier,
                          show: function show() {
                              showPopup();
                          }
                      });
                      showPopup();
                  });
              }
          }
          // stops the hide event if we move from the trigger to the popup element
          clearTimeout(hideDelayTimer);
          // don't trigger the animation again if we're being shown
          if (!beingShown) {
              showPopup();
          }
          return false;
      };
  
      popup[0].popup = getHash();
  
      var contentLoading = false;
      var added = false;
      var appendPopup = function appendPopup() {
          if (!added) {
              (0, _jquery2.default)(opts.container).append(popup);
              added = true;
          }
      };
      var $items = (0, _jquery2.default)(items);
  
      if (opts.onHover) {
          if (opts.useLiveEvents) {
              // We're using .on() to emulate the behaviour of .live() here. on() requires the jQuery object to have
              // a selector - this is actually how .live() is implemented in jQuery 1.7+.
              // Note that .selector is deleted in jQuery 1.9+.
              // This means that jQuery objects created by selection eg $(".my-class-selector") will work, but
              // object created by DOM parsing eg $("<div class='.my-class'></div>") will not work.
              // Ideally we should throw an error if the $items has no selector but that is backwards incompatible,
              // so we warn and do a no-op - this emulates the behaviour of live() but has the added warning.
              if ($items.selector) {
                  (0, _jquery2.default)(document).on('mouseenter', $items.selector, function (e) {
                      appendPopup();
                      initPopup(e, this);
                  }).on('mouseleave', $items.selector, function () {
                      hidePopup();
                  });
              } else {
                  logger.log('Warning: inline dialog trigger elements must have a jQuery selector when the useLiveEvents option is enabled.');
              }
          } else {
              $items.on({
                  mouseenter: function mouseenter(e) {
                      appendPopup();
                      initPopup(e, this);
                  },
                  mouseleave: function mouseleave() {
                      hidePopup();
                  }
              });
          }
      } else {
          if (!opts.noBind) {
              //Check if the noBind option is turned on
              if (opts.useLiveEvents) {
                  // See above for why we filter by .selector
                  if ($items.selector) {
                      (0, _jquery2.default)(document).on('click', $items.selector, function (e) {
                          appendPopup();
                          if (shouldCloseOnTriggerClick()) {
                              popup.hide();
                          } else {
                              initPopup(e, this);
                          }
                          return false;
                      }).on('mouseleave', $items.selector, function () {
                          hidePopup();
                      });
                  } else {
                      logger.log('Warning: inline dialog trigger elements must have a jQuery selector when the useLiveEvents option is enabled.');
                  }
              } else {
                  $items.on('click', function (e) {
                      appendPopup();
                      if (shouldCloseOnTriggerClick()) {
                          popup.hide();
                      } else {
                          initPopup(e, this);
                      }
                      return false;
                  }).on('mouseleave', function () {
                      hidePopup();
                  });
              }
          }
      }
  
      var shouldCloseOnTriggerClick = function shouldCloseOnTriggerClick() {
          return beingShown && opts.closeOnTriggerClick;
      };
  
      var bindHideEvents = function bindHideEvents() {
          bindHideOnExternalClick();
          bindHideOnEscPressed();
      };
  
      var unbindHideEvents = function unbindHideEvents() {
          unbindHideOnExternalClick();
          unbindHideOnEscPressed();
      };
  
      // Be defensive and make sure that we haven't already bound the event
      var hasBoundOnExternalClick = false;
      var externalClickNamespace = identifier + '.inline-dialog-check';
  
      /**
       * Catch click events on the body to see if the click target occurs outside of this popup
       * If it does, the popup will be hidden
       */
      var bindHideOnExternalClick = function bindHideOnExternalClick() {
          if (!hasBoundOnExternalClick) {
              (0, _jquery2.default)('body').bind('click.' + externalClickNamespace, function (e) {
                  var $target = (0, _jquery2.default)(e.target);
                  // hide the popup if the target of the event is not in the dialog
                  if ($target.closest('#inline-dialog-' + escapedIdentifier + ' .contents').length === 0) {
                      hidePopup(0);
                  }
              });
              hasBoundOnExternalClick = true;
          }
      };
  
      var unbindHideOnExternalClick = function unbindHideOnExternalClick() {
          if (hasBoundOnExternalClick) {
              (0, _jquery2.default)('body').unbind('click.' + externalClickNamespace);
          }
          hasBoundOnExternalClick = false;
      };
  
      var onKeydown = function onKeydown(e) {
          if (e.keyCode === 27) {
              hidePopup(0);
          }
      };
  
      var bindHideOnEscPressed = function bindHideOnEscPressed() {
          (0, _jquery2.default)(document).on('keydown', onKeydown);
      };
  
      var unbindHideOnEscPressed = function unbindHideOnEscPressed() {
          (0, _jquery2.default)(document).off('keydown', onKeydown);
      };
  
      /**
       * Show the inline dialog.
       * @method show
       */
      popup.show = function (e, trigger) {
          if (e) {
              e.stopPropagation();
          }
          appendPopup();
          if (opts.noBind && !(items && items.length)) {
              initPopup(e, trigger === undefined ? e.target : trigger);
          } else {
              initPopup(e, items);
          }
      };
      /**
       * Hide the inline dialog.
       * @method hide
       */
      popup.hide = function () {
          hidePopup(0);
      };
      /**
       * Repositions the inline dialog if being shown.
       * @method refresh
       */
      popup.refresh = function () {
          if (beingShown) {
              getHash().reset();
          }
      };
  
      popup.getOptions = function () {
          return opts;
      };
  
      return popup;
  }
  
  function dimensionsOf(el) {
      var $el = (0, _jquery2.default)(el);
      var offset = _jquery2.default.extend({ left: 0, top: 0 }, $el.offset());
      return {
          left: offset.left,
          top: offset.top,
          width: $el.outerWidth(),
          height: $el.outerHeight()
      };
  }
  
  function getDimensions(popup, targetPosition, mousePosition, opts) {
      var offsetX = _jquery2.default.isFunction(opts.offsetX) ? opts.offsetX(popup, targetPosition, mousePosition, opts) : opts.offsetX;
      var offsetY = _jquery2.default.isFunction(opts.offsetY) ? opts.offsetY(popup, targetPosition, mousePosition, opts) : opts.offsetY;
      var arrowOffsetX = _jquery2.default.isFunction(opts.arrowOffsetX) ? opts.arrowOffsetX(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetX;
      var arrowOffsetY = _jquery2.default.isFunction(opts.arrowOffsetY) ? opts.arrowOffsetY(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetY;
  
      // Support positioning inside a scroll container other than <body>
      var isConstrainedScroll = opts.container.toLowerCase() !== 'body';
      var $scrollContainer = (0, _jquery2.default)(opts.container);
      var $scrollWindow = isConstrainedScroll ? (0, _jquery2.default)(opts.container).parent() : (0, _jquery2.default)(window);
      var scrollContainerOffset = isConstrainedScroll ? $scrollContainer.offset() : { left: 0, top: 0 };
      var scrollWindowOffset = isConstrainedScroll ? $scrollWindow.offset() : { left: 0, top: 0 };
  
      var trigger = targetPosition.target;
      var triggerOffset = trigger.offset();
      // Support SVG elements as triggers
      // TODO Should calculateNorthSouthPositions also try getBBox()?
      var triggerBBox = trigger[0].getBBox && trigger[0].getBBox();
  
      return {
          // determines how close to the edge the dialog needs to be before it is considered offscreen
          screenPadding: 10,
          // Min distance arrow needs to be from the edge of the dialog
          arrowMargin: 5,
          window: {
              top: scrollWindowOffset.top,
              left: scrollWindowOffset.left,
              scrollTop: $scrollWindow.scrollTop(),
              scrollLeft: $scrollWindow.scrollLeft(),
              width: $scrollWindow.width(),
              height: $scrollWindow.height()
          },
          scrollContainer: {
              width: $scrollContainer.width(),
              height: $scrollContainer.height()
          },
          // Position of the trigger is relative to the scroll container
          trigger: {
              top: triggerOffset.top - scrollContainerOffset.top,
              left: triggerOffset.left - scrollContainerOffset.left,
              width: triggerBBox ? triggerBBox.width : trigger.outerWidth(),
              height: triggerBBox ? triggerBBox.height : trigger.outerHeight()
          },
          dialog: {
              width: popup.width(),
              height: popup.height(),
              offset: {
                  top: offsetY,
                  left: offsetX
              }
          },
          arrow: {
              height: popup.find('.arrow').outerHeight(),
              offset: {
                  top: arrowOffsetY,
                  left: arrowOffsetX
              }
          }
      };
  }
  
  function calculateWestPositions(popup, targetPosition, mousePosition, opts) {
      var dimensions = getDimensions(popup, targetPosition, mousePosition, opts);
      var screenPadding = dimensions.screenPadding;
      var win = dimensions.window;
      var trigger = dimensions.trigger;
      var dialog = dimensions.dialog;
      var arrow = dimensions.arrow;
      var scrollContainer = dimensions.scrollContainer;
  
      var triggerScrollOffset = {
          top: trigger.top - win.scrollTop,
          left: trigger.left - win.scrollLeft
      };
  
      // Halves - because the browser doesn't do sub-pixel positioning, we need to consistently floor
      // all decimal values or you can get 1px jumps in arrow positioning when the dialog's height changes.
      var halfTriggerHeight = Math.floor(trigger.height / 2);
      var halfPopupHeight = Math.floor(dialog.height / 2);
      var halfArrowHeight = Math.floor(arrow.height / 2);
  
      // Figure out where to position the dialog, preferring the right (gravity: 'w').
      var spaceOnLeft = triggerScrollOffset.left - dialog.offset.left - screenPadding;
  
      // This implementation may not be suitable for horizontally scrolling containers
      var spaceOnRight = scrollContainer.width - triggerScrollOffset.left - trigger.width - dialog.offset.left - screenPadding;
  
      var enoughSpaceOnLeft = spaceOnLeft >= dialog.width;
      var enoughSpaceOnRight = spaceOnRight >= dialog.width;
      var gravity = !enoughSpaceOnRight && enoughSpaceOnLeft ? 'e' : 'w';
  
      // Screen padding needs to be adjusted if the arrow would extend into it
      var arrowScreenTop = triggerScrollOffset.top + halfTriggerHeight - halfArrowHeight;
      var arrowScreenBottom = win.height - arrowScreenTop - arrow.height;
      screenPadding = Math.min(screenPadding, arrowScreenTop - dimensions.arrowMargin);
      screenPadding = Math.min(screenPadding, arrowScreenBottom - dimensions.arrowMargin);
  
      // Figure out if the dialog needs to be adjusted up or down to fit on the screen
      var middleOfTrigger = triggerScrollOffset.top + halfTriggerHeight;
      var spaceAboveMiddleOfTrigger = Math.max(middleOfTrigger - screenPadding, 0);
      var spaceBelowMiddleOfTrigger = Math.max(win.height - middleOfTrigger - screenPadding, 0);
  
      var isOverflowingAbove = halfPopupHeight - dialog.offset.top > spaceAboveMiddleOfTrigger;
      var isOverflowingBelow = halfPopupHeight + dialog.offset.top > spaceBelowMiddleOfTrigger;
  
      var popupCss;
      var arrowCss;
      if (isOverflowingAbove) {
          popupCss = {
              top: win.scrollTop + screenPadding,
              left: gravity === 'w' ? trigger.left + trigger.width + dialog.offset.left : trigger.left - dialog.width - dialog.offset.left
          };
          arrowCss = {
              top: trigger.top + halfTriggerHeight - (popupCss.top + halfArrowHeight)
          };
      } else if (isOverflowingBelow) {
          popupCss = {
              top: win.scrollTop + win.height - dialog.height - screenPadding,
              left: gravity === 'w' ? trigger.left + trigger.width + dialog.offset.left : trigger.left - dialog.width - dialog.offset.left
          };
          arrowCss = {
              top: trigger.top + halfTriggerHeight - (popupCss.top + halfArrowHeight)
          };
      } else {
          popupCss = {
              top: trigger.top + halfTriggerHeight - halfPopupHeight + dialog.offset.top,
              left: gravity === 'w' ? trigger.left + trigger.width + dialog.offset.left : trigger.left - dialog.width - dialog.offset.left
          };
          arrowCss = {
              top: halfPopupHeight - halfArrowHeight + arrow.offset.top
          };
      }
  
      return {
          gravity: gravity,
          popupCss: popupCss,
          arrowCss: arrowCss
      };
  }
  
  function calculateNorthSouthPositions(popup, targetPosition, mousePosition, opts) {
      var offsetX = _jquery2.default.isFunction(opts.offsetX) ? opts.offsetX(popup, targetPosition, mousePosition, opts) : opts.offsetX;
      var offsetY = _jquery2.default.isFunction(opts.offsetY) ? opts.offsetY(popup, targetPosition, mousePosition, opts) : opts.offsetY;
      var arrowOffsetX = _jquery2.default.isFunction(opts.arrowOffsetX) ? opts.arrowOffsetX(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetX;
  
      var viewportDimensions = dimensionsOf(window);
      var targetDimensions = dimensionsOf(targetPosition.target);
      var popupDimensions = dimensionsOf(popup);
      var arrowDimensions = dimensionsOf(popup.find('.aui-inline-dialog-arrow'));
  
      var middleOfTrigger = targetDimensions.left + targetDimensions.width / 2; //The absolute x position of the middle of the Trigger
      var bottomOfViewablePage = (window.pageYOffset || document.documentElement.scrollTop) + viewportDimensions.height;
      var SCREEN_PADDING = 10; //determines how close to the edge the dialog needs to be before it is considered offscreen
  
      // Set popup's position (within the viewport)
      popupDimensions.top = targetDimensions.top + targetDimensions.height + ~~offsetY;
      popupDimensions.left = targetDimensions.left + ~~offsetX;
  
      // Calculate if the popup would render off the side of the viewport
      var diff = viewportDimensions.width - (popupDimensions.left + popupDimensions.width + SCREEN_PADDING);
  
      // Set arrow's position (within the popup)
      arrowDimensions.left = middleOfTrigger - popupDimensions.left + ~~arrowOffsetX;
      // TODO arrowDimensions.top should also use arrowOffsetY.
      arrowDimensions.top = -(arrowDimensions.height / 2);
  
      // Check whether the popup should display above or below the trigger
      var enoughRoomAbove = targetDimensions.top > popupDimensions.height;
      var enoughRoomBelow = popupDimensions.top + popupDimensions.height < bottomOfViewablePage;
      var displayAbove = !enoughRoomBelow && enoughRoomAbove || enoughRoomAbove && opts.gravity === 's';
  
      if (displayAbove) {
          popupDimensions.top = targetDimensions.top - popupDimensions.height - arrowDimensions.height / 2;
          arrowDimensions.top = popupDimensions.height;
      }
  
      // Check if the popup should show up relative to the mouse
      if (opts.isRelativeToMouse) {
          if (diff < 0) {
              popupDimensions.right = SCREEN_PADDING;
              popupDimensions.left = 'auto';
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = mousePosition.x - (viewportDimensions.width - popupDimensions.width);
          } else {
              popupDimensions.left = mousePosition.x - 20;
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = mousePosition.x - popupDimensions.left;
          }
      } else {
          if (diff < 0) {
              popupDimensions.right = SCREEN_PADDING;
              popupDimensions.left = 'auto';
  
              var popupRightEdge = viewportDimensions.width - popupDimensions.right;
              var popupLeftEdge = popupRightEdge - popupDimensions.width;
  
              //arrow's position must be relative to the popup's position and not of the screen.
              arrowDimensions.right = 'auto';
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = middleOfTrigger - popupLeftEdge - arrowDimensions.width / 2;
          } else if (popupDimensions.width <= targetDimensions.width / 2) {
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = popupDimensions.width / 2;
              popupDimensions.left = middleOfTrigger - popupDimensions.width / 2;
          }
      }
      return {
          gravity: displayAbove ? 's' : 'n',
          displayAbove: displayAbove, // Replaced with gravity but remains for backward compatibility.
          popupCss: {
              left: popupDimensions.left,
              top: popupDimensions.top,
              right: popupDimensions.right
          },
          arrowCss: {
              left: arrowDimensions.left,
              top: arrowDimensions.top,
              right: arrowDimensions.right
          }
      };
  }
  
  InlineDialog.opts = {
      onTop: false,
      responseHandler: function responseHandler(data) {
          //assume data is html
          return data;
      },
      closeOthers: true,
      isRelativeToMouse: false,
      addActiveClass: true, // if false, signifies that the triggers should not have the "active" class applied
      onHover: false,
      useLiveEvents: false,
      noBind: false,
      fadeTime: 100,
      persistent: false,
      hideDelay: 10000,
      showDelay: 0,
      width: 300,
      offsetX: 0,
      offsetY: 10,
      arrowOffsetX: 0,
      arrowOffsetY: 0,
      container: 'body',
      cacheContent: true,
      displayShadow: true,
      autoWidth: false,
      gravity: 'n',
      closeOnTriggerClick: false,
      preHideCallback: function preHideCallback() {
          return true;
      },
      hideCallback: function hideCallback() {}, // if defined, this method will be exected after the popup has been faded out.
      initCallback: function initCallback() {}, // A function called after the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
      upfrontCallback: function upfrontCallback() {}, // A function called before the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
      /**
       * Returns an object with the following attributes:
       *      popupCss css attributes to apply on the popup element
       *      arrowCss css attributes to apply on the arrow element
       *
       * @param popup
       * @param targetPosition position of the target element
       * @param mousePosition current mouse position
       * @param opts options
       */
      calculatePositions: function calculatePositions(popup, targetPosition, mousePosition, opts) {
          opts = opts || {};
          var algorithm = opts.gravity === 'w' ? calculateWestPositions : calculateNorthSouthPositions;
          return algorithm(popup, targetPosition, mousePosition, opts);
      }
  };
  
  // Deprecations
  // ------------
  
  InlineDialog = deprecate.construct(InlineDialog, 'Inline dialog constructor', {
      alternativeName: 'inline dialog 2'
  });
  
  var displayAboveDeprecationLogger = deprecate.getMessageLogger('displayAbove', '[remove version]', {
      alternativeName: 'gravity',
      extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'
  });
  
  var onTopDeprecationLogger = deprecate.getMessageLogger('onTop', '[remove version]', {
      alternativeName: 'gravity',
      extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'
  });
  
  // Exporting
  // ---------
  
  (0, _globalize2.default)('InlineDialog', InlineDialog);
  
  exports.default = InlineDialog;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/key-code.js
(typeof window === 'undefined' ? global : window).__509557c937caa8763def39004fcf3193 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var keyCode = {
      ALT: 18,
      BACKSPACE: 8,
      CAPS_LOCK: 20,
      COMMA: 188,
      COMMAND: 91,
  
      // cmd
      COMMAND_LEFT: 91,
      COMMAND_RIGHT: 93,
      LEFT_SQUARE_BRACKET: 91, //This is 91 for keypress and 219 for keydown/keyup
      CONTROL: 17,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      INSERT: 45,
      LEFT: 37,
  
      // right cmd
      MENU: 93,
      NUMPAD_ADD: 107,
      NUMPAD_DECIMAL: 110,
      NUMPAD_DIVIDE: 111,
      NUMPAD_ENTER: 108,
      NUMPAD_MULTIPLY: 106,
      NUMPAD_SUBTRACT: 109,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SHIFT: 16,
      SPACE: 32,
      TAB: 9,
      UP: 38,
  
      // cmd
      WINDOWS: 91
  };
  
  (0, _globalize2.default)('keyCode', keyCode);
  
  exports.default = keyCode;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/format.js
(typeof window === 'undefined' ? global : window).__57111a90131a66c211cf7209c7270167 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Replaces tokens in a string with arguments, similar to Java's MessageFormat.
   * Tokens are in the form {0}, {1}, {2}, etc.
   *
   * This version also provides support for simple choice formats (excluding floating point numbers) of the form
   * {0,choice,0#0 issues|1#1 issue|1<{0,number} issues}
   *
   * Number format is currently not implemented, tokens of the form {0,number} will simply be printed as {0}
   *
   * @method format
   * @param message the message to replace tokens in
   * @param arg (optional) replacement value for token {0}, with subsequent arguments being {1}, etc.
   * @return {String} the message with the tokens replaced
   * @usage formatString("This is a {0} test", "simple");
   */
  function formatString(message) {
      var apos = /'(?!')/g,
          // founds "'", but not "''"
      simpleFormat = /^\d+$/,
          numberFormat = /^(\d+),number$/,
          // TODO: incomplete, as doesn't support floating point numbers
      choiceFormat = /^(\d+)\,choice\,(.+)/,
          choicePart = /^(\d+)([#<])(.+)/; // TODO: does not work for floating point numbers!
      // we are caching RegExps, so will not spend time on recreating them on each call
  
      // formats a value, currently choice and simple replacement are implemented, proper
      var getParamValue = function getParamValue(format, args) {
          // simple substitute
          /*jshint boss:true */
          var res = '',
              match;
          if (match = format.match(simpleFormat)) {
              // TODO: heavy guns for checking whether format is a simple number...
              res = args.length > ++format ? args[format] : ''; // use the argument as is, or use '' if not found
          }
  
          // number format
          else if (match = format.match(numberFormat)) {
                  // TODO: doesn't actually format the number...
                  res = args.length > ++match[1] ? args[match[1]] : '';
              }
  
              // choice format
              else if (match = format.match(choiceFormat)) {
                      // format: "0,choice,0#0 issues|1#1 issue|1<{0,number} issues"
                      // match[0]: "0,choice,0#0 issues|1#1 issue|1<{0,number} issues"
                      // match[1]: "0"
                      // match[2]: "0#0 issues|1#1 issue|1<{0,number} issues"
  
                      // get the argument value we base the choice on
                      var value = args.length > ++match[1] ? args[match[1]] : null;
                      if (value !== null) {
                          // go through all options, checking against the number, according to following formula,
                          // if X < the first entry then the first entry is returned, if X > last entry, the last entry is returned
                          //
                          //    X matches j if and only if limit[j] <= X < limit[j+1]
                          //
                          var options = match[2].split('|');
  
                          var prevOptionValue = null; // holds last passed option
                          for (var i = 0; i < options.length; i++) {
                              // option: "0#0 issues"
                              // part[0]: "0#0 issues"
                              // part[1]: "0"
                              // part[2]: "#"
                              // part[3]" "0 issues";
                              var parts = options[i].match(choicePart);
  
                              // if value is smaller, we take the previous value, or the current if no previous exists
                              var argValue = parseInt(parts[1], 10);
                              if (value < argValue) {
                                  if (prevOptionValue) {
                                      res = prevOptionValue;
                                      break;
                                  } else {
                                      res = parts[3];
                                      break;
                                  }
                              }
                              // if value is equal the condition, and the match is equality match we accept it
                              if (value == argValue && parts[2] == '#') {
                                  res = parts[3];
                                  break;
                              } else {}
                              // value is greater the condition, fall through to next iteration
  
  
                              // check whether we are the last option, in which case accept it even if the option does not match
                              if (i == options.length - 1) {
                                  res = parts[3];
                              }
  
                              // retain current option
                              prevOptionValue = parts[3];
                          }
  
                          // run result through format, as the parts might contain substitutes themselves
                          var formatArgs = [res].concat(Array.prototype.slice.call(args, 1));
                          res = formatString.apply(null, formatArgs);
                      }
                  }
          return res;
      };
  
      // drop in replacement for the token regex
      // splits the message to return the next accurance of a i18n placeholder.
      // Does not use regexps as we need to support nested placeholders
      // text between single ticks ' are ignored
      var _performTokenRegex = function _performTokenRegex(message) {
          var tick = false,
              openIndex = -1,
              openCount = 0;
          for (var i = 0; i < message.length; i++) {
              // handle ticks
              var c = message.charAt(i);
              if (c == "'") {
                  // toggle
                  tick = !tick;
              }
              // skip if we are between ticks
              if (tick) {
                  continue;
              }
              // check open brackets
              if (c === '{') {
                  if (openCount === 0) {
                      openIndex = i;
                  }
                  openCount++;
              } else if (c === '}') {
                  if (openCount > 0) {
                      openCount--;
                      if (openCount === 0) {
                          // we found a bracket match - generate the result array (
                          var match = [];
                          match.push(message.substring(0, i + 1)); // from begin to match
                          match.push(message.substring(0, openIndex)); // everything until match start
                          match.push(message.substring(openIndex + 1, i)); // matched content
                          return match;
                      }
                  }
              }
          }
          return null;
      };
  
      var _formatString = function _formatString(message) {
          var args = arguments;
          var res = '';
  
          if (!message) {
              return res;
          }
  
          var match = _performTokenRegex(message);
  
          while (match) {
              // reduce message to string after match
              message = message.substring(match[0].length);
  
              // add value before match to result
              res += match[1].replace(apos, '');
  
              // add formatted parameter
              res += getParamValue(match[2], args);
  
              // check for next match
              match = _performTokenRegex(message); //message.match(token);
          }
          // add remaining message to result
          res += message.replace(apos, '');
          return res;
      };
  
      return _formatString.apply(null, arguments);
  }
  
  (0, _globalize2.default)('format', formatString);
  
  exports.default = formatString;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/i18n/aui.js
(typeof window === 'undefined' ? global : window).__b7c1042973dc14ee8b82b7aa58d746af = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = {
      'aui.dropdown.async.error': 'Error loading dropdown',
      'aui.dropdown.async.loading': 'Loading dropdown',
      'aui.words.add': 'Add',
      'aui.words.update': 'Update',
      'aui.words.delete': 'Delete',
      'aui.words.remove': 'Remove',
      'aui.words.cancel': 'Cancel',
      'aui.words.loading': 'Loading',
      'aui.words.close': 'Close',
      'aui.enter.value': 'Enter value',
      'aui.words.more': 'More',
      'aui.words.moreitem': 'More…',
      'aui.keyboard.shortcut.type.x': "Type ''{0}''",
      'aui.keyboard.shortcut.then.x': "then ''{0}''",
      'aui.keyboard.shortcut.or.x': "OR ''{0}''",
      'aui.sidebar.expand.tooltip': 'Expand sidebar ( [ )',
      'aui.sidebar.collapse.tooltip': 'Collapse sidebar ( [ )',
      'aui.validation.message.maxlength': 'Must be fewer than or equal to {0} characters',
      'aui.validation.message.minlength': 'Must be greater than or equal to {0} characters',
      'aui.validation.message.exactlength': 'Must be exactly {0} characters',
      'aui.validation.message.matchingfield': '{0} and {1} do not match.',
      'aui.validation.message.matchingfield-novalue': 'These fields do not match.',
      'aui.validation.message.doesnotcontain': 'Do not include the phrase {0} in this field',
      'aui.validation.message.pattern': 'This field does not match the required format',
      'aui.validation.message.required': 'This is a required field',
      'aui.validation.message.validnumber': 'Please enter a valid number',
      'aui.validation.message.min': 'Enter a value greater than {0}',
      'aui.validation.message.max': 'Enter a value less than {0}',
      'aui.validation.message.dateformat': 'Enter a valid date',
      'aui.validation.message.minchecked': 'Tick at least {0,choice,0#0 checkboxes|1#1 checkbox|1<{0,number} checkboxes}.',
      'aui.validation.message.maxchecked': 'Tick at most {0,choice,0#0 checkboxes|1#1 checkbox|1<{0,number} checkboxes}.',
      'aui.checkboxmultiselect.clear.selected': 'Clear selected items',
      'aui.select.no.suggestions': 'No suggestions',
      'aui.select.new.suggestions': 'New suggestions added. Please use the up and down arrows to select.',
      'aui.select.new.value': 'new value',
      'aui.toggle.on': 'On',
      'aui.toggle.off': 'Off',
      'ajs.datepicker.localisations.day-names.sunday': 'Sunday',
      'ajs.datepicker.localisations.day-names.monday': 'Monday',
      'ajs.datepicker.localisations.day-names.tuesday': 'Tuesday',
      'ajs.datepicker.localisations.day-names.wednesday': 'Wednesday',
      'ajs.datepicker.localisations.day-names.thursday': 'Thursday',
      'ajs.datepicker.localisations.day-names.friday': 'Friday',
      'ajs.datepicker.localisations.day-names.saturday': 'Saturday',
      'ajs.datepicker.localisations.day-names-min.sunday': 'Sun',
      'ajs.datepicker.localisations.day-names-min.monday': 'Mon',
      'ajs.datepicker.localisations.day-names-min.tuesday': 'Tue',
      'ajs.datepicker.localisations.day-names-min.wednesday': 'Wed',
      'ajs.datepicker.localisations.day-names-min.thursday': 'Thu',
      'ajs.datepicker.localisations.day-names-min.friday': 'Fri',
      'ajs.datepicker.localisations.day-names-min.saturday': 'Sat',
      'ajs.datepicker.localisations.first-day': 0,
      'ajs.datepicker.localisations.is-RTL': false,
      'ajs.datepicker.localisations.month-names.january': 'January',
      'ajs.datepicker.localisations.month-names.february': 'February',
      'ajs.datepicker.localisations.month-names.march': 'March',
      'ajs.datepicker.localisations.month-names.april': 'April',
      'ajs.datepicker.localisations.month-names.may': 'May',
      'ajs.datepicker.localisations.month-names.june': 'June',
      'ajs.datepicker.localisations.month-names.july': 'July',
      'ajs.datepicker.localisations.month-names.august': 'August',
      'ajs.datepicker.localisations.month-names.september': 'September',
      'ajs.datepicker.localisations.month-names.october': 'October',
      'ajs.datepicker.localisations.month-names.november': 'November',
      'ajs.datepicker.localisations.month-names.december': 'December',
      'ajs.datepicker.localisations.show-month-after-year': false,
      'ajs.datepicker.localisations.year-suffix': null
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/i18n.js
(typeof window === 'undefined' ? global : window).__d74c881c8f23921c15438d0f30c99f80 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _format = __57111a90131a66c211cf7209c7270167;
  
  var _format2 = _interopRequireDefault(_format);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _aui = __b7c1042973dc14ee8b82b7aa58d746af;
  
  var _aui2 = _interopRequireDefault(_aui);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Returns the value defined in AJS.I18n.keys for the given key. If AJS.I18n.keys does not exist, or if the given key does not exist,
   * the key is returned - this could occur in plugin mode if the I18n transform is not performed;
   * or in flatpack mode if the i18n JS file is not loaded.
   */
  var i18n = {
      keys: _aui2.default,
      getText: function getText(key) {
          var params = Array.prototype.slice.call(arguments, 1);
  
          if (Object.prototype.hasOwnProperty.call(this.keys, key)) {
              return _format2.default.apply(null, [this.keys[key]].concat(params));
          }
  
          return key;
      }
  };
  
  (0, _globalize2.default)('I18n', i18n);
  
  exports.default = i18n;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/constants.js
(typeof window === 'undefined' ? global : window).__3ceacf009ef9ceb3c52ebb9324915170 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__3ceacf009ef9ceb3c52ebb9324915170");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
      factory(exports);
    }
  })(function (exports) {
  
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  
    var ATTR_IGNORE = "data-skate-ignore";
    exports.ATTR_IGNORE = ATTR_IGNORE;
    var TYPE_ATTRIBUTE = "a";
    exports.TYPE_ATTRIBUTE = TYPE_ATTRIBUTE;
    var TYPE_CLASSNAME = "c";
    exports.TYPE_CLASSNAME = TYPE_CLASSNAME;
    var TYPE_ELEMENT = "t";
    exports.TYPE_ELEMENT = TYPE_ELEMENT;
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/version.js
(typeof window === 'undefined' ? global : window).__15c28555b7ada36a99309d466d5cff55 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__15c28555b7ada36a99309d466d5cff55");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "module"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
      factory(exports, module);
    }
  })(function (exports, module) {
  
    module.exports = "0.13.17";
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/globals.js
(typeof window === 'undefined' ? global : window).__df73b283f1d40e8f4912fb904e42aa12 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "./version": __15c28555b7ada36a99309d466d5cff55,
    "./version": __15c28555b7ada36a99309d466d5cff55
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__df73b283f1d40e8f4912fb904e42aa12");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "module", "./version"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
      factory(exports, module, __15c28555b7ada36a99309d466d5cff55);
    }
  })(function (exports, module, _version) {
  
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
    var version = _interopRequire(_version);
  
    var VERSION = "__skate_" + version.replace(/[^\w]/g, "_");
  
    if (!window[VERSION]) {
      window[VERSION] = {
        observer: undefined,
        registry: {}
      };
    }
  
    module.exports = window[VERSION];
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/data.js
(typeof window === 'undefined' ? global : window).__4666b4efa3069445b77e23d8419d0090 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__4666b4efa3069445b77e23d8419d0090");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "module"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
      factory(exports, module);
    }
  })(function (exports, module) {
  
    module.exports = function (element) {
      var namespace = arguments[1] === undefined ? "" : arguments[1];
  
      var data = element.__SKATE_DATA || (element.__SKATE_DATA = {});
      return namespace && (data[namespace] || (data[namespace] = {})) || data;
    };
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/mutation-observer.js
(typeof window === 'undefined' ? global : window).__c91177d0507115b2c279ac28adb63576 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__c91177d0507115b2c279ac28adb63576");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
      factory(exports);
    }
  })(function (exports) {
  
    (function (self) {
      // Atlassian: added IIFE
      /**
       * @license
       * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
       * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
       * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
       * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
       * Code distributed by Google as part of the polymer project is also
       * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
       */
      // @version 0.7.15
      if (typeof WeakMap === "undefined") {
        (function () {
          var defineProperty = Object.defineProperty;
          var counter = Date.now() % 1000000000;
          var WeakMap = function WeakMap() {
            this.name = "__st" + (Math.random() * 1000000000 >>> 0) + (counter++ + "__");
          };
          WeakMap.prototype = {
            set: function set(key, value) {
              var entry = key[this.name];
              if (entry && entry[0] === key) entry[1] = value;else defineProperty(key, this.name, {
                value: [key, value],
                writable: true
              });
              return this;
            },
            get: function get(key) {
              var entry;
              return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
            },
            "delete": function _delete(key) {
              var entry = key[this.name];
              if (!entry || entry[0] !== key) {
                return false;
              }entry[0] = entry[1] = undefined;
              return true;
            },
            has: function has(key) {
              var entry = key[this.name];
              if (!entry) {
                return false;
              }return entry[0] === key;
            }
          };
          window.WeakMap = WeakMap;
        })();
      }
  
      (function (global) {
        if (global.JsMutationObserver) {
          return;
        }
        var registrationsTable = new WeakMap();
        var setImmediate;
        if (/Trident|Edge/.test(navigator.userAgent)) {
          setImmediate = setTimeout;
        } else if (window.setImmediate) {
          setImmediate = window.setImmediate;
        } else {
          var setImmediateQueue = [];
          var sentinel = String(Math.random());
          window.addEventListener("message", function (e) {
            if (e.data === sentinel) {
              var queue = setImmediateQueue;
              setImmediateQueue = [];
              queue.forEach(function (func) {
                func();
              });
            }
          });
          setImmediate = function (func) {
            setImmediateQueue.push(func);
            window.postMessage(sentinel, "*");
          };
        }
        var isScheduled = false;
        var scheduledObservers = [];
        function scheduleCallback(observer) {
          scheduledObservers.push(observer);
          if (!isScheduled) {
            isScheduled = true;
            setImmediate(dispatchCallbacks);
          }
        }
        function wrapIfNeeded(node) {
          return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
        }
        function dispatchCallbacks() {
          isScheduled = false;
          var observers = scheduledObservers;
          scheduledObservers = [];
          observers.sort(function (o1, o2) {
            return o1.uid_ - o2.uid_;
          });
          var anyNonEmpty = false;
          observers.forEach(function (observer) {
            var queue = observer.takeRecords();
            removeTransientObserversFor(observer);
            if (queue.length) {
              observer.callback_(queue, observer);
              anyNonEmpty = true;
            }
          });
          if (anyNonEmpty) dispatchCallbacks();
        }
        function removeTransientObserversFor(observer) {
          observer.nodes_.forEach(function (node) {
            var registrations = registrationsTable.get(node);
            if (!registrations) return;
            registrations.forEach(function (registration) {
              if (registration.observer === observer) registration.removeTransientObservers();
            });
          });
        }
        function forEachAncestorAndObserverEnqueueRecord(target, callback) {
          for (var node = target; node; node = node.parentNode) {
            var registrations = registrationsTable.get(node);
            if (registrations) {
              for (var j = 0; j < registrations.length; j++) {
                var registration = registrations[j];
                var options = registration.options;
                if (node !== target && !options.subtree) continue;
                var record = callback(options);
                if (record) registration.enqueue(record);
              }
            }
          }
        }
        var uidCounter = 0;
        function JsMutationObserver(callback) {
          this.callback_ = callback;
          this.nodes_ = [];
          this.records_ = [];
          this.uid_ = ++uidCounter;
        }
        JsMutationObserver.prototype = {
          observe: function observe(target, options) {
            target = wrapIfNeeded(target);
            if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
              throw new SyntaxError();
            }
            var registrations = registrationsTable.get(target);
            if (!registrations) registrationsTable.set(target, registrations = []);
            var registration;
            for (var i = 0; i < registrations.length; i++) {
              if (registrations[i].observer === this) {
                registration = registrations[i];
                registration.removeListeners();
                registration.options = options;
                break;
              }
            }
            if (!registration) {
              registration = new Registration(this, target, options);
              registrations.push(registration);
              this.nodes_.push(target);
            }
            registration.addListeners();
          },
          disconnect: function disconnect() {
            this.nodes_.forEach(function (node) {
              var registrations = registrationsTable.get(node);
              for (var i = 0; i < registrations.length; i++) {
                var registration = registrations[i];
                if (registration.observer === this) {
                  registration.removeListeners();
                  registrations.splice(i, 1);
                  break;
                }
              }
            }, this);
            this.records_ = [];
          },
          takeRecords: function takeRecords() {
            var copyOfRecords = this.records_;
            this.records_ = [];
            return copyOfRecords;
          }
        };
        function MutationRecord(type, target) {
          this.type = type;
          this.target = target;
          this.addedNodes = [];
          this.removedNodes = [];
          this.previousSibling = null;
          this.nextSibling = null;
          this.attributeName = null;
          this.attributeNamespace = null;
          this.oldValue = null;
        }
        function copyMutationRecord(original) {
          var record = new MutationRecord(original.type, original.target);
          record.addedNodes = original.addedNodes.slice();
          record.removedNodes = original.removedNodes.slice();
          record.previousSibling = original.previousSibling;
          record.nextSibling = original.nextSibling;
          record.attributeName = original.attributeName;
          record.attributeNamespace = original.attributeNamespace;
          record.oldValue = original.oldValue;
          return record;
        }
        var currentRecord, recordWithOldValue;
        function getRecord(type, target) {
          return currentRecord = new MutationRecord(type, target);
        }
        function getRecordWithOldValue(oldValue) {
          if (recordWithOldValue) {
            return recordWithOldValue;
          }recordWithOldValue = copyMutationRecord(currentRecord);
          recordWithOldValue.oldValue = oldValue;
          return recordWithOldValue;
        }
        function clearRecords() {
          currentRecord = recordWithOldValue = undefined;
        }
        function recordRepresentsCurrentMutation(record) {
          return record === recordWithOldValue || record === currentRecord;
        }
        function selectRecord(lastRecord, newRecord) {
          if (lastRecord === newRecord) {
            return lastRecord;
          }if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) {
            return recordWithOldValue;
          }return null;
        }
        function Registration(observer, target, options) {
          this.observer = observer;
          this.target = target;
          this.options = options;
          this.transientObservedNodes = [];
        }
        Registration.prototype = {
          enqueue: function enqueue(record) {
            var records = this.observer.records_;
            var length = records.length;
            if (records.length > 0) {
              var lastRecord = records[length - 1];
              var recordToReplaceLast = selectRecord(lastRecord, record);
              if (recordToReplaceLast) {
                records[length - 1] = recordToReplaceLast;
                return;
              }
            } else {
              scheduleCallback(this.observer);
            }
            records[length] = record;
          },
          addListeners: function addListeners() {
            this.addListeners_(this.target);
          },
          addListeners_: function addListeners_(node) {
            var options = this.options;
            if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
            if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
            if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
            if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
          },
          removeListeners: function removeListeners() {
            this.removeListeners_(this.target);
          },
          removeListeners_: function removeListeners_(node) {
            var options = this.options;
            if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
            if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
            if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
            if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
          },
          addTransientObserver: function addTransientObserver(node) {
            if (node === this.target) {
              return;
            }this.addListeners_(node);
            this.transientObservedNodes.push(node);
            var registrations = registrationsTable.get(node);
            if (!registrations) registrationsTable.set(node, registrations = []);
            registrations.push(this);
          },
          removeTransientObservers: function removeTransientObservers() {
            var transientObservedNodes = this.transientObservedNodes;
            this.transientObservedNodes = [];
            transientObservedNodes.forEach(function (node) {
              this.removeListeners_(node);
              var registrations = registrationsTable.get(node);
              for (var i = 0; i < registrations.length; i++) {
                if (registrations[i] === this) {
                  registrations.splice(i, 1);
                  break;
                }
              }
            }, this);
          },
          handleEvent: function handleEvent(e) {
            e.stopImmediatePropagation();
            switch (e.type) {
              case "DOMAttrModified":
                var name = e.attrName;
                var namespace = e.relatedNode.namespaceURI;
                var target = e.target;
                var record = new getRecord("attributes", target);
                record.attributeName = name;
                record.attributeNamespace = namespace;
                var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
                forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                  if (!options.attributes) return;
                  if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
                    return;
                  }
                  if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
                  return record;
                });
                break;
  
              case "DOMCharacterDataModified":
                var target = e.target;
                var record = getRecord("characterData", target);
                var oldValue = e.prevValue;
                forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                  if (!options.characterData) return;
                  if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
                  return record;
                });
                break;
  
              case "DOMNodeRemoved":
                this.addTransientObserver(e.target);
  
              case "DOMNodeInserted":
                var changedNode = e.target;
                var addedNodes, removedNodes;
                if (e.type === "DOMNodeInserted") {
                  addedNodes = [changedNode];
                  removedNodes = [];
                } else {
                  addedNodes = [];
                  removedNodes = [changedNode];
                }
                var previousSibling = changedNode.previousSibling;
                var nextSibling = changedNode.nextSibling;
                var record = getRecord("childList", e.target.parentNode);
                record.addedNodes = addedNodes;
                record.removedNodes = removedNodes;
                record.previousSibling = previousSibling;
                record.nextSibling = nextSibling;
                forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function (options) {
                  if (!options.childList) return;
                  return record;
                });
            }
            clearRecords();
          }
        };
        global.JsMutationObserver = JsMutationObserver;
        if (!global.MutationObserver) {
          global.MutationObserver = JsMutationObserver;
          JsMutationObserver._isPolyfilled = true;
        }
      })(self);
    })(window); // Atlassian: added IIFE
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/utils.js
(typeof window === 'undefined' ? global : window).__c962c88861b22faa9e6b0ff498553ca3 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__c962c88861b22faa9e6b0ff498553ca3");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "./constants"], factory);
    } else if (typeof exports !== "undefined") {
      factory(exports, __3ceacf009ef9ceb3c52ebb9324915170);
    }
  })(function (exports, _constants) {
  
    /**
     * Checks {}.hasOwnProperty in a safe way.
     *
     * @param {Object} obj The object the property is on.
     * @param {String} key The object key to check.
     *
     * @returns {Boolean}
     */
  
    exports.hasOwn = hasOwn;
  
    /**
     * Camel-cases the specified string.
     *
     * @param {String} str The string to camel-case.
     *
     * @returns {String}
     */
    exports.camelCase = camelCase;
  
    /**
     * Returns whether or not the source element contains the target element.
     * This is for browsers that don't support Element.prototype.contains on an
     * HTMLUnknownElement.
     *
     * @param {HTMLElement} source The source element.
     * @param {HTMLElement} target The target element.
     *
     * @returns {Boolean}
     */
    exports.elementContains = elementContains;
  
    /**
     * Returns a function that will prevent more than one call in a single clock
     * tick.
     *
     * @param {Function} fn The function to call.
     *
     * @returns {Function}
     */
    exports.debounce = debounce;
  
    /**
     * Returns whether or not the specified element has been selectively ignored.
     *
     * @param {Element} element The element to check and traverse up from.
     *
     * @returns {Boolean}
     */
    exports.getClosestIgnoredElement = getClosestIgnoredElement;
  
    /**
     * Merges the second argument into the first.
     *
     * @param {Object} child The object to merge into.
     * @param {Object} parent The object to merge from.
     * @param {Boolean} overwrite Whether or not to overwrite properties on the child.
     *
     * @returns {Object} Returns the child object.
     */
    exports.inherit = inherit;
  
    /**
     * Traverses an object checking hasOwnProperty.
     *
     * @param {Object} obj The object to traverse.
     * @param {Function} fn The function to call for each item in the object.
     *
     * @returns {undefined}
     */
    exports.objEach = objEach;
    exports.supportsNativeCustomElements = supportsNativeCustomElements;
    exports.isValidNativeCustomElementName = isValidNativeCustomElementName;
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  
    var ATTR_IGNORE = _constants.ATTR_IGNORE;
    var elementPrototype = window.HTMLElement.prototype;
    exports.elementPrototype = elementPrototype;
    var elementPrototypeContains = elementPrototype.contains;
    function hasOwn(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
  
    function camelCase(str) {
      return str.split(/-/g).map(function (str, index) {
        return index === 0 ? str : str[0].toUpperCase() + str.substring(1);
      }).join("");
    }
  
    function elementContains(source, target) {
      // The document element does not have the contains method in IE.
      if (source === document && !source.contains) {
        return document.head.contains(target) || document.body.contains(target);
      }
  
      return source.contains ? source.contains(target) : elementPrototypeContains.call(source, target);
    }
  
    function debounce(fn) {
      var called = false;
  
      return function () {
        if (!called) {
          called = true;
          setTimeout(function () {
            called = false;
            fn();
          }, 1);
        }
      };
    }
  
    function getClosestIgnoredElement(element) {
      var parent = element;
  
      // e.g. document doesn't have a function hasAttribute; no need to go further up
      while (parent instanceof Element) {
        if (parent.hasAttribute(ATTR_IGNORE)) {
          return parent;
        }
  
        parent = parent.parentNode;
      }
    }
  
    function inherit(child, parent, overwrite) {
      var names = Object.getOwnPropertyNames(parent);
      var namesLen = names.length;
  
      for (var a = 0; a < namesLen; a++) {
        var name = names[a];
  
        if (overwrite || child[name] === undefined) {
          var desc = Object.getOwnPropertyDescriptor(parent, name);
          var shouldDefineProps = desc.get || desc.set || !desc.writable || !desc.enumerable || !desc.configurable;
  
          if (shouldDefineProps) {
            Object.defineProperty(child, name, desc);
          } else {
            child[name] = parent[name];
          }
        }
      }
  
      return child;
    }
  
    function objEach(obj, fn) {
      for (var a in obj) {
        if (hasOwn(obj, a)) {
          fn(obj[a], a);
        }
      }
    }
  
    function supportsNativeCustomElements() {
      return typeof document.registerElement === "function";
    }
  
    function isValidNativeCustomElementName(name) {
      return name.indexOf("-") > 0;
    }
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/registry.js
(typeof window === 'undefined' ? global : window).__c4b6ad56719b8affc0c1c55ea177df52 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./globals": __df73b283f1d40e8f4912fb904e42aa12,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./globals": __df73b283f1d40e8f4912fb904e42aa12,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__c4b6ad56719b8affc0c1c55ea177df52");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "module", "./constants", "./globals", "./utils"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
      factory(exports, module, __3ceacf009ef9ceb3c52ebb9324915170, __df73b283f1d40e8f4912fb904e42aa12, __c962c88861b22faa9e6b0ff498553ca3);
    }
  })(function (exports, module, _constants, _globals, _utils) {
  
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
    var TYPE_ATTRIBUTE = _constants.TYPE_ATTRIBUTE;
    var TYPE_CLASSNAME = _constants.TYPE_CLASSNAME;
    var TYPE_ELEMENT = _constants.TYPE_ELEMENT;
  
    var globals = _interopRequire(_globals);
  
    var hasOwn = _utils.hasOwn;
    var isValidNativeCustomElementName = _utils.isValidNativeCustomElementName;
    var supportsNativeCustomElements = _utils.supportsNativeCustomElements;
  
    /**
     * Returns the class list for the specified element.
     *
     * @param {Element} element The element to get the class list for.
     *
     * @returns {ClassList | Array}
     */
    function getClassList(element) {
      var classList = element.classList;
  
      if (classList) {
        return classList;
      }
  
      var attrs = element.attributes;
  
      return attrs["class"] && attrs["class"].nodeValue.split(/\s+/) || [];
    }
  
    module.exports = {
      clear: function clear() {
        globals.registry = {};
        return this;
      },
  
      get: function get(id) {
        return hasOwn(globals.registry, id) && globals.registry[id];
      },
  
      getForElement: function getForElement(element) {
        var attrs = element.attributes;
        var attrsLen = attrs.length;
        var definitions = [];
        var isAttr = attrs.is;
        var isAttrValue = isAttr && (isAttr.value || isAttr.nodeValue);
  
        // Using localName as fallback for edge cases when processing <object> tag that is used
        // as inteface to NPAPI plugin.
        var tag = (element.tagName || element.localName).toLowerCase();
        var isAttrOrTag = isAttrValue || tag;
        var definition;
        var tagToExtend;
  
        if (this.isType(isAttrOrTag, TYPE_ELEMENT)) {
          definition = globals.registry[isAttrOrTag];
          tagToExtend = definition["extends"];
  
          if (isAttrValue) {
            if (tag === tagToExtend) {
              definitions.push(definition);
            }
          } else if (!tagToExtend) {
            definitions.push(definition);
          }
        }
  
        for (var a = 0; a < attrsLen; a++) {
          var attr = attrs[a].nodeName;
  
          if (this.isType(attr, TYPE_ATTRIBUTE)) {
            definition = globals.registry[attr];
            tagToExtend = definition["extends"];
  
            if (!tagToExtend || tag === tagToExtend) {
              definitions.push(definition);
            }
          }
        }
  
        var classList = getClassList(element);
        var classListLen = classList.length;
  
        for (var b = 0; b < classListLen; b++) {
          var className = classList[b];
  
          if (this.isType(className, TYPE_CLASSNAME)) {
            definition = globals.registry[className];
            tagToExtend = definition["extends"];
  
            if (!tagToExtend || tag === tagToExtend) {
              definitions.push(definition);
            }
          }
        }
  
        return definitions;
      },
  
      isType: function isType(id, type) {
        var def = this.get(id);
        return def && def.type === type;
      },
  
      isNativeCustomElement: function isNativeCustomElement(id) {
        return supportsNativeCustomElements() && this.isType(id, TYPE_ELEMENT) && isValidNativeCustomElementName(id);
      },
  
      set: function set(id, definition) {
        if (hasOwn(globals.registry, id)) {
          throw new Error("A component definition of type \"" + definition.type + "\" with the ID of \"" + id + "\" already exists.");
        }
  
        globals.registry[id] = definition;
  
        return this;
      }
    };
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/lifecycle.js
(typeof window === 'undefined' ? global : window).__76ada509bc46d5c68cd543ddd8e839a4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./data": __4666b4efa3069445b77e23d8419d0090,
    "./mutation-observer": __c91177d0507115b2c279ac28adb63576,
    "./registry": __c4b6ad56719b8affc0c1c55ea177df52,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./data": __4666b4efa3069445b77e23d8419d0090,
    "./mutation-observer": __c91177d0507115b2c279ac28adb63576,
    "./registry": __c4b6ad56719b8affc0c1c55ea177df52,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__76ada509bc46d5c68cd543ddd8e839a4");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "./constants", "./data", "./mutation-observer", "./registry", "./utils"], factory);
    } else if (typeof exports !== "undefined") {
      factory(exports, __3ceacf009ef9ceb3c52ebb9324915170, __4666b4efa3069445b77e23d8419d0090, __c91177d0507115b2c279ac28adb63576, __c4b6ad56719b8affc0c1c55ea177df52, __c962c88861b22faa9e6b0ff498553ca3);
    }
  })(function (exports, _constants, _data, _mutationObserver, _registry, _utils) {
  
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  
    var ATTR_IGNORE = _constants.ATTR_IGNORE;
  
    var data = _interopRequire(_data);
  
    var registry = _interopRequire(_registry);
  
    var camelCase = _utils.camelCase;
    var elementContains = _utils.elementContains;
    var hasOwn = _utils.hasOwn;
    var inherit = _utils.inherit;
    var objEach = _utils.objEach;
    var Node = window.Node;
    //jshint ignore:line
    var elProto = window.HTMLElement.prototype;
    var nativeMatchesSelector = elProto.matches || elProto.msMatchesSelector || elProto.webkitMatchesSelector || elProto.mozMatchesSelector || elProto.oMatchesSelector;
    // Only IE9 has this msMatchesSelector bug, but best to detect it.
    var hasNativeMatchesSelectorDetattachedBug = !nativeMatchesSelector.call(document.createElement("div"), "div");
    var matchesSelector = function matchesSelector(element, selector) {
      if (hasNativeMatchesSelectorDetattachedBug) {
        var clone = element.cloneNode();
        document.createElement("div").appendChild(clone);
        return nativeMatchesSelector.call(clone, selector);
      }
      return nativeMatchesSelector.call(element, selector);
    };
  
    // Edge has a bug where oldValue is sent as null instead of the true oldValue
    // when an element attribute is removed. Bug raised at
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7711883/
    var needsAttributeOldValueCaching = /Edge/.test(navigator.userAgent);
  
    /**
     * Parses an event definition and returns information about it.
     *
     * @param {String} e The event to parse.
     *
     * @returns {Object]}
     */
    function parseEvent(e) {
      var parts = e.split(" ");
      return {
        name: parts.shift(),
        delegate: parts.join(" ")
      };
    }
  
    /**
     * Sets the defined attributes to their default values, if specified.
     *
     * @param {Element} target The web component element.
     * @param {Object} component The web component definition.
     *
     * @returns {undefined}
     */
    function initAttributes(target, component) {
      var componentAttributes = component.attributes;
  
      if (typeof componentAttributes !== "object") {
        return;
      }
  
      for (var attribute in componentAttributes) {
        if (hasOwn(componentAttributes, attribute) && hasOwn(componentAttributes[attribute], "value") && !target.hasAttribute(attribute)) {
          var value = componentAttributes[attribute].value;
          value = typeof value === "function" ? value(target) : value;
          target.setAttribute(attribute, value);
        }
      }
    }
  
    /**
     * Defines a property that proxies the specified attribute.
     *
     * @param {Element} target The web component element.
     * @param {String} attribute The attribute name to proxy.
     *
     * @returns {undefined}
     */
    function defineAttributeProperty(target, attribute, property) {
      Object.defineProperty(target, property, {
        get: function get() {
          return this.getAttribute(attribute);
        },
        set: function set(value) {
          if (value === undefined) {
            this.removeAttribute(attribute);
          } else {
            this.setAttribute(attribute, value);
          }
        }
      });
    }
  
    /**
     * Adds links from attributes to properties.
     *
     * @param {Element} target The web component element.
     * @param {Object} component The web component definition.
     *
     * @returns {undefined}
     */
    function addAttributeToPropertyLinks(target, component) {
      var componentAttributes = component.attributes;
  
      if (typeof componentAttributes !== "object") {
        return;
      }
  
      for (var attribute in componentAttributes) {
        var property = camelCase(attribute);
        if (hasOwn(componentAttributes, attribute) && !hasOwn(target, property)) {
          defineAttributeProperty(target, attribute, property);
        }
      }
    }
  
    function triggerAttributeChanged(target, component, mutationData) {
      var callback;
      var type;
      var name = mutationData.name;
      var newValue = mutationData.newValue;
  
      var cachedAttributeOldValues;
      if (needsAttributeOldValueCaching) {
        cachedAttributeOldValues = data(target, "cachedAttributeOldValues");
      }
  
      // Read the old attribute value from cache if needed, otherwise use native oldValue
      var oldValue = needsAttributeOldValueCaching && hasOwn(cachedAttributeOldValues, name) ? cachedAttributeOldValues[name] : mutationData.oldValue;
  
      var newValueIsString = typeof newValue === "string";
      var oldValueIsString = typeof oldValue === "string";
      var attrs = component.attributes;
      var specific = attrs && attrs[name];
  
      if (!oldValueIsString && newValueIsString) {
        type = "created";
      } else if (oldValueIsString && newValueIsString) {
        type = "updated";
      } else if (oldValueIsString && !newValueIsString) {
        type = "removed";
      }
  
      if (needsAttributeOldValueCaching) {
        if (type === "removed") {
          delete cachedAttributeOldValues[name];
        } else {
          cachedAttributeOldValues[name] = newValue;
        }
      }
  
      if (specific && typeof specific[type] === "function") {
        callback = specific[type];
      } else if (specific && typeof specific.fallback === "function") {
        callback = specific.fallback;
      } else if (typeof specific === "function") {
        callback = specific;
      } else if (typeof attrs === "function") {
        callback = attrs;
      }
  
      // Ensure values are null if undefined.
      newValue = newValue === undefined ? null : newValue;
      oldValue = oldValue === undefined ? null : oldValue;
  
      // There may still not be a callback.
      if (callback) {
        callback(target, {
          type: type,
          name: name,
          newValue: newValue,
          oldValue: oldValue
        });
      }
    }
  
    function triggerAttributesCreated(target, component) {
      var a;
      var attrs = target.attributes;
      var attrsCopy = [];
      var attrsLen = attrs.length;
  
      for (a = 0; a < attrsLen; a++) {
        attrsCopy.push(attrs[a]);
      }
  
      // In default web components, attribute changes aren't triggered for
      // attributes that already exist on an element when it is bound. This sucks
      // when you want to reuse and separate code for attributes away from your
      // lifecycle callbacks. Skate will initialise each attribute by calling the
      // created callback for the attributes that already exist on the element.
      for (a = 0; a < attrsLen; a++) {
        var attr = attrsCopy[a];
        triggerAttributeChanged(target, component, {
          name: attr.nodeName,
          newValue: attr.value || attr.nodeValue
        });
      }
    }
  
    function addAttributeListeners(target, component) {
      var attrs = target.attributes;
  
      if (!component.attributes || registry.isNativeCustomElement(component.id)) {
        return;
      }
  
      var observer = new window.MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          var name = mutation.attributeName;
          var attr = attrs[name];
  
          triggerAttributeChanged(target, component, {
            name: name,
            newValue: attr && (attr.value || attr.nodeValue),
            oldValue: mutation.oldValue
          });
        });
      });
  
      observer.observe(target, {
        attributes: true,
        attributeOldValue: true
      });
    }
  
    /**
     * Binds event listeners for the specified event handlers.
     *
     * @param {Element} target The component element.
     * @param {Object} component The component data.
     *
     * @returns {undefined}
     */
    function addEventListeners(target, component) {
      if (typeof component.events !== "object") {
        return;
      }
  
      function makeHandler(handler, delegate) {
        return function (e) {
          // If we're not delegating, trigger directly on the component element.
          if (!delegate) {
            return handler(target, e, target);
          }
  
          // If we're delegating, but the target doesn't match, then we've have
          // to go up the tree until we find a matching ancestor or stop at the
          // component element, or document. If a matching ancestor is found, the
          // handler is triggered on it.
          var current = e.target;
  
          while (current && current !== document && current !== target.parentNode) {
            if (matchesSelector(current, delegate)) {
              return handler(target, e, current);
            }
  
            current = current.parentNode;
          }
        };
      }
  
      objEach(component.events, function (handler, name) {
        var evt = parseEvent(name);
        var useCapture = !!evt.delegate && (evt.name === "blur" || evt.name === "focus");
        target.addEventListener(evt.name, makeHandler(handler, evt.delegate), useCapture);
      });
    }
  
    /**
     * Triggers the created lifecycle callback.
     *
     * @param {Element} target The component element.
     * @param {Object} component The component data.
     *
     * @returns {undefined}
     */
    function triggerCreated(target, component) {
      var targetData = data(target, component.id);
  
      if (targetData.created) {
        return;
      }
  
      targetData.created = true;
  
      // TODO: This doesn't need to happen if using native.
      inherit(target, component.prototype, true);
  
      // We use the unresolved / resolved attributes to flag whether or not the
      // element has been templated or not.
      if (component.template && !target.hasAttribute(component.resolvedAttribute)) {
        component.template(target);
      }
  
      target.removeAttribute(component.unresolvedAttribute);
      target.setAttribute(component.resolvedAttribute, "");
      addEventListeners(target, component);
      addAttributeListeners(target, component);
      addAttributeToPropertyLinks(target, component);
      initAttributes(target, component);
      triggerAttributesCreated(target, component);
  
      if (component.created) {
        component.created(target);
      }
    }
  
    /**
     * Triggers the attached lifecycle callback.
     *
     * @param {Element} target The component element.
     * @param {Object} component The component data.
     *
     * @returns {undefined}
     */
    function triggerAttached(target, component) {
      var targetData = data(target, component.id);
  
      if (targetData.attached) {
        return;
      }
  
      if (!elementContains(document, target)) {
        return;
      }
  
      targetData.attached = true;
  
      if (component.attached) {
        component.attached(target);
      }
  
      targetData.detached = false;
    }
  
    /**
     * Triggers the detached lifecycle callback.
     *
     * @param {Element} target The component element.
     * @param {Object} component The component data.
     *
     * @returns {undefined}
     */
    function triggerDetached(target, component) {
      var targetData = data(target, component.id);
  
      if (targetData.detached) {
        return;
      }
  
      targetData.detached = true;
  
      if (component.detached) {
        component.detached(target);
      }
  
      targetData.attached = false;
    }
  
    /**
     * Triggers the entire element lifecycle if it's not being ignored.
     *
     * @param {Element} target The component element.
     * @param {Object} component The component data.
     *
     * @returns {undefined}
     */
    function triggerLifecycle(target, component) {
      triggerCreated(target, component);
      triggerAttached(target, component);
    }
  
    /**
     * Initialises a set of elements.
     *
     * @param {DOMNodeList | Array} elements A traversable set of elements.
     *
     * @returns {undefined}
     */
    function initElements(elements) {
      // [CATION] Don't cache elements length! Components initialization could append nodes
      // as siblings (see label's element behaviour for example) and this could lead to problems with
      // components placed at the end of processing childNodes because they will change they index
      // position and get out of cached value range.
      for (var a = 0; a < elements.length; a++) {
        var element = elements[a];
  
        if (element.nodeType !== Node.ELEMENT_NODE || element.attributes[ATTR_IGNORE]) {
          continue;
        }
  
        var currentNodeDefinitions = registry.getForElement(element);
        var currentNodeDefinitionsLength = currentNodeDefinitions.length;
  
        for (var b = 0; b < currentNodeDefinitionsLength; b++) {
          triggerLifecycle(element, currentNodeDefinitions[b]);
        }
  
        // When <object> tag is used to expose NPAPI api to js may have different behaviour then other
        // tags. One of those differences is that its childNodes can be undefined.
        var elementChildNodes = element.childNodes || [];
        var elementChildNodesLen = elementChildNodes.length;
  
        if (elementChildNodesLen) {
          initElements(elementChildNodes);
        }
      }
    }
  
    /**
     * Triggers the remove lifecycle callback on all of the elements.
     *
     * @param {DOMNodeList} elements The elements to trigger the remove lifecycle
     * callback on.
     *
     * @returns {undefined}
     */
    function removeElements(elements) {
      // Don't cache `childNodes` length. For more info see description in `initElements` function.
      for (var a = 0; a < elements.length; a++) {
        var element = elements[a];
  
        if (element.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
  
        removeElements(element.childNodes);
  
        var definitions = registry.getForElement(element);
        var definitionsLen = definitions.length;
  
        for (var b = 0; b < definitionsLen; b++) {
          triggerDetached(element, definitions[b]);
        }
      }
    }
  
    exports.initElements = initElements;
    exports.removeElements = removeElements;
    exports.triggerAttached = triggerAttached;
    exports.triggerAttributeChanged = triggerAttributeChanged;
    exports.triggerCreated = triggerCreated;
    exports.triggerDetached = triggerDetached;
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/fix-ie-innerhtml.js
(typeof window === 'undefined' ? global : window).__576655637d4ea6523fc9a23f8a7b3b68 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__576655637d4ea6523fc9a23f8a7b3b68");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
      factory(exports);
    }
  })(function (exports) {
  
    var isIeUntil10 = /MSIE/.test(navigator.userAgent);
    var isIe11 = /Trident/.test(navigator.userAgent);
    var isIe = isIeUntil10 || isIe11;
    var elementPrototype = window.HTMLElement.prototype;
  
    // ! This walkTree method differs from the implementation in ../../utils/walk-tree
    // It invokes the callback only for the children, not the passed node and the second parameter to the callback is the parent node
    function walkTree(node, cb) {
      var childNodes = node.childNodes;
  
      if (!childNodes) {
        return;
      }
  
      var childNodesLen = childNodes.length;
  
      for (var a = 0; a < childNodesLen; a++) {
        var childNode = childNodes[a];
        cb(childNode, node);
        walkTree(childNode, cb);
      }
    }
  
    function fixInnerHTML() {
      var originalInnerHTML = Object.getOwnPropertyDescriptor(elementPrototype, "innerHTML");
  
      var get = function get() {
        return originalInnerHTML.get.call(this);
      };
      get._hasBeenEnhanced = true;
  
      // This redefines the innerHTML property so that we can ensure that events
      // are properly triggered.
      Object.defineProperty(elementPrototype, "innerHTML", {
        get: get,
        set: function set(html) {
          walkTree(this, function (node, parentNode) {
            var mutationEvent = document.createEvent("MutationEvent");
            mutationEvent.initMutationEvent("DOMNodeRemoved", true, false, parentNode, null, null, null, null);
            node.dispatchEvent(mutationEvent);
          });
          originalInnerHTML.set.call(this, html);
        }
      });
    }
  
    if (isIe) {
      // IE 9-11
      var propertyDescriptor = Object.getOwnPropertyDescriptor(elementPrototype, "innerHTML");
      var hasBeenEnhanced = !!propertyDescriptor && propertyDescriptor.get._hasBeenEnhanced;
  
      if (!hasBeenEnhanced) {
        if (isIe11) {
          // IE11's native MutationObserver needs some help as well :()
          window.MutationObserver = window.JsMutationObserver || window.MutationObserver;
        }
  
        fixInnerHTML();
      }
    }
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/document-observer.js
(typeof window === 'undefined' ? global : window).__3c8c6233f9ea85a9125bd2a1e04f063c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "./globals": __df73b283f1d40e8f4912fb904e42aa12,
    "./lifecycle": __76ada509bc46d5c68cd543ddd8e839a4,
    "./mutation-observer": __c91177d0507115b2c279ac28adb63576,
    "./fix-ie-innerhtml": __576655637d4ea6523fc9a23f8a7b3b68,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3,
    "./globals": __df73b283f1d40e8f4912fb904e42aa12,
    "./lifecycle": __76ada509bc46d5c68cd543ddd8e839a4,
    "./mutation-observer": __c91177d0507115b2c279ac28adb63576,
    "./fix-ie-innerhtml": __576655637d4ea6523fc9a23f8a7b3b68,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__3c8c6233f9ea85a9125bd2a1e04f063c");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "module", "./globals", "./lifecycle", "./mutation-observer", "./fix-ie-innerhtml", "./utils"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
      factory(exports, module, __df73b283f1d40e8f4912fb904e42aa12, __76ada509bc46d5c68cd543ddd8e839a4, __c91177d0507115b2c279ac28adb63576, __576655637d4ea6523fc9a23f8a7b3b68, __c962c88861b22faa9e6b0ff498553ca3);
    }
  })(function (exports, module, _globals, _lifecycle, _mutationObserver, _fixIeInnerhtml, _utils) {
  
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
    var globals = _interopRequire(_globals);
  
    var initElements = _lifecycle.initElements;
    var removeElements = _lifecycle.removeElements;
    var getClosestIgnoredElement = _utils.getClosestIgnoredElement;
  
    /**
     * The document observer handler.
     *
     * @param {Array} mutations The mutations to handle.
     *
     * @returns {undefined}
     */
    function documentObserverHandler(mutations) {
      var mutationsLen = mutations.length;
  
      for (var a = 0; a < mutationsLen; a++) {
        var mutation = mutations[a];
        var addedNodes = mutation.addedNodes;
        var removedNodes = mutation.removedNodes;
  
        // Since siblings are batched together, we check the first node's parent
        // node to see if it is ignored. If it is then we don't process any added
        // nodes. This prevents having to check every node.
        if (addedNodes && addedNodes.length && !getClosestIgnoredElement(addedNodes[0].parentNode)) {
          initElements(addedNodes);
        }
  
        // We can't check batched nodes here because they won't have a parent node.
        if (removedNodes && removedNodes.length) {
          removeElements(removedNodes);
        }
      }
    }
  
    /**
     * Creates a new mutation observer for listening to Skate definitions for the
     * document.
     *
     * @param {Element} root The element to observe.
     *
     * @returns {MutationObserver}
     */
    function createDocumentObserver() {
      var observer = new window.MutationObserver(documentObserverHandler);
  
      // Observe after the DOM content has loaded.
      observer.observe(document, {
        childList: true,
        subtree: true
      });
  
      return observer;
    }
  
    module.exports = {
      register: function register(fixIe) {
        // IE has issues with reporting removedNodes correctly. See the polyfill for
        // details. If we fix IE, we must also re-define the document observer.
        if (fixIe) {
          this.unregister();
        }
  
        if (!globals.observer) {
          globals.observer = createDocumentObserver();
        }
  
        return this;
      },
  
      unregister: function unregister() {
        if (globals.observer) {
          globals.observer.disconnect();
          globals.observer = undefined;
        }
  
        return this;
      }
    };
  });
  
  return module.exports;
}).call(this);
// node_modules/skatejs/lib/skate.js
(typeof window === 'undefined' ? global : window).__612b714a7afa741ae272e3b4821d110b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./document-observer": __3c8c6233f9ea85a9125bd2a1e04f063c,
    "./lifecycle": __76ada509bc46d5c68cd543ddd8e839a4,
    "./registry": __c4b6ad56719b8affc0c1c55ea177df52,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3,
    "./version": __15c28555b7ada36a99309d466d5cff55,
    "./constants": __3ceacf009ef9ceb3c52ebb9324915170,
    "./document-observer": __3c8c6233f9ea85a9125bd2a1e04f063c,
    "./lifecycle": __76ada509bc46d5c68cd543ddd8e839a4,
    "./registry": __c4b6ad56719b8affc0c1c55ea177df52,
    "./utils": __c962c88861b22faa9e6b0ff498553ca3,
    "./version": __15c28555b7ada36a99309d466d5cff55
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__612b714a7afa741ae272e3b4821d110b");
  define.amd = true;
  
  (function (factory) {
    if (typeof define === "function" && define.amd) {
      define(["exports", "module", "./constants", "./document-observer", "./lifecycle", "./registry", "./utils", "./version"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
      factory(exports, module, __3ceacf009ef9ceb3c52ebb9324915170, __3c8c6233f9ea85a9125bd2a1e04f063c, __76ada509bc46d5c68cd543ddd8e839a4, __c4b6ad56719b8affc0c1c55ea177df52, __c962c88861b22faa9e6b0ff498553ca3, __15c28555b7ada36a99309d466d5cff55);
    }
  })(function (exports, module, _constants, _documentObserver, _lifecycle, _registry, _utils, _version) {
  
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
    var TYPE_ATTRIBUTE = _constants.TYPE_ATTRIBUTE;
    var TYPE_CLASSNAME = _constants.TYPE_CLASSNAME;
    var TYPE_ELEMENT = _constants.TYPE_ELEMENT;
  
    var documentObserver = _interopRequire(_documentObserver);
  
    var triggerCreated = _lifecycle.triggerCreated;
    var triggerAttached = _lifecycle.triggerAttached;
    var triggerDetached = _lifecycle.triggerDetached;
    var triggerAttributeChanged = _lifecycle.triggerAttributeChanged;
    var initElements = _lifecycle.initElements;
  
    var registry = _interopRequire(_registry);
  
    var debounce = _utils.debounce;
    var inherit = _utils.inherit;
  
    var version = _interopRequire(_version);
  
    var HTMLElement = window.HTMLElement; //jshint ignore:line
  
    // IE <= 10 can fire "interactive" too early (#243).
    var isOldIE = !!document.attachEvent; // attachEvent was removed in IE11.
  
    function isReady() {
      if (isOldIE) {
        return document.readyState === "complete";
      } else {
        return document.readyState === "interactive" || document.readyState === "complete";
      }
    }
  
    /**
     * Initialises all valid elements in the document. Ensures that it does not
     * happen more than once in the same execution, and that it happens after the DOM is ready.
     *
     * @returns {undefined}
     */
    var initDocument = debounce(function () {
      var initialiseSkateElementsOnDomLoad = function initialiseSkateElementsOnDomLoad() {
        initElements(document.documentElement.childNodes);
      };
      if (isReady()) {
        initialiseSkateElementsOnDomLoad();
      } else {
        if (isOldIE) {
          window.addEventListener("load", initialiseSkateElementsOnDomLoad);
        } else {
          document.addEventListener("DOMContentLoaded", initialiseSkateElementsOnDomLoad);
        }
      }
    });
  
    /**
     * Creates a constructor for the specified definition.
     *
     * @param {Object} definition The definition information to use for generating the constructor.
     *
     * @returns {Function} The element constructor.
     */
    function makeElementConstructor(definition) {
      function CustomElement() {
        var element;
        var tagToExtend = definition["extends"];
        var definitionId = definition.id;
  
        if (tagToExtend) {
          element = document.createElement(tagToExtend);
          element.setAttribute("is", definitionId);
        } else {
          element = document.createElement(definitionId);
        }
  
        // Ensure the definition prototype is up to date with the element's
        // prototype. This ensures that overwriting the element prototype still
        // works.
        definition.prototype = CustomElement.prototype;
  
        // If they use the constructor we don't have to wait until it's attached.
        triggerCreated(element, definition);
  
        return element;
      }
  
      // This allows modifications to the element prototype propagate to the
      // definition prototype.
      CustomElement.prototype = definition.prototype;
  
      return CustomElement;
    }
  
    // Public API
    // ----------
  
    /**
     * Creates a listener for the specified definition.
     *
     * @param {String} id The ID of the definition.
     * @param {Object | Function} definition The definition definition.
     *
     * @returns {Function} Constructor that returns a custom element.
     */
    function skate(id, definition) {
      // Just in case the definition is shared, we duplicate it so that internal
      // modifications to the original aren't shared.
      definition = inherit({}, definition);
      definition = inherit(definition, skate.defaults);
      definition.id = id;
  
      registry.set(id, definition);
  
      if (registry.isNativeCustomElement(id)) {
        var elementPrototype = definition["extends"] ? document.createElement(definition["extends"]).constructor.prototype : HTMLElement.prototype;
  
        if (!elementPrototype.isPrototypeOf(definition.prototype)) {
          definition.prototype = inherit(Object.create(elementPrototype), definition.prototype, true);
        }
  
        var options = {
          prototype: inherit(definition.prototype, {
            createdCallback: function createdCallback() {
              triggerCreated(this, definition);
            },
            attachedCallback: function attachedCallback() {
              triggerAttached(this, definition);
            },
            detachedCallback: function detachedCallback() {
              triggerDetached(this, definition);
            },
            attributeChangedCallback: function attributeChangedCallback(name, oldValue, newValue) {
              triggerAttributeChanged(this, definition, {
                name: name,
                oldValue: oldValue,
                newValue: newValue
              });
            }
          })
        };
  
        if (definition["extends"]) {
          options["extends"] = definition["extends"];
        }
  
        return document.registerElement(id, options);
      }
  
      initDocument();
      documentObserver.register(!!definition.detached);
  
      if (registry.isType(id, TYPE_ELEMENT)) {
        return makeElementConstructor(definition);
      }
    }
  
    /**
     * Synchronously initialises the specified element or elements and descendants.
     *
     * @param {Mixed} nodes The node, or nodes to initialise. Can be anything:
     *                      jQuery, DOMNodeList, DOMNode, selector etc.
     *
     * @returns {skate}
     */
    skate.init = function (nodes) {
      var nodesToUse = nodes;
  
      if (!nodes) {
        return nodes;
      }
  
      if (typeof nodes === "string") {
        nodesToUse = nodes = document.querySelectorAll(nodes);
      } else if (nodes instanceof HTMLElement) {
        nodesToUse = [nodes];
      }
  
      initElements(nodesToUse);
  
      return nodes;
    };
  
    // Restriction type constants.
    skate.type = {
      ATTRIBUTE: TYPE_ATTRIBUTE,
      CLASSNAME: TYPE_CLASSNAME,
      ELEMENT: TYPE_ELEMENT
    };
  
    // Makes checking the version easy when debugging.
    skate.version = version;
  
    /**
     * The default options for a definition.
     *
     * @var {Object}
     */
    skate.defaults = {
      // Attribute lifecycle callback or callbacks.
      attributes: undefined,
  
      // The events to manage the binding and unbinding of during the definition's
      // lifecycle.
      events: undefined,
  
      // Restricts a particular definition to binding explicitly to an element with
      // a tag name that matches the specified value.
      "extends": undefined,
  
      // The ID of the definition. This is automatically set in the `skate()`
      // function.
      id: "",
  
      // Properties and methods to add to each element.
      prototype: {},
  
      // The attribute name to add after calling the created() callback.
      resolvedAttribute: "resolved",
  
      // The template to replace the content of the element with.
      template: undefined,
  
      // The type of bindings to allow.
      type: TYPE_ELEMENT,
  
      // The attribute name to remove after calling the created() callback.
      unresolvedAttribute: "unresolved"
    };
  
    // Exporting
    // ---------
  
    var previousSkate = window.skate;
    skate.noConflict = function () {
      window.skate = previousSkate;
      return skate;
    };
  
    // Global
    window.skate = skate;
  
    // ES6
    module.exports = skate;
  });
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/skate.js
(typeof window === 'undefined' ? global : window).__c1ce1f1e3e613f564fc234ff043570f1 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _skatejs = __612b714a7afa741ae272e3b4821d110b;
  
  var _skatejs2 = _interopRequireDefault(_skatejs);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var auiSkate = _skatejs2.default.noConflict();
  
  exports.default = auiSkate;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/animation.js
(typeof window === 'undefined' ? global : window).__c0311e8841bd8637e025a8fb1474f693 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  /**
   * Force a re-compute of the style of an element.
   *
   * This is useful for CSS transitions and animations that need computed style changes to occur.
   * CSS transitions will fire when the computed value of the property they are transitioning changes.
   * This may not occur if the style changes get batched into one style change event by the browser.
   * We can force the browser to recognise the two different computed values by calling this function when we want it
   * to recompute the styles.
   *
   * For example, consider a transition on the opacity property.
   *
   * With recomputeStyle:
   * $parent.append($el); //opacity=0
   * recomputeStyle($el);
   * $el.addClass('visible'); //opacity=1
   * //Browser calculates value of opacity=0, and then transitions it to opacity=1
   *
   * Without recomputeStyle:
   * $parent.append($el); //opacity=0
   * $el.addClass('visible'); //opacity=1
   * //Browser calculates value of opacity=1 but no transition
   *
   * @param el The DOM or jQuery element for which style should be recomputed
   */
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  function recomputeStyle(el) {
      el = el.length ? el[0] : el;
      window.getComputedStyle(el, null).getPropertyValue('left');
  }
  
  exports.recomputeStyle = recomputeStyle;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/escape-html.js
(typeof window === 'undefined' ? global : window).__d909216fe400315d9bcd3c1a7748d78f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function escapeHtml(str) {
      return str.replace(/[&"'<>`]/g, function (str) {
          var special = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '\'': '&#39;',
              '`': '&#96;'
          };
  
          if (typeof special[str] === 'string') {
              return special[str];
          }
  
          return '&quot;';
      });
  }
  
  (0, _globalize2.default)('escapeHtml', escapeHtml);
  
  exports.default = escapeHtml;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/template.js
(typeof window === 'undefined' ? global : window).__eb201a36d4829c396b434af7bad3dea4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _escapeHtml = __d909216fe400315d9bcd3c1a7748d78f;
  
  var _escapeHtml2 = _interopRequireDefault(_escapeHtml);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Creates an object with methods for template support.
   *
   * See <a href="http://confluence.atlassian.com/display/AUI/AJS.template">CAC Documentation</a>.
   *
   * @constructor
   * @class template
   * @namespace AJS
   */
  var template = function ($) {
      var tokenRegex = /\{([^\}]+)\}/g; // matches "{xxxxx}"
      var objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches ".xxxxx" or "["xxxxx"]" to run over object properties
  
      // internal function
      // parses "{xxxxx}" and returns actual value from the given object that matches the expression
      var replacer = function replacer(all, key, obj, isHTML) {
          var res = obj;
          key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
              name = name || quotedName;
              if (res) {
                  if (name + ':html' in res) {
                      res = res[name + ':html'];
                      isHTML = true;
                  } else if (name in res) {
                      res = res[name];
                  }
                  if (isFunc && typeof res === 'function') {
                      res = res();
                  }
              }
          });
  
          // if not found restore original value
          if (res == null || res === obj) {
              res = all;
          }
  
          res = String(res);
  
          if (!isHTML) {
              res = T.escape(res);
          }
  
          return res;
      };
      /**
       * Replaces tokens in the template with corresponding values without HTML escaping
       * @method fillHtml
       * @param obj {Object} to populate the template with
       * @return {Object} the template object
       */
      var fillHtml = function fillHtml(obj) {
          this.template = this.template.replace(tokenRegex, function (all, key) {
              return replacer(all, key, obj, true);
          });
          return this;
      };
      /**
       * Replaces tokens in the template with corresponding values with HTML escaping
       * @method fill
       * @param obj {Object} to populate the template with
       * @return {Object} the template object
       */
      var fill = function fill(obj) {
          this.template = this.template.replace(tokenRegex, function (all, key) {
              return replacer(all, key, obj);
          });
          return this;
      };
      /**
       * Returns the current templated string.
       * @method toString
       * @return {String} the current template
       */
      var toString = function toString() {
          return this.template;
      };
  
      // internal function
      var T = function T(s) {
          function res() {
              return res.template;
          }
  
          /**
           * The current templated string
           * @property template
           */
          res.template = String(s);
          res.toString = res.valueOf = toString;
          res.fill = fill;
          res.fillHtml = fillHtml;
          return res;
      };
      var cache = {};
      var count = [];
  
      var findScripts = function findScripts(title) {
          return $('script').filter(function () {
              return this.getAttribute('title') === title;
          });
      };
  
      // returns template taken form the script tag with given title. Type agnostic, but better put type="text/x-template"
      T.load = function (title) {
          title = String(title);
          if (!cache.hasOwnProperty(title)) {
              if (count.length >= 1e3) {
                  delete cache[count.shift()]; // enforce maximum cache size
              }
              count.push(title);
              cache[title] = findScripts(title)[0].text;
          }
          return this(cache[title]);
      };
  
      // escape HTML dangerous characters
      T.escape = _escapeHtml2.default;
  
      return T;
  }(_jquery2.default);
  
  (0, _globalize2.default)('template', template);
  
  exports.default = template;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/skatejs-template-html/dist/template-html.js
(typeof window === 'undefined' ? global : window).__f52b7059926ab2bdcd0aee12b4bc782b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__f52b7059926ab2bdcd0aee12b4bc782b");
  define.amd = true;
  
  (function () {
  
    var DocumentFragment = window.DocumentFragment;
    var elProto = window.HTMLElement.prototype;
    var matchesSelector = (
      elProto.matches ||
      elProto.msMatchesSelector ||
      elProto.webkitMatchesSelector ||
      elProto.mozMatchesSelector ||
      elProto.oMatchesSelector
    );
  
    function getData (element, name) {
      if (element.__SKATE_TEMPLATE_HTML_DATA) {
        return element.__SKATE_TEMPLATE_HTML_DATA[name];
      }
    }
  
    function setData (element, name, value) {
      if (!element.__SKATE_TEMPLATE_HTML_DATA) {
        element.__SKATE_TEMPLATE_HTML_DATA = {};
      }
  
      element.__SKATE_TEMPLATE_HTML_DATA[name] = value;
  
      return element;
    }
  
    function createFragmentFromString (domString) {
      var specialMap = {
        caption: 'table',
        dd: 'dl',
        dt: 'dl',
        li: 'ul',
        tbody: 'table',
        td: 'tr',
        thead: 'table',
        tr: 'tbody'
      };
  
      var tag = domString.match(/\s*<([^\s>]+)/);
      var div = document.createElement(tag && specialMap[tag[1]] || 'div');
  
      div.innerHTML = domString;
  
      return createFragmentFromNodeList(div.childNodes);
    }
  
    function createFragmentFromNodeList (nodeList) {
      var frag = document.createDocumentFragment();
  
      while (nodeList && nodeList.length) {
        frag.appendChild(nodeList[0]);
      }
  
      return frag;
    }
  
    function getNodesBetween (startNode, endNode) {
      var nodes = [];
      var nextNode = startNode.nextSibling;
  
      while (nextNode !== endNode) {
        nodes.push(nextNode);
        nextNode = nextNode.nextSibling;
      }
  
      return nodes;
    }
  
    function findChildrenMatchingSelector (sourceNode, selector) {
      if (selector) {
        var found = sourceNode.querySelectorAll(selector);
        var foundLength = found.length;
        var filtered = [];
  
        for (var a = 0; a < foundLength; a++) {
          var node = found[a];
  
          if (node.parentNode === sourceNode) {
            filtered.push(node);
          }
        }
  
        return filtered;
      }
  
      return [].slice.call(sourceNode.childNodes) || [];
    }
  
    function htmlTemplateParentWrapper (element) {
      var contentNodes = getData(element, 'content');
      var contentNodesLen = contentNodes.length;
  
      return {
        childNodes: {
          get: function () {
            var nodes = [];
  
            for (var a = 0; a < contentNodesLen; a++) {
              var contentNode = contentNodes[a];
  
              if (contentNode.isDefault) {
                continue;
              }
  
              nodes = nodes.concat(getNodesBetween(contentNode.startNode, contentNode.endNode));
            }
  
            return nodes;
          }
        },
  
        firstChild: {
          get: function () {
            var childNodes = this.childNodes;
            return childNodes.length && childNodes[0] || null;
          }
        },
  
        innerHTML: {
          get: function () {
            var html = '';
            var childNodes = this.childNodes;
            var childNodesLen = childNodes.length;
  
            for (var a = 0; a < childNodesLen; a++) {
              var childNode = childNodes[a];
              html += childNode.outerHTML || childNode.textContent;
            }
  
            return html;
          },
          set: function (html) {
            var targetFragment = createFragmentFromString(html);
  
            for (var a = 0; a < contentNodesLen; a++) {
              var contentNode = contentNodes[a];
              var childNodes = getNodesBetween(contentNode.startNode, contentNode.endNode);
  
              // Remove all nodes (including default content).
              for (var b = 0; b < childNodes.length; b++) {
                var childNode = childNodes[b];
                childNode.parentNode.removeChild(childNode);
              }
  
              var foundNodes = findChildrenMatchingSelector(targetFragment, contentNode.selector);
  
              // Add any matched nodes from the given HTML.
              for (var c = 0; c < foundNodes.length; c++) {
                contentNode.container.insertBefore(foundNodes[c], contentNode.endNode);
              }
  
              // If no nodes were found, set the default content.
              if (foundNodes.length) {
                removeDefaultContent(contentNode);
              } else {
                addDefaultContent(contentNode);
              }
            }
          }
        },
  
        lastChild: {
          get: function () {
            for (var a = contentNodesLen - 1; a > -1; a--) {
              var contentNode = contentNodes[a];
  
              if (contentNode.isDefault) {
                continue;
              }
  
              var childNodes = this.childNodes;
              var childNodesLen = childNodes.length;
  
              return childNodes[childNodesLen - 1];
            }
  
            return null;
          }
        },
  
        outerHTML: {
          get: function () {
            var name = this.tagName.toLowerCase();
            var html = '<' + name;
            var attrs = this.attributes;
  
            if (attrs) {
              var attrsLength = attrs.length;
  
              for (var a = 0; a < attrsLength; a++) {
                var attr = attrs[a];
                html += ' ' + attr.nodeName + '="' + attr.nodeValue + '"';
              }
            }
  
            html += '>';
            html += this.innerHTML;
            html += '</' + name + '>';
  
            return html;
          }
        },
  
        textContent: {
          get: function () {
            var textContent = '';
            var childNodes = this.childNodes;
            var childNodesLength = this.childNodes.length;
  
            for (var a = 0; a < childNodesLength; a++) {
              textContent += childNodes[a].textContent;
            }
  
            return textContent;
          },
          set: function (textContent) {
            var acceptsTextContent;
  
            // Removes all nodes (including default content).
            this.innerHTML = '';
  
            // Find the first content node without a selector.
            for (var a = 0; a < contentNodesLen; a++) {
              var contentNode = contentNodes[a];
  
              if (!contentNode.selector) {
                acceptsTextContent = contentNode;
                break;
              }
            }
  
            // There may be no content nodes that accept text content.
            if (acceptsTextContent) {
              if (textContent) {
                removeDefaultContent(acceptsTextContent);
                acceptsTextContent.container.insertBefore(document.createTextNode(textContent), acceptsTextContent.endNode);
              } else {
                addDefaultContent(acceptsTextContent);
              }
            }
          }
        },
  
        appendChild: {
          value: function (node) {
            if (node instanceof DocumentFragment) {
              var fragChildNodes = node.childNodes;
  
              [].slice.call(fragChildNodes).forEach(function (node) {
                this.appendChild(node);
              }.bind(this));
  
              return this;
            }
  
            for (var b = 0; b < contentNodesLen; b++) {
              var contentNode = contentNodes[b];
              var contentSelector = contentNode.selector;
  
              if (!contentSelector || node instanceof window.HTMLElement && matchesSelector.call(node, contentSelector)) {
                removeDefaultContent(contentNode);
                contentNode.endNode.parentNode.insertBefore(node, contentNode.endNode);
                break;
              }
            }
  
            return this;
          }
        },
  
        insertAdjacentHTML: {
          value: function (where, html) {
            if (where === 'afterbegin') {
              this.insertBefore(createFragmentFromString(html), this.childNodes[0]);
            } else if (where === 'beforeend') {
              this.appendChild(createFragmentFromString(html));
            } else {
              element.insertAdjacentHTML(where, html);
            }
  
            return this;
          }
        },
  
        insertBefore: {
          value: function (node, referenceNode) {
            // If no reference node is supplied, we append. This also means that we
            // don't need to add / remove any default content because either there
            // aren't any nodes or appendChild will handle it.
            if (!referenceNode) {
              return this.appendChild(node);
            }
  
            // Handle document fragments.
            if (node instanceof DocumentFragment) {
              var fragChildNodes = node.childNodes;
  
              if (fragChildNodes) {
                var fragChildNodesLength = fragChildNodes.length;
  
                for (var a = 0; a < fragChildNodesLength; a++) {
                  this.insertBefore(fragChildNodes[a], referenceNode);
                }
              }
  
              return this;
            }
  
            var hasFoundReferenceNode = false;
  
            // There's no reason to handle default content add / remove because:
            // 1. If no reference node is supplied, appendChild handles it.
            // 2. If a reference node is supplied, there already is content.
            // 3. If a reference node is invalid, an exception is thrown, but also
            //    its state would not change even if it wasn't.
            mainLoop:
            for (var b = 0; b < contentNodesLen; b++) {
              var contentNode = contentNodes[b];
              var betweenNodes = getNodesBetween(contentNode.startNode, contentNode.endNode);
              var betweenNodesLen = betweenNodes.length;
  
              for (var c = 0; c < betweenNodesLen; c++) {
                var betweenNode = betweenNodes[c];
  
                if (betweenNode === referenceNode) {
                  hasFoundReferenceNode = true;
                }
  
                if (hasFoundReferenceNode) {
                  var selector = contentNode.selector;
  
                  if (!selector || matchesSelector.call(node, selector)) {
                    betweenNode.parentNode.insertBefore(node, betweenNode);
                    break mainLoop;
                  }
                }
              }
            }
  
            // If no reference node was found as a child node of the element we must
            // throw an error. This works for both no child nodes, or if the
            // reference wasn't found to be a child node.
            if (!hasFoundReferenceNode) {
              throw new Error('DOMException 8: The node before which the new node is to be inserted is not a child of this node.');
            }
  
            return node;
          }
        },
  
        removeChild: {
          value: function (childNode) {
            var removed = false;
  
            for (var a = 0; a < contentNodesLen; a++) {
              var contentNode = contentNodes[a];
  
              if (contentNode.container === childNode.parentNode) {
                contentNode.container.removeChild(childNode);
                removed = true;
                break;
              }
  
              if (contentNode.startNode.nextSibling === contentNode.endNode) {
                addDefaultContent(contentNode);
              }
            }
  
            if (!removed) {
              throw new Error('DOMException 8: The node in which you are trying to remove is not a child of this node.');
            }
  
            return childNode;
          }
        },
  
        replaceChild: {
          value: function (newChild, oldChild) {
            for (var a = 0; a < contentNodesLen; a++) {
              var contentNode = contentNodes[a];
  
              if (contentNode.container === oldChild.parentNode) {
                contentNode.container.replaceChild(newChild, oldChild);
                break;
              }
            }
  
            return this;
          }
        }
      };
    }
  
    function addDefaultContent (content) {
      var nodes = content.defaultNodes;
      var nodesLen = nodes.length;
  
      for (var a = 0; a < nodesLen; a++) {
        content.container.insertBefore(nodes[a], content.endNode);
      }
  
      content.isDefault = true;
    }
  
    function removeDefaultContent (content) {
      var nodes = content.defaultNodes;
      var nodesLen = nodes.length;
  
      for (var a = 0; a < nodesLen; a++) {
        var node = nodes[a];
        node.parentNode.removeChild(node);
      }
  
      content.isDefault = false;
    }
  
    function createProxyProperty (node, name) {
      return {
        get: function () {
          var value = node[name];
  
          if (typeof value === 'function') {
            return value.bind(node);
          }
  
          return value;
        },
  
        set: function (value) {
          node[name] = value;
        }
      };
    }
  
    function wrapNodeWith (node, wrapper) {
      var wrapped = {};
  
      for (var name in node) {
        var inWrapper = name in wrapper;
  
        if (inWrapper) {
          Object.defineProperty(wrapped, name, wrapper[name]);
        } else {
          Object.defineProperty(wrapped, name, createProxyProperty(node, name));
        }
      }
  
      return wrapped;
    }
  
    function cacheContentData (node) {
      var contentNodes = node.getElementsByTagName('content');
      var contentNodesLen = contentNodes && contentNodes.length;
  
      if (contentNodesLen) {
        var contentData = [];
  
        while (contentNodes.length) {
          var contentNode = contentNodes[0];
          var parentNode = contentNode.parentNode;
          var selector = contentNode.getAttribute('select');
          var startNode = document.createComment(' content ');
          var endNode = document.createComment(' /content ');
  
          contentData.push({
            container: parentNode,
            contentNode: contentNode,
            defaultNodes: [].slice.call(contentNode.childNodes),
            endNode: endNode,
            isDefault: true,
            selector: selector,
            startNode: startNode
          });
  
          parentNode.replaceChild(endNode, contentNode);
          parentNode.insertBefore(startNode, endNode);
  
          // Cache data in the comment that can be read if no content information
          // is cached. This allows seamless server-side rendering.
          startNode.textContent += JSON.stringify({
            defaultContent: contentNode.innerHTML,
            selector: selector
          }) + ' ';
        }
  
        setData(node, 'content', contentData);
      }
    }
  
  
  
    // Content Parser
    // --------------
  
    function parseCommentNode (node) {
      var data;
      var matches = node.textContent.match(/^ (\/?)content (.*)/i);
  
      if (matches) {
        if (matches[2]) {
          try {
            data = JSON.parse(matches[2]);
          } catch (e) {
            throw new Error('Unable to parse content comment data: "' + e + '" in "<!--' + node.textContent + '-->".');
          }
        }
  
        return {
          data: data || {
            defaultContent: undefined,
            isDefault: undefined,
            selector: undefined
          },
          type: matches[1] ? 'close' : 'open'
        };
      }
    }
  
    function parseNodeForContent (node) {
      var a;
      var childNodes = node.childNodes;
      var childNodesLen = childNodes.length;
      var contentDatas = [];
      var lastContentNode;
  
      for (a = 0; a < childNodesLen; a++) {
        var childNode = childNodes[a];
  
        if (childNode.nodeType === 8) {
          var contentInfo = parseCommentNode(childNode);
  
          if (contentInfo) {
            if (contentInfo.type === 'open') {
              if (lastContentNode) {
                throw new Error('Cannot have an opening content placeholder after another content placeholder at the same level in the DOM tree: "' + childNode.textContent + '" in "' + childNode.parentNode.innerHTML + '".');
              }
  
              lastContentNode = {
                container: childNode.parentNode,
                contentNode: childNode,
                defaultNodes: contentInfo.data.defaultContent && createFragmentFromString(contentInfo.data.defaultContent).childNodes || [],
                isDefault: contentInfo.data.isDefault,
                selector: contentInfo.data.selector,
                startNode: childNode
              };
            } else if (contentInfo.type === 'close') {
              if (!lastContentNode) {
                throw new Error('Unmatched closing content placeholder: "' + childNode.textContent + '" in "' + childNode.parentNode.innerHTML + '".');
              }
  
              lastContentNode.endNode = childNode;
              contentDatas.push(lastContentNode);
              lastContentNode = undefined;
            }
          }
        } else {
          contentDatas = contentDatas.concat(parseNodeForContent(childNode));
        }
      }
  
      return contentDatas;
    }
  
  
  
    // Public API
    // ----------
  
    function skateTemplateHtml () {
      var template = [].slice.call(arguments).join('');
  
      return function (target) {
        var frag = createFragmentFromNodeList(target.childNodes);
  
        target.innerHTML = template;
        cacheContentData(target);
  
        if (frag.childNodes.length) {
          skateTemplateHtml.wrap(target).appendChild(frag);
        }
      };
    }
  
    skateTemplateHtml.wrap = function (node) {
      if (!getData(node, 'content')) {
        setData(node, 'content', parseNodeForContent(node));
      }
  
      return wrapNodeWith(node, htmlTemplateParentWrapper(node));
    };
  
  
  
    // Exporting
    // ---------
  
    // Global.
    window.skateTemplateHtml = skateTemplateHtml;
  
    // AMD.
    if (typeof define === 'function') {
      define(function () {
        return skateTemplateHtml;
      });
    }
  
    // CommonJS.
    if (typeof module === 'object') {
      module.exports = skateTemplateHtml;
    }
  })();
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/debounce.js
(typeof window === 'undefined' ? global : window).__c6e18cf9266fe56d02f78a6e812f58db = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = debounce;
  exports.debounceImmediate = debounceImmediate;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function debounce(func, wait) {
      var timeout;
      var result;
  
      return function () {
          var args = arguments;
          var context = this;
          var later = function later() {
              result = func.apply(context, args);
              context = args = null;
          };
  
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
  
          return result;
      };
  }
  
  (0, _globalize2.default)('debounce', debounce);
  
  function debounceImmediate(func, wait) {
      var timeout = null;
      var result;
  
      return function () {
          var context = this;
          var args = arguments;
          var later = function later() {
              timeout = context = args = null;
          };
  
          if (timeout === null) {
              result = func.apply(context, args);
          }
  
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
  
          return result;
      };
  }
  
  (0, _globalize2.default)('debounceImmediate', debounceImmediate);
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/browser.js
(typeof window === 'undefined' ? global : window).__5e80b2d38fa1ffdd67aa3d521738d499 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.supportsCalc = supportsCalc;
  exports.supportsRequestAnimationFrame = supportsRequestAnimationFrame;
  exports.supportsVoiceOver = supportsVoiceOver;
  exports.supportsNewMouseEvent = supportsNewMouseEvent;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var isMacOSX = /Mac OS X/.test(navigator.userAgent);
  
  function supportsCalc() {
      var $d = (0, _jquery2.default)('<div style="height: 10px; height: -webkit-calc(20px + 0); height: calc(20px);"></div>');
      var supportsCalc = 20 === $d.appendTo(document.documentElement).height();
      $d.remove();
  
      return supportsCalc;
  }
  
  function supportsRequestAnimationFrame() {
      return !!window.requestAnimationFrame;
  }
  
  function supportsVoiceOver() {
      return isMacOSX;
  }
  
  // This is supported everywhere except Chrome 22, but we needed to support this use case due to
  // https://bitbucket.org/atlassian/aui/pull-requests/1920/aui-4380-fix-shortcut-not-work-in-old/diff .
  function supportsNewMouseEvent() {
      try {
          new MouseEvent('click');
      } catch (e) {
          return false;
      }
  
      return true;
  }
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/node_modules/tether/tether.js
(typeof window === 'undefined' ? global : window).__c73084fddb2d02d92156231c79374859 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__c73084fddb2d02d92156231c79374859");
  define.amd = true;
  
  /*! tether 0.6.5 */
  (function(root) {
  	(function() {
    var Evented, addClass, defer, deferred, extend, flush, getBounds, getOffsetParent, getOrigin, getScrollBarSize, getScrollParent, hasClass, node, removeClass, uniqueId, updateClasses, zeroPosCache,
      __hasProp = {}.hasOwnProperty,
      __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
      __slice = [].slice;
  
    if (this.Tether == null) {
      this.Tether = {
        modules: []
      };
    }
  
    getScrollParent = function(el) {
      var parent, position, scrollParent, style, _ref;
      position = getComputedStyle(el).position;
      if (position === 'fixed') {
        return el;
      }
      scrollParent = void 0;
      parent = el;
      while (parent = parent.parentNode) {
        try {
          style = getComputedStyle(parent);
        } catch (_error) {}
        if (style == null) {
          return parent;
        }
        if (/(auto|scroll)/.test(style['overflow'] + style['overflow-y'] + style['overflow-x'])) {
          if (position !== 'absolute' || ((_ref = style['position']) === 'relative' || _ref === 'absolute' || _ref === 'fixed')) {
            return parent;
          }
        }
      }
      return document.body;
    };
  
    uniqueId = (function() {
      var id;
      id = 0;
      return function() {
        return id++;
      };
    })();
  
    zeroPosCache = {};
  
    getOrigin = function(doc) {
      var id, k, node, v, _ref;
      node = doc._tetherZeroElement;
      if (node == null) {
        node = doc.createElement('div');
        node.setAttribute('data-tether-id', uniqueId());
        extend(node.style, {
          top: 0,
          left: 0,
          position: 'absolute'
        });
        doc.body.appendChild(node);
        doc._tetherZeroElement = node;
      }
      id = node.getAttribute('data-tether-id');
      if (zeroPosCache[id] == null) {
        zeroPosCache[id] = {};
        _ref = node.getBoundingClientRect();
        for (k in _ref) {
          v = _ref[k];
          zeroPosCache[id][k] = v;
        }
        defer(function() {
          return zeroPosCache[id] = void 0;
        });
      }
      return zeroPosCache[id];
    };
  
    node = null;
  
    getBounds = function(el) {
      var box, doc, docEl, k, origin, v, _ref;
      if (el === document) {
        doc = document;
        el = document.documentElement;
      } else {
        doc = el.ownerDocument;
      }
      docEl = doc.documentElement;
      box = {};
      _ref = el.getBoundingClientRect();
      for (k in _ref) {
        v = _ref[k];
        box[k] = v;
      }
      origin = getOrigin(doc);
      box.top -= origin.top;
      box.left -= origin.left;
      if (box.width == null) {
        box.width = document.body.scrollWidth - box.left - box.right;
      }
      if (box.height == null) {
        box.height = document.body.scrollHeight - box.top - box.bottom;
      }
      box.top = box.top - docEl.clientTop;
      box.left = box.left - docEl.clientLeft;
      box.right = doc.body.clientWidth - box.width - box.left;
      box.bottom = doc.body.clientHeight - box.height - box.top;
      return box;
    };
  
    getOffsetParent = function(el) {
      return el.offsetParent || document.documentElement;
    };
  
    getScrollBarSize = function() {
      var inner, outer, width, widthContained, widthScroll;
      inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '200px';
      outer = document.createElement('div');
      extend(outer.style, {
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        visibility: 'hidden',
        width: '200px',
        height: '150px',
        overflow: 'hidden'
      });
      outer.appendChild(inner);
      document.body.appendChild(outer);
      widthContained = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      widthScroll = inner.offsetWidth;
      if (widthContained === widthScroll) {
        widthScroll = outer.clientWidth;
      }
      document.body.removeChild(outer);
      width = widthContained - widthScroll;
      return {
        width: width,
        height: width
      };
    };
  
    extend = function(out) {
      var args, key, obj, val, _i, _len, _ref;
      if (out == null) {
        out = {};
      }
      args = [];
      Array.prototype.push.apply(args, arguments);
      _ref = args.slice(1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        if (obj) {
          for (key in obj) {
            if (!__hasProp.call(obj, key)) continue;
            val = obj[key];
            out[key] = val;
          }
        }
      }
      return out;
    };
  
    removeClass = function(el, name) {
      var cls, _i, _len, _ref, _results;
      if (el.classList != null) {
        _ref = name.split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cls = _ref[_i];
          if (cls.trim()) {
            _results.push(el.classList.remove(cls));
          }
        }
        return _results;
      } else {
        return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
      }
    };
  
    addClass = function(el, name) {
      var cls, _i, _len, _ref, _results;
      if (el.classList != null) {
        _ref = name.split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cls = _ref[_i];
          if (cls.trim()) {
            _results.push(el.classList.add(cls));
          }
        }
        return _results;
      } else {
        removeClass(el, name);
        return el.className += " " + name;
      }
    };
  
    hasClass = function(el, name) {
      if (el.classList != null) {
        return el.classList.contains(name);
      } else {
        return new RegExp("(^| )" + name + "( |$)", 'gi').test(el.className);
      }
    };
  
    updateClasses = function(el, add, all) {
      var cls, _i, _j, _len, _len1, _results;
      for (_i = 0, _len = all.length; _i < _len; _i++) {
        cls = all[_i];
        if (__indexOf.call(add, cls) < 0) {
          if (hasClass(el, cls)) {
            removeClass(el, cls);
          }
        }
      }
      _results = [];
      for (_j = 0, _len1 = add.length; _j < _len1; _j++) {
        cls = add[_j];
        if (!hasClass(el, cls)) {
          _results.push(addClass(el, cls));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
  
    deferred = [];
  
    defer = function(fn) {
      return deferred.push(fn);
    };
  
    flush = function() {
      var fn, _results;
      _results = [];
      while (fn = deferred.pop()) {
        _results.push(fn());
      }
      return _results;
    };
  
    Evented = (function() {
      function Evented() {}
  
      Evented.prototype.on = function(event, handler, ctx, once) {
        var _base;
        if (once == null) {
          once = false;
        }
        if (this.bindings == null) {
          this.bindings = {};
        }
        if ((_base = this.bindings)[event] == null) {
          _base[event] = [];
        }
        return this.bindings[event].push({
          handler: handler,
          ctx: ctx,
          once: once
        });
      };
  
      Evented.prototype.once = function(event, handler, ctx) {
        return this.on(event, handler, ctx, true);
      };
  
      Evented.prototype.off = function(event, handler) {
        var i, _ref, _results;
        if (((_ref = this.bindings) != null ? _ref[event] : void 0) == null) {
          return;
        }
        if (handler == null) {
          return delete this.bindings[event];
        } else {
          i = 0;
          _results = [];
          while (i < this.bindings[event].length) {
            if (this.bindings[event][i].handler === handler) {
              _results.push(this.bindings[event].splice(i, 1));
            } else {
              _results.push(i++);
            }
          }
          return _results;
        }
      };
  
      Evented.prototype.trigger = function() {
        var args, ctx, event, handler, i, once, _ref, _ref1, _results;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if ((_ref = this.bindings) != null ? _ref[event] : void 0) {
          i = 0;
          _results = [];
          while (i < this.bindings[event].length) {
            _ref1 = this.bindings[event][i], handler = _ref1.handler, ctx = _ref1.ctx, once = _ref1.once;
            handler.apply(ctx != null ? ctx : this, args);
            if (once) {
              _results.push(this.bindings[event].splice(i, 1));
            } else {
              _results.push(i++);
            }
          }
          return _results;
        }
      };
  
      return Evented;
  
    })();
  
    this.Tether.Utils = {
      getScrollParent: getScrollParent,
      getBounds: getBounds,
      getOffsetParent: getOffsetParent,
      extend: extend,
      addClass: addClass,
      removeClass: removeClass,
      hasClass: hasClass,
      updateClasses: updateClasses,
      defer: defer,
      flush: flush,
      uniqueId: uniqueId,
      Evented: Evented,
      getScrollBarSize: getScrollBarSize
    };
  
  }).call(this);
  
  (function() {
    var MIRROR_LR, MIRROR_TB, OFFSET_MAP, Tether, addClass, addOffset, attachmentToOffset, autoToFixedAttachment, defer, extend, flush, getBounds, getOffsetParent, getOuterSize, getScrollBarSize, getScrollParent, getSize, now, offsetToPx, parseAttachment, parseOffset, position, removeClass, tethers, transformKey, updateClasses, within, _Tether, _ref,
      __slice = [].slice,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  
    if (this.Tether == null) {
      throw new Error("You must include the utils.js file before tether.js");
    }
  
    Tether = this.Tether;
  
    _ref = Tether.Utils, getScrollParent = _ref.getScrollParent, getSize = _ref.getSize, getOuterSize = _ref.getOuterSize, getBounds = _ref.getBounds, getOffsetParent = _ref.getOffsetParent, extend = _ref.extend, addClass = _ref.addClass, removeClass = _ref.removeClass, updateClasses = _ref.updateClasses, defer = _ref.defer, flush = _ref.flush, getScrollBarSize = _ref.getScrollBarSize;
  
    within = function(a, b, diff) {
      if (diff == null) {
        diff = 1;
      }
      return (a + diff >= b && b >= a - diff);
    };
  
    transformKey = (function() {
      var el, key, _i, _len, _ref1;
      el = document.createElement('div');
      _ref1 = ['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        key = _ref1[_i];
        if (el.style[key] !== void 0) {
          return key;
        }
      }
    })();
  
    tethers = [];
  
    position = function() {
      var tether, _i, _len;
      for (_i = 0, _len = tethers.length; _i < _len; _i++) {
        tether = tethers[_i];
        tether.position(false);
      }
      return flush();
    };
  
    now = function() {
      var _ref1;
      return (_ref1 = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? _ref1 : +(new Date);
    };
  
    (function() {
      var event, lastCall, lastDuration, pendingTimeout, tick, _i, _len, _ref1, _results;
      lastCall = null;
      lastDuration = null;
      pendingTimeout = null;
      tick = function() {
        if ((lastDuration != null) && lastDuration > 16) {
          lastDuration = Math.min(lastDuration - 16, 250);
          pendingTimeout = setTimeout(tick, 250);
          return;
        }
        if ((lastCall != null) && (now() - lastCall) < 10) {
          return;
        }
        if (pendingTimeout != null) {
          clearTimeout(pendingTimeout);
          pendingTimeout = null;
        }
        lastCall = now();
        position();
        return lastDuration = now() - lastCall;
      };
      _ref1 = ['resize', 'scroll', 'touchmove'];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        event = _ref1[_i];
        _results.push(window.addEventListener(event, tick));
      }
      return _results;
    })();
  
    MIRROR_LR = {
      center: 'center',
      left: 'right',
      right: 'left'
    };
  
    MIRROR_TB = {
      middle: 'middle',
      top: 'bottom',
      bottom: 'top'
    };
  
    OFFSET_MAP = {
      top: 0,
      left: 0,
      middle: '50%',
      center: '50%',
      bottom: '100%',
      right: '100%'
    };
  
    autoToFixedAttachment = function(attachment, relativeToAttachment) {
      var left, top;
      left = attachment.left, top = attachment.top;
      if (left === 'auto') {
        left = MIRROR_LR[relativeToAttachment.left];
      }
      if (top === 'auto') {
        top = MIRROR_TB[relativeToAttachment.top];
      }
      return {
        left: left,
        top: top
      };
    };
  
    attachmentToOffset = function(attachment) {
      var _ref1, _ref2;
      return {
        left: (_ref1 = OFFSET_MAP[attachment.left]) != null ? _ref1 : attachment.left,
        top: (_ref2 = OFFSET_MAP[attachment.top]) != null ? _ref2 : attachment.top
      };
    };
  
    addOffset = function() {
      var left, offsets, out, top, _i, _len, _ref1;
      offsets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      out = {
        top: 0,
        left: 0
      };
      for (_i = 0, _len = offsets.length; _i < _len; _i++) {
        _ref1 = offsets[_i], top = _ref1.top, left = _ref1.left;
        if (typeof top === 'string') {
          top = parseFloat(top, 10);
        }
        if (typeof left === 'string') {
          left = parseFloat(left, 10);
        }
        out.top += top;
        out.left += left;
      }
      return out;
    };
  
    offsetToPx = function(offset, size) {
      if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
        offset.left = parseFloat(offset.left, 10) / 100 * size.width;
      }
      if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
        offset.top = parseFloat(offset.top, 10) / 100 * size.height;
      }
      return offset;
    };
  
    parseAttachment = parseOffset = function(value) {
      var left, top, _ref1;
      _ref1 = value.split(' '), top = _ref1[0], left = _ref1[1];
      return {
        top: top,
        left: left
      };
    };
  
    _Tether = (function() {
      _Tether.modules = [];
  
      function _Tether(options) {
        this.position = __bind(this.position, this);
        var module, _i, _len, _ref1, _ref2;
        tethers.push(this);
        this.history = [];
        this.setOptions(options, false);
        _ref1 = Tether.modules;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          module = _ref1[_i];
          if ((_ref2 = module.initialize) != null) {
            _ref2.call(this);
          }
        }
        this.position();
      }
  
      _Tether.prototype.getClass = function(key) {
        var _ref1, _ref2;
        if ((_ref1 = this.options.classes) != null ? _ref1[key] : void 0) {
          return this.options.classes[key];
        } else if (((_ref2 = this.options.classes) != null ? _ref2[key] : void 0) !== false) {
          if (this.options.classPrefix) {
            return "" + this.options.classPrefix + "-" + key;
          } else {
            return key;
          }
        } else {
          return '';
        }
      };
  
      _Tether.prototype.setOptions = function(options, position) {
        var defaults, key, _i, _len, _ref1, _ref2;
        this.options = options;
        if (position == null) {
          position = true;
        }
        defaults = {
          offset: '0 0',
          targetOffset: '0 0',
          targetAttachment: 'auto auto',
          classPrefix: 'tether'
        };
        this.options = extend(defaults, this.options);
        _ref1 = this.options, this.element = _ref1.element, this.target = _ref1.target, this.targetModifier = _ref1.targetModifier;
        if (this.target === 'viewport') {
          this.target = document.body;
          this.targetModifier = 'visible';
        } else if (this.target === 'scroll-handle') {
          this.target = document.body;
          this.targetModifier = 'scroll-handle';
        }
        _ref2 = ['element', 'target'];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          key = _ref2[_i];
          if (this[key] == null) {
            throw new Error("Tether Error: Both element and target must be defined");
          }
          if (this[key].jquery != null) {
            this[key] = this[key][0];
          } else if (typeof this[key] === 'string') {
            this[key] = document.querySelector(this[key]);
          }
        }
        addClass(this.element, this.getClass('element'));
        addClass(this.target, this.getClass('target'));
        if (!this.options.attachment) {
          throw new Error("Tether Error: You must provide an attachment");
        }
        this.targetAttachment = parseAttachment(this.options.targetAttachment);
        this.attachment = parseAttachment(this.options.attachment);
        this.offset = parseOffset(this.options.offset);
        this.targetOffset = parseOffset(this.options.targetOffset);
        if (this.scrollParent != null) {
          this.disable();
        }
        if (this.targetModifier === 'scroll-handle') {
          this.scrollParent = this.target;
        } else {
          this.scrollParent = getScrollParent(this.target);
        }
        if (this.options.enabled !== false) {
          return this.enable(position);
        }
      };
  
      _Tether.prototype.getTargetBounds = function() {
        var bounds, fitAdj, hasBottomScroll, height, out, scrollBottom, scrollPercentage, style, target;
        if (this.targetModifier != null) {
          switch (this.targetModifier) {
            case 'visible':
              if (this.target === document.body) {
                return {
                  top: pageYOffset,
                  left: pageXOffset,
                  height: innerHeight,
                  width: innerWidth
                };
              } else {
                bounds = getBounds(this.target);
                out = {
                  height: bounds.height,
                  width: bounds.width,
                  top: bounds.top,
                  left: bounds.left
                };
                out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
                out.height = Math.min(out.height, bounds.height - ((bounds.top + bounds.height) - (pageYOffset + innerHeight)));
                out.height = Math.min(innerHeight, out.height);
                out.height -= 2;
                out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
                out.width = Math.min(out.width, bounds.width - ((bounds.left + bounds.width) - (pageXOffset + innerWidth)));
                out.width = Math.min(innerWidth, out.width);
                out.width -= 2;
                if (out.top < pageYOffset) {
                  out.top = pageYOffset;
                }
                if (out.left < pageXOffset) {
                  out.left = pageXOffset;
                }
                return out;
              }
              break;
            case 'scroll-handle':
              target = this.target;
              if (target === document.body) {
                target = document.documentElement;
                bounds = {
                  left: pageXOffset,
                  top: pageYOffset,
                  height: innerHeight,
                  width: innerWidth
                };
              } else {
                bounds = getBounds(target);
              }
              style = getComputedStyle(target);
              hasBottomScroll = target.scrollWidth > target.clientWidth || 'scroll' === [style.overflow, style.overflowX] || this.target !== document.body;
              scrollBottom = 0;
              if (hasBottomScroll) {
                scrollBottom = 15;
              }
              height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;
              out = {
                width: 15,
                height: height * 0.975 * (height / target.scrollHeight),
                left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
              };
              fitAdj = 0;
              if (height < 408 && this.target === document.body) {
                fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
              }
              if (this.target !== document.body) {
                out.height = Math.max(out.height, 24);
              }
              scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
              out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);
              if (this.target === document.body) {
                out.height = Math.max(out.height, 24);
              }
              return out;
          }
        } else {
          return getBounds(this.target);
        }
      };
  
      _Tether.prototype.clearCache = function() {
        return this._cache = {};
      };
  
      _Tether.prototype.cache = function(k, getter) {
        if (this._cache == null) {
          this._cache = {};
        }
        if (this._cache[k] == null) {
          this._cache[k] = getter.call(this);
        }
        return this._cache[k];
      };
  
      _Tether.prototype.enable = function(position) {
        if (position == null) {
          position = true;
        }
        addClass(this.target, this.getClass('enabled'));
        addClass(this.element, this.getClass('enabled'));
        this.enabled = true;
        if (this.scrollParent !== document) {
          this.scrollParent.addEventListener('scroll', this.position);
        }
        if (position) {
          return this.position();
        }
      };
  
      _Tether.prototype.disable = function() {
        removeClass(this.target, this.getClass('enabled'));
        removeClass(this.element, this.getClass('enabled'));
        this.enabled = false;
        if (this.scrollParent != null) {
          return this.scrollParent.removeEventListener('scroll', this.position);
        }
      };
  
      _Tether.prototype.destroy = function() {
        var i, tether, _i, _len, _results;
        this.disable();
        _results = [];
        for (i = _i = 0, _len = tethers.length; _i < _len; i = ++_i) {
          tether = tethers[i];
          if (tether === this) {
            tethers.splice(i, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
  
      _Tether.prototype.updateAttachClasses = function(elementAttach, targetAttach) {
        var add, all, side, sides, _i, _j, _len, _len1, _ref1,
          _this = this;
        if (elementAttach == null) {
          elementAttach = this.attachment;
        }
        if (targetAttach == null) {
          targetAttach = this.targetAttachment;
        }
        sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];
        if ((_ref1 = this._addAttachClasses) != null ? _ref1.length : void 0) {
          this._addAttachClasses.splice(0, this._addAttachClasses.length);
        }
        add = this._addAttachClasses != null ? this._addAttachClasses : this._addAttachClasses = [];
        if (elementAttach.top) {
          add.push("" + (this.getClass('element-attached')) + "-" + elementAttach.top);
        }
        if (elementAttach.left) {
          add.push("" + (this.getClass('element-attached')) + "-" + elementAttach.left);
        }
        if (targetAttach.top) {
          add.push("" + (this.getClass('target-attached')) + "-" + targetAttach.top);
        }
        if (targetAttach.left) {
          add.push("" + (this.getClass('target-attached')) + "-" + targetAttach.left);
        }
        all = [];
        for (_i = 0, _len = sides.length; _i < _len; _i++) {
          side = sides[_i];
          all.push("" + (this.getClass('element-attached')) + "-" + side);
        }
        for (_j = 0, _len1 = sides.length; _j < _len1; _j++) {
          side = sides[_j];
          all.push("" + (this.getClass('target-attached')) + "-" + side);
        }
        return defer(function() {
          if (_this._addAttachClasses == null) {
            return;
          }
          updateClasses(_this.element, _this._addAttachClasses, all);
          updateClasses(_this.target, _this._addAttachClasses, all);
          return _this._addAttachClasses = void 0;
        });
      };
  
      _Tether.prototype.position = function(flushChanges) {
        var elementPos, elementStyle, height, left, manualOffset, manualTargetOffset, module, next, offset, offsetBorder, offsetParent, offsetParentSize, offsetParentStyle, offsetPosition, ret, scrollLeft, scrollTop, scrollbarSize, side, targetAttachment, targetOffset, targetPos, targetSize, top, width, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
          _this = this;
        if (flushChanges == null) {
          flushChanges = true;
        }
        if (!this.enabled) {
          return;
        }
        this.clearCache();
        targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);
        this.updateAttachClasses(this.attachment, targetAttachment);
        elementPos = this.cache('element-bounds', function() {
          return getBounds(_this.element);
        });
        width = elementPos.width, height = elementPos.height;
        if (width === 0 && height === 0 && (this.lastSize != null)) {
          _ref1 = this.lastSize, width = _ref1.width, height = _ref1.height;
        } else {
          this.lastSize = {
            width: width,
            height: height
          };
        }
        targetSize = targetPos = this.cache('target-bounds', function() {
          return _this.getTargetBounds();
        });
        offset = offsetToPx(attachmentToOffset(this.attachment), {
          width: width,
          height: height
        });
        targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);
        manualOffset = offsetToPx(this.offset, {
          width: width,
          height: height
        });
        manualTargetOffset = offsetToPx(this.targetOffset, targetSize);
        offset = addOffset(offset, manualOffset);
        targetOffset = addOffset(targetOffset, manualTargetOffset);
        left = targetPos.left + targetOffset.left - offset.left;
        top = targetPos.top + targetOffset.top - offset.top;
        _ref2 = Tether.modules;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          module = _ref2[_i];
          ret = module.position.call(this, {
            left: left,
            top: top,
            targetAttachment: targetAttachment,
            targetPos: targetPos,
            attachment: this.attachment,
            elementPos: elementPos,
            offset: offset,
            targetOffset: targetOffset,
            manualOffset: manualOffset,
            manualTargetOffset: manualTargetOffset,
            scrollbarSize: scrollbarSize
          });
          if ((ret == null) || typeof ret !== 'object') {
            continue;
          } else if (ret === false) {
            return false;
          } else {
            top = ret.top, left = ret.left;
          }
        }
        next = {
          page: {
            top: top,
            left: left
          },
          viewport: {
            top: top - pageYOffset,
            bottom: pageYOffset - top - height + innerHeight,
            left: left - pageXOffset,
            right: pageXOffset - left - width + innerWidth
          }
        };
        if (document.body.scrollWidth > window.innerWidth) {
          scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
          next.viewport.bottom -= scrollbarSize.height;
        }
        if (document.body.scrollHeight > window.innerHeight) {
          scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
          next.viewport.right -= scrollbarSize.width;
        }
        if (((_ref3 = document.body.style.position) !== '' && _ref3 !== 'static') || ((_ref4 = document.body.parentElement.style.position) !== '' && _ref4 !== 'static')) {
          next.page.bottom = document.body.scrollHeight - top - height;
          next.page.right = document.body.scrollWidth - left - width;
        }
        if (((_ref5 = this.options.optimizations) != null ? _ref5.moveElement : void 0) !== false && (this.targetModifier == null)) {
          offsetParent = this.cache('target-offsetparent', function() {
            return getOffsetParent(_this.target);
          });
          offsetPosition = this.cache('target-offsetparent-bounds', function() {
            return getBounds(offsetParent);
          });
          offsetParentStyle = getComputedStyle(offsetParent);
          elementStyle = getComputedStyle(this.element);
          offsetParentSize = offsetPosition;
          offsetBorder = {};
          _ref6 = ['Top', 'Left', 'Bottom', 'Right'];
          for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
            side = _ref6[_j];
            offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle["border" + side + "Width"]);
          }
          offsetPosition.right = document.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
          offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;
          if (next.page.top >= (offsetPosition.top + offsetBorder.top) && next.page.bottom >= offsetPosition.bottom) {
            if (next.page.left >= (offsetPosition.left + offsetBorder.left) && next.page.right >= offsetPosition.right) {
              scrollTop = offsetParent.scrollTop;
              scrollLeft = offsetParent.scrollLeft;
              next.offset = {
                top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
                left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
              };
            }
          }
        }
        this.move(next);
        this.history.unshift(next);
        if (this.history.length > 3) {
          this.history.pop();
        }
        if (flushChanges) {
          flush();
        }
        return true;
      };
  
      _Tether.prototype.move = function(position) {
        var css, elVal, found, key, moved, offsetParent, point, same, transcribe, type, val, write, writeCSS, _i, _len, _ref1, _ref2,
          _this = this;
        if (this.element.parentNode == null) {
          return;
        }
        same = {};
        for (type in position) {
          same[type] = {};
          for (key in position[type]) {
            found = false;
            _ref1 = this.history;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              point = _ref1[_i];
              if (!within((_ref2 = point[type]) != null ? _ref2[key] : void 0, position[type][key])) {
                found = true;
                break;
              }
            }
            if (!found) {
              same[type][key] = true;
            }
          }
        }
        css = {
          top: '',
          left: '',
          right: '',
          bottom: ''
        };
        transcribe = function(same, pos) {
          var xPos, yPos, _ref3;
          if (((_ref3 = _this.options.optimizations) != null ? _ref3.gpu : void 0) !== false) {
            if (same.top) {
              css.top = 0;
              yPos = pos.top;
            } else {
              css.bottom = 0;
              yPos = -pos.bottom;
            }
            if (same.left) {
              css.left = 0;
              xPos = pos.left;
            } else {
              css.right = 0;
              xPos = -pos.right;
            }
            css[transformKey] = "translateX(" + (Math.round(xPos)) + "px) translateY(" + (Math.round(yPos)) + "px)";
            if (transformKey !== 'msTransform') {
              return css[transformKey] += " translateZ(0)";
            }
          } else {
            if (same.top) {
              css.top = "" + pos.top + "px";
            } else {
              css.bottom = "" + pos.bottom + "px";
            }
            if (same.left) {
              return css.left = "" + pos.left + "px";
            } else {
              return css.right = "" + pos.right + "px";
            }
          }
        };
        moved = false;
        if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
          css.position = 'absolute';
          transcribe(same.page, position.page);
        } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
          css.position = 'fixed';
          transcribe(same.viewport, position.viewport);
        } else if ((same.offset != null) && same.offset.top && same.offset.left) {
          css.position = 'absolute';
          offsetParent = this.cache('target-offsetparent', function() {
            return getOffsetParent(_this.target);
          });
          if (getOffsetParent(this.element) !== offsetParent) {
            defer(function() {
              _this.element.parentNode.removeChild(_this.element);
              return offsetParent.appendChild(_this.element);
            });
          }
          transcribe(same.offset, position.offset);
          moved = true;
        } else {
          css.position = 'absolute';
          transcribe({
            top: true,
            left: true
          }, position.page);
        }
        if (!moved && this.element.parentNode.tagName !== 'BODY') {
          this.element.parentNode.removeChild(this.element);
          document.body.appendChild(this.element);
        }
        writeCSS = {};
        write = false;
        for (key in css) {
          val = css[key];
          elVal = this.element.style[key];
          if (elVal !== '' && val !== '' && (key === 'top' || key === 'left' || key === 'bottom' || key === 'right')) {
            elVal = parseFloat(elVal);
            val = parseFloat(val);
          }
          if (elVal !== val) {
            write = true;
            writeCSS[key] = css[key];
          }
        }
        if (write) {
          return defer(function() {
            return extend(_this.element.style, writeCSS);
          });
        }
      };
  
      return _Tether;
  
    })();
  
    Tether.position = position;
  
    this.Tether = extend(_Tether, Tether);
  
  }).call(this);
  
  (function() {
    var BOUNDS_FORMAT, MIRROR_ATTACH, defer, extend, getBoundingRect, getBounds, getOuterSize, getSize, updateClasses, _ref,
      __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  
    _ref = this.Tether.Utils, getOuterSize = _ref.getOuterSize, getBounds = _ref.getBounds, getSize = _ref.getSize, extend = _ref.extend, updateClasses = _ref.updateClasses, defer = _ref.defer;
  
    MIRROR_ATTACH = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top',
      middle: 'middle'
    };
  
    BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];
  
    getBoundingRect = function(tether, to) {
      var i, pos, side, size, style, _i, _len;
      if (to === 'scrollParent') {
        to = tether.scrollParent;
      } else if (to === 'window') {
        to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
      }
      if (to === document) {
        to = to.documentElement;
      }
      if (to.nodeType != null) {
        pos = size = getBounds(to);
        style = getComputedStyle(to);
        to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];
        for (i = _i = 0, _len = BOUNDS_FORMAT.length; _i < _len; i = ++_i) {
          side = BOUNDS_FORMAT[i];
          side = side[0].toUpperCase() + side.substr(1);
          if (side === 'Top' || side === 'Left') {
            to[i] += parseFloat(style["border" + side + "Width"]);
          } else {
            to[i] -= parseFloat(style["border" + side + "Width"]);
          }
        }
      }
      return to;
    };
  
    this.Tether.modules.push({
      position: function(_arg) {
        var addClasses, allClasses, attachment, bounds, changeAttachX, changeAttachY, cls, constraint, eAttachment, height, left, oob, oobClass, p, pin, pinned, pinnedClass, removeClass, side, tAttachment, targetAttachment, targetHeight, targetSize, targetWidth, to, top, width, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
          _this = this;
        top = _arg.top, left = _arg.left, targetAttachment = _arg.targetAttachment;
        if (!this.options.constraints) {
          return true;
        }
        removeClass = function(prefix) {
          var side, _i, _len, _results;
          _this.removeClass(prefix);
          _results = [];
          for (_i = 0, _len = BOUNDS_FORMAT.length; _i < _len; _i++) {
            side = BOUNDS_FORMAT[_i];
            _results.push(_this.removeClass("" + prefix + "-" + side));
          }
          return _results;
        };
        _ref1 = this.cache('element-bounds', function() {
          return getBounds(_this.element);
        }), height = _ref1.height, width = _ref1.width;
        if (width === 0 && height === 0 && (this.lastSize != null)) {
          _ref2 = this.lastSize, width = _ref2.width, height = _ref2.height;
        }
        targetSize = this.cache('target-bounds', function() {
          return _this.getTargetBounds();
        });
        targetHeight = targetSize.height;
        targetWidth = targetSize.width;
        tAttachment = {};
        eAttachment = {};
        allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];
        _ref3 = this.options.constraints;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          constraint = _ref3[_i];
          if (constraint.outOfBoundsClass) {
            allClasses.push(constraint.outOfBoundsClass);
          }
          if (constraint.pinnedClass) {
            allClasses.push(constraint.pinnedClass);
          }
        }
        for (_j = 0, _len1 = allClasses.length; _j < _len1; _j++) {
          cls = allClasses[_j];
          _ref4 = ['left', 'top', 'right', 'bottom'];
          for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
            side = _ref4[_k];
            allClasses.push("" + cls + "-" + side);
          }
        }
        addClasses = [];
        tAttachment = extend({}, targetAttachment);
        eAttachment = extend({}, this.attachment);
        _ref5 = this.options.constraints;
        for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
          constraint = _ref5[_l];
          to = constraint.to, attachment = constraint.attachment, pin = constraint.pin;
          if (attachment == null) {
            attachment = '';
          }
          if (__indexOf.call(attachment, ' ') >= 0) {
            _ref6 = attachment.split(' '), changeAttachY = _ref6[0], changeAttachX = _ref6[1];
          } else {
            changeAttachX = changeAttachY = attachment;
          }
          bounds = getBoundingRect(this, to);
          if (changeAttachY === 'target' || changeAttachY === 'both') {
            if (top < bounds[1] && tAttachment.top === 'top') {
              top += targetHeight;
              tAttachment.top = 'bottom';
            }
            if (top + height > bounds[3] && tAttachment.top === 'bottom') {
              top -= targetHeight;
              tAttachment.top = 'top';
            }
          }
          if (changeAttachY === 'together') {
            if (top < bounds[1] && tAttachment.top === 'top') {
              if (eAttachment.top === 'bottom') {
                top += targetHeight;
                tAttachment.top = 'bottom';
                top += height;
                eAttachment.top = 'top';
              } else if (eAttachment.top === 'top') {
                top += targetHeight;
                tAttachment.top = 'bottom';
                top -= height;
                eAttachment.top = 'bottom';
              }
            }
            if (top + height > bounds[3] && tAttachment.top === 'bottom') {
              if (eAttachment.top === 'top') {
                top -= targetHeight;
                tAttachment.top = 'top';
                top -= height;
                eAttachment.top = 'bottom';
              } else if (eAttachment.top === 'bottom') {
                top -= targetHeight;
                tAttachment.top = 'top';
                top += height;
                eAttachment.top = 'top';
              }
            }
            if (tAttachment.top === 'middle') {
              if (top + height > bounds[3] && eAttachment.top === 'top') {
                top -= height;
                eAttachment.top = 'bottom';
              } else if (top < bounds[1] && eAttachment.top === 'bottom') {
                top += height;
                eAttachment.top = 'top';
              }
            }
          }
          if (changeAttachX === 'target' || changeAttachX === 'both') {
            if (left < bounds[0] && tAttachment.left === 'left') {
              left += targetWidth;
              tAttachment.left = 'right';
            }
            if (left + width > bounds[2] && tAttachment.left === 'right') {
              left -= targetWidth;
              tAttachment.left = 'left';
            }
          }
          if (changeAttachX === 'together') {
            if (left < bounds[0] && tAttachment.left === 'left') {
              if (eAttachment.left === 'right') {
                left += targetWidth;
                tAttachment.left = 'right';
                left += width;
                eAttachment.left = 'left';
              } else if (eAttachment.left === 'left') {
                left += targetWidth;
                tAttachment.left = 'right';
                left -= width;
                eAttachment.left = 'right';
              }
            } else if (left + width > bounds[2] && tAttachment.left === 'right') {
              if (eAttachment.left === 'left') {
                left -= targetWidth;
                tAttachment.left = 'left';
                left -= width;
                eAttachment.left = 'right';
              } else if (eAttachment.left === 'right') {
                left -= targetWidth;
                tAttachment.left = 'left';
                left += width;
                eAttachment.left = 'left';
              }
            } else if (tAttachment.left === 'center') {
              if (left + width > bounds[2] && eAttachment.left === 'left') {
                left -= width;
                eAttachment.left = 'right';
              } else if (left < bounds[0] && eAttachment.left === 'right') {
                left += width;
                eAttachment.left = 'left';
              }
            }
          }
          if (changeAttachY === 'element' || changeAttachY === 'both') {
            if (top < bounds[1] && eAttachment.top === 'bottom') {
              top += height;
              eAttachment.top = 'top';
            }
            if (top + height > bounds[3] && eAttachment.top === 'top') {
              top -= height;
              eAttachment.top = 'bottom';
            }
          }
          if (changeAttachX === 'element' || changeAttachX === 'both') {
            if (left < bounds[0] && eAttachment.left === 'right') {
              left += width;
              eAttachment.left = 'left';
            }
            if (left + width > bounds[2] && eAttachment.left === 'left') {
              left -= width;
              eAttachment.left = 'right';
            }
          }
          if (typeof pin === 'string') {
            pin = (function() {
              var _len4, _m, _ref7, _results;
              _ref7 = pin.split(',');
              _results = [];
              for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
                p = _ref7[_m];
                _results.push(p.trim());
              }
              return _results;
            })();
          } else if (pin === true) {
            pin = ['top', 'left', 'right', 'bottom'];
          }
          pin || (pin = []);
          pinned = [];
          oob = [];
          if (top < bounds[1]) {
            if (__indexOf.call(pin, 'top') >= 0) {
              top = bounds[1];
              pinned.push('top');
            } else {
              oob.push('top');
            }
          }
          if (top + height > bounds[3]) {
            if (__indexOf.call(pin, 'bottom') >= 0) {
              top = bounds[3] - height;
              pinned.push('bottom');
            } else {
              oob.push('bottom');
            }
          }
          if (left < bounds[0]) {
            if (__indexOf.call(pin, 'left') >= 0) {
              left = bounds[0];
              pinned.push('left');
            } else {
              oob.push('left');
            }
          }
          if (left + width > bounds[2]) {
            if (__indexOf.call(pin, 'right') >= 0) {
              left = bounds[2] - width;
              pinned.push('right');
            } else {
              oob.push('right');
            }
          }
          if (pinned.length) {
            pinnedClass = (_ref7 = this.options.pinnedClass) != null ? _ref7 : this.getClass('pinned');
            addClasses.push(pinnedClass);
            for (_m = 0, _len4 = pinned.length; _m < _len4; _m++) {
              side = pinned[_m];
              addClasses.push("" + pinnedClass + "-" + side);
            }
          }
          if (oob.length) {
            oobClass = (_ref8 = this.options.outOfBoundsClass) != null ? _ref8 : this.getClass('out-of-bounds');
            addClasses.push(oobClass);
            for (_n = 0, _len5 = oob.length; _n < _len5; _n++) {
              side = oob[_n];
              addClasses.push("" + oobClass + "-" + side);
            }
          }
          if (__indexOf.call(pinned, 'left') >= 0 || __indexOf.call(pinned, 'right') >= 0) {
            eAttachment.left = tAttachment.left = false;
          }
          if (__indexOf.call(pinned, 'top') >= 0 || __indexOf.call(pinned, 'bottom') >= 0) {
            eAttachment.top = tAttachment.top = false;
          }
          if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== this.attachment.top || eAttachment.left !== this.attachment.left) {
            this.updateAttachClasses(eAttachment, tAttachment);
          }
        }
        defer(function() {
          updateClasses(_this.target, addClasses, allClasses);
          return updateClasses(_this.element, addClasses, allClasses);
        });
        return {
          top: top,
          left: left
        };
      }
    });
  
  }).call(this);
  
  (function() {
    var defer, getBounds, updateClasses, _ref;
  
    _ref = this.Tether.Utils, getBounds = _ref.getBounds, updateClasses = _ref.updateClasses, defer = _ref.defer;
  
    this.Tether.modules.push({
      position: function(_arg) {
        var abutted, addClasses, allClasses, bottom, height, left, right, side, sides, targetPos, top, width, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4, _ref5,
          _this = this;
        top = _arg.top, left = _arg.left;
        _ref1 = this.cache('element-bounds', function() {
          return getBounds(_this.element);
        }), height = _ref1.height, width = _ref1.width;
        targetPos = this.getTargetBounds();
        bottom = top + height;
        right = left + width;
        abutted = [];
        if (top <= targetPos.bottom && bottom >= targetPos.top) {
          _ref2 = ['left', 'right'];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            side = _ref2[_i];
            if ((_ref3 = targetPos[side]) === left || _ref3 === right) {
              abutted.push(side);
            }
          }
        }
        if (left <= targetPos.right && right >= targetPos.left) {
          _ref4 = ['top', 'bottom'];
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            side = _ref4[_j];
            if ((_ref5 = targetPos[side]) === top || _ref5 === bottom) {
              abutted.push(side);
            }
          }
        }
        allClasses = [];
        addClasses = [];
        sides = ['left', 'top', 'right', 'bottom'];
        allClasses.push(this.getClass('abutted'));
        for (_k = 0, _len2 = sides.length; _k < _len2; _k++) {
          side = sides[_k];
          allClasses.push("" + (this.getClass('abutted')) + "-" + side);
        }
        if (abutted.length) {
          addClasses.push(this.getClass('abutted'));
        }
        for (_l = 0, _len3 = abutted.length; _l < _len3; _l++) {
          side = abutted[_l];
          addClasses.push("" + (this.getClass('abutted')) + "-" + side);
        }
        defer(function() {
          updateClasses(_this.target, addClasses, allClasses);
          return updateClasses(_this.element, addClasses, allClasses);
        });
        return true;
      }
    });
  
  }).call(this);
  
  (function() {
    this.Tether.modules.push({
      position: function(_arg) {
        var left, result, shift, shiftLeft, shiftTop, top, _ref;
        top = _arg.top, left = _arg.left;
        if (!this.options.shift) {
          return;
        }
        result = function(val) {
          if (typeof val === 'function') {
            return val.call(this, {
              top: top,
              left: left
            });
          } else {
            return val;
          }
        };
        shift = result(this.options.shift);
        if (typeof shift === 'string') {
          shift = shift.split(' ');
          shift[1] || (shift[1] = shift[0]);
          shiftTop = shift[0], shiftLeft = shift[1];
          shiftTop = parseFloat(shiftTop, 10);
          shiftLeft = parseFloat(shiftLeft, 10);
        } else {
          _ref = [shift.top, shift.left], shiftTop = _ref[0], shiftLeft = _ref[1];
        }
        top += shiftTop;
        left += shiftLeft;
        return {
          top: top,
          left: left
        };
      }
    });
  
  }).call(this);
  
  
  	root.Tether = this.Tether;
  
  	if (typeof define === 'function') {
  		define([],function() {
  			return root.Tether;
  		});
  	} else if (typeof exports === 'object') {
  		module.exports = root.Tether;
  	}
  }(this));
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/alignment.js
(typeof window === 'undefined' ? global : window).__f420c577506564c314d7d5d82088641c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
  
  var _tether = __c73084fddb2d02d92156231c79374859;
  
  var _tether2 = _interopRequireDefault(_tether);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ATTR_ALIGNMENT = 'alignment';
  var ATTR_ALIGNMENT_STATIC = 'alignment-static';
  var ATTR_CONTAINER = 'alignment-container';
  var CLASS_PREFIX_ALIGNMENT = 'aui-alignment';
  var CLASS_PREFIX_SIDE = 'aui-alignment-side-';
  var CLASS_PREFIX_SNAP = 'aui-alignment-snap-';
  var DEFAULT_ATTACHMENT = 'right middle';
  var attachmentMap = {
      'top left': { el: 'bottom left', target: 'top left' },
      'top center': { el: 'bottom center', target: 'top center' },
      'top right': { el: 'bottom right', target: 'top right' },
      'right top': { el: 'top left', target: 'top right' },
      'right middle': { el: 'middle left', target: 'middle right' },
      'right bottom': { el: 'bottom left', target: 'bottom right' },
      'bottom left': { el: 'top left', target: 'bottom left' },
      'bottom center': { el: 'top center', target: 'bottom center' },
      'bottom right': { el: 'top right', target: 'bottom right' },
      'left top': { el: 'top right', target: 'top left' },
      'left middle': { el: 'middle right', target: 'middle left' },
      'left bottom': { el: 'bottom right', target: 'bottom left' },
      'submenu left': { el: 'top left', target: 'top right' },
      'submenu right': { el: 'top right', target: 'top left' }
  };
  
  function hasClass(element, className) {
      return (' ' + element.className + ' ').indexOf(' ' + className + ' ') !== -1;
  }
  
  function addAlignmentClasses(element, side, snap) {
      var sideClass = CLASS_PREFIX_SIDE + side;
      var snapClass = CLASS_PREFIX_SNAP + snap;
  
      if (!hasClass(element, sideClass)) {
          element.className += ' ' + sideClass;
      }
  
      if (!hasClass(element, snapClass)) {
          element.className += ' ' + snapClass;
      }
  }
  
  function getAttribute(element, name) {
      return element.getAttribute(name) || element.getAttribute('data-aui-' + name);
  }
  
  function hasAttribute(element, name) {
      return element.hasAttribute(name) || element.hasAttribute('data-aui-' + name);
  }
  
  function getAlignment(element) {
      var _split = (getAttribute(element, ATTR_ALIGNMENT) || DEFAULT_ATTACHMENT).split(' '),
          _split2 = _slicedToArray(_split, 2),
          side = _split2[0],
          snap = _split2[1];
  
      return {
          side: side,
          snap: snap
      };
  }
  
  function getContainer(element) {
      var container = getAttribute(element, ATTR_CONTAINER) || window;
  
      if (typeof container === 'string') {
          container = document.querySelector(container);
      }
  
      return container;
  }
  
  function calculateBestAlignmentSnap(target, container) {
      var snap = 'left';
  
      if (!container || container === window || container === document) {
          container = document.documentElement;
      }
  
      if (container && container.nodeType && container.nodeType === Node.ELEMENT_NODE) {
          var containerBounds = container.getBoundingClientRect();
          var targetBounds = target.getBoundingClientRect();
  
          if (targetBounds.left > containerBounds.right / 2) {
              snap = 'right';
          }
      }
  
      return snap;
  }
  
  function getAttachment(side, snap) {
      return attachmentMap[side + ' ' + snap] || attachmentMap[DEFAULT_ATTACHMENT];
  }
  
  function Alignment(element, target) {
      var container = getContainer(element);
      var alignment = getAlignment(element);
  
      if (!alignment.snap || alignment.snap === 'auto') {
          alignment.snap = calculateBestAlignmentSnap(target, container);
      }
  
      var attachment = getAttachment(alignment.side, alignment.snap);
      var isStaticallyAligned = hasAttribute(element, ATTR_ALIGNMENT_STATIC);
      var tether = new _tether2.default({
          enabled: false,
          element: element,
          target: target,
          attachment: attachment.el,
          targetAttachment: attachment.target,
          classPrefix: CLASS_PREFIX_ALIGNMENT,
          constraints: [{
              // Try and keep the element on page
              to: container === window ? 'window' : container,
              attachment: isStaticallyAligned === true ? 'none' : 'together'
          }]
      });
  
      addAlignmentClasses(element, alignment.side, alignment.snap);
  
      this._auiTether = tether;
  }
  
  Alignment.prototype = {
      /**
       * Stops aligning and cleans up.
       *
       * @returns {Alignment}
       */
      destroy: function destroy() {
          this._auiTether.destroy();
          return this;
      },
  
      /**
       * Disables alignment.
       *
       * @returns {Alignment}
       */
      disable: function disable() {
          this._auiTether.disable();
          return this;
      },
  
      /**
       * Enables alignment.
       *
       * @returns {Alignment}
       */
      enable: function enable() {
          this._auiTether.enable();
          return this;
      }
  };
  
  exports.default = Alignment;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/polyfills/custom-event.js
(typeof window === 'undefined' ? global : window).__5a18a90cc502f556e87c4181f8a6b4ab = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  var CustomEvent = void 0;
  
  (function () {
      if (window.CustomEvent) {
          // Some browsers don't support constructable custom events yet.
          try {
              var ce = new window.CustomEvent('name', {
                  bubbles: false,
                  cancelable: true,
                  detail: {
                      x: 'y'
                  }
              });
              ce.preventDefault();
              if (ce.defaultPrevented !== true) {
                  throw new Error('Could not prevent default');
              }
              if (ce.type !== 'name') {
                  throw new Error('Could not set custom name');
              }
              if (ce.detail.x !== 'y') {
                  throw new Error('Could not set detail');
              }
  
              CustomEvent = window.CustomEvent;
              return;
          } catch (e) {
              // polyfill it
          }
      }
  
      /**
       * @type CustomEvent
       * @param {String} event - the name of the event.
       * @param {Object} [params] - optional configuration of the custom event.
       * @param {Boolean} [params.cancelable=false] - A boolean indicating whether the event is cancelable (i.e., can call preventDefault and set the defaultPrevented property).
       * @param {Boolean} [params.bubbles=false] - A boolean indicating whether the event bubbles up through the DOM or not.
       * @param {Boolean} [params.detail] - The data passed when initializing the event.
       * @extends Event
       * @returns {Event}
       * @constructor
       */
      CustomEvent = function CustomEvent(event, params) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
  
          var evt = document.createEvent('CustomEvent');
  
          evt.initCustomEvent(event, !!params.bubbles, !!params.cancelable, params.detail);
          var origPrevent = evt.preventDefault;
          evt.preventDefault = function () {
              origPrevent.call(this);
              try {
                  Object.defineProperty(this, 'defaultPrevented', {
                      get: function get() {
                          return true;
                      }
                  });
              } catch (e) {
                  this.defaultPrevented = true;
              }
          };
  
          return evt;
      };
  
      CustomEvent.prototype = window.Event.prototype;
  })();
  
  exports.default = CustomEvent;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/blanket.js
(typeof window === 'undefined' ? global : window).__594942bfcf520d6e5a0843b1cfdd039a = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.undim = exports.dim = undefined;
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _animation = __c0311e8841bd8637e025a8fb1474f693;
  
  var _createElement = __fd277fcde858b82a198666a405e85600;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var overflowEl;
  var _hiddenByAui = [];
  
  /**
   * Dims the screen using a blanket div
   * @param useShim deprecated, it is calculated by dim() now
   */
  function dim(useShim, zIndex) {
  
      //if we're blanketing the page it means we want to hide the whatever is under the blanket from the screen readers as well
      function hasAriaHidden(element) {
          return element.getAttribute('aria-hidden') ? true : false;
      }
  
      function isAuiLayer(element) {
          return element.className.match(/\baui-layer\b/) ? true : false;
      }
  
      Array.prototype.forEach.call(document.body.children, function (element) {
          if (!hasAriaHidden(element) && !isAuiLayer(element)) {
              element.setAttribute('aria-hidden', 'true');
              _hiddenByAui.push(element);
          }
      });
  
      if (!overflowEl) {
          overflowEl = document.body;
      }
  
      if (useShim === true) {
          useShimDeprecationLogger();
      }
  
      var isBlanketShowing = !!dim.$dim && dim.$dim.attr('aria-hidden') === 'false';
  
      if (!!dim.$dim) {
          dim.$dim.remove();
          dim.$dim = null;
      }
  
      dim.$dim = (0, _createElement2.default)('div').addClass('aui-blanket');
      dim.$dim.attr('tabindex', '0'); //required, or the last element's focusout event will go to the browser
      dim.$dim.appendTo(document.body);
  
      if (!isBlanketShowing) {
          //recompute after insertion and before setting aria-hidden=false to ensure we calculate a difference in
          //computed styles
          (0, _animation.recomputeStyle)(dim.$dim);
  
          AJS.dim.cachedOverflow = {
              overflow: overflowEl.style.overflow,
              overflowX: overflowEl.style.overflowX,
              overflowY: overflowEl.style.overflowY
          };
  
          overflowEl.style.overflowX = 'hidden';
          overflowEl.style.overflowY = 'hidden';
          overflowEl.style.overflow = 'hidden';
      }
  
      dim.$dim.attr('aria-hidden', 'false');
  
      if (zIndex) {
          dim.$dim.css({ zIndex: zIndex });
      }
  
      return dim.$dim;
  }
  
  /**
   * Removes semitransparent DIV
   * @see dim
   */
  function undim() {
      _hiddenByAui.forEach(function (element) {
          element.removeAttribute('aria-hidden');
      });
  
      _hiddenByAui = [];
  
      if (dim.$dim) {
          dim.$dim.attr('aria-hidden', 'true');
  
          if (overflowEl) {
              overflowEl.style.overflow = AJS.dim.cachedOverflow.overflow;
              overflowEl.style.overflowX = AJS.dim.cachedOverflow.overflowX;
              overflowEl.style.overflowY = AJS.dim.cachedOverflow.overflowY;
          }
      }
  }
  
  var useShimDeprecationLogger = (0, _deprecation.getMessageLogger)('useShim', {
      extraInfo: 'useShim has no alternative as it is now calculated by dim().'
  });
  
  (0, _globalize2.default)('dim', dim);
  (0, _globalize2.default)('undim', undim);
  
  exports.dim = dim;
  exports.undim = undim;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/focus-manager.js
(typeof window === 'undefined' ? global : window).__1c9e0b237fd336437964bc9b6dfa74ba = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (function initSelectors() {
      /*
      :tabbable and :focusable functions from jQuery UI v 1.10.4
      renamed to :aui-tabbable and :aui-focusable to not clash with jquery-ui if it's included.
      Code modified slightly to be compatible with jQuery < 1.8
      .addBack() replaced with .andSelf()
      $.curCSS() replaced with $.css()
       */
      function visible(element) {
          return _jquery2.default.css(element, 'visibility') === 'visible';
      }
  
      function focusable(element, isTabIndexNotNaN) {
          var nodeName = element.nodeName.toLowerCase();
  
          if (nodeName === 'aui-select') {
              return true;
          }
  
          if (nodeName === 'area') {
              var map = element.parentNode;
              var mapName = map.name;
              var imageMap = (0, _jquery2.default)('img[usemap=#' + mapName + ']').get();
  
              if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
                  return false;
              }
              return imageMap && visible(imageMap);
          }
          var isFormElement = /input|select|textarea|button|object/.test(nodeName);
          var isAnchor = nodeName === 'a';
          var isAnchorTabbable = element.href || isTabIndexNotNaN;
  
          return (isFormElement ? !element.disabled : isAnchor ? isAnchorTabbable : isTabIndexNotNaN) && visible(element);
      }
  
      function tabbable(element) {
          var tabIndex = _jquery2.default.attr(element, 'tabindex'),
              isTabIndexNaN = isNaN(tabIndex);
          var hasTabIndex = isTabIndexNaN || tabIndex >= 0;
  
          return hasTabIndex && focusable(element, !isTabIndexNaN);
      }
  
      _jquery2.default.extend(_jquery2.default.expr[':'], {
          'aui-focusable': function auiFocusable(element) {
              return focusable(element, !isNaN(_jquery2.default.attr(element, 'tabindex')));
          },
  
          'aui-tabbable': tabbable
      });
  })();
  
  var RESTORE_FOCUS_DATA_KEY = '_aui-focus-restore';
  function FocusManager() {
      this._focusTrapStack = [];
      (0, _jquery2.default)(document).on('focusout', { focusTrapStack: this._focusTrapStack }, focusTrapHandler);
  }
  FocusManager.defaultFocusSelector = ':aui-tabbable';
  FocusManager.prototype.enter = function ($el) {
      // remember focus on old element
      $el.data(RESTORE_FOCUS_DATA_KEY, (0, _jquery2.default)(document.activeElement));
  
      // focus on new selector
      if ($el.attr('data-aui-focus') !== 'false') {
          var focusSelector = $el.attr('data-aui-focus-selector') || FocusManager.defaultFocusSelector;
          var $focusEl = $el.is(focusSelector) ? $el : $el.find(focusSelector);
          $focusEl.first().focus();
      }
  
      if (elementTrapsFocus($el)) {
          trapFocus($el, this._focusTrapStack);
      }
  };
  
  function trapFocus($el, focusTrapStack) {
      focusTrapStack.push($el);
  }
  
  function untrapFocus(focusTrapStack) {
      focusTrapStack.pop();
  }
  
  function elementTrapsFocus($el) {
      return $el.is('.aui-dialog2');
  }
  
  FocusManager.prototype.exit = function ($el) {
      if (elementTrapsFocus($el)) {
          untrapFocus(this._focusTrapStack);
      }
  
      // AUI-1059: remove focus from the active element when dialog is hidden
      var activeElement = document.activeElement;
      if ($el[0] === activeElement || $el.has(activeElement).length) {
          (0, _jquery2.default)(activeElement).blur();
      }
  
      var $restoreFocus = $el.data(RESTORE_FOCUS_DATA_KEY);
      if ($restoreFocus && $restoreFocus.length) {
          $el.removeData(RESTORE_FOCUS_DATA_KEY);
          $restoreFocus.focus();
      }
  };
  
  function focusTrapHandler(event) {
      var focusTrapStack = event.data.focusTrapStack;
  
      if (!event.relatedTarget) {
          //Does not work in firefox, see https://bugzilla.mozilla.org/show_bug.cgi?id=687787
          return;
      }
  
      if (focusTrapStack.length === 0) {
          return;
      }
  
      var $focusTrapElement = focusTrapStack[focusTrapStack.length - 1];
  
      var focusOrigin = event.target;
      var focusTo = event.relatedTarget;
  
      var $tabbableElements = $focusTrapElement.find(':aui-tabbable');
      var $firstTabbableElement = (0, _jquery2.default)($tabbableElements.first());
      var $lastTabbableElement = (0, _jquery2.default)($tabbableElements.last());
  
      var elementContainsOrigin = $focusTrapElement.has(focusTo).length === 0;
      var focusLeavingElement = elementContainsOrigin && focusTo;
      if (focusLeavingElement) {
          if ($firstTabbableElement.is(focusOrigin)) {
              $lastTabbableElement.focus();
          } else if ($lastTabbableElement.is(focusOrigin)) {
              $firstTabbableElement.focus();
          }
      }
  }
  
  FocusManager.global = new FocusManager();
  
  (0, _globalize2.default)('FocusManager', FocusManager);
  
  exports.default = FocusManager;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/widget.js
(typeof window === 'undefined' ? global : window).__e3152236c406a356c24f20f7bfcccf21 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (name, Ctor) {
      var dataAttr = '_aui-widget-' + name;
      return function (selectorOrOptions, maybeOptions) {
          var selector;
          var options;
          if (_jquery2.default.isPlainObject(selectorOrOptions)) {
              options = selectorOrOptions;
          } else {
              selector = selectorOrOptions;
              options = maybeOptions;
          }
  
          var $el = selector && (0, _jquery2.default)(selector);
  
          var widget;
          if (!$el || !$el.data(dataAttr)) {
              widget = new Ctor($el, options || {});
              $el = widget.$el;
              $el.data(dataAttr, widget);
          } else {
              widget = $el.data(dataAttr);
              // options are discarded if $el has already been constructed
          }
  
          return widget;
      };
  };
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  module.exports = exports['default'];
  
  /**
   * @param {string} name The name of the widget to use in any messaging.
   * @param {function(new:{ $el: jQuery }, ?jQuery, ?Object)} Ctor
   *     A constructor which will only ever be called with "new". It must take a JQuery object as the first
   *     parameter, or generate one if not provided. The second parameter will be a configuration object.
   *     The returned object must have an $el property and a setOptions function.
   * @constructor
   */
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/layer.js
(typeof window === 'undefined' ? global : window).__fe0cd0a7ef176e2ef4e0e105d1ce31f5 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _blanket = __594942bfcf520d6e5a0843b1cfdd039a;
  
  var _focusManager = __1c9e0b237fd336437964bc9b6dfa74ba;
  
  var _focusManager2 = _interopRequireDefault(_focusManager);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _widget = __e3152236c406a356c24f20f7bfcccf21;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  var _customEvent = __5a18a90cc502f556e87c4181f8a6b4ab;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var EVENT_PREFIX = '_aui-internal-layer-';
  var GLOBAL_EVENT_PREFIX = '_aui-internal-layer-global-';
  var LAYER_EVENT_PREFIX = 'aui-layer-';
  var AUI_EVENT_PREFIX = 'aui-';
  var $doc = (0, _jquery2.default)(document);
  
  // AUI-3708 - Abstracted to reflect code implemented upstream.
  function isTransitioning(el, prop) {
      var transition = window.getComputedStyle(el).transitionProperty;
      return transition ? transition.indexOf(prop) > -1 : false;
  }
  
  function onTransitionEnd(el, prop, func, once) {
      function handler(e) {
          if (prop !== e.propertyName) {
              return;
          }
  
          func.call(el);
  
          if (once) {
              el.removeEventListener('transitionend', handler);
          }
      }
  
      if (isTransitioning(el, prop)) {
          el.addEventListener('transitionend', handler);
      } else {
          func.call(el);
      }
  }
  
  function oneTransitionEnd(el, prop, func) {
      onTransitionEnd(el, prop, func, true);
  }
  // end AUI-3708
  
  function ariaHide($el) {
      $el.attr('aria-hidden', 'true');
  }
  
  function ariaShow($el) {
      $el.attr('aria-hidden', 'false');
  }
  
  /**
  * @return {bool} Returns false if at least one of the event handlers called .preventDefault(). Returns true otherwise.
  */
  function triggerEvent($el, deprecatedName, newNativeName) {
      var e1 = _jquery2.default.Event(EVENT_PREFIX + deprecatedName);
      var e2 = _jquery2.default.Event(GLOBAL_EVENT_PREFIX + deprecatedName);
      // TODO: Remove this 'aui-layer-' prefixed event once it is no longer used by inline dialog and dialog2.
      var nativeEvent = new _customEvent2.default(LAYER_EVENT_PREFIX + newNativeName, {
          bubbles: true,
          cancelable: true
      });
      var nativeEvent2 = new _customEvent2.default(AUI_EVENT_PREFIX + newNativeName, {
          bubbles: true,
          cancelable: true
      });
  
      $el.trigger(e1);
      $el.trigger(e2, [$el]);
      $el[0].dispatchEvent(nativeEvent);
      $el[0].dispatchEvent(nativeEvent2);
  
      return !e1.isDefaultPrevented() && !e2.isDefaultPrevented() && !nativeEvent.defaultPrevented && !nativeEvent2.defaultPrevented;
  }
  
  function Layer(selector) {
      this.$el = (0, _jquery2.default)(selector || '<div class="aui-layer" aria-hidden="true"></div>');
      this.$el.addClass('aui-layer');
  }
  
  Layer.prototype = {
      /**
       * Returns the layer below the current layer if it exists.
       *
       * @returns {jQuery | undefined}
       */
      below: function below() {
          return LayerManager.global.item(LayerManager.global.indexOf(this.$el) - 1);
      },
  
      /**
       * Returns the layer above the current layer if it exists.
       *
       * @returns {jQuery | undefined}
       */
      above: function above() {
          return LayerManager.global.item(LayerManager.global.indexOf(this.$el) + 1);
      },
  
      /**
       * Sets the width and height of the layer.
       *
       * @param {Integer} width The width to set.
       * @param {Integer} height The height to set.
       *
       * @returns {Layer}
       */
      changeSize: function changeSize(width, height) {
          this.$el.css('width', width);
          this.$el.css('height', height === 'content' ? '' : height);
          return this;
      },
  
      /**
       * Binds a layer event.
       *
       * @param {String} event The event name to listen to.
       * @param {Function} fn The event handler.
       *
       * @returns {Layer}
       */
      on: function on(event, fn) {
          this.$el.on(EVENT_PREFIX + event, fn);
          return this;
      },
  
      /**
       * Unbinds a layer event.
       *
       * @param {String} event The event name to unbind=.
       * @param {Function} fn Optional. The event handler.
       *
       * @returns {Layer}
       */
      off: function off(event, fn) {
          this.$el.off(EVENT_PREFIX + event, fn);
          return this;
      },
  
      /**
       * Shows the layer.
       *
       * @returns {Layer}
       */
      show: function show() {
          if (this.isVisible()) {
              ariaShow(this.$el);
              return this;
          }
  
          if (!triggerEvent(this.$el, 'beforeShow', 'show')) {
              return this;
          }
  
          // AUI-3708
          // Ensures that the display property is removed if it's been added
          // during hiding.
          if (this.$el.css('display') === 'none') {
              this.$el.css('display', '');
          }
  
          LayerManager.global.push(this.$el);
  
          return this;
      },
  
      /**
       * Hides the layer.
       *
       * @returns {Layer}
       */
      hide: function hide() {
          if (!this.isVisible()) {
              ariaHide(this.$el);
              return this;
          }
  
          if (!triggerEvent(this.$el, 'beforeHide', 'hide')) {
              return this;
          }
  
          // AUI-3708
          var thisLayer = this;
          oneTransitionEnd(this.$el.get(0), 'opacity', function () {
              if (!thisLayer.isVisible()) {
                  this.style.display = 'none';
              }
          });
  
          LayerManager.global.popUntil(this.$el);
  
          return this;
      },
  
      /**
       * Checks to see if the layer is visible.
       *
       * @returns {Boolean}
       */
      isVisible: function isVisible() {
          return this.$el.attr('aria-hidden') === 'false';
      },
  
      /**
       * Removes the layer and cleans up internal state.
       *
       * @returns {undefined}
       */
      remove: function remove() {
          this.hide();
          this.$el.remove();
          this.$el = null;
      },
  
      /**
       * Returns whether or not the layer is blanketed.
       *
       * @returns {Boolean}
       */
      isBlanketed: function isBlanketed() {
          return this.$el.attr('data-aui-blanketed') === 'true';
      },
  
      /**
       * Returns whether or not the layer is persistent.
       *
       * @returns {Boolean}
       */
      isPersistent: function isPersistent() {
          var modal = this.$el.attr('modal') || this.$el.attr('data-aui-modal');
          var isPersistent = this.$el[0].hasAttribute('persistent');
  
          return modal === 'true' || isPersistent;
      },
  
      _hideLayer: function _hideLayer(triggerBeforeEvents) {
          if (this.isPersistent() || this.isBlanketed()) {
              _focusManager2.default.global.exit(this.$el);
          }
  
          if (triggerBeforeEvents) {
              triggerEvent(this.$el, 'beforeHide', 'hide');
          }
  
          this.$el.attr('aria-hidden', 'true');
          this.$el.css('z-index', this.$el.data('_aui-layer-cached-z-index') || '');
          this.$el.data('_aui-layer-cached-z-index', '');
          this.$el.trigger(EVENT_PREFIX + 'hide');
          this.$el.trigger(GLOBAL_EVENT_PREFIX + 'hide', [this.$el]);
      },
  
      _showLayer: function _showLayer(zIndex) {
          if (!this.$el.parent().is('body')) {
              this.$el.appendTo(document.body);
          }
  
          this.$el.data('_aui-layer-cached-z-index', this.$el.css('z-index'));
          this.$el.css('z-index', zIndex);
          this.$el.attr('aria-hidden', 'false');
  
          if (this.isPersistent() || this.isBlanketed()) {
              _focusManager2.default.global.enter(this.$el);
          }
  
          this.$el.trigger(EVENT_PREFIX + 'show');
          this.$el.trigger(GLOBAL_EVENT_PREFIX + 'show', [this.$el]);
      }
  };
  
  var createLayer = (0, _widget2.default)('layer', Layer);
  
  createLayer.on = function (eventName, selector, fn) {
      $doc.on(GLOBAL_EVENT_PREFIX + eventName, selector, fn);
      return this;
  };
  
  createLayer.off = function (eventName, selector, fn) {
      $doc.off(GLOBAL_EVENT_PREFIX + eventName, selector, fn);
      return this;
  };
  
  // Layer Manager
  // -------------
  
  /**
   * Manages layers.
   *
   * There is a single global layer manager.
   * Additional instances can be created however this should generally only be used in tests.
   *
   * Layers are added by the push($el) method. Layers are removed by the
   * popUntil($el) method.
   *
   * popUntil's contract is that it pops all layers above & including the given
   * layer. This is used to support popping multiple layers.
   * Say we were showing a dropdown inside an inline dialog inside a dialog - we
   * have a stack of dialog layer, inline dialog layer, then dropdown layer. Calling
   * popUntil(dialog.$el) would hide all layers above & including the dialog.
   */
  
  function getTrigger($layer) {
      return (0, _jquery2.default)('[aria-controls="' + $layer.attr('id') + '"]');
  }
  
  function hasTrigger($layer) {
      return getTrigger($layer).length > 0;
  }
  
  function topIndexWhere(layerArr, fn) {
      var i = layerArr.length;
  
      while (i--) {
          if (fn(layerArr[i])) {
              return i;
          }
      }
  
      return -1;
  }
  
  function layerIndex(layerArr, $el) {
      return topIndexWhere(layerArr, function ($layer) {
          return $layer[0] === $el[0];
      });
  }
  
  function topBlanketedIndex(layerArr) {
      return topIndexWhere(layerArr, function ($layer) {
          return createLayer($layer).isBlanketed();
      });
  }
  
  function nextZIndex(layerArr) {
      var _nextZIndex;
  
      if (layerArr.length) {
          var $topEl = layerArr[layerArr.length - 1];
          var zIndex = parseInt($topEl.css('z-index'), 10);
          _nextZIndex = (isNaN(zIndex) ? 0 : zIndex) + 100;
      } else {
          _nextZIndex = 0;
      }
  
      return Math.max(3000, _nextZIndex);
  }
  
  function updateBlanket(stack, oldBlanketIndex) {
      var newTopBlanketedIndex = topBlanketedIndex(stack);
  
      if (oldBlanketIndex !== newTopBlanketedIndex) {
          if (newTopBlanketedIndex > -1) {
              (0, _blanket.dim)(false, stack[newTopBlanketedIndex].css('z-index') - 20);
          } else {
              (0, _blanket.undim)();
          }
      }
  }
  
  function popLayers(stack, stopIndex, forceClosePersistent) {
      if (stopIndex < 0) {
          return;
      }
  
      for (var a = stack.length - 1; a >= stopIndex; a--) {
          var $layer = stack[a];
          var layer = createLayer($layer);
  
          if (forceClosePersistent || !layer.isPersistent()) {
              layer._hideLayer(true);
              stack.splice(a, 1);
          }
      }
  }
  
  function getParentLayer($childLayer) {
      var $layerTrigger = getTrigger($childLayer);
  
      if ($layerTrigger.length > 0) {
          return $layerTrigger.closest('.aui-layer');
      }
  }
  
  function LayerManager() {
      this._stack = [];
  }
  
  LayerManager.prototype = {
      /**
      * Pushes a layer onto the stack. The same element cannot be opened as a layer multiple times - if the given
      * element is already an open layer, this method throws an exception.
      *
      * @param {HTMLElement | String | jQuery} element  The element to push onto the stack.
      *
      * @returns {LayerManager}
      */
      push: function push(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          if (layerIndex(this._stack, $el) >= 0) {
              throw new Error('The given element is already an active layer.');
          }
  
          this.popLayersBeside($el);
  
          var layer = createLayer($el);
          var zIndex = nextZIndex(this._stack);
  
          layer._showLayer(zIndex);
  
          if (layer.isBlanketed()) {
              (0, _blanket.dim)(false, zIndex - 20);
          }
  
          this._stack.push($el);
  
          return this;
      },
  
      popLayersBeside: function popLayersBeside(element) {
          var $layer = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          if (!hasTrigger($layer)) {
              // We can't find this layer's trigger, we will pop all non-persistent until a blanket or the document
              var blanketedIndex = topBlanketedIndex(this._stack);
              popLayers(this._stack, ++blanketedIndex, false);
              return;
          }
  
          var $parentLayer = getParentLayer($layer);
          if ($parentLayer) {
              var parentIndex = this.indexOf($parentLayer);
              popLayers(this._stack, ++parentIndex, false);
          } else {
              popLayers(this._stack, 0, false);
          }
      },
  
      /**
      * Returns the index of the specified layer in the layer stack.
      *
      * @param {HTMLElement | String | jQuery} element  The element to find in the stack.
      *
      * @returns {Number} the (zero-based) index of the element, or -1 if not in the stack.
      */
      indexOf: function indexOf(element) {
          return layerIndex(this._stack, (0, _jquery2.default)(element));
      },
  
      /**
      * Returns the item at the particular index or false.
      *
      * @param {Number} index The index of the element to get.
      *
      * @returns {jQuery | Boolean}
      */
      item: function item(index) {
          return this._stack[index];
      },
  
      /**
      * Hides all layers in the stack.
      *
      * @returns {LayerManager}
      */
      hideAll: function hideAll() {
          this._stack.reverse().forEach(function (element) {
              var layer = createLayer(element);
              if (layer.isBlanketed() || layer.isPersistent()) {
                  return;
              }
              layer.hide();
          });
  
          return this;
      },
  
      /**
      * Gets the previous layer below the given layer, which is non modal and non persistent. If it finds a blanketed layer on the way
      * it returns it regardless if it is modal or not
      *
      * @param {HTMLElement | String | jQuery} element layer to start the search from.
      *
      * @returns {jQuery | null} the next matching layer or null if none found.
      */
      getNextLowerNonPersistentOrBlanketedLayer: function getNextLowerNonPersistentOrBlanketedLayer(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          var index = layerIndex(this._stack, $el);
  
          if (index < 0) {
              return null;
          }
  
          var $nextEl;
          index--;
          while (index >= 0) {
              $nextEl = this._stack[index];
              var layer = createLayer($nextEl);
  
              if (!layer.isPersistent() || layer.isBlanketed()) {
                  return $nextEl;
              }
              index--;
          }
  
          return null;
      },
  
      /**
      * Gets the next layer which is neither modal or blanketed, from the given layer.
      *
      * @param {HTMLElement | String | jQuery} element layer to start the search from.
      *
      * @returns {jQuery | null} the next non modal non blanketed layer or null if none found.
      */
      getNextHigherNonPeristentAndNonBlanketedLayer: function getNextHigherNonPeristentAndNonBlanketedLayer(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          var index = layerIndex(this._stack, $el);
  
          if (index < 0) {
              return null;
          }
  
          var $nextEl;
          index++;
          while (index < this._stack.length) {
              $nextEl = this._stack[index];
              var layer = createLayer($nextEl);
  
              if (!(layer.isPersistent() || layer.isBlanketed())) {
                  return $nextEl;
              }
              index++;
          }
  
          return null;
      },
  
      /**
      * Removes all non-modal layers above & including the given element. If the given element is not an active layer, this method
      * is a no-op. The given element will be removed regardless of whether or not it is modal.
      *
      * @param {HTMLElement | String | jQuery} element layer to pop.
      *
      * @returns {jQuery} The last layer that was popped, or null if no layer matching the given $el was found.
      */
      popUntil: function popUntil(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          var index = layerIndex(this._stack, $el);
  
          if (index === -1) {
              return null;
          }
  
          var oldTopBlanketedIndex = topBlanketedIndex(this._stack);
  
          // Removes all layers above the current one.
          popLayers(this._stack, index + 1, createLayer($el).isBlanketed());
  
          // Removes the current layer.
          createLayer($el)._hideLayer();
          this._stack.splice(index, 1);
  
          updateBlanket(this._stack, oldTopBlanketedIndex);
  
          return $el;
      },
  
      /**
      * Gets the top layer, if it exists.
      *
      * @returns The layer on top of the stack, if it exists, otherwise null.
      */
      getTopLayer: function getTopLayer() {
          if (!this._stack.length) {
              return null;
          }
  
          var $topLayer = this._stack[this._stack.length - 1];
  
          return $topLayer;
      },
  
      /**
      * Pops the top layer, if it exists and it is non modal and non persistent.
      *
      * @returns The layer that was popped, if it was popped.
      */
      popTopIfNonPersistent: function popTopIfNonPersistent() {
          var $topLayer = this.getTopLayer();
          var layer = createLayer($topLayer);
  
          if (!$topLayer || layer.isPersistent()) {
              return null;
          }
  
          return this.popUntil($topLayer);
      },
  
      /**
      * Pops all layers above and including the top blanketed layer. If layers exist but none are blanketed, this method
      * does nothing.
      *
      * @returns The blanketed layer that was popped, if it exists, otherwise null.
      */
      popUntilTopBlanketed: function popUntilTopBlanketed() {
          var i = topBlanketedIndex(this._stack);
  
          if (i < 0) {
              return null;
          }
  
          var $topBlanketedLayer = this._stack[i];
          var layer = createLayer($topBlanketedLayer);
  
          if (layer.isPersistent()) {
              // We can't pop the blanketed layer, only the things ontop
              var $next = this.getNextHigherNonPeristentAndNonBlanketedLayer($topBlanketedLayer);
              if ($next) {
                  var stopIndex = layerIndex(this._stack, $next);
                  popLayers(this._stack, stopIndex, true);
                  return $next;
              }
              return null;
          }
  
          popLayers(this._stack, i, true);
          updateBlanket(this._stack, i);
          return $topBlanketedLayer;
      },
  
      /**
      * Pops all layers above and including the top persistent layer. If layers exist but none are persistent, this method
      * does nothing.
      */
      popUntilTopPersistent: function popUntilTopPersistent() {
          var $toPop = LayerManager.global.getTopLayer();
          if (!$toPop) {
              return;
          }
  
          var stopIndex;
          var oldTopBlanketedIndex = topBlanketedIndex(this._stack);
  
          var toPop = createLayer($toPop);
          if (toPop.isPersistent()) {
              if (toPop.isBlanketed()) {
                  return;
              } else {
                  // Get the closest non modal layer below, stop at the first blanketed layer though, we don't want to pop below that
                  $toPop = LayerManager.global.getNextLowerNonPersistentOrBlanketedLayer($toPop);
                  toPop = createLayer($toPop);
  
                  if ($toPop && !toPop.isPersistent()) {
                      stopIndex = layerIndex(this._stack, $toPop);
                      popLayers(this._stack, stopIndex, true);
                      updateBlanket(this._stack, oldTopBlanketedIndex);
                  } else {
                      // Here we have a blanketed persistent layer
                      return;
                  }
              }
          } else {
              stopIndex = layerIndex(this._stack, $toPop);
              popLayers(this._stack, stopIndex, true);
              updateBlanket(this._stack, oldTopBlanketedIndex);
          }
      }
  };
  
  // LayerManager.global
  // -------------------
  
  function initCloseLayerOnEscPress() {
      $doc.on('keydown', function (e) {
          if (e.keyCode === _keyCode2.default.ESCAPE) {
              LayerManager.global.popUntilTopPersistent();
              e.preventDefault();
          }
      });
  }
  
  function initCloseLayerOnBlanketClick() {
      $doc.on('click', '.aui-blanket', function (e) {
          if (LayerManager.global.popUntilTopBlanketed()) {
              e.preventDefault();
          }
      });
  }
  
  function hasLayer($trigger) {
      if (!$trigger.length) {
          return false;
      }
  
      var layer = document.getElementById($trigger.attr('aria-controls'));
      return LayerManager.global.indexOf(layer) > -1;
  }
  
  // If it's a click on a trigger, do nothing.
  // If it's a click on a layer, close all layers above.
  // Otherwise, close all layers.
  function initCloseLayerOnOuterClick() {
      $doc.on('click', function (e) {
          var $target = (0, _jquery2.default)(e.target);
          if ($target.closest('.aui-blanket').length) {
              return;
          }
  
          var $trigger = $target.closest('[aria-controls]');
          var $layer = $target.closest('.aui-layer');
          if (!$layer.length && !hasLayer($trigger)) {
              LayerManager.global.hideAll();
              return;
          }
  
          // Triggers take precedence over layers
          if (hasLayer($trigger)) {
              return;
          }
  
          if ($layer.length) {
              // We dont want to explicitly call close on a modal dialog if it happens to be next.
              // All blanketed layers should be below us, as otherwise the blanket should have caught the click.
              // We make sure we dont close a blanketed one explicitly as a hack, this is to fix the problem arising
              // from dialog2 triggers inside dialog2's having no aria controls, where the dialog2 that was just
              // opened would be closed instantly
              var $next = LayerManager.global.getNextHigherNonPeristentAndNonBlanketedLayer($layer);
  
              if ($next) {
                  createLayer($next).hide();
              }
          }
      });
  }
  
  initCloseLayerOnEscPress();
  initCloseLayerOnBlanketClick();
  initCloseLayerOnOuterClick();
  
  LayerManager.global = new LayerManager();
  createLayer.Manager = LayerManager;
  
  (0, _globalize2.default)('layer', createLayer);
  
  exports.default = createLayer;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/state.js
(typeof window === 'undefined' ? global : window).__fd7d82ce22cd33cac1609667ce8040f9 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  function state(element) {
      return {
          /**
           * sets an internal state on a component element
           * @param element the element to which the state will be added
           * @param stateName the name of the state
           * @param stateValue the value that the state will be changed to
           */
          set: function set(stateName, stateValue) {
              if (element._state === undefined) {
                  element._state = {};
              }
  
              element._state[stateName] = stateValue;
          },
  
          /**
           * gets an internal state on a component element
           * @param element the element to which the state will be added
           * @param stateName the name of the state
           */
          get: function get(stateName) {
              if (element._state) {
                  return element._state[stateName];
              }
          }
      };
  }
  
  exports.default = state;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/dropdown2.js
(typeof window === 'undefined' ? global : window).__05701638a79b5b92cc62cfe475ac143b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _skatejsTemplateHtml = __f52b7059926ab2bdcd0aee12b4bc782b;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _debounce = __c6e18cf9266fe56d02f78a6e812f58db;
  
  var _browser = __5e80b2d38fa1ffdd67aa3d521738d499;
  
  var _alignment = __f420c577506564c314d7d5d82088641c;
  
  var _alignment2 = _interopRequireDefault(_alignment);
  
  var _customEvent = __5a18a90cc502f556e87c4181f8a6b4ab;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _layer = __fe0cd0a7ef176e2ef4e0e105d1ce31f5;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  var _state = __fd7d82ce22cd33cac1609667ce8040f9;
  
  var _state2 = _interopRequireDefault(_state);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function isChecked(el) {
      return (0, _jquery2.default)(el).is('.checked, .aui-dropdown2-checked, [aria-checked="true"]');
  }
  
  function getTrigger(control) {
      return control._triggeringElement || document.querySelector('[aria-controls="' + control.id + '"]');
  }
  
  function doIfTrigger(triggerable, callback) {
      var trigger = getTrigger(triggerable);
  
      if (trigger) {
          callback(trigger);
      }
  }
  
  function setDropdownTriggerActiveState(trigger, isActive) {
      var $trigger = (0, _jquery2.default)(trigger);
  
      if (isActive) {
          $trigger.attr('aria-expanded', 'true');
          $trigger.addClass('active aui-dropdown2-active');
      } else {
          $trigger.attr('aria-expanded', 'false');
          $trigger.removeClass('active aui-dropdown2-active');
      }
  }
  
  // LOADING STATES
  var UNLOADED = 'unloaded';
  var LOADING = 'loading';
  var ERROR = 'error';
  var SUCCESS = 'success';
  
  // ASYNC DROPDOWN FUNCTIONS
  
  function makeAsyncDropdownContents(json) {
      var dropdownContents = json.map(function makeSection(sectionData) {
          var sectionItemsHtml = sectionData.items.map(function makeSectionItem(itemData) {
              function makeBooleanAttribute(attr) {
                  return itemData[attr] ? attr + ' ="true"' : '';
              }
  
              function makeAttribute(attr) {
                  return itemData[attr] ? attr + '="' + itemData[attr] + '"' : '';
              }
  
              var tagName = 'aui-item-' + itemData.type;
              var itemHtml = '\n                <' + tagName + ' ' + makeAttribute('for') + ' ' + makeAttribute('href') + ' ' + makeBooleanAttribute('interactive') + '\n                    ' + makeBooleanAttribute('checked') + ' ' + makeBooleanAttribute('disabled') + ' ' + makeBooleanAttribute('hidden') + '>\n                    ' + itemData.content + '\n                </' + tagName + '>';
  
              return itemHtml;
          }).join('');
  
          var sectionAttributes = sectionData.label ? 'label="' + sectionData.label + '"' : '';
          var sectionHtml = '\n            <aui-section ' + sectionAttributes + '>\n                ' + sectionItemsHtml + '\n            </aui-section>';
  
          return sectionHtml;
      }).join('\n');
  
      return dropdownContents;
  }
  
  function setDropdownContents(dropdown, json) {
      (0, _state2.default)(dropdown).set('loading-state', SUCCESS);
      _skatejsTemplateHtml2.default.wrap(dropdown).innerHTML = makeAsyncDropdownContents(json);
      _skate2.default.init(dropdown);
  }
  
  function setDropdownErrorState(dropdown) {
      (0, _state2.default)(dropdown).set('loading-state', ERROR);
      (0, _state2.default)(dropdown).set('hasErrorBeenShown', dropdown.isVisible());
      _skatejsTemplateHtml2.default.wrap(dropdown).innerHTML = '\n        <div class="aui-message aui-message-error aui-dropdown-error">\n            <p>' + AJS.I18n.getText('aui.dropdown.async.error') + '</p>\n        </div>\n    ';
  }
  
  function setDropdownLoadingState(dropdown) {
      (0, _state2.default)(dropdown).set('loading-state', LOADING);
      (0, _state2.default)(dropdown).set('hasErrorBeenShown', false);
  
      doIfTrigger(dropdown, function (trigger) {
          trigger.setAttribute('aria-busy', 'true');
      });
  
      _skatejsTemplateHtml2.default.wrap(dropdown).innerHTML = '\n        <div class="aui-dropdown-loading">\n            <span class="spinner"></span> ' + AJS.I18n.getText('aui.dropdown.async.loading') + '\n        </div>\n    ';
      (0, _jquery2.default)(dropdown).find('.spinner').spin();
  }
  
  function setDropdownLoaded(dropdown) {
      doIfTrigger(dropdown, function (trigger) {
          trigger.setAttribute('aria-busy', 'false');
      });
  }
  
  function loadContentsIfAsync(dropdown) {
      if (!dropdown.src || (0, _state2.default)(dropdown).get('loading-state') === LOADING) {
          return;
      }
  
      setDropdownLoadingState(dropdown);
  
      _jquery2.default.ajax(dropdown.src).done(function (json, status, xhr) {
          var isValidStatus = xhr.status === 200;
          if (isValidStatus) {
              setDropdownContents(dropdown, json);
          } else {
              setDropdownErrorState(dropdown);
          }
      }).fail(function () {
          setDropdownErrorState(dropdown);
      }).always(function () {
          setDropdownLoaded(dropdown);
      });
  }
  
  function loadContentWhenMouseEnterTrigger(dropdown) {
      var isDropdownUnloaded = (0, _state2.default)(dropdown).get('loading-state') === UNLOADED;
      var hasCurrentErrorBeenShown = (0, _state2.default)(dropdown).get('hasErrorBeenShown');
      if (isDropdownUnloaded || hasCurrentErrorBeenShown && !dropdown.isVisible()) {
          loadContentsIfAsync(dropdown);
      }
  }
  
  function loadContentWhenMenuShown(dropdown) {
      var isDropdownUnloaded = (0, _state2.default)(dropdown).get('loading-state') === UNLOADED;
      var hasCurrentErrorBeenShown = (0, _state2.default)(dropdown).get('hasErrorBeenShown');
      if (isDropdownUnloaded || hasCurrentErrorBeenShown) {
          loadContentsIfAsync(dropdown);
      }
      if ((0, _state2.default)(dropdown).get('loading-state') === ERROR) {
          (0, _state2.default)(dropdown).set('hasErrorBeenShown', true);
      }
  }
  
  // The dropdown's trigger
  // ----------------------
  
  function triggerCreated(trigger) {
      var dropdownID = trigger.getAttribute('aria-controls');
  
      if (!dropdownID) {
          dropdownID = trigger.getAttribute('aria-owns');
  
          if (!dropdownID) {
              logger.error('Dropdown triggers need either a "aria-owns" or "aria-controls" attribute');
          } else {
              trigger.removeAttribute('aria-owns');
              trigger.setAttribute('aria-controls', dropdownID);
          }
      }
  
      trigger.setAttribute('aria-haspopup', true);
      trigger.setAttribute('aria-expanded', false);
  
      var shouldSetHref = trigger.nodeName === 'A' && !trigger.href;
      if (shouldSetHref) {
          trigger.setAttribute('href', '#' + dropdownID);
      }
  
      function handleIt(e) {
          e.preventDefault();
  
          if (!trigger.isEnabled()) {
              return;
          }
  
          var dropdown = document.getElementById(dropdownID);
  
          // AUI-4271 - Maintains legacy integration with parent elements.
          var $trigger = (0, _jquery2.default)(trigger);
          if ($trigger.parent().hasClass('aui-buttons')) {
              dropdown.classList.add('aui-dropdown2-in-buttons');
          }
          if ($trigger.parents().hasClass('aui-header')) {
              dropdown.classList.add('aui-dropdown2-in-header');
          }
  
          dropdown.toggle(e);
          dropdown.isSubmenu = trigger.hasSubmenu();
  
          return dropdown;
      }
  
      function handleMouseEnter(e) {
          e.preventDefault();
  
          if (!trigger.isEnabled()) {
              return;
          }
  
          var dropdown = document.getElementById(dropdownID);
          loadContentWhenMouseEnterTrigger(dropdown);
  
          if (trigger.hasSubmenu()) {
              dropdown.show(e);
              dropdown.isSubmenu = trigger.hasSubmenu();
          }
  
          return dropdown;
      }
  
      function handleKeydown(e) {
          var normalInvoke = e.keyCode === _keyCode2.default.ENTER || e.keyCode === _keyCode2.default.SPACE;
          var submenuInvoke = e.keyCode === _keyCode2.default.RIGHT && trigger.hasSubmenu();
          var rootMenuInvoke = (e.keyCode === _keyCode2.default.UP || e.keyCode === _keyCode2.default.DOWN) && !trigger.hasSubmenu();
  
          if (normalInvoke || submenuInvoke || rootMenuInvoke) {
              var dropdown = handleIt(e);
  
              if (dropdown) {
                  dropdown.focusItem(0);
              }
          }
      }
  
      (0, _jquery2.default)(trigger).on('aui-button-invoke', handleIt).on('click', handleIt).on('keydown', handleKeydown).on('mouseenter', handleMouseEnter);
  }
  
  var triggerPrototype = {
      disable: function disable() {
          this.setAttribute('aria-disabled', 'true');
      },
  
      enable: function enable() {
          this.setAttribute('aria-disabled', 'false');
      },
  
      isEnabled: function isEnabled() {
          return this.getAttribute('aria-disabled') !== 'true';
      },
  
      hasSubmenu: function hasSubmenu() {
          var triggerClasses = (this.className || '').split(/\s+/);
          return triggerClasses.indexOf('aui-dropdown2-sub-trigger') !== -1;
      }
  };
  
  (0, _skate2.default)('aui-dropdown2-trigger', {
      type: _skate2.default.type.CLASSNAME,
      created: triggerCreated,
      prototype: triggerPrototype
  });
  
  //To remove at a later date. Some dropdown triggers initialise lazily, so we need to listen for mousedown
  //and synchronously init before the click event is fired.
  //TODO: delete in AUI 6.0.0, see AUI-2868
  function bindLazyTriggerInitialisation() {
      (0, _jquery2.default)(document).on('mousedown', '.aui-dropdown2-trigger', function () {
          var isElementSkated = this.hasAttribute('resolved');
          if (!isElementSkated) {
              _skate2.default.init(this);
              var lazyDeprecate = deprecate.getMessageLogger('Dropdown2 lazy initialisation', {
                  removeInVersion: '6.0.0',
                  alternativeName: 'initialisation on DOM insertion',
                  sinceVersion: '5.8.0',
                  extraInfo: 'Dropdown2 triggers should have all necessary attributes on DOM insertion',
                  deprecationType: 'JS'
              });
              lazyDeprecate();
          }
      });
  }
  
  bindLazyTriggerInitialisation();
  
  (0, _skate2.default)('aui-dropdown2-sub-trigger', {
      type: _skate2.default.type.CLASSNAME,
      created: function created(trigger) {
          trigger.className += ' aui-dropdown2-trigger';
          _skate2.default.init(trigger);
      }
  });
  
  // Dropdown trigger groups
  // -----------------------
  
  (0, _jquery2.default)(document).on('mouseenter', '.aui-dropdown2-trigger-group a, .aui-dropdown2-trigger-group button', function (e) {
      var $item = (0, _jquery2.default)(e.currentTarget);
  
      if ($item.is('.aui-dropdown2-active')) {
          return; // No point doing anything if we're hovering over the already-active item trigger.
      }
  
      if ($item.closest('.aui-dropdown2').size()) {
          return; // We don't want to deal with dropdown items, just the potential triggers in the group.
      }
  
      var $triggerGroup = $item.closest('.aui-dropdown2-trigger-group');
  
      var $groupActiveTrigger = $triggerGroup.find('.aui-dropdown2-active');
      if ($groupActiveTrigger.size() && $item.is('.aui-dropdown2-trigger')) {
          $groupActiveTrigger.blur(); // Remove focus from the previously opened menu.
          $item.trigger('aui-button-invoke'); // Open this trigger's menu.
          e.preventDefault();
      }
  
      var $groupFocusedTrigger = $triggerGroup.find(':focus');
      if ($groupFocusedTrigger.size() && $item.is('.aui-dropdown2-trigger')) {
          $groupFocusedTrigger.blur();
      }
  });
  
  // Dropdown items
  // --------------
  
  function getDropdownItems(dropdown, filter) {
      return (0, _jquery2.default)(dropdown).find([
      // Legacy markup.
      '> ul > li', '> .aui-dropdown2-section > ul > li',
      // Accessible markup.
      '> div[role] > .aui-dropdown2-section > div[role="group"] > ul[role] > li[role]',
      // Web component.
      'aui-item-link', 'aui-item-checkbox', 'aui-item-radio'].join(', ')).filter(filter).children('a, button, [role="checkbox"], [role="menuitemcheckbox"], [role="radio"], [role="menuitemradio"]');
  }
  
  function getAllDropdownItems(dropdown) {
      return getDropdownItems(dropdown, function () {
          return true;
      });
  }
  
  function getVisibleDropdownItems(dropdown) {
      return getDropdownItems(dropdown, function () {
          return this.className.indexOf('hidden') === -1 && !this.hasAttribute('hidden');
      });
  }
  
  function amendDropdownItem(item) {
      var $item = (0, _jquery2.default)(item);
  
      $item.attr('tabindex', '-1');
  
      /**
       * Honouring the documentation.
       * @link https://docs.atlassian.com/aui/latest/docs/dropdown2.html
       */
      if ($item.hasClass('aui-dropdown2-disabled') || $item.parent().hasClass('aui-dropdown2-hidden')) {
          $item.attr('aria-disabled', true);
      }
  }
  
  function amendDropdownContent(dropdown) {
      // Add assistive semantics to each dropdown item
      getAllDropdownItems(dropdown).each(function () {
          amendDropdownItem(this);
      });
  }
  
  /**
   * Honours behaviour for code written using only the legacy class names.
   * To maintain old behaviour (i.e., remove the 'hidden' class and the item will become un-hidden)
   * whilst allowing our code to only depend on the new classes, we need to
   * keep the state of the DOM in sync with legacy classes.
   *
   * Calling this function will add the new namespaced classes to elements with legacy names.
   * @returns {Function} a function to remove the new namespaced classes, only from the elements they were added to.
   */
  function migrateAndSyncLegacyClassNames(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      // Migrate away from legacy class names
      var $hiddens = $dropdown.find('.hidden').addClass('aui-dropdown2-hidden');
      var $disableds = $dropdown.find('.disabled').addClass('aui-dropdown2-disabled');
      var $interactives = $dropdown.find('.interactive').addClass('aui-dropdown2-interactive');
  
      return function revertToOriginalMarkup() {
          $hiddens.removeClass('aui-dropdown2-hidden');
          $disableds.removeClass('aui-dropdown2-disabled');
          $interactives.removeClass('aui-dropdown2-interactive');
      };
  }
  
  // The Dropdown itself
  // -------------------
  
  function setLayerAlignment(dropdown, trigger) {
      var hasSubmenu = trigger && trigger.hasSubmenu && trigger.hasSubmenu();
      var hasSubmenuAlignment = dropdown.getAttribute('data-aui-alignment') === 'submenu auto';
  
      if (!hasSubmenu && hasSubmenuAlignment) {
          restorePreviousAlignment(dropdown);
      }
      var hasAnyAlignment = dropdown.hasAttribute('data-aui-alignment');
  
      if (hasSubmenu && !hasSubmenuAlignment) {
          saveCurrentAlignment(dropdown);
          dropdown.setAttribute('data-aui-alignment', 'submenu auto');
          dropdown.setAttribute('data-aui-alignment-static', true);
      } else if (!hasAnyAlignment) {
          dropdown.setAttribute('data-aui-alignment', 'bottom auto');
          dropdown.setAttribute('data-aui-alignment-static', true);
      }
  
      if (dropdown._auiAlignment) {
          dropdown._auiAlignment.destroy();
      }
  
      dropdown._auiAlignment = new _alignment2.default(dropdown, trigger);
  
      dropdown._auiAlignment.enable();
  }
  
  function saveCurrentAlignment(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
      if (dropdown.hasAttribute('data-aui-alignment')) {
          $dropdown.data('previous-data-aui-alignment', dropdown.getAttribute('data-aui-alignment'));
      }
      $dropdown.data('had-data-aui-alignment-static', dropdown.hasAttribute('data-aui-alignment-static'));
  }
  
  function restorePreviousAlignment(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      var previousAlignment = $dropdown.data('previous-data-aui-alignment');
      if (previousAlignment) {
          dropdown.setAttribute('data-aui-alignment', previousAlignment);
      } else {
          dropdown.removeAttribute('data-aui-alignment');
      }
      $dropdown.removeData('previous-data-aui-alignment');
  
      if (!$dropdown.data('had-data-aui-alignment-static')) {
          dropdown.removeAttribute('data-aui-alignment-static');
      }
      $dropdown.removeData('had-data-aui-alignment-static');
  }
  
  function getDropdownHideLocation(dropdown, trigger) {
      var possibleHome = trigger.getAttribute('data-dropdown2-hide-location');
      return document.getElementById(possibleHome) || dropdown.parentNode;
  }
  
  var keyboardClose = false;
  function keyboardCloseDetected() {
      keyboardClose = true;
  }
  
  function wasProbablyClosedViaKeyboard() {
      var result = keyboardClose === true;
      keyboardClose = false;
      return result;
  }
  
  function bindDropdownBehaviourToLayer(dropdown) {
      (0, _layer2.default)(dropdown);
  
      dropdown.addEventListener('aui-layer-show', function () {
          (0, _jquery2.default)(dropdown).trigger('aui-dropdown2-show');
  
          dropdown._syncClasses = migrateAndSyncLegacyClassNames(dropdown);
  
          amendDropdownContent(this);
  
          doIfTrigger(dropdown, function (trigger) {
              setDropdownTriggerActiveState(trigger, true);
              dropdown._returnTo = getDropdownHideLocation(dropdown, trigger);
          });
      });
  
      dropdown.addEventListener('aui-layer-hide', function () {
          (0, _jquery2.default)(dropdown).trigger('aui-dropdown2-hide');
  
          if (dropdown._syncClasses) {
              dropdown._syncClasses();
              delete dropdown._syncClasses;
          }
  
          if (dropdown._auiAlignment) {
              dropdown._auiAlignment.disable();
              dropdown._auiAlignment.destroy();
          }
  
          if (dropdown._returnTo) {
              if (dropdown.parentNode && dropdown.parentNode !== dropdown._returnTo) {
                  dropdown._returnTo.appendChild(dropdown);
              }
          }
  
          (0, _jquery2.default)(dropdown).removeClass('aui-dropdown2-in-buttons');
  
          getVisibleDropdownItems(dropdown).removeClass('active aui-dropdown2-active');
  
          doIfTrigger(dropdown, function (trigger) {
              if (wasProbablyClosedViaKeyboard()) {
                  trigger.focus();
                  setDropdownTriggerActiveState(trigger, trigger.hasSubmenu && trigger.hasSubmenu());
              } else {
                  setDropdownTriggerActiveState(trigger, false);
              }
          });
  
          // Gets set by submenu trigger invocation. Bad coupling point?
          delete dropdown.isSubmenu;
          dropdown._triggeringElement = null;
      });
  }
  
  function bindItemInteractionBehaviourToDropdown(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      $dropdown.on('keydown', function (e) {
          if (e.keyCode === _keyCode2.default.DOWN) {
              dropdown.focusNext();
              e.preventDefault();
          } else if (e.keyCode === _keyCode2.default.UP) {
              dropdown.focusPrevious();
              e.preventDefault();
          } else if (e.keyCode === _keyCode2.default.LEFT) {
              if (dropdown.isSubmenu) {
                  keyboardCloseDetected();
                  dropdown.hide(e);
                  e.preventDefault();
              }
          } else if (e.keyCode === _keyCode2.default.ESCAPE) {
              // The closing will be handled by the LayerManager!
              keyboardCloseDetected();
          } else if (e.keyCode === _keyCode2.default.TAB) {
              keyboardCloseDetected();
              dropdown.hide(e);
          }
      });
  
      var hideIfNotSubmenuAndNotInteractive = function hideIfNotSubmenuAndNotInteractive(e) {
          var $item = (0, _jquery2.default)(e.currentTarget);
  
          if ($item.attr('aria-disabled') === 'true') {
              e.preventDefault();
              return;
          }
  
          var isSubmenuTrigger = e.currentTarget.hasSubmenu && e.currentTarget.hasSubmenu();
          if (!isSubmenuTrigger && !$item.is('.aui-dropdown2-interactive')) {
  
              var theMenu = dropdown;
              do {
                  var dd = (0, _layer2.default)(theMenu);
                  theMenu = (0, _layer2.default)(theMenu).below();
                  if (dd.$el.is('.aui-dropdown2')) {
                      dd.hide(e);
                  }
              } while (theMenu);
          }
      };
  
      $dropdown.on('click keydown', 'a, button, [role="menuitem"], [role="menuitemcheckbox"], [role="checkbox"], [role="menuitemradio"], [role="radio"]', function (e) {
          var item = e.currentTarget;
          var $item = (0, _jquery2.default)(item);
          var eventKeyCode = e.keyCode;
          var isEnter = eventKeyCode === _keyCode2.default.ENTER;
          var isSpace = eventKeyCode === _keyCode2.default.SPACE;
  
          // AUI-4283: Accessibility - need to ignore enter on links/buttons so
          // that the dropdown remains visible to allow the click event to eventually fire.
          var itemIgnoresEnter = isEnter && $item.is('a[href], button');
  
          if (!itemIgnoresEnter && (e.type === 'click' || isEnter || isSpace)) {
              hideIfNotSubmenuAndNotInteractive(e);
          }
      });
  
      // close a submenus when the mouse moves over items other than its trigger
      $dropdown.on('mouseenter', 'a, button, [role="menuitem"], [role="menuitemcheckbox"], [role="checkbox"], [role="menuitemradio"], [role="radio"]', function (e) {
          var item = e.currentTarget;
          var hasSubmenu = item.hasSubmenu && item.hasSubmenu();
  
          if (!e.isDefaultPrevented() && !hasSubmenu) {
              var maybeALayer = (0, _layer2.default)(dropdown).above();
  
              if (maybeALayer) {
                  (0, _layer2.default)(maybeALayer).hide();
              }
          }
      });
  }
  
  (0, _jquery2.default)(window).on('resize', (0, _debounce.debounceImmediate)(function () {
      (0, _jquery2.default)('.aui-dropdown2').each(function (index, dropdown) {
          _skate2.default.init(dropdown);
          if (dropdown.isVisible()) {
              dropdown.hide();
          }
      });
  }, 1000));
  
  // Dropdowns
  // ---------
  
  function dropdownCreated(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      $dropdown.addClass('aui-dropdown2');
  
      // swap the inner div to presentation as application is only needed for Windows
      if ((0, _browser.supportsVoiceOver)()) {
          $dropdown.find('> div[role="application"]').attr('role', 'presentation');
      }
  
      if (dropdown.hasAttribute('data-container')) {
          $dropdown.attr('data-aui-alignment-container', $dropdown.attr('data-container'));
          $dropdown.removeAttr('data-container');
      }
  
      bindDropdownBehaviourToLayer(dropdown);
      bindItemInteractionBehaviourToDropdown(dropdown);
      dropdown.hide();
  
      (0, _jquery2.default)(dropdown).delegate('.aui-dropdown2-checkbox:not(.disabled):not(.aui-dropdown2-disabled)', 'click keydown', function (e) {
          if (e.type === 'click' || e.keyCode === _keyCode2.default.ENTER || e.keyCode === _keyCode2.default.SPACE) {
              var checkbox = this;
              if (e.isDefaultPrevented()) {
                  return;
              }
              if (checkbox.isInteractive()) {
                  e.preventDefault();
              }
              if (checkbox.isEnabled()) {
                  // toggle the checked state
                  if (checkbox.isChecked()) {
                      checkbox.uncheck();
                  } else {
                      checkbox.check();
                  }
              }
          }
      });
  
      (0, _jquery2.default)(dropdown).delegate('.aui-dropdown2-radio:not(.checked):not(.aui-dropdown2-checked):not(.disabled):not(.aui-dropdown2-disabled)', 'click keydown', function (e) {
          if (e.type === 'click' || e.keyCode === _keyCode2.default.ENTER || e.keyCode === _keyCode2.default.SPACE) {
              var radio = this;
              if (e.isDefaultPrevented()) {
                  return;
              }
              if (radio.isInteractive()) {
                  e.preventDefault();
              }
  
              var $radio = (0, _jquery2.default)(this);
              if (this.isEnabled() && this.isChecked() === false) {
                  // toggle the checked state
                  $radio.closest('ul,[role=group]').find('.aui-dropdown2-checked').not(this).each(function () {
                      this.uncheck();
                  });
                  radio.check();
              }
          }
      });
  }
  
  var dropdownPrototype = {
      /**
       * Toggles the visibility of the dropdown menu
       */
      toggle: function toggle(e) {
          if (this.isVisible()) {
              this.hide(e);
          } else {
              this.show(e);
          }
      },
  
      /**
       * Explicitly shows the menu
       *
       * @returns {HTMLElement}
       */
      show: function show(e) {
          if (e && e.currentTarget && e.currentTarget.classList.contains('aui-dropdown2-trigger')) {
              this._triggeringElement = e.currentTarget;
          }
          (0, _layer2.default)(this).show();
  
          var dropdown = this;
          doIfTrigger(dropdown, function (trigger) {
              setLayerAlignment(dropdown, trigger);
          });
  
          return this;
      },
  
      /**
       * Explicitly hides the menu
       *
       * @returns {HTMLElement}
       */
      hide: function hide() {
          (0, _layer2.default)(this).hide();
          return this;
      },
  
      /**
       * Shifts explicit focus to the next available item in the menu
       *
       * @returns {undefined}
       */
      focusNext: function focusNext() {
          var $items = getVisibleDropdownItems(this);
          var selected = document.activeElement;
          var idx;
  
          if ($items.last()[0] !== selected) {
              idx = $items.toArray().indexOf(selected);
              this.focusItem($items.get(idx + 1));
          }
      },
  
      /**
       * Shifts explicit focus to the previous available item in the menu
       *
       * @returns {undefined}
       */
      focusPrevious: function focusPrevious() {
          var $items = getVisibleDropdownItems(this);
          var selected = document.activeElement;
          var idx;
  
          if ($items.first()[0] !== selected) {
              idx = $items.toArray().indexOf(selected);
              this.focusItem($items.get(idx - 1));
          }
      },
  
      /**
       * Shifts explicit focus to the menu item matching the index param
       */
      focusItem: function focusItem(item) {
          var $items = getVisibleDropdownItems(this);
          var $item;
          if (typeof item === 'number') {
              item = $items.get(item);
          }
          $item = (0, _jquery2.default)(item);
          $item.focus();
          $items.removeClass('active aui-dropdown2-active');
          $item.addClass('active aui-dropdown2-active');
      },
  
      /**
       * Checks whether or not the menu is currently displayed
       *
       * @returns {Boolean}
       */
      isVisible: function isVisible() {
          return (0, _layer2.default)(this).isVisible();
      }
  };
  
  // Web component API for dropdowns
  // -------------------------------
  
  var disabledAttributeHandler = {
      created: function created(element) {
          var a = element.children[0];
          a.setAttribute('aria-disabled', 'true');
          a.className += ' aui-dropdown2-disabled';
      },
      removed: function removed(element) {
          var a = element.children[0];
          a.setAttribute('aria-disabled', 'false');
          (0, _jquery2.default)(a).removeClass('aui-dropdown2-disabled');
      }
  };
  
  var interactiveAttributeHandler = {
      created: function created(element) {
          var a = element.children[0];
          a.className += ' aui-dropdown2-interactive';
      },
      removed: function removed(element) {
          var a = element.children[0];
          (0, _jquery2.default)(a).removeClass('aui-dropdown2-interactive');
      }
  };
  
  var checkedAttributeHandler = {
      created: function created(element) {
          var a = element.children[0];
          (0, _jquery2.default)(a).addClass('checked aui-dropdown2-checked');
          a.setAttribute('aria-checked', true);
          element.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
      },
      removed: function removed(element) {
          var a = element.children[0];
          (0, _jquery2.default)(a).removeClass('checked aui-dropdown2-checked');
          a.setAttribute('aria-checked', false);
          element.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
      }
  };
  
  var hiddenAttributeHandler = {
      created: function created(element) {
          disabledAttributeHandler.created(element);
      },
      removed: function removed(element) {
          disabledAttributeHandler.removed(element);
      }
  };
  
  (0, _skate2.default)('aui-item-link', {
      template: (0, _skatejsTemplateHtml2.default)('<a role="menuitem" tabindex="-1"><content></content></a>'),
      attributes: {
          disabled: disabledAttributeHandler,
          interactive: interactiveAttributeHandler,
          hidden: hiddenAttributeHandler,
          href: {
              created: function created(element, change) {
                  var a = element.children[0];
                  a.setAttribute('href', change.newValue);
              },
              updated: function updated(element, change) {
                  var a = element.children[0];
                  a.setAttribute('href', change.newValue);
              },
              removed: function removed(element) {
                  var a = element.children[0];
                  a.removeAttribute('href');
              }
          },
          for: {
              created: function created(element) {
                  var anchor = element.children[0];
                  anchor.setAttribute('aria-controls', element.getAttribute('for'));
                  (0, _jquery2.default)(anchor).addClass('aui-dropdown2-sub-trigger');
              },
              updated: function updated(element) {
                  var anchor = element.children[0];
                  anchor.setAttribute('aria-controls', element.getAttribute('for'));
              },
              removed: function removed(element) {
                  var anchor = element.children[0];
                  anchor.removeAttribute('aria-controls');
                  (0, _jquery2.default)(anchor).removeClass('aui-dropdown2-sub-trigger');
              }
          }
      }
  });
  
  (0, _skate2.default)('aui-item-checkbox', {
      template: (0, _skatejsTemplateHtml2.default)('<span role="checkbox" class="aui-dropdown2-checkbox" tabindex="-1"><content></content></span>'),
      attributes: {
          disabled: disabledAttributeHandler,
          interactive: interactiveAttributeHandler,
          checked: checkedAttributeHandler,
          hidden: hiddenAttributeHandler
      }
  });
  
  (0, _skate2.default)('aui-item-radio', {
      template: (0, _skatejsTemplateHtml2.default)('<span role="radio" class="aui-dropdown2-radio" tabindex="-1"><content></content></span>'),
      attributes: {
          disabled: disabledAttributeHandler,
          interactive: interactiveAttributeHandler,
          checked: checkedAttributeHandler,
          hidden: hiddenAttributeHandler
      }
  });
  
  (0, _skate2.default)('aui-section', {
      template: (0, _skatejsTemplateHtml2.default)('\n        <strong aria-role="presentation" class="aui-dropdown2-heading"></strong>\n        <div role="group">\n            <content></content>\n        </div>\n    '),
      attributes: {
          label: function label(element, data) {
              var headingElement = element.children[0];
              var groupElement = element.children[1];
              headingElement.textContent = data.newValue;
              groupElement.setAttribute('aria-label', data.newValue);
          }
      },
      created: function created(element) {
          element.className += ' aui-dropdown2-section';
          element.setAttribute('role', 'presentation');
      }
  });
  
  (0, _skate2.default)('aui-dropdown-menu', {
      template: (0, _skatejsTemplateHtml2.default)('\n        <div role="application">\n            <content></content>\n        </div>\n    '),
      created: function created(dropdown) {
          dropdown.setAttribute('role', 'menu');
          dropdown.className = 'aui-dropdown2 aui-style-default aui-layer';
          (0, _state2.default)(dropdown).set('loading-state', UNLOADED);
          // Now skate the .aui-dropdown2 behaviour.
          _skate2.default.init(dropdown);
      },
      attributes: {
          src: {}
      },
      prototype: dropdownPrototype,
      events: {
          'aui-layer-show': loadContentWhenMenuShown
      }
  });
  
  // Legacy dropdown inits
  // ---------------------
  
  (0, _skate2.default)('aui-dropdown2', {
      type: _skate2.default.type.CLASSNAME,
      created: dropdownCreated,
      prototype: dropdownPrototype
  });
  
  (0, _skate2.default)('data-aui-dropdown2', {
      type: _skate2.default.type.ATTRIBUTE,
      created: dropdownCreated,
      prototype: dropdownPrototype
  });
  
  // Checkboxes and radios
  // ---------------------
  
  (0, _skate2.default)('aui-dropdown2-checkbox', {
      type: _skate2.default.type.CLASSNAME,
  
      created: function created(checkbox) {
          var checked = isChecked(checkbox);
          if (checked) {
              (0, _jquery2.default)(checkbox).addClass('checked aui-dropdown2-checked');
          }
          checkbox.setAttribute('aria-checked', checked);
          checkbox.setAttribute('tabindex', '0');
  
          // swap from menuitemcheckbox to just plain checkbox for VoiceOver
          if ((0, _browser.supportsVoiceOver)()) {
              checkbox.setAttribute('role', 'checkbox');
          }
      },
  
      prototype: {
          isEnabled: function isEnabled() {
              return !(this.getAttribute('aria-disabled') !== null && this.getAttribute('aria-disabled') === 'true');
          },
  
          isChecked: function isChecked() {
              return this.getAttribute('aria-checked') !== null && this.getAttribute('aria-checked') === 'true';
          },
  
          isInteractive: function isInteractive() {
              return (0, _jquery2.default)(this).hasClass('aui-dropdown2-interactive');
          },
  
          uncheck: function uncheck() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-checkbox') {
                  this.parentNode.removeAttribute('checked');
              }
              this.setAttribute('aria-checked', 'false');
              (0, _jquery2.default)(this).removeClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-uncheck');
          },
  
          check: function check() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-checkbox') {
                  this.parentNode.setAttribute('checked', '');
              }
              this.setAttribute('aria-checked', 'true');
              (0, _jquery2.default)(this).addClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-check');
          }
      }
  });
  
  (0, _skate2.default)('aui-dropdown2-radio', {
      type: _skate2.default.type.CLASSNAME,
  
      created: function created(radio) {
          // add a dash of ARIA
          var checked = isChecked(radio);
          if (checked) {
              (0, _jquery2.default)(radio).addClass('checked aui-dropdown2-checked');
          }
          radio.setAttribute('aria-checked', checked);
          radio.setAttribute('tabindex', '0');
  
          // swap from menuitemradio to just plain radio for VoiceOver
          if ((0, _browser.supportsVoiceOver)()) {
              radio.setAttribute('role', 'radio');
          }
      },
  
      prototype: {
          isEnabled: function isEnabled() {
              return !(this.getAttribute('aria-disabled') !== null && this.getAttribute('aria-disabled') === 'true');
          },
  
          isChecked: function isChecked() {
              return this.getAttribute('aria-checked') !== null && this.getAttribute('aria-checked') === 'true';
          },
  
          isInteractive: function isInteractive() {
              return (0, _jquery2.default)(this).hasClass('aui-dropdown2-interactive');
          },
  
          uncheck: function uncheck() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-radio') {
                  this.parentNode.removeAttribute('checked');
              }
              this.setAttribute('aria-checked', 'false');
              (0, _jquery2.default)(this).removeClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-uncheck');
          },
  
          check: function check() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-radio') {
                  this.parentNode.setAttribute('checked', '');
              }
              this.setAttribute('aria-checked', 'true');
              (0, _jquery2.default)(this).addClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-check');
          }
      }
  });
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/enforcer.js
(typeof window === 'undefined' ? global : window).__8339408c10b0a9052af9f3aad7b3a4e8 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function enforcer(element) {
  
      function attributeExists(attributeName) {
          var errorMessage = attributeName + ' wasn\'t defined';
  
          return satisfiesRules(function () {
              return element.hasAttribute(attributeName);
          }, errorMessage);
      }
  
      function refersTo(attributeName) {
  
          if (!attributeExists(attributeName, element)) {
              return false;
          }
  
          var desiredId = element.getAttribute(attributeName);
          var errorMessage = 'an element with id set to "' + desiredId + '" was not found';
  
          return satisfiesRules(function () {
              return document.getElementById(desiredId);
          }, errorMessage);
      }
  
      function ariaControls() {
          return refersTo('aria-controls');
      }
  
      function ariaOwns() {
          return refersTo('aria-owns');
      }
  
      function satisfiesRules(predicate, message) {
          if (!predicate()) {
              if (element) {
                  logger.error(message, element);
              } else {
                  logger.error(message);
              }
              return false;
          }
          return true;
      }
  
      return {
          attributeExists: attributeExists,
          refersTo: refersTo,
          satisfiesRules: satisfiesRules,
          ariaControls: ariaControls,
          ariaOwns: ariaOwns
      };
  }
  
  exports.default = enforcer;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/underscorejs/underscore.js
(typeof window === 'undefined' ? global : window).__61c16d543bfae33bb4747b45f7b91f35 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__61c16d543bfae33bb4747b45f7b91f35");
  define.amd = true;
  
  //     Underscore.js 1.5.2
  //     http://underscorejs.org
  //     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
  //     Underscore may be freely distributed under the MIT license.
  
  (function() {
  
      // Baseline setup
      // --------------
  
      // Establish the root object, `window` in the browser, or `exports` on the server.
      var root = this;
  
      // Save the previous value of the `_` variable.
      var previousUnderscore = root._;
  
      // Establish the object that gets returned to break out of a loop iteration.
      var breaker = {};
  
      // Save bytes in the minified (but not gzipped) version:
      var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
  
      // Create quick reference variables for speed access to core prototypes.
      var
          push             = ArrayProto.push,
          slice            = ArrayProto.slice,
          concat           = ArrayProto.concat,
          toString         = ObjProto.toString,
          hasOwnProperty   = ObjProto.hasOwnProperty;
  
      // All **ECMAScript 5** native function implementations that we hope to use
      // are declared here.
      var
          nativeForEach      = ArrayProto.forEach,
          nativeMap          = ArrayProto.map,
          nativeReduce       = ArrayProto.reduce,
          nativeReduceRight  = ArrayProto.reduceRight,
          nativeFilter       = ArrayProto.filter,
          nativeEvery        = ArrayProto.every,
          nativeSome         = ArrayProto.some,
          nativeIndexOf      = ArrayProto.indexOf,
          nativeLastIndexOf  = ArrayProto.lastIndexOf,
          nativeIsArray      = Array.isArray,
          nativeKeys         = Object.keys,
          nativeBind         = FuncProto.bind;
  
      // Create a safe reference to the Underscore object for use below.
      var _ = function(obj) {
          if (obj instanceof _) return obj;
          if (!(this instanceof _)) return new _(obj);
          this._wrapped = obj;
      };
  
      // Export the Underscore object for **Node.js**, with
      // backwards-compatibility for the old `require()` API. If we're in
      // the browser, add `_` as a global object via a string identifier,
      // for Closure Compiler "advanced" mode.
      if (typeof exports !== 'undefined') {
          if (typeof module !== 'undefined' && module.exports) {
              exports = module.exports = _;
          }
          exports._ = _;
      } else {
          root._ = _;
      }
  
      // Current version.
      _.VERSION = '1.5.2';
  
      // Collection Functions
      // --------------------
  
      // The cornerstone, an `each` implementation, aka `forEach`.
      // Handles objects with the built-in `forEach`, arrays, and raw objects.
      // Delegates to **ECMAScript 5**'s native `forEach` if available.
      var each = _.each = _.forEach = function(obj, iterator, context) {
          if (obj == null) return;
          if (nativeForEach && obj.forEach === nativeForEach) {
              obj.forEach(iterator, context);
          } else if (obj.length === +obj.length) {
              for (var i = 0, length = obj.length; i < length; i++) {
                  if (iterator.call(context, obj[i], i, obj) === breaker) return;
              }
          } else {
              var keys = _.keys(obj);
              for (var i = 0, length = keys.length; i < length; i++) {
                  if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
              }
          }
      };
  
      // Return the results of applying the iterator to each element.
      // Delegates to **ECMAScript 5**'s native `map` if available.
      _.map = _.collect = function(obj, iterator, context) {
          var results = [];
          if (obj == null) return results;
          if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
          each(obj, function(value, index, list) {
              results.push(iterator.call(context, value, index, list));
          });
          return results;
      };
  
      var reduceError = 'Reduce of empty array with no initial value';
  
      // **Reduce** builds up a single result from a list of values, aka `inject`,
      // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
      _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
          var initial = arguments.length > 2;
          if (obj == null) obj = [];
          if (nativeReduce && obj.reduce === nativeReduce) {
              if (context) iterator = _.bind(iterator, context);
              return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
          }
          each(obj, function(value, index, list) {
              if (!initial) {
                  memo = value;
                  initial = true;
              } else {
                  memo = iterator.call(context, memo, value, index, list);
              }
          });
          if (!initial) throw new TypeError(reduceError);
          return memo;
      };
  
      // The right-associative version of reduce, also known as `foldr`.
      // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
      _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
          var initial = arguments.length > 2;
          if (obj == null) obj = [];
          if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
              if (context) iterator = _.bind(iterator, context);
              return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
          }
          var length = obj.length;
          if (length !== +length) {
              var keys = _.keys(obj);
              length = keys.length;
          }
          each(obj, function(value, index, list) {
              index = keys ? keys[--length] : --length;
              if (!initial) {
                  memo = obj[index];
                  initial = true;
              } else {
                  memo = iterator.call(context, memo, obj[index], index, list);
              }
          });
          if (!initial) throw new TypeError(reduceError);
          return memo;
      };
  
      // Return the first value which passes a truth test. Aliased as `detect`.
      _.find = _.detect = function(obj, iterator, context) {
          var result;
          any(obj, function(value, index, list) {
              if (iterator.call(context, value, index, list)) {
                  result = value;
                  return true;
              }
          });
          return result;
      };
  
      // Return all the elements that pass a truth test.
      // Delegates to **ECMAScript 5**'s native `filter` if available.
      // Aliased as `select`.
      _.filter = _.select = function(obj, iterator, context) {
          var results = [];
          if (obj == null) return results;
          if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
          each(obj, function(value, index, list) {
              if (iterator.call(context, value, index, list)) results.push(value);
          });
          return results;
      };
  
      // Return all the elements for which a truth test fails.
      _.reject = function(obj, iterator, context) {
          return _.filter(obj, function(value, index, list) {
              return !iterator.call(context, value, index, list);
          }, context);
      };
  
      // Determine whether all of the elements match a truth test.
      // Delegates to **ECMAScript 5**'s native `every` if available.
      // Aliased as `all`.
      _.every = _.all = function(obj, iterator, context) {
          iterator || (iterator = _.identity);
          var result = true;
          if (obj == null) return result;
          if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
          each(obj, function(value, index, list) {
              if (!(result = result && iterator.call(context, value, index, list))) return breaker;
          });
          return !!result;
      };
  
      // Determine if at least one element in the object matches a truth test.
      // Delegates to **ECMAScript 5**'s native `some` if available.
      // Aliased as `any`.
      var any = _.some = _.any = function(obj, iterator, context) {
          iterator || (iterator = _.identity);
          var result = false;
          if (obj == null) return result;
          if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
          each(obj, function(value, index, list) {
              if (result || (result = iterator.call(context, value, index, list))) return breaker;
          });
          return !!result;
      };
  
      // Determine if the array or object contains a given value (using `===`).
      // Aliased as `include`.
      _.contains = _.include = function(obj, target) {
          if (obj == null) return false;
          if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
          return any(obj, function(value) {
              return value === target;
          });
      };
  
      // Invoke a method (with arguments) on every item in a collection.
      _.invoke = function(obj, method) {
          var args = slice.call(arguments, 2);
          var isFunc = _.isFunction(method);
          return _.map(obj, function(value) {
              return (isFunc ? method : value[method]).apply(value, args);
          });
      };
  
      // Convenience version of a common use case of `map`: fetching a property.
      _.pluck = function(obj, key) {
          return _.map(obj, function(value){ return value[key]; });
      };
  
      // Convenience version of a common use case of `filter`: selecting only objects
      // containing specific `key:value` pairs.
      _.where = function(obj, attrs, first) {
          if (_.isEmpty(attrs)) return first ? void 0 : [];
          return _[first ? 'find' : 'filter'](obj, function(value) {
              for (var key in attrs) {
                  if (attrs[key] !== value[key]) return false;
              }
              return true;
          });
      };
  
      // Convenience version of a common use case of `find`: getting the first object
      // containing specific `key:value` pairs.
      _.findWhere = function(obj, attrs) {
          return _.where(obj, attrs, true);
      };
  
      // Return the maximum element or (element-based computation).
      // Can't optimize arrays of integers longer than 65,535 elements.
      // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
      _.max = function(obj, iterator, context) {
          if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
              return Math.max.apply(Math, obj);
          }
          if (!iterator && _.isEmpty(obj)) return -Infinity;
          var result = {computed : -Infinity, value: -Infinity};
          each(obj, function(value, index, list) {
              var computed = iterator ? iterator.call(context, value, index, list) : value;
              computed > result.computed && (result = {value : value, computed : computed});
          });
          return result.value;
      };
  
      // Return the minimum element (or element-based computation).
      _.min = function(obj, iterator, context) {
          if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
              return Math.min.apply(Math, obj);
          }
          if (!iterator && _.isEmpty(obj)) return Infinity;
          var result = {computed : Infinity, value: Infinity};
          each(obj, function(value, index, list) {
              var computed = iterator ? iterator.call(context, value, index, list) : value;
              computed < result.computed && (result = {value : value, computed : computed});
          });
          return result.value;
      };
  
      // Shuffle an array, using the modern version of the
      // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisherâ€“Yates_shuffle).
      _.shuffle = function(obj) {
          var rand;
          var index = 0;
          var shuffled = [];
          each(obj, function(value) {
              rand = _.random(index++);
              shuffled[index - 1] = shuffled[rand];
              shuffled[rand] = value;
          });
          return shuffled;
      };
  
      // Sample **n** random values from an array.
      // If **n** is not specified, returns a single random element from the array.
      // The internal `guard` argument allows it to work with `map`.
      _.sample = function(obj, n, guard) {
          if (arguments.length < 2 || guard) {
              return obj[_.random(obj.length - 1)];
          }
          return _.shuffle(obj).slice(0, Math.max(0, n));
      };
  
      // An internal function to generate lookup iterators.
      var lookupIterator = function(value) {
          return _.isFunction(value) ? value : function(obj){ return obj[value]; };
      };
  
      // Sort the object's values by a criterion produced by an iterator.
      _.sortBy = function(obj, value, context) {
          var iterator = lookupIterator(value);
          return _.pluck(_.map(obj, function(value, index, list) {
              return {
                  value: value,
                  index: index,
                  criteria: iterator.call(context, value, index, list)
              };
          }).sort(function(left, right) {
                  var a = left.criteria;
                  var b = right.criteria;
                  if (a !== b) {
                      if (a > b || a === void 0) return 1;
                      if (a < b || b === void 0) return -1;
                  }
                  return left.index - right.index;
              }), 'value');
      };
  
      // An internal function used for aggregate "group by" operations.
      var group = function(behavior) {
          return function(obj, value, context) {
              var result = {};
              var iterator = value == null ? _.identity : lookupIterator(value);
              each(obj, function(value, index) {
                  var key = iterator.call(context, value, index, obj);
                  behavior(result, key, value);
              });
              return result;
          };
      };
  
      // Groups the object's values by a criterion. Pass either a string attribute
      // to group by, or a function that returns the criterion.
      _.groupBy = group(function(result, key, value) {
          (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
      });
  
      // Indexes the object's values by a criterion, similar to `groupBy`, but for
      // when you know that your index values will be unique.
      _.indexBy = group(function(result, key, value) {
          result[key] = value;
      });
  
      // Counts instances of an object that group by a certain criterion. Pass
      // either a string attribute to count by, or a function that returns the
      // criterion.
      _.countBy = group(function(result, key) {
          _.has(result, key) ? result[key]++ : result[key] = 1;
      });
  
      // Use a comparator function to figure out the smallest index at which
      // an object should be inserted so as to maintain order. Uses binary search.
      _.sortedIndex = function(array, obj, iterator, context) {
          iterator = iterator == null ? _.identity : lookupIterator(iterator);
          var value = iterator.call(context, obj);
          var low = 0, high = array.length;
          while (low < high) {
              var mid = (low + high) >>> 1;
              iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
          }
          return low;
      };
  
      // Safely create a real, live array from anything iterable.
      _.toArray = function(obj) {
          if (!obj) return [];
          if (_.isArray(obj)) return slice.call(obj);
          if (obj.length === +obj.length) return _.map(obj, _.identity);
          return _.values(obj);
      };
  
      // Return the number of elements in an object.
      _.size = function(obj) {
          if (obj == null) return 0;
          return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
      };
  
      // Array Functions
      // ---------------
  
      // Get the first element of an array. Passing **n** will return the first N
      // values in the array. Aliased as `head` and `take`. The **guard** check
      // allows it to work with `_.map`.
      _.first = _.head = _.take = function(array, n, guard) {
          if (array == null) return void 0;
          return (n == null) || guard ? array[0] : slice.call(array, 0, n);
      };
  
      // Returns everything but the last entry of the array. Especially useful on
      // the arguments object. Passing **n** will return all the values in
      // the array, excluding the last N. The **guard** check allows it to work with
      // `_.map`.
      _.initial = function(array, n, guard) {
          return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
      };
  
      // Get the last element of an array. Passing **n** will return the last N
      // values in the array. The **guard** check allows it to work with `_.map`.
      _.last = function(array, n, guard) {
          if (array == null) return void 0;
          if ((n == null) || guard) {
              return array[array.length - 1];
          } else {
              return slice.call(array, Math.max(array.length - n, 0));
          }
      };
  
      // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
      // Especially useful on the arguments object. Passing an **n** will return
      // the rest N values in the array. The **guard**
      // check allows it to work with `_.map`.
      _.rest = _.tail = _.drop = function(array, n, guard) {
          return slice.call(array, (n == null) || guard ? 1 : n);
      };
  
      // Trim out all falsy values from an array.
      _.compact = function(array) {
          return _.filter(array, _.identity);
      };
  
      // Internal implementation of a recursive `flatten` function.
      var flatten = function(input, shallow, output) {
          if (shallow && _.every(input, _.isArray)) {
              return concat.apply(output, input);
          }
          each(input, function(value) {
              if (_.isArray(value) || _.isArguments(value)) {
                  shallow ? push.apply(output, value) : flatten(value, shallow, output);
              } else {
                  output.push(value);
              }
          });
          return output;
      };
  
      // Flatten out an array, either recursively (by default), or just one level.
      _.flatten = function(array, shallow) {
          return flatten(array, shallow, []);
      };
  
      // Return a version of the array that does not contain the specified value(s).
      _.without = function(array) {
          return _.difference(array, slice.call(arguments, 1));
      };
  
      // Produce a duplicate-free version of the array. If the array has already
      // been sorted, you have the option of using a faster algorithm.
      // Aliased as `unique`.
      _.uniq = _.unique = function(array, isSorted, iterator, context) {
          if (_.isFunction(isSorted)) {
              context = iterator;
              iterator = isSorted;
              isSorted = false;
          }
          var initial = iterator ? _.map(array, iterator, context) : array;
          var results = [];
          var seen = [];
          each(initial, function(value, index) {
              if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                  seen.push(value);
                  results.push(array[index]);
              }
          });
          return results;
      };
  
      // Produce an array that contains the union: each distinct element from all of
      // the passed-in arrays.
      _.union = function() {
          return _.uniq(_.flatten(arguments, true));
      };
  
      // Produce an array that contains every item shared between all the
      // passed-in arrays.
      _.intersection = function(array) {
          var rest = slice.call(arguments, 1);
          return _.filter(_.uniq(array), function(item) {
              return _.every(rest, function(other) {
                  return _.indexOf(other, item) >= 0;
              });
          });
      };
  
      // Take the difference between one array and a number of other arrays.
      // Only the elements present in just the first array will remain.
      _.difference = function(array) {
          var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
          return _.filter(array, function(value){ return !_.contains(rest, value); });
      };
  
      // Zip together multiple lists into a single array -- elements that share
      // an index go together.
      _.zip = function() {
          var length = _.max(_.pluck(arguments, "length").concat(0));
          var results = new Array(length);
          for (var i = 0; i < length; i++) {
              results[i] = _.pluck(arguments, '' + i);
          }
          return results;
      };
  
      // Converts lists into objects. Pass either a single array of `[key, value]`
      // pairs, or two parallel arrays of the same length -- one of keys, and one of
      // the corresponding values.
      _.object = function(list, values) {
          if (list == null) return {};
          var result = {};
          for (var i = 0, length = list.length; i < length; i++) {
              if (values) {
                  result[list[i]] = values[i];
              } else {
                  result[list[i][0]] = list[i][1];
              }
          }
          return result;
      };
  
      // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
      // we need this function. Return the position of the first occurrence of an
      // item in an array, or -1 if the item is not included in the array.
      // Delegates to **ECMAScript 5**'s native `indexOf` if available.
      // If the array is large and already in sort order, pass `true`
      // for **isSorted** to use binary search.
      _.indexOf = function(array, item, isSorted) {
          if (array == null) return -1;
          var i = 0, length = array.length;
          if (isSorted) {
              if (typeof isSorted == 'number') {
                  i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
              } else {
                  i = _.sortedIndex(array, item);
                  return array[i] === item ? i : -1;
              }
          }
          if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
          for (; i < length; i++) if (array[i] === item) return i;
          return -1;
      };
  
      // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
      _.lastIndexOf = function(array, item, from) {
          if (array == null) return -1;
          var hasIndex = from != null;
          if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
              return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
          }
          var i = (hasIndex ? from : array.length);
          while (i--) if (array[i] === item) return i;
          return -1;
      };
  
      // Generate an integer Array containing an arithmetic progression. A port of
      // the native Python `range()` function. See
      // [the Python documentation](http://docs.python.org/library/functions.html#range).
      _.range = function(start, stop, step) {
          if (arguments.length <= 1) {
              stop = start || 0;
              start = 0;
          }
          step = arguments[2] || 1;
  
          var length = Math.max(Math.ceil((stop - start) / step), 0);
          var idx = 0;
          var range = new Array(length);
  
          while(idx < length) {
              range[idx++] = start;
              start += step;
          }
  
          return range;
      };
  
      // Function (ahem) Functions
      // ------------------
  
      // Reusable constructor function for prototype setting.
      var ctor = function(){};
  
      // Create a function bound to a given object (assigning `this`, and arguments,
      // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
      // available.
      _.bind = function(func, context) {
          var args, bound;
          if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
          if (!_.isFunction(func)) throw new TypeError;
          args = slice.call(arguments, 2);
          return bound = function() {
              if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
              ctor.prototype = func.prototype;
              var self = new ctor;
              ctor.prototype = null;
              var result = func.apply(self, args.concat(slice.call(arguments)));
              if (Object(result) === result) return result;
              return self;
          };
      };
  
      // Partially apply a function by creating a version that has had some of its
      // arguments pre-filled, without changing its dynamic `this` context.
      _.partial = function(func) {
          var args = slice.call(arguments, 1);
          return function() {
              return func.apply(this, args.concat(slice.call(arguments)));
          };
      };
  
      // Bind all of an object's methods to that object. Useful for ensuring that
      // all callbacks defined on an object belong to it.
      _.bindAll = function(obj) {
          var funcs = slice.call(arguments, 1);
          if (funcs.length === 0) throw new Error("bindAll must be passed function names");
          each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
          return obj;
      };
  
      // Memoize an expensive function by storing its results.
      _.memoize = function(func, hasher) {
          var memo = {};
          hasher || (hasher = _.identity);
          return function() {
              var key = hasher.apply(this, arguments);
              return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
          };
      };
  
      // Delays a function for the given number of milliseconds, and then calls
      // it with the arguments supplied.
      _.delay = function(func, wait) {
          var args = slice.call(arguments, 2);
          return setTimeout(function(){ return func.apply(null, args); }, wait);
      };
  
      // Defers a function, scheduling it to run after the current call stack has
      // cleared.
      _.defer = function(func) {
          return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
      };
  
      // Returns a function, that, when invoked, will only be triggered at most once
      // during a given window of time. Normally, the throttled function will run
      // as much as it can, without ever going more than once per `wait` duration;
      // but if you'd like to disable the execution on the leading edge, pass
      // `{leading: false}`. To disable execution on the trailing edge, ditto.
      _.throttle = function(func, wait, options) {
          var context, args, result;
          var timeout = null;
          var previous = 0;
          options || (options = {});
          var later = function() {
              previous = options.leading === false ? 0 : new Date;
              timeout = null;
              result = func.apply(context, args);
          };
          return function() {
              var now = new Date;
              if (!previous && options.leading === false) previous = now;
              var remaining = wait - (now - previous);
              context = this;
              args = arguments;
              if (remaining <= 0) {
                  clearTimeout(timeout);
                  timeout = null;
                  previous = now;
                  result = func.apply(context, args);
              } else if (!timeout && options.trailing !== false) {
                  timeout = setTimeout(later, remaining);
              }
              return result;
          };
      };
  
      // Returns a function, that, as long as it continues to be invoked, will not
      // be triggered. The function will be called after it stops being called for
      // N milliseconds. If `immediate` is passed, trigger the function on the
      // leading edge, instead of the trailing.
      _.debounce = function(func, wait, immediate) {
          var timeout, args, context, timestamp, result;
          return function() {
              context = this;
              args = arguments;
              timestamp = new Date();
              var later = function() {
                  var last = (new Date()) - timestamp;
                  if (last < wait) {
                      timeout = setTimeout(later, wait - last);
                  } else {
                      timeout = null;
                      if (!immediate) result = func.apply(context, args);
                  }
              };
              var callNow = immediate && !timeout;
              if (!timeout) {
                  timeout = setTimeout(later, wait);
              }
              if (callNow) result = func.apply(context, args);
              return result;
          };
      };
  
      // Returns a function that will be executed at most one time, no matter how
      // often you call it. Useful for lazy initialization.
      _.once = function(func) {
          var ran = false, memo;
          return function() {
              if (ran) return memo;
              ran = true;
              memo = func.apply(this, arguments);
              func = null;
              return memo;
          };
      };
  
      // Returns the first function passed as an argument to the second,
      // allowing you to adjust arguments, run code before and after, and
      // conditionally execute the original function.
      _.wrap = function(func, wrapper) {
          return function() {
              var args = [func];
              push.apply(args, arguments);
              return wrapper.apply(this, args);
          };
      };
  
      // Returns a function that is the composition of a list of functions, each
      // consuming the return value of the function that follows.
      _.compose = function() {
          var funcs = arguments;
          return function() {
              var args = arguments;
              for (var i = funcs.length - 1; i >= 0; i--) {
                  args = [funcs[i].apply(this, args)];
              }
              return args[0];
          };
      };
  
      // Returns a function that will only be executed after being called N times.
      _.after = function(times, func) {
          return function() {
              if (--times < 1) {
                  return func.apply(this, arguments);
              }
          };
      };
  
      // Object Functions
      // ----------------
  
      // Retrieve the names of an object's properties.
      // Delegates to **ECMAScript 5**'s native `Object.keys`
      _.keys = nativeKeys || function(obj) {
          if (obj !== Object(obj)) throw new TypeError('Invalid object');
          var keys = [];
          for (var key in obj) if (_.has(obj, key)) keys.push(key);
          return keys;
      };
  
      // Retrieve the values of an object's properties.
      _.values = function(obj) {
          var keys = _.keys(obj);
          var length = keys.length;
          var values = new Array(length);
          for (var i = 0; i < length; i++) {
              values[i] = obj[keys[i]];
          }
          return values;
      };
  
      // Convert an object into a list of `[key, value]` pairs.
      _.pairs = function(obj) {
          var keys = _.keys(obj);
          var length = keys.length;
          var pairs = new Array(length);
          for (var i = 0; i < length; i++) {
              pairs[i] = [keys[i], obj[keys[i]]];
          }
          return pairs;
      };
  
      // Invert the keys and values of an object. The values must be serializable.
      _.invert = function(obj) {
          var result = {};
          var keys = _.keys(obj);
          for (var i = 0, length = keys.length; i < length; i++) {
              result[obj[keys[i]]] = keys[i];
          }
          return result;
      };
  
      // Return a sorted list of the function names available on the object.
      // Aliased as `methods`
      _.functions = _.methods = function(obj) {
          var names = [];
          for (var key in obj) {
              if (_.isFunction(obj[key])) names.push(key);
          }
          return names.sort();
      };
  
      // Extend a given object with all the properties in passed-in object(s).
      _.extend = function(obj) {
          each(slice.call(arguments, 1), function(source) {
              if (source) {
                  for (var prop in source) {
                      obj[prop] = source[prop];
                  }
              }
          });
          return obj;
      };
  
      // Return a copy of the object only containing the whitelisted properties.
      _.pick = function(obj) {
          var copy = {};
          var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
          each(keys, function(key) {
              if (key in obj) copy[key] = obj[key];
          });
          return copy;
      };
  
      // Return a copy of the object without the blacklisted properties.
      _.omit = function(obj) {
          var copy = {};
          var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
          for (var key in obj) {
              if (!_.contains(keys, key)) copy[key] = obj[key];
          }
          return copy;
      };
  
      // Fill in a given object with default properties.
      _.defaults = function(obj) {
          each(slice.call(arguments, 1), function(source) {
              if (source) {
                  for (var prop in source) {
                      if (obj[prop] === void 0) obj[prop] = source[prop];
                  }
              }
          });
          return obj;
      };
  
      // Create a (shallow-cloned) duplicate of an object.
      _.clone = function(obj) {
          if (!_.isObject(obj)) return obj;
          return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
      };
  
      // Invokes interceptor with the obj, and then returns obj.
      // The primary purpose of this method is to "tap into" a method chain, in
      // order to perform operations on intermediate results within the chain.
      _.tap = function(obj, interceptor) {
          interceptor(obj);
          return obj;
      };
  
      // Internal recursive comparison function for `isEqual`.
      var eq = function(a, b, aStack, bStack) {
          // Identical objects are equal. `0 === -0`, but they aren't identical.
          // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
          if (a === b) return a !== 0 || 1 / a == 1 / b;
          // A strict comparison is necessary because `null == undefined`.
          if (a == null || b == null) return a === b;
          // Unwrap any wrapped objects.
          if (a instanceof _) a = a._wrapped;
          if (b instanceof _) b = b._wrapped;
          // Compare `[[Class]]` names.
          var className = toString.call(a);
          if (className != toString.call(b)) return false;
          switch (className) {
              // Strings, numbers, dates, and booleans are compared by value.
              case '[object String]':
                  // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                  // equivalent to `new String("5")`.
                  return a == String(b);
              case '[object Number]':
                  // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                  // other numeric values.
                  return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
              case '[object Date]':
              case '[object Boolean]':
                  // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                  // millisecond representations. Note that invalid dates with millisecond representations
                  // of `NaN` are not equivalent.
                  return +a == +b;
              // RegExps are compared by their source patterns and flags.
              case '[object RegExp]':
                  return a.source == b.source &&
                      a.global == b.global &&
                      a.multiline == b.multiline &&
                      a.ignoreCase == b.ignoreCase;
          }
          if (typeof a != 'object' || typeof b != 'object') return false;
          // Assume equality for cyclic structures. The algorithm for detecting cyclic
          // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
          var length = aStack.length;
          while (length--) {
              // Linear search. Performance is inversely proportional to the number of
              // unique nested structures.
              if (aStack[length] == a) return bStack[length] == b;
          }
          // Objects with different constructors are not equivalent, but `Object`s
          // from different frames are.
          var aCtor = a.constructor, bCtor = b.constructor;
          if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
              _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
              return false;
          }
          // Add the first object to the stack of traversed objects.
          aStack.push(a);
          bStack.push(b);
          var size = 0, result = true;
          // Recursively compare objects and arrays.
          if (className == '[object Array]') {
              // Compare array lengths to determine if a deep comparison is necessary.
              size = a.length;
              result = size == b.length;
              if (result) {
                  // Deep compare the contents, ignoring non-numeric properties.
                  while (size--) {
                      if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                  }
              }
          } else {
              // Deep compare objects.
              for (var key in a) {
                  if (_.has(a, key)) {
                      // Count the expected number of properties.
                      size++;
                      // Deep compare each member.
                      if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                  }
              }
              // Ensure that both objects contain the same number of properties.
              if (result) {
                  for (key in b) {
                      if (_.has(b, key) && !(size--)) break;
                  }
                  result = !size;
              }
          }
          // Remove the first object from the stack of traversed objects.
          aStack.pop();
          bStack.pop();
          return result;
      };
  
      // Perform a deep comparison to check if two objects are equal.
      _.isEqual = function(a, b) {
          return eq(a, b, [], []);
      };
  
      // Is a given array, string, or object empty?
      // An "empty" object has no enumerable own-properties.
      _.isEmpty = function(obj) {
          if (obj == null) return true;
          if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
          for (var key in obj) if (_.has(obj, key)) return false;
          return true;
      };
  
      // Is a given value a DOM element?
      _.isElement = function(obj) {
          return !!(obj && obj.nodeType === 1);
      };
  
      // Is a given value an array?
      // Delegates to ECMA5's native Array.isArray
      _.isArray = nativeIsArray || function(obj) {
          return toString.call(obj) == '[object Array]';
      };
  
      // Is a given variable an object?
      _.isObject = function(obj) {
          return obj === Object(obj);
      };
  
      // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
      each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
          _['is' + name] = function(obj) {
              return toString.call(obj) == '[object ' + name + ']';
          };
      });
  
      // Define a fallback version of the method in browsers (ahem, IE), where
      // there isn't any inspectable "Arguments" type.
      if (!_.isArguments(arguments)) {
          _.isArguments = function(obj) {
              return !!(obj && _.has(obj, 'callee'));
          };
      }
  
      // Optimize `isFunction` if appropriate.
      if (typeof (/./) !== 'function') {
          _.isFunction = function(obj) {
              return typeof obj === 'function';
          };
      }
  
      // Is a given object a finite number?
      _.isFinite = function(obj) {
          return isFinite(obj) && !isNaN(parseFloat(obj));
      };
  
      // Is the given value `NaN`? (NaN is the only number which does not equal itself).
      _.isNaN = function(obj) {
          return _.isNumber(obj) && obj != +obj;
      };
  
      // Is a given value a boolean?
      _.isBoolean = function(obj) {
          return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
      };
  
      // Is a given value equal to null?
      _.isNull = function(obj) {
          return obj === null;
      };
  
      // Is a given variable undefined?
      _.isUndefined = function(obj) {
          return obj === void 0;
      };
  
      // Shortcut function for checking if an object has a given property directly
      // on itself (in other words, not on a prototype).
      _.has = function(obj, key) {
          return hasOwnProperty.call(obj, key);
      };
  
      // Utility Functions
      // -----------------
  
      // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
      // previous owner. Returns a reference to the Underscore object.
      _.noConflict = function() {
          root._ = previousUnderscore;
          return this;
      };
  
      // Keep the identity function around for default iterators.
      _.identity = function(value) {
          return value;
      };
  
      // Run a function **n** times.
      _.times = function(n, iterator, context) {
          var accum = Array(Math.max(0, n));
          for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
          return accum;
      };
  
      // Return a random integer between min and max (inclusive).
      _.random = function(min, max) {
          if (max == null) {
              max = min;
              min = 0;
          }
          return min + Math.floor(Math.random() * (max - min + 1));
      };
  
      // List of HTML entities for escaping.
      var entityMap = {
          escape: {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#x27;'
          }
      };
      entityMap.unescape = _.invert(entityMap.escape);
  
      // Regexes containing the keys and values listed immediately above.
      var entityRegexes = {
          escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
          unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
      };
  
      // Functions for escaping and unescaping strings to/from HTML interpolation.
      _.each(['escape', 'unescape'], function(method) {
          _[method] = function(string) {
              if (string == null) return '';
              return ('' + string).replace(entityRegexes[method], function(match) {
                  return entityMap[method][match];
              });
          };
      });
  
      // If the value of the named `property` is a function then invoke it with the
      // `object` as context; otherwise, return it.
      _.result = function(object, property) {
          if (object == null) return void 0;
          var value = object[property];
          return _.isFunction(value) ? value.call(object) : value;
      };
  
      // Add your own custom functions to the Underscore object.
      _.mixin = function(obj) {
          each(_.functions(obj), function(name) {
              var func = _[name] = obj[name];
              _.prototype[name] = function() {
                  var args = [this._wrapped];
                  push.apply(args, arguments);
                  return result.call(this, func.apply(_, args));
              };
          });
      };
  
      // Generate a unique integer id (unique within the entire client session).
      // Useful for temporary DOM ids.
      var idCounter = 0;
      _.uniqueId = function(prefix) {
          var id = ++idCounter + '';
          return prefix ? prefix + id : id;
      };
  
      // By default, Underscore uses ERB-style template delimiters, change the
      // following template settings to use alternative delimiters.
      _.templateSettings = {
          evaluate    : /<%([\s\S]+?)%>/g,
          interpolate : /<%=([\s\S]+?)%>/g,
          escape      : /<%-([\s\S]+?)%>/g
      };
  
      // When customizing `templateSettings`, if you don't want to define an
      // interpolation, evaluation or escaping regex, we need one that is
      // guaranteed not to match.
      var noMatch = /(.)^/;
  
      // Certain characters need to be escaped so that they can be put into a
      // string literal.
      var escapes = {
          "'":      "'",
          '\\':     '\\',
          '\r':     'r',
          '\n':     'n',
          '\t':     't',
          '\u2028': 'u2028',
          '\u2029': 'u2029'
      };
  
      var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  
      // JavaScript micro-templating, similar to John Resig's implementation.
      // Underscore templating handles arbitrary delimiters, preserves whitespace,
      // and correctly escapes quotes within interpolated code.
      _.template = function(text, data, settings) {
          var render;
          settings = _.defaults({}, settings, _.templateSettings);
  
          // Combine delimiters into one regular expression via alternation.
          var matcher = new RegExp([
              (settings.escape || noMatch).source,
              (settings.interpolate || noMatch).source,
              (settings.evaluate || noMatch).source
          ].join('|') + '|$', 'g');
  
          // Compile the template source, escaping string literals appropriately.
          var index = 0;
          var source = "__p+='";
          text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
              source += text.slice(index, offset)
                  .replace(escaper, function(match) { return '\\' + escapes[match]; });
  
              if (escape) {
                  source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
              }
              if (interpolate) {
                  source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
              }
              if (evaluate) {
                  source += "';\n" + evaluate + "\n__p+='";
              }
              index = offset + match.length;
              return match;
          });
          source += "';\n";
  
          // If a variable is not specified, place data values in local scope.
          if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
  
          source = "var __t,__p='',__j=Array.prototype.join," +
              "print=function(){__p+=__j.call(arguments,'');};\n" +
              source + "return __p;\n";
  
          try {
              render = new Function(settings.variable || 'obj', '_', source);
          } catch (e) {
              e.source = source;
              throw e;
          }
  
          if (data) return render(data, _);
          var template = function(data) {
              return render.call(this, data, _);
          };
  
          // Provide the compiled function source as a convenience for precompilation.
          template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
  
          return template;
      };
  
      // Add a "chain" function, which will delegate to the wrapper.
      _.chain = function(obj) {
          return _(obj).chain();
      };
  
      // OOP
      // ---------------
      // If Underscore is called as a function, it returns a wrapped object that
      // can be used OO-style. This wrapper holds altered versions of all the
      // underscore functions. Wrapped objects may be chained.
  
      // Helper function to continue chaining intermediate results.
      var result = function(obj) {
          return this._chain ? _(obj).chain() : obj;
      };
  
      // Add all of the Underscore functions to the wrapper object.
      _.mixin(_);
  
      // Add all mutator Array functions to the wrapper.
      each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
          var method = ArrayProto[name];
          _.prototype[name] = function() {
              var obj = this._wrapped;
              method.apply(obj, arguments);
              if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
              return result.call(this, obj);
          };
      });
  
      // Add all accessor Array functions to the wrapper.
      each(['concat', 'join', 'slice'], function(name) {
          var method = ArrayProto[name];
          _.prototype[name] = function() {
              return result.call(this, method.apply(this._wrapped, arguments));
          };
      });
  
      _.extend(_.prototype, {
  
          // Start chaining a wrapped Underscore object.
          chain: function() {
              this._chain = true;
              return this;
          },
  
          // Extracts the result from a wrapped and chained object.
          value: function() {
              return this._wrapped;
          }
  
      });
  
  }).call(this);
  
  /**
  * FOLLOWING LINES MODIFIED BY ATLASSIAN
  * @see https://ecosystem.atlassian.net/browse/AUI-2989
  */
  if (typeof window.define === 'function') {
     define('underscore', [], function(){
         return window._;
     })
  }
  /** END ATLASSIAN */
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/underscore.js
(typeof window === 'undefined' ? global : window).__922acd0053a6de3ea4c53d8902766ab6 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __61c16d543bfae33bb4747b45f7b91f35;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  if (!window._) {
      window._ = _underscore2.default;
  }
  
  exports.default = window._;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/events.js
(typeof window === 'undefined' ? global : window).__1a99a68c34e660050a094f87fb28903d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.triggerEvtForInst = exports.triggerEvt = exports.bindEvt = undefined;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _createElement = __fd277fcde858b82a198666a405e85600;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Triggers a custom event on the AJS object
   *
   * @param {String} name - name of event
   * @param {Array} args - args for event handler
   */
  function triggerEvt(name, args) {
      (0, _jquery2.default)(_createElement2.default).trigger(name, args);
  }
  
  /**
   * Binds handler to the AJS object
   *
   * @param {String} name
   * @param {Function} func
   */
  function bindEvt(name, func) {
      (0, _jquery2.default)(_createElement2.default).bind(name, func);
  }
  
  /**
   * Some generic error handling that fires event in multiple contexts
   * - on AJS object
   * - on Instance
   * - on AJS object with prefixed id.
   *
   * @param evt
   * @param inst
   * @param args
   */
  function triggerEvtForInst(evt, inst, args) {
      (0, _jquery2.default)(inst).trigger(evt, args);
      triggerEvt(evt, args);
      if (inst.id) {
          triggerEvt(inst.id + '-' + evt, args);
      }
  }
  
  exports.bindEvt = bindEvt = deprecate.fn(bindEvt, 'bindEvt', {
      sinceVersion: '5.8.0'
  });
  
  exports.triggerEvt = triggerEvt = deprecate.fn(triggerEvt, 'triggerEvt', {
      sinceVersion: '5.8.0'
  });
  
  exports.triggerEvtForInst = triggerEvtForInst = deprecate.fn(triggerEvtForInst, 'triggerEvtForInst', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('bindEvt', bindEvt);
  (0, _globalize2.default)('triggerEvt', triggerEvt);
  (0, _globalize2.default)('triggerEvtForInst', triggerEvtForInst);
  
  exports.bindEvt = bindEvt;
  exports.triggerEvt = triggerEvt;
  exports.triggerEvtForInst = triggerEvtForInst;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/event.js
(typeof window === 'undefined' ? global : window).__bf6c7c62de0eb613e0ab12d56d9a6197 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.trigger = exports.unbind = exports.bind = undefined;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Binds events to the window object. See jQuery bind documentation for more
   * details. Exceptions are caught and logged.
   */
  function bind(eventType, eventData, handler) {
      try {
          if (typeof handler === 'function') {
              return (0, _jquery2.default)(window).bind(eventType, eventData, handler);
          } else {
              return (0, _jquery2.default)(window).bind(eventType, eventData);
          }
      } catch (e) {
          logger.log('error while binding: ' + e.message);
      }
  }
  
  /**
   * Unbinds event handlers from the window object. See jQuery unbind
   * documentation for more details. Exceptions are caught and logged.
   */
  function unbind(eventType, handler) {
      try {
          return (0, _jquery2.default)(window).unbind(eventType, handler);
      } catch (e) {
          logger.log('error while unbinding: ' + e.message);
      }
  }
  
  /**
   * Triggers events on the window object. See jQuery trigger documentation for
   * more details. Exceptions are caught and logged.
   */
  function trigger(eventType, extraParameters) {
      try {
          return (0, _jquery2.default)(window).trigger(eventType, extraParameters);
      } catch (e) {
          logger.log('error while triggering: ' + e.message);
      }
  }
  
  (0, _globalize2.default)('bind', bind);
  (0, _globalize2.default)('trigger', trigger);
  (0, _globalize2.default)('unbind', unbind);
  
  exports.bind = bind;
  exports.unbind = unbind;
  exports.trigger = trigger;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/forms.js
(typeof window === 'undefined' ? global : window).__05b42b82bab2942063ea875333a900bb = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.inlineHelp = exports.enable = undefined;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Enables the specified form element.
   *
   * @param {Element} el The element to enable.
   * @param {Boolean} b The flag setting enabled / disabled.
   *
   * @returns {jQuery}
   */
  function enable(el, b) {
      var $el = (0, _jquery2.default)(el);
  
      if (typeof b === 'undefined') {
          b = true;
      }
  
      return $el.each(function () {
          this.disabled = !b;
      });
  }
  
  /**
   * Forms: Inline Help - toggles visibility of inline help content.
   *
   * @method inlineHelp
   * @namespace AJS
   * @for AJS
   */
  function inlineHelp() {
      (0, _jquery2.default)('.icon-inline-help').click(function () {
          var $t = (0, _jquery2.default)(this).siblings('.field-help');
          if ($t.hasClass('hidden')) {
              $t.removeClass('hidden');
          } else {
              $t.addClass('hidden');
          }
      });
  }
  
  (0, _globalize2.default)('enable', enable);
  (0, _globalize2.default)('inlineHelp', inlineHelp);
  
  exports.enable = enable;
  exports.inlineHelp = inlineHelp;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/dialog.js
(typeof window === 'undefined' ? global : window).__8eca5e5171c0c22be18ea931ed65c747 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.popup = exports.Dialog = undefined;
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; // can't "use strict"
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _event = __bf6c7c62de0eb613e0ab12d56d9a6197;
  
  var _blanket = __594942bfcf520d6e5a0843b1cfdd039a;
  
  var _forms = __05b42b82bab2942063ea875333a900bb;
  
  var _createElement = __fd277fcde858b82a198666a405e85600;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Creates a generic popup that will be displayed in the center of the screen with a
   * grey blanket in the background.
   * Usage:
   * <pre>
   * createPopup({
   *     width: 800,
   *     height: 400,
   *     id: "my-dialog"
   * });
   * </pre>
   * @param options {object} [optional] Permitted options and defaults are as follows:
   * width (800), height (600), keypressListener (closes dialog on ESC).
  */
  function createPopup(options) {
      var defaults = {
          width: 800,
          height: 600,
          closeOnOutsideClick: false,
          keypressListener: function keypressListener(e) {
              if (e.keyCode === 27 && popup.is(':visible')) {
                  res.hide();
              }
          }
      };
      // for backwards-compatibility
      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) != 'object') {
          options = {
              width: arguments[0],
              height: arguments[1],
              id: arguments[2]
          };
          options = _jquery2.default.extend({}, options, arguments[3]);
      }
      options = _jquery2.default.extend({}, defaults, options);
      var popup = (0, _createElement2.default)('div').addClass('aui-popup');
  
      if (options.id) {
          popup.attr('id', options.id);
      }
      //find the highest z-index on the page to ensure any new popup that is shown is shown on top
      var highestZIndex = 3000;
      (0, _jquery2.default)('.aui-dialog').each(function () {
          var currentPopup = (0, _jquery2.default)(this);
          highestZIndex = currentPopup.css('z-index') > highestZIndex ? currentPopup.css('z-index') : highestZIndex;
      });
  
      var applySize = function _applySize(width, height) {
          options.width = width = width || options.width;
          options.height = height = height || options.height;
  
          popup.css({
              marginTop: -Math.round(height / 2) + 'px',
              marginLeft: -Math.round(width / 2) + 'px',
              width: width,
              height: height,
              'z-index': parseInt(highestZIndex, 10) + 2 //+ 2 so that the shadow can be shown on +1 (underneath the popup but above everything else)
          });
          return _applySize;
      }(options.width, options.height);
  
      (0, _jquery2.default)('body').append(popup);
  
      popup.hide();
      (0, _forms.enable)(popup);
  
      /**
       * Popup object
       * @class Popup
       * @static
      */
  
      //blanket for reference further down
      var blanket = (0, _jquery2.default)('.aui-blanket'),
          focusItem = function focusItem(selector, element) {
          var item = (0, _jquery2.default)(selector, element);
          if (item.length) {
              item.focus();
              return true;
          }
          return false;
      },
  
      // we try and place focus, in the configured element or by looking for the first input
      // in page body, then button panel and finally page menu.
      focusDialog = function focusDialog(element) {
          if ((0, _jquery2.default)('.dialog-page-body', element).find(':focus').length !== 0) {
              return;
          }
          if (options.focusSelector) {
              return focusItem(options.focusSelector, element);
          }
          var defaultFocusSelector = ':input:visible:enabled:first';
          if (focusItem(defaultFocusSelector, (0, _jquery2.default)('.dialog-page-body', element))) return;
          if (focusItem(defaultFocusSelector, (0, _jquery2.default)('.dialog-button-panel', element))) return;
  
          focusItem(defaultFocusSelector, (0, _jquery2.default)('.dialog-page-menu', element));
      };
  
      var res = {
  
          changeSize: function changeSize(w, h) {
              if (w && w != options.width || h && h != options.height) {
                  applySize(w, h);
              }
              this.show();
          },
  
          /**
           * Shows the popup
           * @method show
          */
          show: function show() {
  
              var show = function show() {
                  (0, _jquery2.default)(document).off('keydown', options.keypressListener).on('keydown', options.keypressListener);
                  (0, _blanket.dim)();
                  blanket = (0, _jquery2.default)('.aui-blanket');
                  if (blanket.size() != 0 && options.closeOnOutsideClick) {
                      blanket.click(function () {
                          if (popup.is(':visible')) {
                              res.hide();
                          }
                      });
                  }
                  popup.show();
  
                  createPopup.current = this;
                  focusDialog(popup);
                  (0, _jquery2.default)(document).trigger('showLayer', ['popup', this]);
              };
              show.call(this);
              this.show = show;
          },
          /**
           * Hides the popup.
           * @method hide
          */
          hide: function hide() {
              (0, _jquery2.default)(document).unbind('keydown', options.keypressListener);
              blanket.unbind();
              this.element.hide();
  
              //only undim if no other dialogs are visible
              if ((0, _jquery2.default)('.aui-dialog:visible').size() == 0) {
                  (0, _blanket.undim)();
              }
  
              // AUI-1059: remove focus from the active element when dialog is hidden
              var activeElement = document.activeElement;
              if (this.element.has(activeElement).length) {
                  activeElement.blur();
              }
  
              (0, _jquery2.default)(document).trigger('hideLayer', ['popup', this]);
              createPopup.current = null;
              this.enable();
          },
          /**
           * jQuery object, representing popup DOM element
           * @property element
          */
          element: popup,
          /**
           * Removes popup elements from the DOM
           * @method remove
          */
          remove: function remove() {
              popup.remove();
              this.element = null;
          },
          /**
           * disables the popup
           * @method disable
          */
          disable: function disable() {
              if (!this.disabled) {
                  this.popupBlanket = (0, _jquery2.default)("<div class='dialog-blanket'> </div>").css({
                      height: popup.height(),
                      width: popup.width()
                  });
                  popup.append(this.popupBlanket);
                  this.disabled = true;
              }
          },
          /**
           * enables the popup if it is disabled
           * @method enable
          */
          enable: function enable() {
              if (this.disabled) {
                  this.disabled = false;
                  this.popupBlanket.remove();
                  this.popupBlanket = null;
              }
          }
      };
  
      return res;
  };
  
  // Scoping function
  var Dialog = function () {
      /**
       * @class Button
       * @constructor Button
       * @param page {number} page id
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @private
      */
      function Button(page, label, onclick, className) {
          if (!page.buttonpanel) {
              page.addButtonPanel();
          }
          this.page = page;
          this.onclick = onclick;
          this._onclick = function (e) {
              return onclick.call(this, page.dialog, page, e) === true;
          };
          this.item = (0, _createElement2.default)('button', label).addClass('button-panel-button');
          if (className) {
              this.item.addClass(className);
          }
          if (typeof onclick == 'function') {
              this.item.click(this._onclick);
          }
          page.buttonpanel.append(this.item);
          this.id = page.button.length;
          page.button[this.id] = this;
      }
  
      /**
       * @class Link
       * @constructor Link
       * @param page {number} page id
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @private
      */
      function Link(page, label, onclick, className, url) {
          if (!page.buttonpanel) {
              page.addButtonPanel();
          }
  
          //if no url is given use # as default
          if (!url) {
              url = '#';
          }
  
          this.page = page;
          this.onclick = onclick;
          this._onclick = function (e) {
              return onclick.call(this, page.dialog, page, e) === true;
          };
          this.item = (0, _createElement2.default)('a', label).attr('href', url).addClass('button-panel-link');
          if (className) {
              this.item.addClass(className);
          }
          if (typeof onclick == 'function') {
              this.item.click(this._onclick);
          }
          page.buttonpanel.append(this.item);
          this.id = page.button.length;
          page.button[this.id] = this;
      }
  
      function itemMove(leftOrRight, target) {
          var dir = leftOrRight == 'left' ? -1 : 1;
          return function (step) {
              var dtarget = this.page[target];
              if (this.id != (dir == 1 ? dtarget.length - 1 : 0)) {
                  dir *= step || 1;
                  dtarget[this.id + dir].item[dir < 0 ? 'before' : 'after'](this.item);
                  dtarget.splice(this.id, 1);
                  dtarget.splice(this.id + dir, 0, this);
                  for (var i = 0, ii = dtarget.length; i < ii; i++) {
                      if (target == 'panel' && this.page.curtab == dtarget[i].id) {
                          this.page.curtab = i;
                      }
                      dtarget[i].id = i;
                  }
              }
              return this;
          };
      }
      function itemRemove(target) {
          return function () {
              this.page[target].splice(this.id, 1);
              for (var i = 0, ii = this.page[target].length; i < ii; i++) {
                  this.page[target][i].id = i;
              }
              this.item.remove();
          };
      }
      /**
       * Moves item left in the hierarchy
       * @method moveUp
       * @method moveLeft
       * @param step {number} how many items to move, default is 1
       * @return {object} button
      */
      Button.prototype.moveUp = Button.prototype.moveLeft = itemMove('left', 'button');
      /**
       * Moves item right in the hierarchy
       * @method moveDown
       * @method moveRight
       * @param step {number} how many items to move, default is 1
       * @return {object} button
      */
      Button.prototype.moveDown = Button.prototype.moveRight = itemMove('right', 'button');
      /**
       * Removes item
       * @method remove
      */
      Button.prototype.remove = itemRemove('button');
  
      /**
       * Getter and setter for label
       * @method label
       * @param label {string} [optional] label of the button
       * @return {string} label, if nothing is passed in
       * @return {object} jQuery button object, if label is passed in
      */
      Button.prototype.html = function (label) {
          return this.item.html(label);
      };
      /**
       * Getter and setter of onclick event handler
       * @method onclick
       * @param onclick {function} [optional] new event handler, that is going to replace the old one
       * @return {function} existing event handler if new one is undefined
      */
      Button.prototype.onclick = function (onclick) {
          if (typeof onclick == 'undefined') {
              return this.onclick;
          } else {
              this.item.unbind('click', this._onclick);
              this._onclick = function (e) {
                  return onclick.call(this, page.dialog, page, e) === true;
              };
              if (typeof onclick == 'function') {
                  this.item.click(this._onclick);
              }
          }
      };
  
      var DEFAULT_PADDING = 20;
  
      /**
       * Class for panels
       * @class Panel
       * @constructor
       * @param page {number} page id
       * @param title {string} panel title
       * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
       * @param className {string} [optional] HTML class name
       * @param panelButtonId {string} the unique id that will be put on the button element for this panel.
       * @private
      */
      var Panel = function Panel(page, title, reference, className, panelButtonId) {
          if (!(reference instanceof _jquery2.default)) {
              reference = (0, _jquery2.default)(reference);
          }
  
          this.dialog = page.dialog;
          this.page = page;
          this.id = page.panel.length;
          this.button = (0, _createElement2.default)('button').html(title).addClass('item-button');
  
          if (panelButtonId) {
              this.button[0].id = panelButtonId;
          }
  
          this.item = (0, _createElement2.default)('li').append(this.button).addClass('page-menu-item');
          this.body = (0, _createElement2.default)('div').append(reference).addClass('dialog-panel-body').css('height', page.dialog.height + 'px');
          this.padding = DEFAULT_PADDING;
          if (className) {
              this.body.addClass(className);
          }
          var i = page.panel.length,
              tab = this;
          page.menu.append(this.item);
          page.body.append(this.body);
          page.panel[i] = this;
          var onclick = function onclick() {
              var cur;
              if (page.curtab + 1) {
                  cur = page.panel[page.curtab];
                  cur.body.hide();
                  cur.item.removeClass('selected');
                  typeof cur.onblur == 'function' && cur.onblur();
              }
              page.curtab = tab.id;
              tab.body.show();
              tab.item.addClass('selected');
              typeof tab.onselect == 'function' && tab.onselect();
              typeof page.ontabchange == 'function' && page.ontabchange(tab, cur);
          };
          if (!this.button.click) {
              logger.log('atlassian-dialog:Panel:constructor - this.button.click false');
              this.button.onclick = onclick;
          } else {
              this.button.click(onclick);
          }
          onclick();
          if (i == 0) {
              page.menu.css('display', 'none'); // don't use jQuery hide()
          } else {
              page.menu.show();
          }
      };
      /**
       * Selects current panel
       * @method select
      */
      Panel.prototype.select = function () {
          this.button.click();
      };
      /**
       * Moves item left in the hierarchy
       * @method moveUp
       * @method moveLeft
       * @param step {number} how many items to move, default is 1
       * @return {object} panel
      */
      Panel.prototype.moveUp = Panel.prototype.moveLeft = itemMove('left', 'panel');
      /**
       * Moves item right in the hierarchy
       * @method moveDown
       * @method moveRight
       * @param step {number} how many items to move, default is 1
       * @return {object} panel
      */
      Panel.prototype.moveDown = Panel.prototype.moveRight = itemMove('right', 'panel');
      /**
       * Removes item
       * @method remove
      */
      Panel.prototype.remove = itemRemove('panel');
      /**
       * Getter and setter of inner HTML of the panel
       * @method html
       * @param html {string} HTML source to set up
       * @return {object} panel
       * @return {string} current HTML source
      */
      Panel.prototype.html = function (html) {
          if (html) {
              this.body.html(html);
              return this;
          } else {
              return this.body.html();
          }
      };
      /**
       * This method gives you ability to overwrite default padding value. Use it with caution.
       * @method setPadding
       * @param padding {number} padding in pixels
       * @return {object} panel
       * @see DEFAULT_PADDING
      */
      Panel.prototype.setPadding = function (padding) {
          if (!isNaN(+padding)) {
              this.body.css('padding', +padding);
              this.padding = +padding;
              this.page.recalcSize();
          }
          return this;
      };
  
      var HEADER_HEIGHT = 56;
      var BUTTONS_HEIGHT = 51;
      var MIN_DIALOG_VERTICAL_BUFFER = 50;
  
      /**
       * Class for pages
       * @class Page
       * @constructor
       * @param dialog {object} dialog object
       * @param className {string} [optional] HTML class name
       * @private
      */
      var Page = function Page(dialog, className) {
          this.dialog = dialog;
          this.id = dialog.page.length;
          this.element = (0, _createElement2.default)('div').addClass('dialog-components');
          this.body = (0, _createElement2.default)('div').addClass('dialog-page-body');
          this.menu = (0, _createElement2.default)('ul').addClass('dialog-page-menu').css('height', dialog.height + 'px');
          this.body.append(this.menu);
          this.curtab;
          this.panel = [];
          this.button = [];
          if (className) {
              this.body.addClass(className);
          }
          dialog.popup.element.append(this.element.append(this.menu).append(this.body));
          dialog.page[dialog.page.length] = this;
      };
  
      /**
       * Size updater for contents of the page. For internal use
       * @method recalcSize
      */
      Page.prototype.recalcSize = function () {
          var headerHeight = this.header ? HEADER_HEIGHT : 0;
          var buttonHeight = this.buttonpanel ? BUTTONS_HEIGHT : 0;
          for (var i = this.panel.length; i--;) {
              var dialogComponentsHeight = this.dialog.height - headerHeight - buttonHeight;
              this.panel[i].body.css('height', dialogComponentsHeight);
              this.menu.css('height', dialogComponentsHeight);
          }
      };
  
      /**
       * Adds a button panel to the bottom of dialog
       * @method addButtonPanel
       */
      Page.prototype.addButtonPanel = function () {
          this.buttonpanel = (0, _createElement2.default)('div').addClass('dialog-button-panel');
          this.element.append(this.buttonpanel);
      };
  
      /**
       * Method for adding new panel to the page
       * @method addPanel
       * @param title {string} panel title
       * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
       * @param className {string} [optional] HTML class name
       * @param panelButtonId {string} [optional] The unique id for the panel's button.
       * @return {object} the page
      */
      Page.prototype.addPanel = function (title, reference, className, panelButtonId) {
          new Panel(this, title, reference, className, panelButtonId);
          this.recalcSize();
          return this;
      };
      /**
       * Method for adding header to the page
       * @method addHeader
       * @param title {string} panel title
       * @param className {string} [optional] CSS class name
       * @return {object} the page
      */
      Page.prototype.addHeader = function (title, className) {
          if (this.header) {
              this.header.remove();
          }
          this.header = (0, _createElement2.default)('h2').text(title || '').addClass('dialog-title');
          className && this.header.addClass(className);
          this.element.prepend(this.header);
          this.recalcSize();
          return this;
      };
      /**
       * Method for adding new button to the page
       * @method addButton
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the page
      */
      Page.prototype.addButton = function (label, onclick, className) {
          new Button(this, label, onclick, className);
          this.recalcSize();
          return this;
      };
      /**
       * Method for adding new link to the page
       * @method addLink
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the page
      */
      Page.prototype.addLink = function (label, onclick, className, url) {
          new Link(this, label, onclick, className, url);
          this.recalcSize();
          return this;
      };
  
      /**
       * Selects corresponding panel
       * @method gotoPanel
       * @param panel {object} panel object
       * @param panel {number} id of the panel
      */
      Page.prototype.gotoPanel = function (panel) {
          this.panel[panel.id || panel].select();
      };
      /**
       * Returns current panel on the page
       * @method getCurrentPanel
       * @return panel {object} the panel
      */
      Page.prototype.getCurrentPanel = function () {
          return this.panel[this.curtab];
      };
      /**
       * Hides the page
       * @method hide
      */
      Page.prototype.hide = function () {
          this.element.hide();
      };
      /**
       * Shows the page, if it was hidden
       * @method show
      */
      Page.prototype.show = function () {
          this.element.show();
      };
      /**
       * Removes the page
       * @method remove
      */
      Page.prototype.remove = function () {
          this.element.remove();
      };
  
      /**
       * Constructor for a Dialog. A Dialog is a popup which consists of Pages, where each Page can consist of Panels,
       * Buttons and a Header. The dialog must be constructed in page order as it has a current page state. For example,
       * calling addButton() will add a button to the 'current' page.
       * <p>
       * By default, a new Dialog will have one page. If there are multiple Panels on a Page, a
       * menu is displayed on the left side of the dialog.
       * </p>
       * Usage:
       * <pre>
       * var dialog = new Dialog(860, 530);
       * dialog.addHeader("Insert Macro")
       * .addPanel("All", "&lt;p&gt;&lt;/p&gt;")
       * .addPanel("Some", "&lt;p&gt;&lt;/p&gt;")
       * .addButton("Next", function (dialog) {dialog.nextPage();})
       * .addButton("Cancel", function (dialog) {dialog.hide();});
       *
       * dialog.addPage()
       * .addButton("Cancel", function (dialog) {dialog.hide();});
       *
       * somebutton.click(function () {dialog.show();});
       * </pre>
       * @class Dialog
       * @constructor
       * @param width {number} dialog width in pixels, or an object containing the Dialog parameters
       * @param height {number} dialog height in pixels
       * @param id {number} [optional] dialog id
      */
      function Dialog(width, height, id) {
          var options = {};
          if (!+width) {
              options = Object(width);
              width = options.width;
              height = options.height;
              id = options.id;
          }
          this.height = height || 480;
          this.width = width || 640;
          this.id = id;
          options = _jquery2.default.extend({}, options, {
              width: this.width,
              height: this.height,
              id: this.id
          });
          this.popup = createPopup(options);
  
          this.popup.element.addClass('aui-dialog');
          this.page = [];
          this.curpage = 0;
  
          new Page(this);
      };
  
      /**
       * Method for adding header to the current page
       * @method addHeader
       * @param title {string} panel title
       * @param className {string} [optional] HTML class name
       * @return {object} the dialog
      */
      Dialog.prototype.addHeader = function (title, className) {
          this.page[this.curpage].addHeader(title, className);
          return this;
      };
      /**
       * Method for adding new button to the current page
       * @method addButton
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the dialog
      */
      Dialog.prototype.addButton = function (label, onclick, className) {
          this.page[this.curpage].addButton(label, onclick, className);
          return this;
      };
  
      /**
       * Method for adding new link to the current page
       * @method addButton
       * @param label {string} link label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the dialog
      */
      Dialog.prototype.addLink = function (label, onclick, className, url) {
          this.page[this.curpage].addLink(label, onclick, className, url);
          return this;
      };
  
      /**
      * Method for adding a submit button to the current page
      * @method addSubmit
      * @param label {string} link label
      * @param onclick {function} [optional] click event handler
      * @return {object} the dialog
      */
      Dialog.prototype.addSubmit = function (label, onclick) {
          this.page[this.curpage].addButton(label, onclick, 'button-panel-submit-button');
          return this;
      };
  
      /**
      * Method for adding a cancel link to the current page
      * @method addCancel
      * @param label {string} link label
      * @param onclick {function} [optional] click event handler
      * @return {object} the dialog
      */
      Dialog.prototype.addCancel = function (label, onclick) {
          this.page[this.curpage].addLink(label, onclick, 'button-panel-cancel-link');
          return this;
      };
  
      /**
       * Method for adding new button panel to the current page
       * @return {object} the dialog
      */
      Dialog.prototype.addButtonPanel = function () {
          this.page[this.curpage].addButtonPanel();
          return this;
      };
  
      /**
       * Method for adding new panel to the current page.
       * @method addPanel
       * @param title {string} panel title
       * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
       * @param className {string} [optional] HTML class name
       * @param panelButtonId {String} [optional] The unique id for the panel's button.
       * @return {object} the dialog
      */
      Dialog.prototype.addPanel = function (title, reference, className, panelButtonId) {
          this.page[this.curpage].addPanel(title, reference, className, panelButtonId);
          return this;
      };
      /**
       * Adds a new page to the dialog and sets the new page as the current page
       * @method addPage
       * @param className {string} [optional] HTML class name
       * @return {object} the dialog
      */
      Dialog.prototype.addPage = function (className) {
          new Page(this, className);
          this.page[this.curpage].hide();
          this.curpage = this.page.length - 1;
          return this;
      };
      /**
       * Making next page in hierarchy visible and active
       * @method nextPage
       * @return {object} the dialog
      */
      Dialog.prototype.nextPage = function () {
          this.page[this.curpage++].hide();
          if (this.curpage >= this.page.length) {
              this.curpage = 0;
          }
          this.page[this.curpage].show();
          return this;
      };
      /**
       * Making previous page in hierarchy visible and active
       * @method prevPage
       * @return {object} the dialog
      */
      Dialog.prototype.prevPage = function () {
          this.page[this.curpage--].hide();
          if (this.curpage < 0) {
              this.curpage = this.page.length - 1;
          }
          this.page[this.curpage].show();
          return this;
      };
      /**
       * Making specified page visible and active
       * @method gotoPage
       * @param num {number} page id
       * @return {object} the dialog
      */
      Dialog.prototype.gotoPage = function (num) {
          this.page[this.curpage].hide();
          this.curpage = num;
          if (this.curpage < 0) {
              this.curpage = this.page.length - 1;
          } else if (this.curpage >= this.page.length) {
              this.curpage = 0;
          }
          this.page[this.curpage].show();
          return this;
      };
      /**
       * Returns specified panel at the current page
       * @method getPanel
       * @param pageorpanelId {number} page id or panel id
       * @param panelId {number} panel id
       * @return {object} the internal Panel object
      */
      Dialog.prototype.getPanel = function (pageorpanelId, panelId) {
          var pageid = panelId == null ? this.curpage : pageorpanelId;
          if (panelId == null) {
              panelId = pageorpanelId;
          }
          return this.page[pageid].panel[panelId];
      };
      /**
       * Returns specified page
       * @method getPage
       * @param pageid {number} page id
       * @return {object} the internal Page Object
      */
      Dialog.prototype.getPage = function (pageid) {
          return this.page[pageid];
      };
      /**
       * Returns current panel at the current page
       * @method getCurrentPanel
       * @return {object} the internal Panel object
      */
      Dialog.prototype.getCurrentPanel = function () {
          return this.page[this.curpage].getCurrentPanel();
      };
  
      /**
       * Selects corresponding panel
       * @method gotoPanel
       * @param pageorpanel {object} panel object or page object
       * @param panel {object} panel object
       * @param panel {number} id of the panel
      */
      Dialog.prototype.gotoPanel = function (pageorpanel, panel) {
          if (panel != null) {
              var pageid = pageorpanel.id || pageorpanel;
              this.gotoPage(pageid);
          }
          this.page[this.curpage].gotoPanel(typeof panel == 'undefined' ? pageorpanel : panel);
      };
  
      /**
       * Shows the dialog, if it is not visible
       * @method show
       * @return {object} the dialog
      */
      Dialog.prototype.show = function () {
          this.popup.show();
          (0, _event.trigger)('show.dialog', { dialog: this });
          return this;
      };
      /**
       * Hides the dialog, if it was visible
       * @method hide
       * @return {object} the dialog
      */
      Dialog.prototype.hide = function () {
          this.popup.hide();
          (0, _event.trigger)('hide.dialog', { dialog: this });
          return this;
      };
      /**
       * Removes the dialog elements from the DOM
       * @method remove
      */
      Dialog.prototype.remove = function () {
          this.popup.hide();
          this.popup.remove();
          (0, _event.trigger)('remove.dialog', { dialog: this });
      };
      /**
       * Disables the dialog if enabled
       * @method disable
      */
      Dialog.prototype.disable = function () {
          this.popup.disable();
          return this;
      };
      /**
       * Enables the dialog if disabled
       * @method disable
      */
      Dialog.prototype.enable = function () {
          this.popup.enable();
          return this;
      };
      /**
       * Gets set of items depending on query
       * @method get
       * @param query {string} query to search for panels, pages, headers or buttons
       * e.g.
       *      '#Name' will find all dialog components with the given name such as panels and buttons, etc
       *      'panel#Name' will find only panels with the given name
       *      'panel#"Foo bar"' will find only panels with given name
       *      'panel:3' will find the third panel
       */
      Dialog.prototype.get = function (query) {
          var coll = [],
              dialog = this;
          var nameExp = '#([^"][^ ]*|"[^"]*")'; // a name is a hash followed by either a bare word or quoted string
          var indexExp = ':(\\d+)'; // an index is a colon followed by some digits
          var typeExp = 'page|panel|button|header'; // one of the allowed types
          var selectorExp = '(?:' + // a selector is either ...
          '(' + typeExp + ')(?:' + nameExp + '|' + indexExp + ')?' + // a type optionally followed by either #name or :index
          '|' + nameExp + // or just a #name
          ')';
          var queryRE = new RegExp('(?:^|,)' + // a comma or at the start of the line
          '\\s*' + selectorExp + // optional space and a selector
          '(?:\\s+' + selectorExp + ')?' + // optionally, followed by some space and a second selector
          '\\s*(?=,|$)', 'ig'); // followed by, but not including, a comma or the end of the string
          (query + '').replace(queryRE, function (all, name, title, id, justtitle, name2, title2, id2, justtitle2) {
              name = name && name.toLowerCase();
              var pages = [];
              if (name == 'page' && dialog.page[id]) {
                  pages.push(dialog.page[id]);
                  name = name2;
                  name = name && name.toLowerCase();
                  title = title2;
                  id = id2;
                  justtitle = justtitle2;
              } else {
                  pages = dialog.page;
              }
              title = title && (title + '').replace(/"/g, '');
              title2 = title2 && (title2 + '').replace(/"/g, '');
              justtitle = justtitle && (justtitle + '').replace(/"/g, '');
              justtitle2 = justtitle2 && (justtitle2 + '').replace(/"/g, '');
              if (name || justtitle) {
                  for (var i = pages.length; i--;) {
                      if (justtitle || name == 'panel' && (title || !title && id == null)) {
                          for (var j = pages[i].panel.length; j--;) {
                              if (pages[i].panel[j].button.html() == justtitle || pages[i].panel[j].button.html() == title || name == 'panel' && !title && id == null) {
                                  coll.push(pages[i].panel[j]);
                              }
                          }
                      }
                      if (justtitle || name == 'button' && (title || !title && id == null)) {
                          for (var j = pages[i].button.length; j--;) {
                              if (pages[i].button[j].item.html() == justtitle || pages[i].button[j].item.html() == title || name == 'button' && !title && id == null) {
                                  coll.push(pages[i].button[j]);
                              }
                          }
                      }
                      if (pages[i][name] && pages[i][name][id]) {
                          coll.push(pages[i][name][id]);
                      }
                      if (name == 'header' && pages[i].header) {
                          coll.push(pages[i].header);
                      }
                  }
              } else {
                  coll = coll.concat(pages);
              }
          });
          var res = {
              length: coll.length
          };
          for (var i = coll.length; i--;) {
              res[i] = coll[i];
              for (var method in coll[i]) {
                  if (!(method in res)) {
                      (function (m) {
                          res[m] = function () {
                              for (var j = this.length; j--;) {
                                  if (typeof this[j][m] == 'function') {
                                      this[j][m].apply(this[j], arguments);
                                  }
                              }
                          };
                      })(method);
                  }
              }
          }
          return res;
      };
  
      /**
       * Updates height of panels, to contain content without the need for scroll bars.
       *
       * @method updateHeight
       */
      Dialog.prototype.updateHeight = function () {
          var height = 0;
          var maxDialogHeight = (0, _jquery2.default)(window).height() - HEADER_HEIGHT - BUTTONS_HEIGHT - MIN_DIALOG_VERTICAL_BUFFER * 2;
          for (var i = 0; this.getPanel(i); i++) {
              if (this.getPanel(i).body.css({ height: 'auto', display: 'block' }).outerHeight() > height) {
                  height = Math.min(maxDialogHeight, this.getPanel(i).body.outerHeight());
              }
              if (i !== this.page[this.curpage].curtab) {
                  this.getPanel(i).body.css({ display: 'none' });
              }
          }
          for (i = 0; this.getPanel(i); i++) {
              this.getPanel(i).body.css({ height: height || this.height });
          }
          this.page[0].menu.height(height);
          this.height = height + HEADER_HEIGHT + BUTTONS_HEIGHT + 1;
          this.popup.changeSize(undefined, this.height);
      };
  
      /**
       * Returns whether the dialog has been resized to its maximum height (has been capped by the viewport height and vertical buffer).
       *
       * @method isMaximised
       */
      Dialog.prototype.isMaximised = function () {
          return this.popup.element.outerHeight() >= (0, _jquery2.default)(window).height() - MIN_DIALOG_VERTICAL_BUFFER * 2;
      };
  
      /**
       * Returns the current panel.
       * @deprecated Since 3.0.1 Use getCurrentPanel() instead.
       */
      Dialog.prototype.getCurPanel = function () {
          return this.getPanel(this.page[this.curpage].curtab);
      };
  
      /**
       * Returns the current button panel.
       * @deprecated Since 3.0.1 Use get() instead.
       */
      Dialog.prototype.getCurPanelButton = function () {
          return this.getCurPanel().button;
      };
  
      return Dialog;
  }();
  
  exports.Dialog = Dialog = deprecate.construct(Dialog, 'Dialog constructor', {
      alternativeName: 'Dialog2'
  });
  
  exports.popup = createPopup = deprecate.construct(createPopup, 'Dialog popup constructor', {
      alternatveName: 'Dialog2'
  });
  
  (0, _globalize2.default)('Dialog', Dialog);
  (0, _globalize2.default)('popup', createPopup);
  
  exports.Dialog = Dialog;
  exports.popup = createPopup;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/unique-id.js
(typeof window === 'undefined' ? global : window).__9fa5e8acd81f0f9028180b8fcdcd9cb4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var uniqueID;
  var uniqueIDstring;
  var uniqueIDcounter = 0;
  
  /**
   * Generate a unique ID string, checking the ID is not present in the DOM before
   * returning. Note uniqueID, uniqueIDstring, uniqueIDcounter = 0; set at top of
   * file.
   *
   * @param {String} prefix String to prepend to ID instead of default AUI prefix.
   *
   * @returns {String}
   */
  function generateUniqueId(prefix) {
      uniqueID = uniqueIDcounter++ + '';
      uniqueIDstring = prefix ? prefix + uniqueID : 'aui-uid-' + uniqueID;
  
      if (!document.getElementById(uniqueIDstring)) {
          return uniqueIDstring;
      } else {
          uniqueIDstring = uniqueIDstring + '-' + new Date().getTime();
  
          if (!document.getElementById(uniqueIDstring)) {
              return uniqueIDstring;
          } else {
              throw new Error('Timestamped fallback ID "' + uniqueIDstring + '" exists.');
          }
      }
  }
  
  (0, _globalize2.default)('id', generateUniqueId);
  
  exports.default = generateUniqueId;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/attributes.js
(typeof window === 'undefined' ? global : window).__29fa312a51517f20df339a1900640e1d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.computeBooleanValue = computeBooleanValue;
  exports.setBooleanAttribute = setBooleanAttribute;
  exports.computeEnumValue = computeEnumValue;
  exports.setEnumAttribute = setEnumAttribute;
  /**
   * Like el.hasAttribute(attr) but designed for use within a skate attribute
   * change handler where you only have access to change.oldValue.
   */
  function computeBooleanValue(attrValue) {
      return attrValue !== null;
  }
  
  function setBooleanAttribute(el, attr, newValue) {
      if (newValue) {
          el.setAttribute(attr, '');
      } else {
          el.removeAttribute(attr);
      }
  }
  
  function computeEnumValue(enumOptions, value) {
      var matchesEnumValue = function matchesEnumValue(enumValue) {
          return enumValue.toLowerCase() === value.toLowerCase();
      };
  
      var isMissing = value === null;
      var isInvalid = !isMissing && !enumOptions.values.filter(matchesEnumValue).length;
  
      if (isMissing) {
          if (enumOptions.hasOwnProperty('missingDefault')) {
              return enumOptions.missingDefault;
          }
          return null;
      }
  
      if (isInvalid) {
          if (enumOptions.hasOwnProperty('invalidDefault')) {
              return enumOptions.invalidDefault;
          } else if (enumOptions.hasOwnProperty('missingDefault')) {
              return enumOptions.missingDefault;
          }
          return null;
      }
  
      return enumOptions.values.length ? enumOptions.values.filter(matchesEnumValue)[0] : null;
  }
  
  function setEnumAttribute(el, enumOptions, newValue) {
      el.setAttribute(enumOptions.attribute, newValue);
  }
  
  /**
   * Helper functions useful for implementing reflected boolean and enumerated
   * attributes and properties.
   *
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#reflecting-content-attributes-in-idl-attributes
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attribute
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#enumerated-attribute
   */
  exports.default = {
      computeBooleanValue: computeBooleanValue,
      setBooleanAttribute: setBooleanAttribute,
  
      computeEnumValue: computeEnumValue,
      setEnumAttribute: setEnumAttribute
  };
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/header/create-header.js
(typeof window === 'undefined' ? global : window).__906ea2ee8af7ec57662c322a720a678d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _customEvent = __5a18a90cc502f556e87c4181f8a6b4ab;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _debounce = __c6e18cf9266fe56d02f78a6e812f58db;
  
  var _debounce2 = _interopRequireDefault(_debounce);
  
  var _i18n = __d74c881c8f23921c15438d0f30c99f80;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _skatejsTemplateHtml = __f52b7059926ab2bdcd0aee12b4bc782b;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var $window = (0, _jquery2.default)(window);
  
  function Header(element) {
      var that = this;
  
      this.element = element;
      this.$element = (0, _jquery2.default)(element);
      this.index = (0, _jquery2.default)('aui-header, .aui-header').index(element);
      this.$secondaryNav = this.$element.find('.aui-header-secondary .aui-nav').first();
      this.menuItems = [];
      this.totalWidth = 0;
      this.$moreMenu = undefined;
      this.rightMostNavItemIndex = undefined;
      this.$applicationLogo = this.$element.find('#logo');
      this.moreMenuWidth = 0;
      this.primaryButtonsWidth = 0;
  
      // to cache the selector and give .find convenience
      this.$headerFind = function () {
          var $header = (0, _jquery2.default)(that.$element[0].querySelector('.aui-header-primary'));
  
          return function (selector) {
              return $header.find(selector);
          };
      }();
  }
  
  Header.prototype = {
      init: function init() {
          var that = this;
  
          this.element.setAttribute('data-aui-responsive', 'true');
          this.$headerFind('.aui-button').parent().each(function () {
              that.primaryButtonsWidth += (0, _jquery2.default)(this).outerWidth(true);
          });
  
          // remember the widths of all the menu items
          this.$headerFind('.aui-nav > li > a:not(.aui-button)').each(function () {
              var $this = (0, _jquery2.default)(this).parent();
              var outerWidth = $this.outerWidth(true);
  
              that.totalWidth += outerWidth;
              that.menuItems.push({
                  $element: $this,
                  outerWidth: outerWidth
              });
          });
  
          /** The zero based index of the right-most visible nav menu item. */
          this.rightMostNavItemIndex = this.menuItems.length - 1;
  
          $window.on('resize', this._resizeHandler = (0, _debounce2.default)(function () {
              that.constructResponsiveDropdown();
          }, 100));
  
          // So that the header logo doesn't mess things up. (size is unknown before the image loads)
          var $logoImg = this.$applicationLogo.find('img');
  
          if ($logoImg.length !== 0) {
              $logoImg.attr('data-aui-responsive-header-index', this.index);
              $logoImg.load(function () {
                  that.constructResponsiveDropdown();
              });
          }
  
          this.constructResponsiveDropdown();
  
          // show the aui nav (hidden via css on load)
          this.$headerFind('.aui-nav').css('width', 'auto');
      },
  
      destroy: function destroy() {
          $window.off('resize', this._resizeHandler);
      },
  
      // calculate widths based on the current state of the page
      calculateAvailableWidth: function calculateAvailableWidth() {
          // if there is no secondary nav, use the right of the screen as the boundary instead
          var rightMostBoundary = this.$secondaryNav.is(':visible') ? this.$secondaryNav.offset().left : this.$element.outerWidth();
  
          // the right most side of the primary nav, this is assumed to exists if this code is running
          var primaryNavRight = this.$applicationLogo.offset().left + this.$applicationLogo.outerWidth(true) + this.primaryButtonsWidth;
  
          return rightMostBoundary - primaryNavRight;
      },
  
      showResponsiveDropdown: function showResponsiveDropdown() {
          if (this.$moreMenu === undefined) {
              this.$moreMenu = this.createResponsiveDropdownTrigger();
          }
          this.$moreMenu.css('display', '');
      },
  
      hideResponsiveDropdown: function hideResponsiveDropdown() {
          if (this.$moreMenu !== undefined) {
              this.$moreMenu.css('display', 'none');
          }
      },
  
      constructResponsiveDropdown: function constructResponsiveDropdown() {
          if (!this.menuItems.length) {
              return;
          }
  
          var remainingWidth;
          var availableWidth = this.calculateAvailableWidth(this.$element, this.primaryButtonsWidth);
  
          if (availableWidth > this.totalWidth) {
              this.showAll();
          } else {
              this.showResponsiveDropdown();
              remainingWidth = availableWidth - this.moreMenuWidth;
  
              // Figure out how many nav menu items fit into the available space.
              var newRightMostNavItemIndex = -1;
              while (remainingWidth - this.menuItems[newRightMostNavItemIndex + 1].outerWidth >= 0) {
                  remainingWidth -= this.menuItems[newRightMostNavItemIndex + 1].outerWidth;
                  newRightMostNavItemIndex++;
              }
  
              if (newRightMostNavItemIndex < this.rightMostNavItemIndex) {
                  this.moveToResponsiveDropdown(this.rightMostNavItemIndex - newRightMostNavItemIndex);
              } else if (this.rightMostNavItemIndex < newRightMostNavItemIndex) {
                  this.moveOutOfResponsiveDropdown(newRightMostNavItemIndex - this.rightMostNavItemIndex);
              }
          }
      },
  
      // creates the trigger and content elements for the show more dropdown
      createResponsiveDropdownTrigger: function createResponsiveDropdownTrigger() {
          var moreNavItemEl = document.createElement('li');
          var dropdownEl = document.createElement('aui-dropdown-menu');
          dropdownEl.id = 'aui-responsive-header-dropdown-' + this.index;
          _skate2.default.init(dropdownEl);
  
          var dropdownSectionEl = document.createElement('aui-section');
          dropdownSectionEl.id = 'aui-responsive-header-dropdown-list-' + this.index;
          _skate2.default.init(dropdownSectionEl);
  
          _skatejsTemplateHtml2.default.wrap(dropdownEl).appendChild(dropdownSectionEl);
  
          var triggerEl = createTriggerAndAssociate(dropdownEl);
          moreNavItemEl.appendChild(triggerEl);
          moreNavItemEl.appendChild(dropdownEl);
  
          // Append the More menu before any primary buttons.
          if (this.primaryButtonsWidth === 0) {
              this.$headerFind('.aui-nav').append(moreNavItemEl);
          } else {
              this.$headerFind('.aui-nav > li > .aui-button:first').parent().before(moreNavItemEl);
          }
  
          this.moreMenuWidth = (0, _jquery2.default)(moreNavItemEl).outerWidth(true);
          return (0, _jquery2.default)(moreNavItemEl);
      },
  
      // function that handles moving items out of the show more menu into the app header
      moveOutOfResponsiveDropdown: function moveOutOfResponsiveDropdown(numItems) {
          if (numItems <= 0) {
              return;
          }
  
          var $moreDropdown = (0, _jquery2.default)('#aui-responsive-header-dropdown-' + this.index);
  
          // Move items (working top-to-bottom) from the more menu into the nav bar.
          var leftMostIndexToMove = this.rightMostNavItemIndex + 1;
          var rightMostIndexToMove = this.rightMostNavItemIndex + numItems;
          for (var i = leftMostIndexToMove; i <= rightMostIndexToMove; i++) {
              var $navItem = this.menuItems[i].$element;
              var $navItemTrigger = $navItem.children('a');
              var $navItemDropdown = (0, _jquery2.default)('#' + $navItemTrigger.attr('aria-controls'));
  
              if ($navItemTrigger.attr('aria-controls')) {
                  $navItemDropdown.removeClass('aui-dropdown2-sub-menu');
                  $navItem.append($navItemDropdown);
              }
  
              $moreDropdown.find('aui-item-link:first').remove();
              $navItem.insertBefore(this.$moreMenu);
          }
  
          this.rightMostNavItemIndex += numItems;
      },
  
      // function that handles moving items into the show more menu
      moveToResponsiveDropdown: function moveToResponsiveDropdown(numItems) {
          if (numItems <= 0) {
              return;
          }
  
          var moreDropdownSectionEl = _skatejsTemplateHtml2.default.wrap(this.$moreMenu[0].querySelector('aui-section'));
  
          // Move items (working right-to-left) from the nav bar to the more menu.
          var rightMostIndexToMove = this.rightMostNavItemIndex;
          var leftMostIndexToMove = this.rightMostNavItemIndex - numItems + 1;
          for (var i = rightMostIndexToMove; i >= leftMostIndexToMove; i--) {
              var $navItem = this.menuItems[i].$element;
              var $navItemTrigger = $navItem.children('a');
              _skate2.default.init($navItemTrigger); // ensure all triggers have gone through their lifecycle before we check for submenus
              var $navItemDropdown = (0, _jquery2.default)('#' + $navItemTrigger.attr('aria-controls'));
  
              var moreDropdownItemEl = document.createElement('aui-item-link');
              moreDropdownItemEl.setAttribute('href', $navItemTrigger.attr('href'));
              if ($navItemTrigger.attr('aria-controls')) {
                  moreDropdownItemEl.setAttribute('for', $navItemTrigger.attr('aria-controls'));
                  $navItemDropdown.addClass('aui-dropdown2-sub-menu');
                  $navItemDropdown.appendTo('body');
              }
              _skate2.default.init(moreDropdownItemEl);
              _skatejsTemplateHtml2.default.wrap(moreDropdownItemEl).textContent = $navItemTrigger.text();
  
              $navItem.detach();
              moreDropdownSectionEl.insertBefore(moreDropdownItemEl, moreDropdownSectionEl.firstChild);
              this.element.dispatchEvent(new _customEvent2.default('aui-responsive-menu-item-created', {
                  bubbles: true,
                  detail: {
                      originalItem: $navItem[0],
                      newItem: moreDropdownItemEl
                  }
              }));
          }
  
          this.rightMostNavItemIndex -= numItems;
      },
  
      // function that handles show everything
      showAll: function showAll() {
          this.moveOutOfResponsiveDropdown(this.menuItems.length - 1 - this.rightMostNavItemIndex);
          this.hideResponsiveDropdown();
      }
  };
  
  function createTriggerAndAssociate(dropdown) {
      var trigger = document.createElement('a');
      trigger.setAttribute('class', 'aui-dropdown2-trigger');
      trigger.setAttribute('href', '#');
      trigger.id = dropdown.id + '-trigger';
      trigger.setAttribute('aria-controls', dropdown.id);
      trigger.innerHTML = _i18n2.default.getText('aui.words.more');
  
      return trigger;
  }
  
  /**
   * Initialise a Header, or return an existing Header for an element.
   */
  function createHeader(element) {
      var header = element._header;
      if (!(header instanceof Header)) {
          header = new Header(element);
          header.init();
          element._header = header;
      }
      return header;
  }
  
  exports.default = createHeader;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/fancy-file-input/dist/fancy-file-input.js
(typeof window === 'undefined' ? global : window).__e978d2e4e1d10e62ed13103fb5b406fc = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "jquery": __307d3e18fd611f85395c67cddeb1fe24,
    "jquery": __307d3e18fd611f85395c67cddeb1fe24
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__e978d2e4e1d10e62ed13103fb5b406fc");
  define.amd = true;
  
  /*! jQuery Fancy File Input plugin - v1.0.0 - 2016-02-23
  * http://seancurtis.com/experiments/fancy-file-input/
  * Copyright (c) 2016 Atlassian Pty Ltd; Licensed http://www.apache.org/licenses/LICENSE-2.0 */
  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module unless amdModuleId is set
      define(["jquery"], function (a0) {
        return (root['FancyFileInput'] = factory(a0));
      });
    } else if (typeof exports === 'object') {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory(__307d3e18fd611f85395c67cddeb1fe24);
    } else {
      root['FancyFileInput'] = factory(jQuery);
    }
  }(this, function ($) {
  
  /**
   * --------------------------------------------------------------------
   * jQuery Fancy File Input plugin
   * Author: Atlassian Pty Ltd
   * Copyright © 2012 - 2016 Atlassian Pty Ltd. Licensed under the
   * Apache License, Version 2.0 (the "License"); you may not use this
   * file except in compliance with the License. You may obtain a copy
   * of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   * implied. See the License for the specific language governing
   * permissions and limitations under the License.
   * --------------------------------------------------------------------
   */
  
  /* jshint -W097 */
  
  var fakePathRegex = /^.*[\\\/]/;
  var multipleFileTextRegex = /\{0\}/gi;
  var ie = (function() {
      var v = 3;
      var div = document.createElement( 'div' );
      var all = div.getElementsByTagName( 'i' );
  
      do {
          div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
      } while (all[0]);
  
      return v > 4 ? v : document.documentMode;
  }());
  
  function FancyFileInput(el, options) {
      var instance = $(el).data('FancyFileInput');
      if (instance) {
          return instance;
      }
      options = $.extend({}, FancyFileInput.defaults, options);
      this.el = el;
      this.$el = $(el);
      this.$label = this.createLabel(options.buttonText);
      this._addLabelText();
      this.$clearButton = $('<button>', {
          text: (this.$label.attr('data-ffi-clearButtonText') || options.clearButtonText),
          'class': 'ffi-clear',
          type: 'button',
          'tabindex': '-1'
      });
      this.multipleFileTextPattern = this.$label.attr('data-ffi-multipleFileTextPattern') || options.multipleFileTextPattern;
      this._eventNamespace = '.ffi';
      this.CLASSES = {
          disabled: 'is-disabled',
          focused: 'is-focused',
          active: 'is-active',
          valid: 'is-valid',
          invalid: 'is-invalid'
      };
      this[this.isDisabled() ? 'disable' : 'enable']();
      this.isFocused = false;
  }
  
  FancyFileInput.defaults = {
      buttonText: 'Browse\u2026',
      clearButtonText: 'Clear',
      multipleFileTextPattern: '{0} files'
  };
  
  FancyFileInput.prototype._addLabelText = function attLabelText() {
      var $associatedLabel = $('label[for="' + this.el.id + '"]');
      if ($associatedLabel.length) {
          this.$el.attr('aria-label', $associatedLabel.text());
      }
  };
  
  FancyFileInput.prototype.createLabel = function (buttonText) {
      var $label = this.$el.parent('.ffi[data-ffi-button-text]');
      if (!$label.length) {
          $label = this.$el.wrap($('<label>', { 'class': 'ffi', 'data-ffi-button-text': buttonText })).parent();
      }
      return $label;
  };
  
  FancyFileInput.prototype.isDisabled = function () {
      return this.$el.is(':disabled');
  };
  
  FancyFileInput.prototype.formatMultipleFileText = function (numFiles) {
      return this.multipleFileTextPattern.replace(multipleFileTextRegex, numFiles);
  };
  
  FancyFileInput.prototype.bindEvents = function () {
      this.$el
          .on('invalid'   + this._eventNamespace, $.proxy(this.checkValidity, this))
          .on('change'    + this._eventNamespace, $.proxy(this.change, this))
          .on('keydown'   + this._eventNamespace, $.proxy(this.keydown, this))
          .on('mousedown' + this._eventNamespace, $.proxy(this.mousedown, this))
          .on('mouseup'   + this._eventNamespace, $.proxy(this.mouseup, this))
          .on('focus'     + this._eventNamespace, $.proxy(this.focus, this))
          .on('blur'      + this._eventNamespace, $.proxy(this.blur, this));
      this.$clearButton.on('click' + this._eventNamespace, $.proxy(this.clear, this));
  };
  
  FancyFileInput.prototype.unbindEvents = function () {
      this.$el.off(this._eventNamespace);
      this.$clearButton.off(this._eventNamespace);
  };
  
  FancyFileInput.prototype.fireEvent = function (event) {
      this.$el.trigger(event + this._eventNamespace);
  };
  
  FancyFileInput.prototype.enable = function () {
      this.bindEvents();
      this.$el.prop('disabled', false);
      this.$label.removeClass(this.CLASSES.disabled);
  };
  
  FancyFileInput.prototype.disable = function () {
      this.unbindEvents();
      this.$el.prop('disabled', true);
      this.$label.addClass(this.CLASSES.disabled);
  };
  
  FancyFileInput.prototype.clear = function () {
      this.$el.wrap('<form>').closest('form').get(0).reset();
      this.$el.unwrap();
      this.el.value = '';
      this.change();
      return false;
  };
  
  FancyFileInput.prototype.focus = function () {
      var instance = this;
  
      this.$label.addClass(this.CLASSES.focused);
  
      // toggle focus so that the cursor appears back in the field instead of on the button
      if (ie && !this.isFocused) {
          this.isFocused = true;
  
          setTimeout(function() {
              instance.$el.blur();
              instance.$el.focus();
          }, 0);
      }
  };
  
  FancyFileInput.prototype.blur = function () {
      if (!ie || !this.isFocused) {
          this.$label.removeClass(this.CLASSES.focused);
          this.isFocused = false;
      }
  };
  
  FancyFileInput.prototype.mousedown = function () {
      this.$label.addClass(this.CLASSES.active);
  };
  
  FancyFileInput.prototype.mouseup = function () {
      this.$label.removeClass(this.CLASSES.active);
  };
  
  FancyFileInput.prototype.keydown = function (e) {
      var keyCode = e.which;
      var BACKSPACE = 8;
      var TAB = 9;
      var DELETE = 46;
  
      // Add clear behaviour for all browsers
      if (keyCode === BACKSPACE || keyCode === DELETE) {
          this.clear();
          e.preventDefault();
      }
  
      // This works around the IE double tab-stop - no events or blur/change occur when moving between
      //  the field part of the input and the button part. This is dirty, but it works.
      if (ie && keyCode === TAB) {
          var instance = this;
  
          this.isFocused = false;
          this.$el.prop('disabled',true);
  
          setTimeout(function(){
              instance.$el.prop('disabled', false).blur();
          }, 0);
      }
  };
  
  FancyFileInput.prototype.checkValidity = function () {
      if (!this.el.required) {
          return;
      }
      var isInvalid = this.$el.is(':invalid');
  
      this.$label.toggleClass(this.CLASSES.invalid, isInvalid).toggleClass(this.CLASSES.valid, !isInvalid);
  };
  
  FancyFileInput.prototype.change = function () {
      var files;
      var val = '';
  
      this.checkValidity();
  
      // multiple file selection
      if (this.el.multiple && this.el.files.length > 1) {
          files = this.formatMultipleFileText(this.el.files.length); // '5 files'
      } else {
          files = this.el.value; // 'README.txt'
      }
  
      if (files.length) {
          val = files.replace(fakePathRegex, ''); // Strips off the C:\fakepath nonsense
          this.$clearButton.appendTo(this.$label);
      } else {
          this.$clearButton.detach();
      }
  
      this.$el.focus();
      this.setFieldText(val);
      this.fireEvent('value-changed');
  };
  
  FancyFileInput.prototype.setFieldText = function (text) {
      var dataAttribute = 'data-ffi-value';
      if (text.length) {
          this.$label.attr(dataAttribute, text);
          this.fireEvent('value-added');
      } else {
          this.$label.removeAttr(dataAttribute);
          this.fireEvent('value-cleared');
      }
  };
  
  $.fn.fancyFileInput = function (options) {
      return this.each(function () {
          var ffi = new FancyFileInput(this, options);
          $(this).data('FancyFileInput', ffi);
      });
  };
  
  return FancyFileInput;
  
  }));
  
  
  return module.exports;
}).call(this);
// src/js/aui/fancy-file-input.js
(typeof window === 'undefined' ? global : window).__84e1fe9bfd01961fdb8386c0cdd32066 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /* AUI-4199: This puts the FFI object on the jQuery global for backwards compatibility. */
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _fancyFileInput = __e978d2e4e1d10e62ed13103fb5b406fc;
  
  var _fancyFileInput2 = _interopRequireDefault(_fancyFileInput);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _fancyFileInput2.default;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/polyfills/console.js
(typeof window === 'undefined' ? global : window).__935a5cbb862450a49a36c8831ebb8846 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  /**
   * AUI-2773
   *
   * The following shim for console is deprecated and to be removed in AUI 6.
   * We shouldn't be creating console.log if it doesn't exist; instead, we should avoid using it directly.
   * @start deprecated
   */
  
  if (typeof window.console === 'undefined') {
      window.console = {
          messages: [],
  
          log: function log(text) {
              this.messages.push(text);
          },
  
          show: function show() {
              alert(this.messages.join('\n'));
              this.messages = [];
          }
      };
  } else {
      // Firebug console - show not required to do anything.
      window.console.show = function () {};
  }
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/binder.js
(typeof window === 'undefined' ? global : window).__6160ee95bf90760449be557c1758e3db = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Support for markup based binder components. Binder components must be objects with the following "interface":
   *
   * <pre>
   * {
   *   selector: "input.foo",
   *   run: function(element) {
   *      //do stuff on given element
   *   }
   * }
   * </pre>
   */
  var Binder = function () {
  
      var binders = {};
  
      return {
          /**
           * Runs all the binder components for the given scope, or the document body if none specified.
           *
           * @method runBinders
           * @param scope {Element} element scope to run the binders in
           */
          runBinders: function runBinders(scope) {
              if (_jquery2.default.isEmptyObject(binders)) {
                  logger.log('No binders to run');
                  return;
              }
  
              scope = scope || document.body;
  
              (0, _jquery2.default)('*:not(link, script)', scope).each(function (i, element) {
                  var $element = (0, _jquery2.default)(element);
                  _jquery2.default.each(binders, function (id, binder) {
                      if (!$element.data(id) && $element.is(binder.selector)) {
                          logger.log('Running binder component: ' + id + ' on element ' + element);
                          $element.data(id, true); // so we don't bind to the same element again later
                          binder.run(element);
                      }
                  });
              });
          },
  
          /**
           * Register a binder component with the given id.
           * @method register
           */
          register: function register(id, binder) {
              binders[id] = binder;
          },
  
          /**
           * Unregister a binder component for the given id.
           * @method unregister
           */
          unregister: function unregister(id) {
              binders[id] = null;
          }
      };
  }();
  
  Binder = deprecate.construct(Binder, 'Binder', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('Binder', Binder);
  
  exports.default = Binder;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/binders/placeholder.js
(typeof window === 'undefined' ? global : window).__6b53202d7e5920f946b3003fd2037f67 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _binder = __6160ee95bf90760449be557c1758e3db;
  
  var _binder2 = _interopRequireDefault(_binder);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (function () {
      // browser supports placeholder, no need to do anything
      var temp = document.createElement('input');
  
      if ('placeholder' in temp) {
          return;
      }
  
      /**
       * Displays default text in the input field when its value is empty.
       * If the browser supports placeholder input attributes (HTML5), then
       * we skip this component.
       *
       * Usage:
       * <pre>
       * &lt;input placeholder='Some default text'&gt;
       * </pre>
       *
       * Events thrown: reset.placeholder
       */
      _binder2.default.register('placeholder', {
          selector: 'input[placeholder]',
          run: function run(element) {
              var $this = (0, _jquery2.default)(element);
              var applyDefaultText = function applyDefaultText() {
                  if (!_jquery2.default.trim($this.val()).length) {
                      $this.val($this.attr('placeholder')).addClass('placeholder-shown').trigger('reset.placeholder');
                  }
              };
  
              applyDefaultText();
              $this.blur(applyDefaultText).focus(function () {
                  if ($this.hasClass('placeholder-shown')) {
                      $this.val('').removeClass('placeholder-shown');
                  }
              });
          }
      });
  })();
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/jquery/jquery.os.js
(typeof window === 'undefined' ? global : window).__9046514ee4273e195fc535faaba755b5 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  jQuery.os = {};
  (function () {
      var platform = navigator.platform.toLowerCase();
      jQuery.os.windows = (platform.indexOf('win') != -1);
      jQuery.os.mac = (platform.indexOf('mac') != -1);
      jQuery.os.linux = (platform.indexOf('linux') != -1);
  }());
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/jquery/jquery.moveto.js
(typeof window === 'undefined' ? global : window).__55cc9a6466186ba6dac3b7d90666eefa = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**
   *
   * @module Controls
   * @requires AJS, jQuery
   */
  
  /**
   * If not visible, moves the scroll position of the screen to the element
   *
   * <pre>
   * <strong>Usage:</strong>
   * jQuery("li.item").moveTo();
   * </pre>
   *
   * This plugin also supports options as an argument.  The options
   * that can be defined are:
   * <ul>
   * <li>transition - if set to true will cause a smooth scrolling transition (false by default)</li>
   * <li>scrollOffset - defines an offset to scroll past the element to view in pixels such that
   * all of it can be viewed (35 pixels by default)</li>
   * </ul>
   *
   * @class moveTo
   * @constuctor moveTo
   * @namespace jQuery.fn
   * @param {Object} options
   */
  jQuery.fn.moveTo = function (options) {
      var defaults = {
          transition: false,
          scrollOffset: 35
      };
  
      var opts = jQuery.extend(defaults, options),
          instance = this,
          topOffset = instance.offset().top,
          scrollTarget;
  
      if ((jQuery(window).scrollTop() + jQuery(window).height() - this.outerHeight() < topOffset ||
              jQuery(window).scrollTop() + opts.scrollOffset > topOffset) &&
              jQuery(window).height() > opts.scrollOffset) {
  
          if (jQuery(window).scrollTop() + opts.scrollOffset > topOffset) {
              //move up
              scrollTarget = topOffset - (jQuery(window).height() - this.outerHeight()) + opts.scrollOffset;
          } else {
              //move down
              scrollTarget = topOffset - opts.scrollOffset;
          }
  
          if (!jQuery.fn.moveTo.animating && opts.transition) {
              jQuery(document).trigger('moveToStarted', this);
              jQuery.fn.moveTo.animating = true;
              jQuery('html,body').animate({
                  scrollTop: scrollTarget
              }, 1000, function () {
                  jQuery(document).trigger('moveToFinished', instance);
                  delete jQuery.fn.moveTo.animating;
              });
              return this;
          } else {
              var jQueryCache =  jQuery('html, body');
              if (jQueryCache.is(':animated')) {
                  jQueryCache.stop();
                  delete jQuery.fn.moveTo.animating;
              }
  
              jQuery(document).trigger('moveToStarted');
              jQuery(window).scrollTop(scrollTarget);
              //need to put a slight timeout for the moveToFinished event such that recipients of this event
              //have time to act on it.
              setTimeout(function () {
                  jQuery(document).trigger('moveToFinished', instance);
              }, 100);
              return this;
          }
      }
      jQuery(document).trigger('moveToFinished', this);
      return this;
  };
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/cookie.js
(typeof window === 'undefined' ? global : window).__74896855d42a16a84b35c202ab5bc9b4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.save = exports.read = exports.erase = undefined;
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  var COOKIE_NAME = 'AJS.conglomerate.cookie';
  var UNESCAPE_COOKIE_REGEX = /(\\|^"|"$)/g;
  var CONSECUTIVE_PIPE_CHARS_REGEX = /\|\|+/g;
  var ANY_QUOTE_REGEX = /"/g;
  var REGEX_SPECIAL_CHARS = /[.*+?|^$()[\]{\\]/g;
  
  function regexEscape(str) {
      return str.replace(REGEX_SPECIAL_CHARS, '\\$&');
  }
  
  function getValueFromConglomerate(name, cookieValue) {
      // A null cookieValue is just the first time through so create it.
      cookieValue = cookieValue || '';
      var reg = new RegExp(regexEscape(name) + '=([^|]+)');
      var res = cookieValue.match(reg);
      return res && res[1];
  }
  
  // Either append or replace the value in the cookie string/
  function addOrAppendToValue(name, value, cookieValue) {
      // A cookie name follows after any amount of white space mixed with any amount of '|' characters.
      // A cookie value is preceded by '=', then anything except for '|'.
      var reg = new RegExp('(\\s|\\|)*\\b' + regexEscape(name) + '=[^|]*[|]*');
  
      cookieValue = cookieValue || '';
      cookieValue = cookieValue.replace(reg, '|');
  
      if (value !== '') {
          var pair = name + '=' + value;
          if (cookieValue.length + pair.length < 4020) {
              cookieValue += '|' + pair;
          }
      }
  
      return cookieValue.replace(CONSECUTIVE_PIPE_CHARS_REGEX, '|');
  }
  
  function unescapeCookieValue(name) {
      return name.replace(UNESCAPE_COOKIE_REGEX, '');
  }
  
  function getCookieValue(name) {
      var reg = new RegExp('\\b' + regexEscape(name) + '=((?:[^\\\\;]+|\\\\.)*)(?:;|$)');
      var res = document.cookie.match(reg);
      return res && unescapeCookieValue(res[1]);
  }
  
  function saveCookie(name, value, days) {
      var ex = '';
      var d;
      var quotedValue = '"' + value.replace(ANY_QUOTE_REGEX, '\\"') + '"';
  
      if (days) {
          d = new Date();
          d.setTime(+d + days * 24 * 60 * 60 * 1000);
          ex = '; expires=' + d.toGMTString();
      }
  
      document.cookie = name + '=' + quotedValue + ex + ';path=/';
  }
  
  /**
   * Save a cookie.
   * @param name {String} name of cookie
   * @param value {String} value of cookie
   * @param expires {Number} number of days before cookie expires
   */
  function save(name, value, expires) {
      var cookieValue = getCookieValue(COOKIE_NAME);
      cookieValue = addOrAppendToValue(name, value, cookieValue);
      saveCookie(COOKIE_NAME, cookieValue, expires || 365);
  }
  
  /**
   * Get the value of a cookie.
   * @param name {String} name of cookie to read
   * @param defaultValue {String} the default value of the cookie to return if not found
   */
  function read(name, defaultValue) {
      var cookieValue = getCookieValue(COOKIE_NAME);
      var value = getValueFromConglomerate(name, cookieValue);
      if (value != null) {
          return value;
      }
      return defaultValue;
  }
  
  /**
   * Remove the given cookie.
   * @param name {String} the name of the cookie to remove
   */
  function erase(name) {
      save(name, '');
  }
  
  var cookie = {
      erase: erase,
      read: read,
      save: save
  };
  
  (0, _globalize2.default)('cookie', cookie);
  (0, _globalize2.default)('Cookie', cookie);
  
  deprecate.prop(AJS, 'Cookie', {
      alternativeName: 'cookie',
      sinceVersion: '5.8.0'
  });
  
  exports.erase = erase;
  exports.read = read;
  exports.save = save;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/firebug.js
(typeof window === 'undefined' ? global : window).__a2065e31477708e50a18b50a0ede61c2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.warnAboutFirebug = exports.firebug = undefined;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Does nothing because legacy code.
   *
   * @returns {undefined}
   */
  function warnAboutFirebug() {}
  
  /**
   * Includes firebug lite for debugging in IE. Especially in IE.
   *
   * @returns {undefined}
   */
  function firebug() {
      var script = (0, _jquery2.default)(document.createElement('script'));
  
      script.attr('src', 'https://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js');
      (0, _jquery2.default)('head').append(script);
  
      (function () {
          if (window.firebug) {
              firebug.init();
          } else {
              setTimeout(firebug, 0);
          }
      })();
  }
  
  exports.firebug = firebug = deprecate.fn(firebug, 'firebug', {
      sinceVersion: '5.1.0'
  });
  
  exports.warnAboutFirebug = warnAboutFirebug = deprecate.fn(warnAboutFirebug, 'warnAboutFirebug', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('firebug', firebug);
  (0, _globalize2.default)('warnAboutFirebug', warnAboutFirebug);
  
  exports.firebug = firebug;
  exports.warnAboutFirebug = warnAboutFirebug;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/add-id.js
(typeof window === 'undefined' ? global : window).__6ccb0f8a73a13028d85029aeb628b44d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _uniqueId = __9fa5e8acd81f0f9028180b8fcdcd9cb4;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Apply a unique ID to the element. Preserves ID if the element already has one.
   *
   * @param {Element} el Selector to find target element.
   * @param {string} prefix Optional. String to prepend to ID instead of default AUI prefix.
   *
   * @returns {undefined}
   */
  function addId(el, prefix) {
      var element = (0, _jquery2.default)(el);
      var addprefix = prefix || false;
  
      element.each(function () {
          var $el = (0, _jquery2.default)(this);
  
          if (!$el.attr('id')) {
              $el.attr('id', (0, _uniqueId2.default)(addprefix));
          }
      });
  }
  
  (0, _globalize2.default)('_addID', addId);
  
  exports.default = addId;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/alphanum.js
(typeof window === 'undefined' ? global : window).__b7458c300fca6582c4952fdcceceaf52 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Compare two strings in alphanumeric way
   * @method alphanum
   * @param {String} a first string to compare
   * @param {String} b second string to compare
   * @return {Number(-1|0|1)} -1 if a < b, 0 if a = b, 1 if a > b
   */
  function alphanum(a, b) {
      a = (a + '').toLowerCase();
      b = (b + '').toLowerCase();
  
      var chunks = /(\d+|\D+)/g;
      var am = a.match(chunks);
      var bm = b.match(chunks);
      var len = Math.max(am.length, bm.length);
  
      for (var i = 0; i < len; i++) {
          if (i === am.length) {
              return -1;
          }
  
          if (i === bm.length) {
              return 1;
          }
  
          var ad = parseInt(am[i], 10) + '';
          var bd = parseInt(bm[i], 10) + '';
  
          if (ad === am[i] && bd === bm[i] && ad !== bd) {
              return (ad - bd) / Math.abs(ad - bd);
          }
  
          if ((ad !== am[i] || bd !== bm[i]) && am[i] !== bm[i]) {
              return am[i] < bm[i] ? -1 : 1;
          }
      }
  
      return 0;
  }
  
  (0, _globalize2.default)('alphanum', alphanum);
  
  exports.default = alphanum;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/clone.js
(typeof window === 'undefined' ? global : window).__3991070589efec7bdc39ed4cd105d896 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Clones the element specified by the selector and removes the id attribute.
   *
   * @param {String} selector A jQuery selector
   */
  function clone(selector) {
    return (0, _jquery2.default)(selector).clone().removeAttr('id');
  }
  
  (0, _globalize2.default)('clone', clone);
  
  exports.default = clone;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/contain-dropdown.js
(typeof window === 'undefined' ? global : window).__68009f2830334905101f253fcd1d7207 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function containDropdown(dropdown, containerSelector, dynamic) {
      function getDropdownOffset() {
          return dropdown.$.offset().top - (0, _jquery2.default)(containerSelector).offset().top;
      }
  
      var container;
      var ddOffset;
      var availableArea;
      var shadowOffset = 25;
  
      if (dropdown.$.parents(containerSelector).length !== -1) {
          container = (0, _jquery2.default)(containerSelector);
          ddOffset = getDropdownOffset();
          shadowOffset = 30;
          availableArea = container.outerHeight() - ddOffset - shadowOffset;
  
          if (availableArea <= parseInt(dropdown.$.attr('scrollHeight'), 10)) {
              containDropdown.containHeight(dropdown, availableArea);
          } else if (dynamic) {
              containDropdown.releaseContainment(dropdown);
          }
          dropdown.reset();
      }
  };
  
  containDropdown.containHeight = function (dropdown, availableArea) {
      dropdown.$.css({
          height: availableArea
      });
      if (dropdown.$.css('overflowY') !== 'scroll') {
          dropdown.$.css({
              width: 15 + dropdown.$.attr('scrollWidth'),
              overflowY: 'scroll',
              overflowX: 'hidden'
          });
      }
  };
  
  containDropdown.releaseContainment = function (dropdown) {
      dropdown.$.css({
          height: '',
          width: '',
          overflowY: '',
          overflowX: ''
      });
  };
  
  (0, _globalize2.default)('containDropdown', containDropdown);
  
  exports.default = containDropdown;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/index-of.js
(typeof window === 'undefined' ? global : window).__d350fbd2bc40ef24a63df8309bff4162 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Finds the index of an element in the array.
   *
   * @param {Array} The array being searched.
   * @param {Mixed} item Element which will be searched for.
   * @param {Integer} fromIndex The index from which the item will be searched. Negative values will search from the end of the array.
   *
   * @returns {Integer}
   */
  function indexOf(array, item, fromIndex) {
      var length = array.length;
  
      if (!fromIndex) {
          fromIndex = 0;
      } else if (fromIndex < 0) {
          fromIndex = Math.max(0, length + fromIndex);
      }
  
      for (var i = fromIndex; i < length; i++) {
          if (array[i] === item) {
              return i;
          }
      }
  
      return -1;
  }
  
  (0, _globalize2.default)('indexOf', indexOf);
  
  exports.default = indexOf;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/contains.js
(typeof window === 'undefined' ? global : window).__a2c859f35719ca3425471df788438a74 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _indexOf = __d350fbd2bc40ef24a63df8309bff4162;
  
  var _indexOf2 = _interopRequireDefault(_indexOf);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Looks for an element inside the array.
   *
   * @param {Array} array The array being searched.
   * @param {Array} item The current item.
   *
   * @return {Boolean}
   */
  function contains(array, item) {
    return (0, _indexOf2.default)(array, item) > -1;
  }
  
  (0, _globalize2.default)('contains', contains);
  
  exports.default = contains;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/jquery/plugins/jquery.aop.js
(typeof window === 'undefined' ? global : window).__f69e6f12e8b5283975dbec4f415ad825 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**
  * jQuery AOP - jQuery plugin to add features of aspect-oriented programming (AOP) to jQuery.
  * http://jquery-aop.googlecode.com/
  *
  * Licensed under the MIT license:
  * http://www.opensource.org/licenses/mit-license.php
  *
  * Version: 1.3
  *
  * Cross-frame type detection based on Daniel Steigerwald's code (http://daniel.steigerwald.cz)
  * http://gist.github.com/204554
  *
  */
  
  (function() {
  
  	var _after			= 1;
  	var _afterThrow		= 2;
  	var _afterFinally	= 3;
  	var _before			= 4;
  	var _around			= 5;
  	var _intro			= 6;
  	var _regexEnabled = true;
  	var _arguments = 'arguments';
  	var _undef = 'undefined';
  
  	var getType = (function() {
  
  		var toString = Object.prototype.toString,
  			toStrings = {},
  			nodeTypes = { 1: 'element', 3: 'textnode', 9: 'document', 11: 'fragment' },
  			types = 'Arguments Array Boolean Date Document Element Error Fragment Function NodeList Null Number Object RegExp String TextNode Undefined Window'.split(' ');
  
  		for (var i = types.length; i--; ) {
  			var type = types[i], constructor = window[type];
  			if (constructor) {
  				try { toStrings[toString.call(new constructor)] = type.toLowerCase(); }
  				catch (e) { }
  			}
  		}
  
  		return function(item) {
  			return item == null && (item === undefined ? _undef : 'null') ||
  				item.nodeType && nodeTypes[item.nodeType] ||
  				typeof item.length == 'number' && (
  					item.callee && _arguments ||
  					item.alert && 'window' ||
  					item.item && 'nodelist') ||
  				toStrings[toString.call(item)];
  		};
  
  	})();
  
  	var isFunc = function(obj) { return getType(obj) == 'function'; };
  
  	/**
  	 * Private weaving function.
  	 */
  	var weaveOne = function(source, method, advice) {
  
  		var old = source[method];
  
  		// Work-around IE6/7 behavior on some native method that return object instances
  		if (advice.type != _intro && !isFunc(old)) {
  			var oldObject = old;
  			old = function() {
  				var code = arguments.length > 0 ? _arguments + '[0]' : '';
  
  				for (var i=1;i<arguments.length;i++) {
  					code += ',' + _arguments + '[' + i + ']';
  				}
  
  				return eval('oldObject(' + code + ');');
  			};
  		}
  
  		var aspect;
  		if (advice.type == _after || advice.type == _afterThrow || advice.type == _afterFinally)
  			aspect = function() {
  				var returnValue, exceptionThrown = null;
  
  				try {
  					returnValue = old.apply(this, arguments);
  				} catch (e) {
  					exceptionThrown = e;
  				}
  
  				if (advice.type == _after)
  					if (exceptionThrown == null)
  						returnValue = advice.value.apply(this, [returnValue, method]);
  					else
  						throw exceptionThrown;
  				else if (advice.type == _afterThrow && exceptionThrown != null)
  					returnValue = advice.value.apply(this, [exceptionThrown, method]);
  				else if (advice.type == _afterFinally)
  					returnValue = advice.value.apply(this, [returnValue, exceptionThrown, method]);
  
  				return returnValue;
  			};
  		else if (advice.type == _before)
  			aspect = function() {
  				advice.value.apply(this, [arguments, method]);
  				return old.apply(this, arguments);
  			};
  		else if (advice.type == _intro)
  			aspect = function() {
  				return advice.value.apply(this, arguments);
  			};
  		else if (advice.type == _around) {
  			aspect = function() {
  				var invocation = { object: this, args: Array.prototype.slice.call(arguments) };
  				return advice.value.apply(invocation.object, [{ arguments: invocation.args, method: method, proceed :
  					function() {
  						return old.apply(invocation.object, invocation.args);
  					}
  				}] );
  			};
  		}
  
  		aspect.unweave = function() {
  			source[method] = old;
  			pointcut = source = aspect = old = null;
  		};
  
  		source[method] = aspect;
  
  		return aspect;
  
  	};
  
  	/**
  	 * Private method search
  	 */
  	var search = function(source, pointcut, advice) {
  
  		var methods = [];
  
  		for (var method in source) {
  
  			var item = null;
  
  			// Ignore exceptions during method retrival
  			try {
  				item = source[method];
  			}
  			catch (e) { }
  
  			if (item != null && method.match(pointcut.method) && isFunc(item))
  				methods[methods.length] = { source: source, method: method, advice: advice };
  
  		}
  
  		return methods;
  	};
  
  	/**
  	 * Private weaver and pointcut parser.
  	 */
  	var weave = function(pointcut, advice) {
  
  		var source = typeof(pointcut.target.prototype) != _undef ? pointcut.target.prototype : pointcut.target;
  		var advices = [];
  
  		// If it's not an introduction and no method was found, try with regex...
  		if (advice.type != _intro && typeof(source[pointcut.method]) == _undef) {
  
  			// First try directly on target
  			var methods = search(pointcut.target, pointcut, advice);
  
  			// No method found, re-try directly on prototype
  			if (methods.length == 0)
  				methods = search(source, pointcut, advice);
  
  			for (var i in methods)
  				advices[advices.length] = weaveOne(methods[i].source, methods[i].method, methods[i].advice);
  
  		}
  		else
  		{
  			// Return as an array of one element
  			advices[0] = weaveOne(source, pointcut.method, advice);
  		}
  
  		return _regexEnabled ? advices : advices[0];
  
  	};
  
  	jQuery.aop =
  	{
  		/**
  		 * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method
  		 * has completed execution successfully, and will receive one parameter with the result of the execution.
  		 * This function returns an array of weaved aspects (Function).
  		 *
  		 * @example jQuery.aop.after( {target: window, method: 'MyGlobalMethod'}, function(result) {
  		 *                alert('Returned: ' + result);
  		 *                return result;
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @example jQuery.aop.after( {target: String, method: 'indexOf'}, function(index) {
  		 *                alert('Result found at: ' + index + ' on:' + this);
  		 *                return index;
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @name after
  		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
  		 * @option Object target Target object to be weaved.
  		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
  		 * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
  		 *                        with the result of the point-cut's execution. The function can choose to return this same value or a different one.
  		 *
  		 * @type Array<Function>
  		 * @cat Plugins/General
  		 */
  		after : function(pointcut, advice)
  		{
  			return weave( pointcut, { type: _after, value: advice } );
  		},
  
  		/**
  		 * Creates an advice after the defined point-cut only for unhandled exceptions. The advice will be executed
  		 * after the point-cut method only if the execution failed and an exception has been thrown. It will receive one
  		 * parameter with the exception thrown by the point-cut method.
  		 * This function returns an array of weaved aspects (Function).
  		 *
  		 * @example jQuery.aop.afterThrow( {target: String, method: 'indexOf'}, function(exception) {
  		 *                alert('Unhandled exception: ' + exception);
  		 *                return -1;
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @example jQuery.aop.afterThrow( {target: calculator, method: 'Calculate'}, function(exception) {
  		 *                console.log('Unhandled exception: ' + exception);
  		 *                throw exception;
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @name afterThrow
  		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
  		 * @option Object target Target object to be weaved.
  		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
  		 * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
  		 *                        with the exception thrown by the point-cut method.
  		 *
  		 * @type Array<Function>
  		 * @cat Plugins/General
  		 */
  		afterThrow : function(pointcut, advice)
  		{
  			return weave( pointcut, { type: _afterThrow, value: advice } );
  		},
  
  		/**
  		 * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method
  		 * regardless of its success or failure, and it will receive two parameters: one with the
  		 * result of a successful execution or null, and another one with the exception thrown or null.
  		 * This function returns an array of weaved aspects (Function).
  		 *
  		 * @example jQuery.aop.afterFinally( {target: window, method: 'MyGlobalMethod'}, function(result, exception) {
  		 *                if (exception == null)
  		 *                    return 'Returned: ' + result;
  		 *                else
  		 *                    return 'Unhandled exception: ' + exception;
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @name afterFinally
  		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
  		 * @option Object target Target object to be weaved.
  		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
  		 * @param Function advice Function containing the code that will get called after the execution of the point-cut regardless of its success or failure.
  		 *                        It receives two parameters, the first one with the result of a successful execution or null, and the second one with the
  		 *                        exception or null.
  		 *
  		 * @type Array<Function>
  		 * @cat Plugins/General
  		 */
  		afterFinally : function(pointcut, advice)
  		{
  			return weave( pointcut, { type: _afterFinally, value: advice } );
  		},
  
  
  		/**
  		 * Creates an advice before the defined point-cut. The advice will be executed before the point-cut method
  		 * but cannot modify the behavior of the method, or prevent its execution.
  		 * This function returns an array of weaved aspects (Function).
  		 *
  		 * @example jQuery.aop.before( {target: window, method: 'MyGlobalMethod'}, function() {
  		 *                alert('About to execute MyGlobalMethod');
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @example jQuery.aop.before( {target: String, method: 'indexOf'}, function(index) {
  		 *                alert('About to execute String.indexOf on: ' + this);
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @name before
  		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
  		 * @option Object target Target object to be weaved.
  		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
  		 * @param Function advice Function containing the code that will get called before the execution of the point-cut.
  		 *
  		 * @type Array<Function>
  		 * @cat Plugins/General
  		 */
  		before : function(pointcut, advice)
  		{
  			return weave( pointcut, { type: _before, value: advice } );
  		},
  
  
  		/**
  		 * Creates an advice 'around' the defined point-cut. This type of advice can control the point-cut method execution by calling
  		 * the functions '.proceed()' on the 'invocation' object, and also, can modify the arguments collection before sending them to the function call.
  		 * This function returns an array of weaved aspects (Function).
  		 *
  		 * @example jQuery.aop.around( {target: window, method: 'MyGlobalMethod'}, function(invocation) {
  		 *                alert('# of Arguments: ' + invocation.arguments.length);
  		 *                return invocation.proceed();
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @example jQuery.aop.around( {target: String, method: 'indexOf'}, function(invocation) {
  		 *                alert('Searching: ' + invocation.arguments[0] + ' on: ' + this);
  		 *                return invocation.proceed();
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @example jQuery.aop.around( {target: window, method: /Get(\d+)/}, function(invocation) {
  		 *                alert('Executing ' + invocation.method);
  		 *                return invocation.proceed();
  		 *          } );
  		 * @desc Matches all global methods starting with 'Get' and followed by a number.
  		 * @result Array<Function>
  		 *
  		 *
  		 * @name around
  		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
  		 * @option Object target Target object to be weaved.
  		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
  		 * @param Function advice Function containing the code that will get called around the execution of the point-cut. This advice will be called with one
  		 *                        argument containing one function '.proceed()', the collection of arguments '.arguments', and the matched method name '.method'.
  		 *
  		 * @type Array<Function>
  		 * @cat Plugins/General
  		 */
  		around : function(pointcut, advice)
  		{
  			return weave( pointcut, { type: _around, value: advice } );
  		},
  
  		/**
  		 * Creates an introduction on the defined point-cut. This type of advice replaces any existing methods with the same
  		 * name. To restore them, just unweave it.
  		 * This function returns an array with only one weaved aspect (Function).
  		 *
  		 * @example jQuery.aop.introduction( {target: window, method: 'MyGlobalMethod'}, function(result) {
  		 *                alert('Returned: ' + result);
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @example jQuery.aop.introduction( {target: String, method: 'log'}, function() {
  		 *                alert('Console: ' + this);
  		 *          } );
  		 * @result Array<Function>
  		 *
  		 * @name introduction
  		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
  		 * @option Object target Target object to be weaved.
  		 * @option String method Name of the function to be weaved.
  		 * @param Function advice Function containing the code that will be executed on the point-cut.
  		 *
  		 * @type Array<Function>
  		 * @cat Plugins/General
  		 */
  		introduction : function(pointcut, advice)
  		{
  			return weave( pointcut, { type: _intro, value: advice } );
  		},
  
  		/**
  		 * Configures global options.
  		 *
  		 * @name setup
  		 * @param Map settings Configuration options.
  		 * @option Boolean regexMatch Enables/disables regex matching of method names.
  		 *
  		 * @example jQuery.aop.setup( { regexMatch: false } );
  		 * @desc Disable regex matching.
  		 *
  		 * @type Void
  		 * @cat Plugins/General
  		 */
  		setup: function(settings)
  		{
  			_regexEnabled = settings.regexMatch;
  		}
  	};
  
  })();
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/drop-down.js
(typeof window === 'undefined' ? global : window).__7d40391c96767a3290496e157f1428e1 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __f69e6f12e8b5283975dbec4f415ad825;
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _createElement = __fd277fcde858b82a198666a405e85600;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Displays a drop down, typically used for menus.
   *
   * @param obj {jQuery Object|String|Array} object to populate the drop down from.
   * @param usroptions optional dropdown configuration. Supported properties are:
   * <li>alignment - "left" or "right" alignment of the drop down</li>
   * <li>escapeHandler - function to handle on escape key presses</li>
   * <li>activeClass - class name to be added to drop down items when 'active' ie. hover over</li>
   * <li>selectionHandler - function to handle when drop down items are selected on</li>
   * <li>hideHandler - function to handle when the drop down is hidden</li>
   * When an object of type Array is passed in, you can also configure:
   * <li>isHiddenByDefault - set to true if you would like to hide the drop down on initialisation</li>
   * <li>displayHandler - function to display text in the drop down</li>
   * <li>useDisabled - If set to true, the dropdown will not appear if a class of disabled is added to aui-dd-parent</li>
   *
   * @returns {Array} an array of jQuery objects, referring to the drop down container elements
   */
  function dropDown(obj, usroptions) {
      var dd = null;
      var result = [];
      var moving = false;
      var $doc = (0, _jquery2.default)(document);
      var options = {
          item: 'li:has(a)',
          activeClass: 'active',
          alignment: 'right',
          displayHandler: function displayHandler(obj) {
              return obj.name;
          },
          escapeHandler: function escapeHandler() {
              this.hide('escape');
              return false;
          },
          hideHandler: function hideHandler() {},
          moveHandler: function moveHandler() {},
          useDisabled: false
      };
  
      _jquery2.default.extend(options, usroptions);
      options.alignment = { left: 'left', right: 'right' }[options.alignment.toLowerCase()] || 'left';
  
      if (obj && obj.jquery) {
          // if $
          dd = obj;
      } else if (typeof obj === 'string') {
          // if $ selector
          dd = (0, _jquery2.default)(obj);
      } else if (obj && obj.constructor === Array) {
          // if JSON
          dd = (0, _createElement2.default)('div').addClass('aui-dropdown').toggleClass('hidden', !!options.isHiddenByDefault);
          for (var i = 0, ii = obj.length; i < ii; i++) {
              var ol = (0, _createElement2.default)('ol');
              for (var j = 0, jj = obj[i].length; j < jj; j++) {
                  var li = (0, _createElement2.default)('li');
                  var properties = obj[i][j];
                  if (properties.href) {
                      li.append((0, _createElement2.default)('a').html('<span>' + options.displayHandler(properties) + '</span>').attr({ href: properties.href }).addClass(properties.className));
  
                      // deprecated - use the properties on the li, not the span
                      _jquery2.default.data((0, _jquery2.default)('a > span', li)[0], 'properties', properties);
                  } else {
                      li.html(properties.html).addClass(properties.className);
                  }
                  if (properties.icon) {
                      li.prepend((0, _createElement2.default)('img').attr('src', properties.icon));
                  }
                  if (properties.insideSpanIcon) {
                      li.children('a').prepend((0, _createElement2.default)('span').attr('class', 'icon'));
                  }
                  if (properties.iconFontClass) {
                      li.children('a').prepend((0, _createElement2.default)('span').addClass('aui-icon aui-icon-small aui-iconfont-' + properties.iconFontClass));
                  }
  
                  _jquery2.default.data(li[0], 'properties', properties);
                  ol.append(li);
              }
              if (i === ii - 1) {
                  ol.addClass('last');
              }
              dd.append(ol);
          }
          (0, _jquery2.default)('body').append(dd);
      } else {
          throw new Error('dropDown function was called with illegal parameter. Should be $ object, $ selector or array.');
      }
  
      var moveDown = function moveDown() {
          move(+1);
      };
  
      var moveUp = function moveUp() {
          move(-1);
      };
  
      var move = function move(dir) {
          var trigger = !moving;
          var cdd = dropDown.current.$[0];
          var links = dropDown.current.links;
          var oldFocus = cdd.focused;
  
          moving = true;
  
          if (links.length === 0) {
              // Nothing to move focus to. Abort.
              return;
          }
  
          cdd.focused = typeof oldFocus === 'number' ? oldFocus : -1;
  
          if (!dropDown.current) {
              logger.log('move - not current, aborting');
              return true;
          }
  
          cdd.focused += dir;
  
          // Resolve out of bounds values:
          if (cdd.focused < 0) {
              cdd.focused = links.length - 1;
          } else if (cdd.focused >= links.length) {
              cdd.focused = 0;
          }
  
          options.moveHandler((0, _jquery2.default)(links[cdd.focused]), dir < 0 ? 'up' : 'down');
          if (trigger && links.length) {
              (0, _jquery2.default)(links[cdd.focused]).addClass(options.activeClass);
              moving = false;
          } else if (!links.length) {
              moving = false;
          }
      };
  
      var moveFocus = function moveFocus(e) {
          if (!dropDown.current) {
              return true;
          }
          var c = e.which,
              cdd = dropDown.current.$[0],
              links = dropDown.current.links;
  
          dropDown.current.cleanActive();
          switch (c) {
              case 40:
                  {
                      moveDown();
                      break;
                  }
              case 38:
                  {
                      moveUp();
                      break;
                  }
              case 27:
                  {
                      return options.escapeHandler.call(dropDown.current, e);
                  }
              case 13:
                  {
                      if (cdd.focused >= 0) {
                          if (!options.selectionHandler) {
                              if ((0, _jquery2.default)(links[cdd.focused]).attr('nodeName') != 'a') {
                                  return (0, _jquery2.default)('a', links[cdd.focused]).trigger('focus'); //focus on the "a" within the parent item elements
                              } else {
                                  return (0, _jquery2.default)(links[cdd.focused]).trigger('focus'); //focus on the "a"
                              }
                          } else {
                              return options.selectionHandler.call(dropDown.current, e, (0, _jquery2.default)(links[cdd.focused])); //call the selection handler
                          }
                      }
                      return true;
                  }
              default:
                  {
                      if (links.length) {
                          (0, _jquery2.default)(links[cdd.focused]).addClass(options.activeClass);
                      }
                      return true;
                  }
          }
  
          e.stopPropagation();
          e.preventDefault();
          return false;
      };
  
      var hider = function hider(e) {
          if (!(e && e.which && e.which == 3 || e && e.button && e.button == 2 || false)) {
              // right click check
              if (dropDown.current) {
                  dropDown.current.hide('click');
              }
          }
      };
      var active = function active(i) {
          return function () {
              if (!dropDown.current) {
                  return;
              }
              dropDown.current.cleanFocus();
              this.originalClass = this.className;
              (0, _jquery2.default)(this).addClass(options.activeClass);
              dropDown.current.$[0].focused = i;
          };
      };
  
      var handleClickSelection = function handleClickSelection(e) {
          if (e.button || e.metaKey || e.ctrlKey || e.shiftKey) {
              return true;
          }
          if (dropDown.current && options.selectionHandler) {
              options.selectionHandler.call(dropDown.current, e, (0, _jquery2.default)(this));
          }
      };
  
      var isEventsBound = function isEventsBound(el) {
          var bound = false;
          if (el.data('events')) {
              _jquery2.default.each(el.data('events'), function (i, handler) {
                  _jquery2.default.each(handler, function (type, handler) {
                      if (handleClickSelection === handler) {
                          bound = true;
                          return false;
                      }
                  });
              });
          }
          return bound;
      };
  
      dd.each(function () {
          var cdd = this,
              $cdd = (0, _jquery2.default)(this),
              res = {};
          var methods = {
              reset: function reset() {
                  res = _jquery2.default.extend(res, {
                      $: $cdd,
                      links: (0, _jquery2.default)(options.item || 'li:has(a)', cdd),
                      cleanActive: function cleanActive() {
                          if (cdd.focused + 1 && res.links.length) {
                              (0, _jquery2.default)(res.links[cdd.focused]).removeClass(options.activeClass);
                          }
                      },
                      cleanFocus: function cleanFocus() {
                          res.cleanActive();
                          cdd.focused = -1;
                      },
                      moveDown: moveDown,
                      moveUp: moveUp,
                      moveFocus: moveFocus,
                      getFocusIndex: function getFocusIndex() {
                          return typeof cdd.focused == 'number' ? cdd.focused : -1;
                      }
                  });
                  res.links.each(function (i) {
                      var $this = (0, _jquery2.default)(this);
                      if (!isEventsBound($this)) {
                          $this.hover(active(i), res.cleanFocus);
                          $this.click(handleClickSelection);
                      }
                  });
              },
              appear: function appear(dir) {
                  if (dir) {
                      $cdd.removeClass('hidden');
                      //handle left or right alignment
                      $cdd.addClass('aui-dropdown-' + options.alignment);
                  } else {
                      $cdd.addClass('hidden');
                  }
              },
              fade: function fade(dir) {
                  if (dir) {
                      $cdd.fadeIn('fast');
                  } else {
                      $cdd.fadeOut('fast');
                  }
              },
              scroll: function scroll(dir) {
                  if (dir) {
                      $cdd.slideDown('fast');
                  } else {
                      $cdd.slideUp('fast');
                  }
              }
          };
  
          res.reset = methods.reset;
          res.reset();
  
          /**
           * Uses Aspect Oriented Programming (AOP) to wrap a method around another method
           * Allows control of the execution of the wrapped method.
           * specified method has returned @see $.aop
           * @method addControlProcess
           * @param {String} methodName - Name of a public method
           * @param {Function} callback - Function to be executed
           * @return {Array} weaved aspect
           */
          res.addControlProcess = function (method, process) {
              _jquery2.default.aop.around({ target: this, method: method }, process);
          };
  
          /**
           * Uses Aspect Oriented Programming (AOP) to insert callback <em>after</em> the
           * specified method has returned @see $.aop
           * @method addCallback
           * @param {String} methodName - Name of a public method
           * @param {Function} callback - Function to be executed
           * @return {Array} weaved aspect
           */
          res.addCallback = function (method, callback) {
              return _jquery2.default.aop.after({ target: this, method: method }, callback);
          };
  
          res.show = function (method) {
              if (options.useDisabled && this.$.closest('.aui-dd-parent').hasClass('disabled')) {
                  return;
              }
  
              this.alignment = options.alignment;
              hider();
              dropDown.current = this;
              this.method = method || this.method || 'appear';
  
              this.timer = setTimeout(function () {
                  $doc.click(hider);
              }, 0);
  
              $doc.keydown(moveFocus);
  
              if (options.firstSelected && this.links[0]) {
                  active(0).call(this.links[0]);
              }
  
              (0, _jquery2.default)(cdd.offsetParent).css({ zIndex: 2000 });
              methods[this.method](true);
  
              (0, _jquery2.default)(document).trigger('showLayer', ['dropdown', dropDown.current]);
          };
  
          res.hide = function (causer) {
              this.method = this.method || 'appear';
              (0, _jquery2.default)($cdd.get(0).offsetParent).css({ zIndex: '' });
              this.cleanFocus();
              methods[this.method](false);
              $doc.unbind('click', hider).unbind('keydown', moveFocus);
              (0, _jquery2.default)(document).trigger('hideLayer', ['dropdown', dropDown.current]);
              dropDown.current = null;
              return causer;
          };
  
          res.addCallback('reset', function () {
              if (options.firstSelected && this.links[0]) {
                  active(0).call(this.links[0]);
              }
          });
  
          if (!dropDown.iframes) {
              dropDown.iframes = [];
          }
  
          dropDown.createShims = function createShims() {
              (0, _jquery2.default)('iframe').each(function (idx) {
                  var iframe = this;
                  if (!iframe.shim) {
                      iframe.shim = (0, _jquery2.default)('<div />').addClass('shim hidden').appendTo('body');
                      dropDown.iframes.push(iframe);
                  }
              });
              return createShims;
          }();
  
          res.addCallback('show', function () {
              (0, _jquery2.default)(dropDown.iframes).each(function () {
                  var $this = (0, _jquery2.default)(this);
  
                  if ($this.is(':visible')) {
                      var offset = $this.offset();
                      offset.height = $this.height();
                      offset.width = $this.width();
                      this.shim.css({
                          left: offset.left + 'px',
                          top: offset.top + 'px',
                          height: offset.height + 'px',
                          width: offset.width + 'px'
                      }).removeClass('hidden');
                  }
              });
          });
  
          res.addCallback('hide', function () {
              (0, _jquery2.default)(dropDown.iframes).each(function () {
                  this.shim.addClass('hidden');
              });
              options.hideHandler();
          });
          result.push(res);
      });
      return result;
  };
  
  /**
   * For the given item in the drop down get the value of the named additional property. If there is no
   * property with the specified name then null will be returned.
   *
   * @method getAdditionalPropertyValue
   * @namespace dropDown
   * @param item {Object} jQuery Object of the drop down item. An LI element is expected.
   * @param name {String} name of the property to retrieve
   */
  dropDown.getAdditionalPropertyValue = function (item, name) {
      var el = item[0];
      if (!el || typeof el.tagName !== 'string' || el.tagName.toLowerCase() !== 'li') {
          // we are moving the location of the properties and want to deprecate the attachment to the span
          // but are unsure where and how its being called so for now we just log
          logger.log('dropDown.getAdditionalPropertyValue : item passed in should be an LI element wrapped by jQuery');
      }
      var properties = _jquery2.default.data(el, 'properties');
      return properties ? properties[name] : null;
  };
  
  /**
   * Only here for backwards compatibility
   * @method removeAllAdditionalProperties
   * @namespace dropDown
   * @deprecated Since 3.0
   */
  dropDown.removeAllAdditionalProperties = function (item) {};
  
  /**
   * Base dropdown control. Enables you to identify triggers that when clicked, display dropdown.
   *
   * @class Standard
   * @constructor
   * @namespace dropDown
   * @param {Object} usroptions
   * @return {Object
   */
  dropDown.Standard = function (usroptions) {
  
      var res = [],
          dropdownParents,
          options = {
          selector: '.aui-dd-parent',
          dropDown: '.aui-dropdown',
          trigger: '.aui-dd-trigger'
      };
  
      // extend defaults with user options
      _jquery2.default.extend(options, usroptions);
  
      var hookUpDropDown = function hookUpDropDown($trigger, $parent, $dropdown, ddcontrol) {
          // extend to control to have any additional properties/methods
          _jquery2.default.extend(ddcontrol, { trigger: $trigger });
  
          // flag it to prevent additional dd controls being applied
          $parent.addClass('dd-allocated');
  
          //hide dropdown if not already hidden
          $dropdown.addClass('hidden');
  
          //show the dropdown if isHiddenByDefault is set to false
          if (options.isHiddenByDefault == false) {
              ddcontrol.show();
          }
  
          ddcontrol.addCallback('show', function () {
              $parent.addClass('active');
          });
  
          ddcontrol.addCallback('hide', function () {
              $parent.removeClass('active');
          });
      };
  
      var handleEvent = function handleEvent(event, $trigger, $dropdown, ddcontrol) {
          if (ddcontrol != dropDown.current) {
              $dropdown.css({ top: $trigger.outerHeight() });
              ddcontrol.show();
              event.stopImmediatePropagation();
          }
          event.preventDefault();
      };
  
      if (options.useLiveEvents) {
          // cache arrays so that we don't have to recalculate the dropdowns. Since we can't store objects as keys in a map,
          // we have two arrays: keysCache stores keys of dropdown triggers; valuesCache stores a map of internally used objects
          var keysCache = [];
          var valuesCache = [];
  
          (0, _jquery2.default)(options.trigger).live('click', function (event) {
              var $trigger = (0, _jquery2.default)(this);
              var $parent, $dropdown, ddcontrol;
  
              // if we're cached, don't recalculate the dropdown and do all that funny shite.
              var index;
              if ((index = _jquery2.default.inArray(this, keysCache)) >= 0) {
                  var val = valuesCache[index];
                  $parent = val['parent'];
                  $dropdown = val['dropdown'];
                  ddcontrol = val['ddcontrol'];
              } else {
                  $parent = $trigger.closest(options.selector);
                  $dropdown = $parent.find(options.dropDown);
                  // Sanity checking
                  if ($dropdown.length === 0) {
                      return;
                  }
  
                  ddcontrol = dropDown($dropdown, options)[0];
                  // Sanity checking
                  if (!ddcontrol) {
                      return;
                  }
  
                  // cache
                  keysCache.push(this);
                  val = {
                      parent: $parent,
                      dropdown: $dropdown,
                      ddcontrol: ddcontrol
                  };
  
                  hookUpDropDown($trigger, $parent, $dropdown, ddcontrol);
  
                  valuesCache.push(val);
              }
  
              handleEvent(event, $trigger, $dropdown, ddcontrol);
          });
      } else {
          // handling for jQuery collections
          if (this instanceof _jquery2.default) {
              dropdownParents = this;
              // handling for selectors
          } else {
              dropdownParents = (0, _jquery2.default)(options.selector);
          }
  
          // a series of checks to ensure we are dealing with valid dropdowns
          dropdownParents = dropdownParents.not('.dd-allocated').filter(':has(' + options.dropDown + ')').filter(':has(' + options.trigger + ')');
  
          dropdownParents.each(function () {
              var $parent = (0, _jquery2.default)(this),
                  $dropdown = (0, _jquery2.default)(options.dropDown, this),
                  $trigger = (0, _jquery2.default)(options.trigger, this),
                  ddcontrol = dropDown($dropdown, options)[0];
  
              // extend to control to have any additional properties/methods
              _jquery2.default.extend(ddcontrol, { trigger: $trigger });
  
              hookUpDropDown($trigger, $parent, $dropdown, ddcontrol);
  
              $trigger.click(function (e) {
                  handleEvent(e, $trigger, $dropdown, ddcontrol);
              });
  
              // add control to the response
              res.push(ddcontrol);
          });
      }
      return res;
  };
  
  /**
   * A NewStandard dropdown, however, with the ability to populate its content's via ajax.
   *
   * @class Ajax
   * @constructor
   * @namespace dropDown
   * @param {Object} options
   * @return {Object} dropDown instance
   */
  dropDown.Ajax = function (usroptions) {
  
      var dropdowns,
          options = { cache: true };
  
      // extend defaults with user options
      _jquery2.default.extend(options, usroptions || {});
  
      // we call with "this" in case we are called in the context of a jQuery collection
      dropdowns = dropDown.Standard.call(this, options);
  
      (0, _jquery2.default)(dropdowns).each(function () {
  
          var ddcontrol = this;
  
          _jquery2.default.extend(ddcontrol, {
              getAjaxOptions: function getAjaxOptions(opts) {
                  var success = function success(response) {
                      if (options.formatResults) {
                          response = options.formatResults(response);
                      }
                      if (options.cache) {
                          ddcontrol.cache.set(ddcontrol.getAjaxOptions(), response);
                      }
                      ddcontrol.refreshSuccess(response);
                  };
                  if (options.ajaxOptions) {
  
                      if (_jquery2.default.isFunction(options.ajaxOptions)) {
                          return _jquery2.default.extend(options.ajaxOptions.call(ddcontrol), { success: success });
                      } else {
                          return _jquery2.default.extend(options.ajaxOptions, { success: success });
                      }
                  }
                  return _jquery2.default.extend(opts, { success: success });
              },
  
              refreshSuccess: function refreshSuccess(response) {
                  this.$.html(response);
              },
  
              cache: function () {
                  var c = {};
                  return {
                      get: function get(ajaxOptions) {
                          var data = ajaxOptions.data || '';
                          return c[(ajaxOptions.url + data).replace(/[\?\&]/gi, '')];
                      },
                      set: function set(ajaxOptions, responseData) {
                          var data = ajaxOptions.data || '';
                          c[(ajaxOptions.url + data).replace(/[\?\&]/gi, '')] = responseData;
                      },
                      reset: function reset() {
                          c = {};
                      }
                  };
              }(),
  
              show: function (superMethod) {
                  return function () {
                      if (options.cache && !!ddcontrol.cache.get(ddcontrol.getAjaxOptions())) {
                          ddcontrol.refreshSuccess(ddcontrol.cache.get(ddcontrol.getAjaxOptions()));
                          superMethod.call(ddcontrol);
                      } else {
                          (0, _jquery2.default)(_jquery2.default.ajax(ddcontrol.getAjaxOptions())).throbber({ target: ddcontrol.$,
                              end: function end() {
                                  ddcontrol.reset();
                              }
                          });
                          superMethod.call(ddcontrol);
                          if (ddcontrol.iframeShim) {
                              ddcontrol.iframeShim.hide();
                          }
                      }
                  };
              }(ddcontrol.show),
  
              resetCache: function resetCache() {
                  ddcontrol.cache.reset();
              }
          });
          ddcontrol.addCallback('refreshSuccess', function () {
              ddcontrol.reset();
          });
      });
      return dropdowns;
  };
  
  // OMG. No. Just no.
  _jquery2.default.fn.dropDown = function (type, options) {
      type = (type || 'Standard').replace(/^([a-z])/, function (match) {
          return match.toUpperCase();
      });
      return dropDown[type].call(this, options);
  };
  
  _jquery2.default.fn.dropDown = deprecate.construct(_jquery2.default.fn.dropDown, 'Dropdown constructor', {
      alternativeName: 'Dropdown2'
  });
  
  (0, _globalize2.default)('dropDown', dropDown);
  
  exports.default = dropDown;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/escape.js
(typeof window === 'undefined' ? global : window).__7e7d65e26f310fe6f23f29f57edf55c9 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Similar to Javascript's in-built escape() function, but where the built-in escape()
   * might encode unicode charaters as %uHHHH, this function will leave them as-is.
   *
   * NOTE: this function does not do html-escaping, see escapeHtml().
   */
  var jsEscape = window.escape;
  
  function escape(string) {
      return jsEscape(string).replace(/%u\w{4}/gi, function (w) {
          return unescape(w);
      });
  }
  
  (0, _globalize2.default)('escape', escape);
  
  exports.default = escape;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/filter-by-search.js
(typeof window === 'undefined' ? global : window).__92d9a6fcc35a9e99b2baea240928a821 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Filters a list of entries by a passed search term.
   *
   * Options:
   * - `keywordsField` name of entry field containing keywords, default "keywords".
   * - `ignoreForCamelCase` ignore search case for camel case, e.g. CB matches Code Block *and* Code block.
   * - `matchBoundary` match words only at boundary, e.g. link matches "linking" but not "hyperlinks".
   * - `splitRegex` regex to split search words, instead of on whitespace.
   *
   * @param {Array} entries An array of objects with a "keywords" property.
   * @param {String} search One or more words to search on, which may include camel-casing.
   * @param {Object} options Specifiy to override default behaviour.
   *
   * @returns {Array}
   */
  function filterBySearch(entries, search, options) {
      // search for nothing, get nothing - up to calling code to handle.
      if (!search) {
          return [];
      }
  
      var keywordsField = options && options.keywordsField || 'keywords';
      var camelCaseFlags = options && options.ignoreForCamelCase ? 'i' : '';
      var boundaryFlag = options && options.matchBoundary ? '\\b' : '';
      var splitRegex = options && options.splitRegex || /\s+/;
  
      // each word in the input is considered a distinct filter that has to match a keyword in the record
      var filterWords = search.split(splitRegex);
      var filters = [];
  
      filterWords.forEach(function (word) {
          // anchor on word boundaries
          var subfilters = [new RegExp(boundaryFlag + word, 'i')];
  
          // split camel-case into separate words
          if (/^([A-Z][a-z]*) {2,}$/.test(this)) {
              var camelRegexStr = this.replace(/([A-Z][a-z]*)/g, '\\b$1[^,]*');
  
              subfilters.push(new RegExp(camelRegexStr, camelCaseFlags));
          }
  
          filters.push(subfilters);
      });
  
      var result = [];
  
      entries.forEach(function (entry) {
          for (var i = 0; i < filters.length; i++) {
              var somethingMatches = false;
  
              for (var j = 0; j < filters[i].length; j++) {
                  if (filters[i][j].test(entry[keywordsField])) {
                      somethingMatches = true;
                      break;
                  }
              }
  
              if (!somethingMatches) {
                  return;
              }
          }
  
          result.push(entry);
      });
  
      return result;
  }
  
  var filterBySearch = (0, _deprecation.fn)(filterBySearch, 'filterBySearch', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. If products require this function, this should be copied.'
  });
  
  (0, _globalize2.default)('filterBySearch', filterBySearch);
  
  exports.default = filterBySearch;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/include.js
(typeof window === 'undefined' ? global : window).__2396162f5ca62936e832b63581d0b02d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _contains = __a2c859f35719ca3425471df788438a74;
  
  var _contains2 = _interopRequireDefault(_contains);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var included = [];
  
  function include(url) {
      if (!(0, _contains2.default)(included, url)) {
          included.push(url);
          var s = document.createElement('script');
          s.src = url;
          (0, _jquery2.default)('body').append(s);
      }
  }
  
  var include = (0, _deprecation.fn)(include, 'include', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use a proper module loader instead.'
  });
  
  (0, _globalize2.default)('include', include);
  
  exports.default = include;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/inline-dialog2.js
(typeof window === 'undefined' ? global : window).__2883f62e804d6ae6a52910b6c4a55520 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _alignment = __f420c577506564c314d7d5d82088641c;
  
  var _alignment2 = _interopRequireDefault(_alignment);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _attributes = __29fa312a51517f20df339a1900640e1d;
  
  var _attributes2 = _interopRequireDefault(_attributes);
  
  var _enforcer = __8339408c10b0a9052af9f3aad7b3a4e8;
  
  var _enforcer2 = _interopRequireDefault(_enforcer);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _layer = __fe0cd0a7ef176e2ef4e0e105d1ce31f5;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _state = __fd7d82ce22cd33cac1609667ce8040f9;
  
  var _state2 = _interopRequireDefault(_state);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DEFAULT_HOVEROUT_DELAY = 1000;
  
  function getTrigger(element) {
      return document.querySelector('[aria-controls="' + element.id + '"]');
  }
  
  function doIfTrigger(element, callback) {
      var trigger = getTrigger(element);
  
      if (trigger) {
          callback(trigger);
      }
  }
  
  function initAlignment(element, trigger) {
      if (!element._auiAlignment) {
          element._auiAlignment = new _alignment2.default(element, trigger);
      }
  }
  
  function enableAlignment(element, trigger) {
      initAlignment(element, trigger);
      element._auiAlignment.enable();
  }
  
  function disableAlignment(element, trigger) {
      initAlignment(element, trigger);
      element._auiAlignment.disable();
  }
  
  function handleMessage(element, message) {
      var messageTypeMap = {
          toggle: ['click'],
          hover: ['mouseenter', 'mouseleave', 'focus', 'blur']
      };
  
      var messageList = messageTypeMap[element.respondsTo];
      if (messageList && messageList.indexOf(message.type) > -1) {
          messageHandler[message.type](element, message);
      }
  }
  
  var messageHandler = {
      click: function click(element) {
          if (element.open) {
              if (!(0, _layer2.default)(element).isPersistent()) {
                  element.open = false;
              }
          } else {
              element.open = true;
          }
      },
  
      mouseenter: function mouseenter(element) {
          if (!element.open) {
              element.open = true;
          }
  
          if (element._clearMouseleaveTimeout) {
              element._clearMouseleaveTimeout();
          }
      },
  
      mouseleave: function mouseleave(element) {
          if ((0, _layer2.default)(element).isPersistent() || !element.open) {
              return;
          }
  
          if (element._clearMouseleaveTimeout) {
              element._clearMouseleaveTimeout();
          }
  
          var timeout = setTimeout(function () {
              if (!(0, _state2.default)(element).get('mouse-inside')) {
                  element.open = false;
              }
          }, DEFAULT_HOVEROUT_DELAY);
  
          element._clearMouseleaveTimeout = function () {
              clearTimeout(timeout);
              element._clearMouseleaveTimeout = null;
          };
      },
  
      focus: function focus(element) {
          if (!element.open) {
              element.open = true;
          }
      },
  
      blur: function blur(element) {
          if (!(0, _layer2.default)(element).isPersistent() && element.open) {
              element.open = false;
          }
      }
  };
  
  function onMouseEnter(e) {
      var element = e.target;
      (0, _state2.default)(element).set('mouse-inside', true);
      element.message({
          type: 'mouseenter'
      });
  }
  
  function onMouseLeave(e) {
      var element = e.target;
      (0, _state2.default)(element).set('mouse-inside', false);
      element.message({
          type: 'mouseleave'
      });
  }
  
  function rebindMouseEvents(el) {
      (0, _state2.default)(el).set('mouse-inside', undefined);
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
  
      if (el.respondsTo === 'hover') {
          (0, _state2.default)(el).set('mouse-inside', false);
          el.addEventListener('mouseenter', onMouseEnter);
          el.addEventListener('mouseleave', onMouseLeave);
      }
  }
  
  function showInlineDialog(el) {
      (0, _layer2.default)(el).show();
      if ((0, _layer2.default)(el).isVisible()) {
          doIfTrigger(el, function (trigger) {
              enableAlignment(el, trigger);
              trigger.setAttribute('aria-expanded', 'true');
          });
      } else {
          el.open = false;
      }
  }
  
  function hideInlineDialog(el) {
      (0, _layer2.default)(el).hide();
      if (!(0, _layer2.default)(el).isVisible()) {
          doIfTrigger(el, function (trigger) {
              disableAlignment(el, trigger);
              trigger.setAttribute('aria-expanded', 'false');
          });
      } else {
          el.open = true;
      }
  }
  
  function reflectOpenness(el) {
      var isInitalizing = !el.hasAttribute('aria-hidden');
      var shouldBeOpen = el.hasAttribute('open');
      if (isInitalizing || el.open !== shouldBeOpen) {
          if (shouldBeOpen) {
              (0, _state2.default)(el).set('is-processing-show', true);
              showInlineDialog(el);
              (0, _state2.default)(el).set('is-processing-show', false);
          } else {
              hideInlineDialog(el);
          }
      }
  }
  
  var RESPONDS_TO_ATTRIBUTE_ENUM = {
      attribute: 'responds-to',
      values: ['toggle', 'hover'],
      missingDefault: 'toggle',
      invalidDefault: 'toggle'
  };
  
  var inlineDialog = (0, _skate2.default)('aui-inline-dialog', {
      prototype: {
          /**
           * Returns whether the inline dialog is open.
           */
          get open() {
              return (0, _layer2.default)(this).isVisible();
          },
  
          /**
           * Opens or closes the inline dialog, returning whether the dialog is
           * open or closed as a result (since event handlers can prevent either
           * action).
           *
           * You should check the value of open after setting this
           * value since the before show/hide events may have prevented it.
           */
          set open(value) {
              // TODO AUI-3726 Revisit double calls to canceled event handlers.
              // Explicitly calling reflectOpenness(…) in this setter means
              // that in native we'll get two sync calls to reflectOpenness(…)
              // and in polyfill one sync (here) and one async (attr change
              // handler). The latter of the two calls, for both cases, will
              // usually be a noop (except when show/hide events are cancelled).
              _attributes2.default.setBooleanAttribute(this, 'open', value);
              reflectOpenness(this);
          },
  
          get persistent() {
              return this.hasAttribute('persistent');
          },
  
          set persistent(value) {
              _attributes2.default.setBooleanAttribute(this, 'persistent', value);
          },
  
          get respondsTo() {
              var attr = RESPONDS_TO_ATTRIBUTE_ENUM.attribute;
              return _attributes2.default.computeEnumValue(RESPONDS_TO_ATTRIBUTE_ENUM, this.getAttribute(attr));
          },
  
          set respondsTo(value) {
              var oldComputedValue = this.respondsTo;
              _attributes2.default.setEnumAttribute(this, RESPONDS_TO_ATTRIBUTE_ENUM, value);
              if (oldComputedValue !== this.respondsTo) {
                  rebindMouseEvents(this);
              }
          },
  
          /**
           * Handles the receiving of a message from another component.
           *
           * @param {Object} msg The message to act on.
           *
           * @returns {HTMLElement}
           */
          message: function message(msg) {
              handleMessage(this, msg);
              return this;
          }
      },
  
      created: function created(element) {
          (0, _state2.default)(element).set('is-processing-show', false);
  
          doIfTrigger(element, function (trigger) {
              trigger.setAttribute('aria-expanded', element.open);
              trigger.setAttribute('aria-haspopup', 'true');
          });
      },
  
      attributes: {
          'aria-hidden': function ariaHidden(element, change) {
              if (change.newValue === 'true') {
                  var trigger = getTrigger(element);
                  if (trigger) {
                      trigger.setAttribute('aria-expanded', 'false');
                  }
              }
  
              // Whenever layer manager hides us, we need to sync the open attribute.
              _attributes2.default.setBooleanAttribute(element, 'open', change.newValue === 'false');
          },
  
          open: function open(element) {
              // skate runs the created callback for attributes before the
              // element is attached to the DOM, so guard against that.
              if (document.body.contains(element)) {
                  reflectOpenness(element);
              }
          },
  
          'responds-to': function respondsTo(element, change) {
              var oldComputedValue = _attributes2.default.computeEnumValue(RESPONDS_TO_ATTRIBUTE_ENUM, change.oldValue);
              var newComputedValue = _attributes2.default.computeEnumValue(RESPONDS_TO_ATTRIBUTE_ENUM, change.newValue);
              if (oldComputedValue !== newComputedValue) {
                  rebindMouseEvents(element);
              }
          }
      },
  
      attached: function attached(element) {
          (0, _enforcer2.default)(element).attributeExists('id');
          if (element.hasAttribute('open')) {
              // show() can cause the element to be reattached (to the <body>),
              // so guard against a nested show() call that blows up the layer
              // manager (since it sees us pushing the same element twice).
              if (!(0, _state2.default)(element).get('is-processing-show')) {
                  reflectOpenness(element);
              }
          } else {
              reflectOpenness(element);
          }
          rebindMouseEvents(element);
      },
  
      detached: function detached(element) {
          if (element._auiAlignment) {
              element._auiAlignment.destroy();
          }
      },
  
      template: function template(element) {
          var elem = (0, _jquery2.default)('<div class="aui-inline-dialog-contents"></div>').append(element.childNodes);
          (0, _jquery2.default)(element).addClass('aui-layer').html(elem);
      }
  });
  
  (0, _amdify2.default)('aui/inline-dialog2', inlineDialog);
  (0, _globalize2.default)('InlineDialog2', inlineDialog);
  exports.default = inlineDialog;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/is-clipped.js
(typeof window === 'undefined' ? global : window).__be88e4b5c5dd8d343902ce7534076e13 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function to see if passed element is truncated/clipped, eg. with
   * text-overflow: ellipsis.
   *
   * @param {String | Element | jQuery} element The element to check.
   *
   * @returns {Boolean}
   */
  function isClipped(el) {
    el = (0, _jquery2.default)(el);
    return el.prop('scrollWidth') > el.prop('clientWidth');
  }
  
  (0, _globalize2.default)('isClipped', isClipped);
  
  exports.default = isClipped;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/is-visible.js
(typeof window === 'undefined' ? global : window).__2c1b431bb110038d1c7590dfbddac12c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function to see if passed element is currently visible on screen.
   *
   * @param {String | Element} element The HTMLElement or an jQuery selector to check.
   *
   * @returns {Boolean}
   */
  function isVisible(element) {
      return !(0, _jquery2.default)(element).hasClass('hidden');
  }
  
  var isVisible = (0, _deprecation.fn)(isVisible, 'isVisible', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use jQuery.hasClass() instead.'
  });
  
  (0, _globalize2.default)('isVisible', isVisible);
  
  exports.default = isVisible;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/layer-manager.js
(typeof window === 'undefined' ? global : window).__5530e5d8d41ad2f3690318a3191759ae = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _layer = __fe0cd0a7ef176e2ef4e0e105d1ce31f5;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (0, _globalize2.default)('LayerManager', _layer2.default.Manager);
  
  exports.default = _layer2.default.Manager;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/messages.js
(typeof window === 'undefined' ? global : window).__7f014f4563f4730ba724da8ae59dfe98 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _template = __eb201a36d4829c396b434af7bad3dea4;
  
  var _template2 = _interopRequireDefault(_template);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DEFAULT_FADEOUT_DURATION = 500;
  var DEFAULT_FADEOUT_DELAY = 5000;
  var FADEOUT_RESTORE_DURATION = 100;
  
  var MESSAGE_TEMPLATE = '<div class="aui-message aui-message-{type} {closeable} {shadowed} {fadeout}">' + '<p class="title">' + '<strong>{title}</strong>' + '</p>' + '{body}<!-- .aui-message -->' + '</div>';
  
  function createMessageConstructor(type) {
      /**
       *
       * @param context
       * @param {Object} obj - message configuration
       * @param {boolean} [obj.id] - ID to add to the message
       * @param {boolean} obj.body - Content of the message
       * @param {boolean} [obj.closeable]
       * @param {boolean} [obj.shadowed]
       * @param {boolean} [obj.fadeout]
       * @param {boolean} [obj.duration]
       * @param {boolean} [obj.delay]
       * @returns {*|HTMLElement}
       */
      messages[type] = function (context, obj) {
          if (!obj) {
              obj = context;
              context = '#aui-message-bar';
          }
  
          // Set up our template options
          obj.closeable = obj.closeable !== null && obj.closeable !== false;
  
          // shadowed no longer does anything but left in so it doesn't break
          obj.shadowed = obj.shadowed !== null && obj.shadowed !== false;
  
          var $message = renderMessageElement(this.template, obj, type);
          insertMessageIntoContext($message, obj.insert, context);
  
          // Attach the optional extra behaviours
          if (obj.closeable) {
              makeCloseable($message);
          }
  
          if (obj.fadeout) {
              makeFadeout($message, obj.delay, obj.duration);
          }
  
          return $message;
      };
  }
  
  function makeCloseable(message) {
      (0, _jquery2.default)(message || 'div.aui-message.closeable').each(function () {
          var $this = (0, _jquery2.default)(this);
          var $closeIcons = $this.find('.aui-icon.icon-close');
          var $icon = $closeIcons.length > 0 ? $closeIcons.first() : (0, _jquery2.default)('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');
  
          $this.addClass('closeable');
          $this.append($icon);
  
          initCloseMessageBoxOnClickAndKeypress($this);
      });
  }
  
  function makeFadeout(message, delay, duration) {
      delay = typeof delay !== 'undefined' ? delay : DEFAULT_FADEOUT_DELAY;
      duration = typeof duration !== 'undefined' ? duration : DEFAULT_FADEOUT_DURATION;
  
      (0, _jquery2.default)(message || 'div.aui-message.fadeout').each(function () {
          var $this = (0, _jquery2.default)(this);
  
          //Store the component state to avoid collisions between animations
          var hasFocus = false;
          var isHover = false;
  
          //Small functions to keep the code easier to read and avoid code duplication
          function fadeOut() {
              //Algorithm:
              //1. Stop all running animations (first arg), including any fade animation and delay
              //   Do not jump to the end of the animation (second arg). This prevents the message to abruptly
              //   jump to opacity:0 or opacity:1
              //2. Wait <delay> ms before starting the fadeout
              //3. Start the fadeout with a duration of <duration> ms
              //4. Close the message at the end of the animation
              $this.stop(true, false).delay(delay).fadeOut(duration, function () {
                  $this.closeMessage();
              });
          }
          function resetFadeOut() {
              //Algorithm:
              //1. Stop all running animations (first arg), including any fade animation and delay
              //   Do not jump to the end of the animation (second arg). This prevents the message to abruptly
              //   jump to opacity:0 or opacity:1
              //2. Fast animation to opacity:1
              $this.stop(true, false).fadeTo(FADEOUT_RESTORE_DURATION, 1);
          }
          function shouldStartFadeOut() {
              return !hasFocus && !isHover;
          }
  
          //Attach handlers for user interactions (focus and hover)
          $this.focusin(function () {
              hasFocus = true;
              resetFadeOut();
          }).focusout(function () {
              hasFocus = false;
              if (shouldStartFadeOut()) {
                  fadeOut();
              }
          }).hover(function () {
              //should be called .hoverin(), but jQuery does not implement that method
              isHover = true;
              resetFadeOut();
          }, function () {
              //should be called .hoverout(), but jQuery does not implement that method
              isHover = false;
              if (shouldStartFadeOut()) {
                  fadeOut();
              }
          });
  
          //Initial animation
          fadeOut();
      });
  }
  
  /**
   * Utility methods to display different message types to the user.
   * Usage:
   * <pre>
   * messages.info("#container", {
       *   title: "Info",
       *   body: "You can choose to have messages without Close functionality.",
       *   closeable: false,
       *   shadowed: false
       * });
   * </pre>
   */
  var messages = {
      setup: function setup() {
          makeCloseable();
          makeFadeout();
      },
      makeCloseable: makeCloseable,
      makeFadeout: makeFadeout,
      template: MESSAGE_TEMPLATE,
      createMessage: createMessageConstructor
  };
  
  function initCloseMessageBoxOnClickAndKeypress($message) {
      $message.on('click', '.aui-icon.icon-close', function (e) {
          (0, _jquery2.default)(e.target).closest('.aui-message').closeMessage();
      }).on('keydown', '.aui-icon.icon-close', function (e) {
          if (e.which === _keyCode2.default.ENTER || e.which === _keyCode2.default.SPACE) {
              (0, _jquery2.default)(e.target).closest('.aui-message').closeMessage();
              e.preventDefault(); // this is especially important when handling the space bar, as we don't want to page down
          }
      });
  }
  
  function insertMessageIntoContext($message, insertWhere, context) {
      if (insertWhere === 'prepend') {
          $message.prependTo(context);
      } else {
          $message.appendTo(context);
      }
  }
  
  function renderMessageElement(templateString, options, type) {
      // Append the message using template
      var $message = (0, _jquery2.default)((0, _template2.default)(templateString).fill({
          type: type,
          closeable: options.closeable ? 'closeable' : '',
          shadowed: options.shadowed ? 'shadowed' : '',
          fadeout: options.fadeout ? 'fadeout' : '',
          title: options.title || '',
          'body:html': options.body || ''
      }).toString());
  
      // Add ID if supplied
      if (options.id) {
          if (/[#\'\"\.\s]/g.test(options.id)) {
              // reject IDs that don't comply with style guide (ie. they'll break stuff)
              logger.warn('Messages error: ID rejected, must not include spaces, hashes, dots or quotes.');
          } else {
              $message.attr('id', options.id);
          }
      }
  
      return $message;
  }
  
  _jquery2.default.fn.closeMessage = function () {
      var $message = (0, _jquery2.default)(this);
      if ($message.hasClass('aui-message') && $message.hasClass('closeable')) {
          $message.stop(true); //Stop any running animation
          $message.trigger('messageClose', [this]).remove(); //messageClose event Deprecated as of 5.3
          (0, _jquery2.default)(document).trigger('aui-message-close', [this]); //must trigger on document since the element has been removed
      }
  };
  
  createMessageConstructor('generic');
  createMessageConstructor('error');
  createMessageConstructor('warning');
  createMessageConstructor('info');
  createMessageConstructor('success');
  createMessageConstructor('hint');
  
  (0, _skate2.default)('aui-message', {
      created: function created(element) {
          var body = element.innerHTML;
          var type = element.getAttribute('type') || 'info';
  
          element.innerHTML = '';
          messages[type](element, {
              body: body,
              closeable: element.getAttribute('closeable'),
              delay: element.getAttribute('delay'),
              duration: element.getAttribute('duration'),
              fadeout: element.getAttribute('fadeout'),
              title: element.getAttribute('title')
          });
      }
  });
  
  (0, _jquery2.default)(function () {
      messages.setup();
  });
  
  deprecate.prop(messages, 'makeCloseable', {
      extraInfo: 'Use the "closeable" option in the constructor instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  deprecate.prop(messages, 'createMessage', {
      extraInfo: 'Use the provided convenience methods instead e.g. messages.generic(). Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  deprecate.prop(messages, 'makeFadeout', {
      extraInfo: 'Use the "fadeout" option in the constructor instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  // Exporting
  // ---------
  
  (0, _globalize2.default)('messages', messages);
  
  exports.default = messages;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/navigation.js
(typeof window === 'undefined' ? global : window).__ae9d29286cb1bf270e0b6093684e6bea = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _widget = __e3152236c406a356c24f20f7bfcccf21;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Navigation (".aui-nav" elements).
   *
   * @param {(string|HtmlElement|jQuery)} selector - An expression
   *     representing a single .aui-nav element; you may also pass an expression
   *     for a descendent element, in which case the closest containing
   *     .aui-nav element is used.
   * @constructor
   */
  function Navigation(selector) {
      this.$el = (0, _jquery2.default)(selector).closest('.aui-nav');
  
      // If there are multiple objects, initialise them separately
      if (this.$el.length > 1) {
          return this.$el.map(function (idx, elm) {
              return new Navigation(elm);
          })[0];
      }
  
      // If already initialised, return existing object
      if (this.$el.data('aui-navigation')) {
          return this.$el.data('aui-navigation');
      }
  
      this.$el.data('aui-navigation', this);
  
      this.$treeParent = this.$el.parent('li[aria-expanded]');
      this.$subtreeToggleIcon = this.$treeParent.children('.aui-nav-subtree-toggle').children('span.aui-icon');
  
      // Hide extra items under a 'More...' link
      this.hideMoreItems();
  
      // Add child-selected class to relevant attributes
      this.$el.children('li:has(.aui-nav-selected)').addClass('aui-nav-child-selected');
  
      // Auto-expand if child is selected
      var $selected = this.$el.children('.aui-nav-selected');
      $selected.parents('.aui-nav > [aria-expanded=false]').add($selected.filter('[aria-expanded=false]')).each(function () {
          var nav = navigationWidget((0, _jquery2.default)(this).children('.aui-nav'));
          nav.expand();
      });
  
      // Toggle expand on click
      this.$el.find('> li[aria-expanded] > .aui-nav-subtree-toggle').on('click', function () {
          var nav = navigationWidget((0, _jquery2.default)(this).siblings('.aui-nav'));
          nav.toggle();
      });
  
      return this;
  }
  
  Navigation.prototype.isNested = function () {
      return this.$treeParent.length === 1;
  };
  
  Navigation.prototype.isCollapsed = function () {
      return this.$treeParent.attr('aria-expanded') === 'false';
  };
  
  Navigation.prototype.expand = function () {
      this.$treeParent.attr('aria-expanded', 'true');
      this.$subtreeToggleIcon.removeClass('aui-iconfont-collapsed').addClass('aui-iconfont-expanded');
      this.hideMoreItems();
      return this;
  };
  
  Navigation.prototype.collapse = function () {
      this.$treeParent.attr('aria-expanded', 'false');
      this.$subtreeToggleIcon.removeClass('aui-iconfont-expanded').addClass('aui-iconfont-collapsed');
      return this;
  };
  
  Navigation.prototype.toggle = function () {
      if (this.isCollapsed()) {
          this.expand();
      } else {
          this.collapse();
      }
      return this;
  };
  
  Navigation.prototype.hideMoreItems = function () {
      if (this.$el.is('.aui-nav:not([aria-expanded=false]) [data-more]')) {
          var moreText = this.$el.attr('data-more') || AJS.I18n.getText('aui.words.moreitem');
          var limit = Math.abs(parseInt(this.$el.attr('data-more-limit'))) || 5;
          var $listElements = this.$el.children('li');
  
          // Only add 'More...' if there is more than one element to hide and there are no selected elements
          var lessThanTwoToHide = $listElements.length <= limit + 1;
          var selectedElementPresent = $listElements.filter('.aui-nav-selected').length;
          var alreadyInitialised = $listElements.filter('.aui-nav-more').length;
          if (lessThanTwoToHide || selectedElementPresent || alreadyInitialised) {
              return this;
          }
  
          (0, _jquery2.default)('<li>', {
              'class': 'aui-nav-more',
              'aria-hidden': 'true'
          }).append((0, _jquery2.default)('<a>', {
              'href': '#',
              'class': 'aui-nav-item',
              'text': moreText,
              'click': function click(e) {
                  e.preventDefault();
                  (0, _jquery2.default)(this).parent().remove();
              }
          })).insertAfter($listElements.eq(limit - 1));
      }
  
      return this;
  };
  
  var navigationWidget = (0, _widget2.default)('navigation', Navigation);
  
  // Initialise nav elements
  (0, _skate2.default)('aui-nav', {
      type: _skate2.default.type.CLASSNAME,
      attached: function attached(element) {
          new Navigation(element);
      },
      detached: function detached(element) {
          (0, _jquery2.default)(element).removeData();
      }
  });
  
  (0, _globalize2.default)('navigation', navigationWidget);
  
  exports.default = navigationWidget;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/on-text-resize.js
(typeof window === 'undefined' ? global : window).__7993d85ab19905f85e57d36cb0999580 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _createElement = __fd277fcde858b82a198666a405e85600;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function onTextResize(f) {
      if (typeof f === 'function') {
          if (onTextResize['on-text-resize']) {
              onTextResize['on-text-resize'].push(function (emsize) {
                  f(emsize);
              });
          } else {
              var em = (0, _createElement2.default)('div');
  
              em.css({
                  width: '1em',
                  height: '1em',
                  position: 'absolute',
                  top: '-9999em',
                  left: '-9999em'
              });
  
              (0, _jquery2.default)('body').append(em);
              em.size = em.width();
  
              setInterval(function () {
                  if (em.size !== em.width()) {
                      em.size = em.width();
  
                      for (var i = 0, ii = onTextResize['on-text-resize'].length; i < ii; i++) {
                          onTextResize['on-text-resize'][i](em.size);
                      }
                  }
              }, 0);
              onTextResize.em = em;
              onTextResize['on-text-resize'] = [function (emsize) {
                  f(emsize);
              }];
          }
      }
  }
  
  (0, _globalize2.default)('onTextResize', onTextResize);
  
  exports.default = onTextResize;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/params.js
(typeof window === 'undefined' ? global : window).__c9067396b725a0e50bb5247a7338561e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = (0, _globalize2.default)('params', {});
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/populate-parameters.js
(typeof window === 'undefined' ? global : window).__0210cf71af3a1c7fcbb0f421af87d03c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _params = __c9067396b725a0e50bb5247a7338561e;
  
  var _params2 = _interopRequireDefault(_params);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function populateParameters(parameters) {
      if (!parameters) {
          parameters = _params2.default;
      }
  
      (0, _jquery2.default)('.parameters input').each(function () {
          var value = this.value;
          var id = this.title || this.id;
  
          if ((0, _jquery2.default)(this).hasClass('list')) {
              if (parameters[id]) {
                  parameters[id].push(value);
              } else {
                  parameters[id] = [value];
              }
          } else {
              parameters[id] = value.match(/^(tru|fals)e$/i) ? value.toLowerCase() === 'true' : value;
          }
      });
  }
  
  (0, _globalize2.default)('populateParameters', populateParameters);
  
  exports.default = populateParameters;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/prevent-default.js
(typeof window === 'undefined' ? global : window).__0a2618b4f4b11d46cc024fa7624c6b00 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Calls e.preventDefault. This is designed for event handlers that only need to prevent the default browser
   * action, eg:
   *
   *     $(".my-class").click(AJS.preventDefault)
   *
   * @param {jQuery.Event} e jQuery event.
   *
   * @returns {undefined}
   */
  function preventDefault(e) {
    e.preventDefault();
  }
  
  (0, _globalize2.default)('preventDefault', preventDefault);
  
  exports.default = preventDefault;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/header.js
(typeof window === 'undefined' ? global : window).__3b5a26bdd3080332ee26f12f39993af9 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _createHeader = __906ea2ee8af7ec57662c322a720a678d;
  
  var _createHeader2 = _interopRequireDefault(_createHeader);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function findAndCreateHeaders() {
      (0, _jquery2.default)('.aui-header').each(function () {
          (0, _createHeader2.default)(this);
      });
  }
  
  (0, _jquery2.default)(findAndCreateHeaders);
  
  var responsiveheader = {};
  responsiveheader.setup = deprecate.fn(findAndCreateHeaders, 'responsiveheader.setup', {
      removeInVersion: '6.0.0',
      sinceVersion: '5.8.0',
      extraInfo: 'No need to manually initialise anymore as this is now a web component.'
  });
  
  (0, _globalize2.default)('responsiveheader', responsiveheader);
  
  exports.default = responsiveheader;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/set-current.js
(typeof window === 'undefined' ? global : window).__2886f8ce6fcbda101b4cfd4ff7250339 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function adds or removes 'current' classname to an element based on a passed boolean.
   *
   * @param {String | Element} element The element or an ID to show or hide.
   * @param {boolean} show True to add 'current' class, false to remove.
   *
   * @returns {undefined}
   */
  function setCurrent(element, current) {
      if (!(element = (0, _jquery2.default)(element))) {
          return;
      }
  
      if (current) {
          element.addClass('current');
      } else {
          element.removeClass('current');
      }
  }
  
  var setCurrent = (0, _deprecation.fn)(setCurrent, 'setCurrent', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use jQuery.addClass() / removeClass() instead.'
  });
  
  (0, _globalize2.default)('setCurrent', setCurrent);
  
  exports.default = setCurrent;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/set-visible.js
(typeof window === 'undefined' ? global : window).__a6a0829fdd31675ae9bd1ab07593b9aa = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function adds or removes 'hidden' classname to an element based on a passed boolean.
   *
   * @param {String | Element} element The element or an ID to show or hide.
   * @param {boolean} show true to show, false to hide.
   *
   * @returns {undefined}
   */
  function setVisible(element, show) {
      if (!(element = (0, _jquery2.default)(element))) {
          return;
      }
  
      (0, _jquery2.default)(element).each(function () {
          var isHidden = (0, _jquery2.default)(this).hasClass('hidden');
  
          if (isHidden && show) {
              (0, _jquery2.default)(this).removeClass('hidden');
          } else if (!isHidden && !show) {
              (0, _jquery2.default)(this).addClass('hidden');
          }
      });
  }
  
  var setVisible = (0, _deprecation.fn)(setVisible, 'setVisible', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use jQuery.addClass() / removeClass() instead.'
  });
  
  (0, _globalize2.default)('setVisible', setVisible);
  
  exports.default = setVisible;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/stop-event.js
(typeof window === 'undefined' ? global : window).__aeebc1cbc698431a10d11e14e8095d6e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Prevent further handling of an event. Returns false, which you should use as the return value of your event handler:
   * return stopEvent(e);
   *
   * @param {jQuery.Event} e jQuery event
   *
   * @returns {Boolean}
   */
  function stopEvent(e) {
      e.stopPropagation();
      return false; // required for JWebUnit pop-up links to work properly
  }
  
  var stopEvent = (0, _deprecation.fn)(stopEvent, 'stopEvent', {
      alternativeName: 'preventDefault()',
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('stopEvent', stopEvent);
  
  exports.default = stopEvent;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/tabs.js
(typeof window === 'undefined' ? global : window).__528cf2801debf7075d1fc56b34c7b259 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  __f52b7059926ab2bdcd0aee12b4bc782b;
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _debounce = __c6e18cf9266fe56d02f78a6e812f58db;
  
  var _debounce2 = _interopRequireDefault(_debounce);
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _addId = __6ccb0f8a73a13028d85029aeb628b44d;
  
  var _addId2 = _interopRequireDefault(_addId);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _isClipped = __be88e4b5c5dd8d343902ce7534076e13;
  
  var _isClipped2 = _interopRequireDefault(_isClipped);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  var template = window.skateTemplateHtml;
  
  var REGEX = /#.*/;
  var STORAGE_PREFIX = '_internal-aui-tabs-';
  var RESPONSIVE_OPT_IN_SELECTOR = '.aui-tabs.horizontal-tabs[data-aui-responsive]:not([data-aui-responsive="false"]), aui-tabs[responsive]:not([responsive="false"])';
  
  function enhanceTabLink(link) {
      var $thisLink = (0, _jquery2.default)(link);
      var targetPane = $thisLink.attr('href');
  
      (0, _addId2.default)($thisLink);
      $thisLink.attr('role', 'tab');
      (0, _jquery2.default)(targetPane).attr('aria-labelledby', $thisLink.attr('id'));
  
      if ($thisLink.parent().hasClass('active-tab')) {
          $thisLink.attr('aria-selected', 'true');
      } else {
          $thisLink.attr('aria-selected', 'false');
      }
  }
  
  var ResponsiveAdapter = {
      totalTabsWidth: function totalTabsWidth($visibleTabs, $dropdown) {
          var totalVisibleTabsWidth = this.totalVisibleTabWidth($visibleTabs);
          var totalDropdownTabsWidth = 0;
  
          $dropdown.find('li').each(function (index, tab) {
              totalDropdownTabsWidth += parseInt(tab.getAttribute('data-aui-tab-width'));
          });
  
          return totalVisibleTabsWidth + totalDropdownTabsWidth;
      },
  
      totalVisibleTabWidth: function totalVisibleTabWidth($tabs) {
          var totalWidth = 0;
  
          $tabs.each(function (index, tab) {
              totalWidth += (0, _jquery2.default)(tab).outerWidth();
          });
  
          return totalWidth;
      },
  
      removeResponsiveDropdown: function removeResponsiveDropdown($dropdown, $dropdownTriggerTab) {
          $dropdown.remove();
          $dropdownTriggerTab.remove();
      },
  
      createResponsiveDropdownTrigger: function createResponsiveDropdownTrigger($tabsMenu, id) {
          var triggerMarkup = '<li class="menu-item aui-tabs-responsive-trigger-item">' + '<a class="aui-dropdown2-trigger aui-tabs-responsive-trigger aui-dropdown2-trigger-arrowless" id="aui-tabs-responsive-trigger-' + id + '" aria-haspopup="true" aria-controls="aui-tabs-responsive-dropdown-' + id + '" href="aui-tabs-responsive-dropdown-' + id + '">...</a>' + '</li>';
          $tabsMenu.append(triggerMarkup);
          var $trigger = $tabsMenu.find('.aui-tabs-responsive-trigger-item');
          return $trigger;
      },
  
      createResponsiveDropdown: function createResponsiveDropdown($tabsContainer, id) {
          var dropdownMarkup = '<div class="aui-dropdown2 aui-style-default aui-tabs-responsive-dropdown" id="aui-tabs-responsive-dropdown-' + id + '">' + '<ul>' + '</ul>' + '</div>';
          $tabsContainer.append(dropdownMarkup);
          var $dropdown = $tabsContainer.find('#aui-tabs-responsive-dropdown-' + id);
          return $dropdown;
      },
  
      findNewVisibleTabs: function findNewVisibleTabs(tabs, parentWidth, dropdownTriggerTabWidth) {
          function hasMoreSpace(currentTotalTabWidth, dropdownTriggerTabWidth, parentWidth) {
              return currentTotalTabWidth + dropdownTriggerTabWidth <= parentWidth;
          }
  
          var currentTotalTabWidth = 0;
  
          for (var i = 0; hasMoreSpace(currentTotalTabWidth, dropdownTriggerTabWidth, parentWidth) && i < tabs.length; i++) {
              var $tab = (0, _jquery2.default)(tabs[i]);
              var tabWidth = $tab.outerWidth(true);
              currentTotalTabWidth += tabWidth;
          }
  
          // i should now be at the tab index after the last visible tab because of the loop so we minus 1 to get the new visible tabs
          return tabs.slice(0, i - 1);
      },
  
      moveVisibleTabs: function moveVisibleTabs(oldVisibleTabs, $tabsParent, $dropdownTriggerTab) {
          var dropdownId = $dropdownTriggerTab.find('a').attr('aria-controls');
          var $dropdown = (0, _jquery2.default)('#' + dropdownId);
          var newVisibleTabs = this.findNewVisibleTabs(oldVisibleTabs, $tabsParent.outerWidth(), $dropdownTriggerTab.parent().outerWidth(true));
          var lastTabIndex = newVisibleTabs.length - 1;
  
          for (var j = oldVisibleTabs.length - 1; j >= lastTabIndex; j--) {
              var $tab = (0, _jquery2.default)(oldVisibleTabs[j]);
              this.moveTabToResponsiveDropdown($tab, $dropdown, $dropdownTriggerTab);
          }
  
          return (0, _jquery2.default)(newVisibleTabs);
      },
  
      moveTabToResponsiveDropdown: function moveTabToResponsiveDropdown($tab, $dropdown, $dropdownTriggerTab) {
          var $tabLink = $tab.find('a');
  
          $tab.attr('data-aui-tab-width', $tab.outerWidth(true));
          $tabLink.addClass('aui-dropdown2-radio aui-tabs-responsive-item');
  
          if ($tab.hasClass('active-tab')) {
              $tabLink.addClass('aui-dropdown2-checked');
              $dropdownTriggerTab.addClass('active-tab');
          }
  
          $dropdown.find('ul').prepend($tab);
      },
  
      moveInvisibleTabs: function moveInvisibleTabs(tabsInDropdown, remainingSpace, $dropdownTriggerTab) {
          function hasMoreSpace(remainingSpace) {
              return remainingSpace > 0;
          }
  
          for (var i = 0; hasMoreSpace(remainingSpace) && i < tabsInDropdown.length; i++) {
              var $tab = (0, _jquery2.default)(tabsInDropdown[i]);
              var tabInDropdownWidth = parseInt($tab.attr('data-aui-tab-width'), 10);
              var shouldMoveTabOut = tabInDropdownWidth < remainingSpace;
  
              if (shouldMoveTabOut) {
                  this.moveTabOutOfDropdown($tab, $dropdownTriggerTab);
              }
  
              remainingSpace -= tabInDropdownWidth;
          }
      },
  
      moveTabOutOfDropdown: function moveTabOutOfDropdown($tab, $dropdownTriggerTab) {
          var isTabInDropdownActive = $tab.find('a').hasClass('aui-dropdown2-checked');
  
          if (isTabInDropdownActive) {
              $tab.addClass('active-tab');
              $dropdownTriggerTab.removeClass('active-tab');
          }
  
          $tab.children('a').removeClass('aui-dropdown2-radio aui-tabs-responsive-item aui-dropdown2-checked');
          $dropdownTriggerTab.before($tab);
      }
  };
  
  // this function is run by jquery .each() where 'this' is the current tabs container
  function calculateResponsiveTabs(tabsContainer, index) {
      var $tabsContainer = (0, _jquery2.default)(tabsContainer);
      var $tabsMenu = $tabsContainer.find('.tabs-menu').first();
      var $visibleTabs = $tabsMenu.find('li:not(.aui-tabs-responsive-trigger-item)');
      var $dropdownTriggerTab = $tabsMenu.find('.aui-tabs-responsive-trigger').parent();
      var $dropdownTrigger = $dropdownTriggerTab.find('a');
      var dropdownId = $dropdownTrigger.attr('aria-controls');
      var $dropdown = (0, _jquery2.default)(document).find('#' + dropdownId).attr('aria-checked', false);
      var isResponsive = $dropdown.length > 0;
      var totalTabsWidth = ResponsiveAdapter.totalTabsWidth($visibleTabs, $dropdown);
      var needsResponsive = totalTabsWidth > $tabsContainer.outerWidth();
  
      if (!isResponsive && needsResponsive) {
          $dropdownTriggerTab = ResponsiveAdapter.createResponsiveDropdownTrigger($tabsMenu, index);
          $dropdown = ResponsiveAdapter.createResponsiveDropdown($tabsContainer, index);
      }
  
      // reset id's in case tabs have changed DOM order
      $dropdownTrigger.attr('aria-controls', 'aui-tabs-responsive-dropdown-' + index);
      $dropdownTrigger.attr('id', 'aui-tabs-responsive-trigger-' + index);
      $dropdownTrigger.attr('href', 'aui-tabs-responsive-trigger-' + index);
      $dropdown.attr('id', 'aui-tabs-responsive-dropdown-' + index);
  
      if (needsResponsive) {
          var $newVisibleTabs = ResponsiveAdapter.moveVisibleTabs($visibleTabs.toArray(), $tabsContainer, $dropdownTriggerTab);
          var visibleTabWidth = ResponsiveAdapter.totalVisibleTabWidth($newVisibleTabs);
          var remainingSpace = $tabsContainer.outerWidth() - visibleTabWidth - $dropdownTriggerTab.outerWidth(true);
          var hasSpace = remainingSpace > 0;
  
          if (hasSpace) {
              var $tabsInDropdown = $dropdown.find('li');
              ResponsiveAdapter.moveInvisibleTabs($tabsInDropdown.toArray(), remainingSpace, $dropdownTriggerTab);
          }
  
          $dropdown.on('click', 'a', handleTabClick);
  
          /* Workaround for bug in Edge where the dom is just not being re-rendered properly
          It is only triggered for certain widths. Simply taking the element out of the DOM
          and placing it back in causes the browser to re-render, hiding the issue.
          added from AUI-4098 and to be revisited in AUI-4117*/
          if ($tabsMenu.is(':visible')) {
              $tabsMenu.hide().show();
          }
      }
  
      if (isResponsive && !needsResponsive) {
          $dropdown.find('li').each(function () {
              ResponsiveAdapter.moveTabOutOfDropdown((0, _jquery2.default)(this), $dropdownTriggerTab);
          });
          ResponsiveAdapter.removeResponsiveDropdown($dropdown, $dropdownTriggerTab);
      }
  }
  
  function switchToTab(tab) {
      var $tab = (0, _jquery2.default)(tab);
  
      // This probably isn't needed anymore. Remove once confirmed.
      if ($tab.hasClass('aui-tabs-responsive-trigger')) {
          return;
      }
  
      var $pane = (0, _jquery2.default)($tab.attr('href').match(REGEX)[0]);
  
      $pane.addClass('active-pane').attr('aria-hidden', 'false').siblings('.tabs-pane').removeClass('active-pane').attr('aria-hidden', 'true');
  
      var $dropdownTriggerTab = $tab.parents('.aui-tabs').find('.aui-tabs-responsive-trigger-item a');
      var dropdownId = $dropdownTriggerTab.attr('aria-controls');
      var $dropdown = (0, _jquery2.default)(document).find('#' + dropdownId);
  
      $dropdown.find('li a').attr('aria-checked', false).removeClass('checked aui-dropdown2-checked');
      $dropdown.find('li').removeClass('active-tab');
  
      $tab.parent('li.menu-item').addClass('active-tab').siblings('.menu-item').removeClass('active-tab');
  
      if ($tab.hasClass('aui-tabs-responsive-item')) {
          var $visibleTabs = $pane.parent('.aui-tabs').find('li.menu-item:not(.aui-tabs-responsive-trigger-item)');
  
          $visibleTabs.removeClass('active-tab');
          $visibleTabs.find('a').removeClass('checked').removeAttr('aria-checked');
      }
  
      if ($tab.hasClass('aui-tabs-responsive-item')) {
          $pane.parent('.aui-tabs').find('li.menu-item.aui-tabs-responsive-trigger-item').addClass('active-tab');
      }
  
      $tab.closest('.tabs-menu').find('a').attr('aria-selected', 'false');
      $tab.attr('aria-selected', 'true');
      $tab.trigger('tabSelect', {
          tab: $tab,
          pane: $pane
      });
  }
  
  function isPersistentTabGroup($tabGroup) {
      // Tab group persistent attribute exists and is not false
      return $tabGroup.attr('data-aui-persist') !== undefined && $tabGroup.attr('data-aui-persist') !== 'false';
  }
  
  function createPersistentKey($tabGroup) {
      var tabGroupId = $tabGroup.attr('id');
      var value = $tabGroup.attr('data-aui-persist');
  
      return STORAGE_PREFIX + (tabGroupId ? tabGroupId : '') + (value && value !== 'true' ? '-' + value : '');
  }
  
  /* eslint max-depth: 1 */
  function updateTabsFromLocalStorage($tabGroups) {
      for (var i = 0, ii = $tabGroups.length; i < ii; i++) {
          var $tabGroup = $tabGroups.eq(i);
          var tabs = $tabGroups.get(i);
  
          if (isPersistentTabGroup($tabGroup) && window.localStorage) {
              var tabGroupId = $tabGroup.attr('id');
  
              if (tabGroupId) {
                  var persistentTabId = window.localStorage.getItem(createPersistentKey($tabGroup));
  
                  if (persistentTabId) {
                      var anchor = tabs.querySelector('a[href$="' + persistentTabId + '"]');
  
                      if (anchor) {
                          switchToTab(anchor);
                      }
                  }
              } else {
                  logger.warn('A tab group must specify an id attribute if it specifies data-aui-persist.');
              }
          }
      }
  }
  
  function updateLocalStorageEntry($tab) {
      var $tabGroup = $tab.closest('.aui-tabs');
      var tabGroupId = $tabGroup.attr('id');
  
      if (tabGroupId) {
          var tabId = $tab.attr('href');
  
          if (tabId) {
              window.localStorage.setItem(createPersistentKey($tabGroup), tabId);
          }
      } else {
          logger.warn('A tab group must specify an id attribute if it specifies data-aui-persist.');
      }
  }
  
  function handleTabClick(e) {
      tabs.change((0, _jquery2.default)(e.target).closest('a'));
  
      if (e) {
          e.preventDefault();
      }
  }
  
  function responsiveResizeHandler(tabs) {
      tabs.forEach(function (tab, index) {
          calculateResponsiveTabs(tab, index);
      });
  }
  
  // Initialisation
  // --------------
  
  function getTabs() {
      return (0, _jquery2.default)('.aui-tabs:not(.aui-tabs-disabled)');
  }
  
  function getResponsiveTabs() {
      return (0, _jquery2.default)(RESPONSIVE_OPT_IN_SELECTOR).toArray();
  }
  
  function initWindow() {
      var debounced = (0, _debounce2.default)(responsiveResizeHandler, 200);
      var responsive = getResponsiveTabs();
  
      responsiveResizeHandler(responsive);
  
      (0, _jquery2.default)(window).resize(function () {
          debounced(responsive);
      });
  }
  
  function initTab(tab) {
      var $tab = (0, _jquery2.default)(tab);
  
      tab.setAttribute('role', 'application');
  
      if (!$tab.data('aui-tab-events-bound')) {
          var $tabMenu = $tab.children('ul.tabs-menu');
  
          // ARIA setup
          $tabMenu.attr('role', 'tablist');
  
          // ignore the LIs so tab count is announced correctly
          $tabMenu.children('li').attr('role', 'presentation');
          $tabMenu.find('> .menu-item a').each(function () {
              enhanceTabLink(this);
          });
  
          // Set up click event for tabs
          $tabMenu.on('click', 'a', handleTabClick);
          $tab.data('aui-tab-events-bound', true);
  
          initPanes(tab);
      }
  }
  
  function initTabs() {
      var tabs = getTabs();
  
      tabs.each(function () {
          initTab(this);
      });
  
      updateTabsFromLocalStorage(tabs);
  }
  
  function initPane(pane) {
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-hidden', (0, _jquery2.default)(pane).hasClass('active-pane') ? 'false' : 'true');
  }
  
  function initPanes(tab) {
      [].slice.call(tab.querySelectorAll('.tabs-pane')).forEach(initPane);
  }
  
  function initVerticalTabs() {
      // Vertical tab truncation setup (adds title if clipped)
      (0, _jquery2.default)('.aui-tabs.vertical-tabs').find('a').each(function () {
          var thisTab = (0, _jquery2.default)(this);
  
          // don't override existing titles
          if (!thisTab.attr('title')) {
              // if text has been truncated, add title
              if ((0, _isClipped2.default)(thisTab)) {
                  thisTab.attr('title', thisTab.text());
              }
          }
      });
  }
  
  var tabs = {
      setup: function setup() {
          initWindow();
          initTabs();
          initVerticalTabs();
      },
  
      change: function change(a) {
          var $a = (0, _jquery2.default)(a);
          var $tabGroup = $a.closest('.aui-tabs');
  
          switchToTab($a);
  
          if (isPersistentTabGroup($tabGroup) && window.localStorage) {
              updateLocalStorageEntry($a);
          }
      }
  };
  
  (0, _jquery2.default)(tabs.setup);
  
  // Web Components
  // --------------
  
  function findComponent(element) {
      return (0, _jquery2.default)(element).closest('aui-tabs').get(0);
  }
  
  function findPanes(tabs) {
      return tabs.querySelectorAll('aui-tabs-pane');
  }
  
  function findTabs(tabs) {
      return tabs.querySelectorAll('li[is=aui-tabs-tab]');
  }
  
  (0, _skate2.default)('aui-tabs', {
      created: function created(element) {
          (0, _jquery2.default)(element).addClass('aui-tabs horizontal-tabs');
  
          // We must initialise here so that the old code still works since
          // the lifecycle of the sub-components setup the markup so that it
          // can be processed by the old logic.
          _skate2.default.init(element);
  
          // Use the old logic to initialise the tabs.
          initTab(element);
      },
      template: template('<ul class="tabs-menu">', '<content select="li[is=aui-tabs-tab]"></content>', '</ul>', '<content select="aui-tabs-pane"></content>'),
      prototype: {
          select: function select(element) {
              var index = (0, _jquery2.default)(findPanes(this)).index(element);
  
              if (index > -1) {
                  tabs.change(findTabs(this)[index].children[0]);
              }
  
              return this;
          }
      }
  });
  
  var Tab = (0, _skate2.default)('aui-tabs-tab', {
      extends: 'li',
      created: function created(element) {
          (0, _jquery2.default)(element).addClass('menu-item');
      },
      template: template('<a href="#">', '<strong>', '<content></content>', '</strong>', '</a>')
  });
  
  (0, _skate2.default)('aui-tabs-pane', {
      attached: function attached(element) {
          var $component = (0, _jquery2.default)(findComponent(element));
          var $element = (0, _jquery2.default)(element);
          var index = $component.find('aui-tabs-pane').index($element);
          var tab = new Tab();
          var $tab = (0, _jquery2.default)(tab);
  
          $element.addClass('tabs-pane');
          tab.firstChild.setAttribute('href', '#' + element.id);
          template.wrap(tab).textContent = $element.attr('title');
  
          if (index === 0) {
              $element.addClass('active-pane');
          }
  
          if ($element.hasClass('active-pane')) {
              $tab.addClass('active-tab');
          }
  
          $element.siblings('ul').append(tab);
      },
      template: template('<content></content>')
  });
  
  (0, _globalize2.default)('tabs', tabs);
  
  exports.default = tabs;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/toggle-class-name.js
(typeof window === 'undefined' ? global : window).__c420a05e11c25eb845523736179494b2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function to toggle class name of an element.
   *
   * @param {String | Element} element The element or an ID to toggle class name on.
   * @param {String} className The class name to remove or add.
   *
   * @returns {undefined}
   */
  function toggleClassName(element, className) {
      if (!(element = (0, _jquery2.default)(element))) {
          return;
      }
  
      element.toggleClass(className);
  }
  
  var toggleClassName = (0, _deprecation.fn)(toggleClassName, 'toggleClassName', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('toggleClassName', toggleClassName);
  
  exports.default = toggleClassName;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/to-init.js
(typeof window === 'undefined' ? global : window).__ba5a7ce6790d1c3ae792c368216bffa8 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Adds functions to the list of methods to be run on initialisation. Wraps
   * error handling around the provided function so its failure won't prevent
   * other init functions running.
   *
   * @param {Function} func Function to be call on initialisation.
   *
   * @return {Object}
   */
  function toInit(func) {
      (0, _jquery2.default)(function () {
          try {
              func.apply(this, arguments);
          } catch (ex) {
              logger.log('Failed to run init function: ' + ex + '\n' + func.toString());
          }
      });
  
      return this;
  }
  
  (0, _globalize2.default)('toInit', toInit);
  
  exports.default = toInit;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/unbind-text-resize.js
(typeof window === 'undefined' ? global : window).__44bcf6c07add060bcccfeba49a3ce6b4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _onTextResize = __7993d85ab19905f85e57d36cb0999580;
  
  var _onTextResize2 = _interopRequireDefault(_onTextResize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function unbindTextResize(f) {
      for (var i = 0, ii = _onTextResize2.default['on-text-resize'].length; i < ii; i++) {
          if (_onTextResize2.default['on-text-resize'][i] === f) {
              return _onTextResize2.default['on-text-resize'].splice(i, 1);
          }
      }
  }
  
  (0, _globalize2.default)('unbindTextResize', unbindTextResize);
  
  exports.default = unbindTextResize;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/jquery/jquery.hotkeys.js
(typeof window === 'undefined' ? global : window).__9d8814c2d651791325671e2fd4ff2ade = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /*
   * Modified by Atlassian to allow chaining of keys
   *
   * jQuery Hotkeys Plugin
   * Copyright 2010, John Resig
   * Dual licensed under the MIT or GPL Version 2 licenses.
   *
   * Based upon the plugin by Tzury Bar Yochay:
   * http://github.com/tzuryby/hotkeys
   *
   * Original idea by:
   * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
  */
  
  (function(jQuery){
  
      jQuery.hotkeys = {
          version: "0.8",
  
          specialKeys: {
              8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
              20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
              37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
              91 : "meta",
              96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
              104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
              112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
              120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll",
              188: ",", 190: ".", 191: "/", 224: "meta", 219: '[', 221: ']'
          },
  
          // These only work under Mac Gecko when using keypress (see http://unixpapa.com/js/key.html).
          keypressKeys: [ "<", ">", "?" ],
  
          shiftNums: {
              "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
              "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ":", "'": "\"", ",": "<",
              ".": ">",  "/": "?",  "\\": "|"
          }
      };
  
      jQuery.each(jQuery.hotkeys.keypressKeys, function (_, key) {
          jQuery.hotkeys.shiftNums[ key ] = key;
      });
  
      function TimedNumber(timer) {
          this.num = 0;
          this.timer = timer > 0 ? timer : false;
      }
      TimedNumber.prototype.val = function () {
          return this.num;
      };
      TimedNumber.prototype.inc = function () {
          if (this.timer) {
              clearTimeout(this.timeout);
              this.timeout = setTimeout(jQuery.proxy(TimedNumber.prototype.reset, this), this.timer);
          }
          this.num++;
      };
      TimedNumber.prototype.reset = function () {
          if (this.timer) {
              clearTimeout(this.timeout);
          }
          this.num = 0;
      };
  
      function keyHandler( handleObj ) {
          // Only care when a possible input has been specified
          if ( !(jQuery.isPlainObject(handleObj.data) || jQuery.isArray(handleObj.data) || typeof handleObj.data === "string") ) {
              return;
          }
  
          var origHandler = handleObj.handler,
              options = {
                  timer: 700,
                  combo: []
              };
  
          (function (data) {
              if (typeof data === 'string') {
                  options.combo = [ data ];
              } else if (jQuery.isArray(data)) {
                  options.combo = data;
              } else {
                  jQuery.extend(options, data);
              }
              options.combo = jQuery.map(options.combo, function (key) {
                  return key.toLowerCase();
              });
          })(handleObj.data);
  
          handleObj.index = new TimedNumber(options.timer);
          handleObj.handler = function( event ) {
              // Don't fire in text-accepting inputs that we didn't directly bind to
              if (this !== event.target && (/textarea|select|input/i.test(event.target.nodeName))){
                  return;
              }
  
              // Keypress represents characters, not special keys
              var special = event.type !== 'keypress' ? jQuery.hotkeys.specialKeys[ event.which ] : null,
                  character = String.fromCharCode( event.which ).toLowerCase(),
                  key, modif = "", possible = {};
  
              // check combinations (alt|ctrl|shift+anything)
              if ( event.altKey && special !== "alt" ) {
                  modif += "alt+";
              }
  
              if ( event.ctrlKey && special !== "ctrl" ) {
                  modif += "ctrl+";
              }
  
              // TODO: Need to make sure this works consistently across platforms
              if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
                  modif += "meta+";
              }
  
              if ( event.shiftKey && special !== "shift" ) {
                  modif += "shift+";
              }
  
              // Under Chrome and Safari, meta's keycode == '['s charcode
              // Even if they did type this key combo we could not use it because it is browser back in Chrome/Safari on OS X
              if (event.metaKey && character === '[') {
                  character = null;
              }
  
              if (special) {
                  possible[ modif + special ] = true;
              }
              if (character) {
                  possible[ modif + character ] = true;
              }
  
              // "$" can be specified as "shift+4" or "$"
              if ( /shift+/.test(modif) ) {
                  possible [ modif.replace('shift+', '') + jQuery.hotkeys.shiftNums[ (special || character) ] ] = true;
              }
  
              var index = handleObj.index,
                  combo = options.combo;
  
              if ( pressed(combo[index.val()], possible) ) {
                  if ( index.val() === combo.length - 1 ) {
                      index.reset();
                      return origHandler.apply(this, arguments);
                  } else {
                      index.inc();
                  }
              } else {
                  index.reset();
                  // For mutli-key combinations, we might have restarted the key sequence.
                  if ( pressed(combo[0], possible) ) {
                      index.inc();
                  }
              }
          };
      }
  
      function pressed(key, possible) {
          var keys = key.split(' ');
          for (var i = 0, len = keys.length; i < len; i++) {
              if ( possible[keys[i]] ) {
                  return true;
              }
          }
          return false;
      }
  
      jQuery.each([ "keydown", "keyup", "keypress" ], function() {
          jQuery.event.special[ this ] = { add: keyHandler };
      });
  
  })( jQuery );
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/when-i-type.js
(typeof window === 'undefined' ? global : window).__28e4efe4472a2cec72985d259674db56 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __9d8814c2d651791325671e2fd4ff2ade;
  
  __55cc9a6466186ba6dac3b7d90666eefa;
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _dialog = __8eca5e5171c0c22be18ea931ed65c747;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _browser = __5e80b2d38fa1ffdd67aa3d521738d499;
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _underscore = __922acd0053a6de3ea4c53d8902766ab6;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var isMac = navigator.platform.indexOf('Mac') !== -1;
  var multiCharRegex = /^(backspace|tab|r(ight|eturn)|s(hift|pace|croll)|c(trl|apslock)|alt|pa(use|ge(up|down))|e(sc|nd)|home|left|up|d(el|own)|insert|f\d\d?|numlock|meta)/i;
  
  /**
   * Trigger native click event.
   * @param $el
   */
  var triggerClickEvent = function triggerClickEvent($el) {
      var element = $el[0];
  
      // if we find the element and Native MouseEvents are available, change it!
      if (element && 'MouseEvent' in window) {
          // Native event bubbles are compatible with Synthetic Event from React
          var event = void 0;
          var bubbles = true;
          var cancelable = true;
          if ((0, _browser.supportsNewMouseEvent)()) {
              event = new MouseEvent('click', { bubbles: bubbles, cancelable: cancelable });
          } else {
              // `document.createEvent` is deprecated and may be removed by some browsers in future
              // (https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent).
              // As of 2016-12-28, all browsers still support `document.createEvent`
              event = document.createEvent('MouseEvent');
              event.initEvent('click', bubbles, cancelable);
          }
  
          element.dispatchEvent(event);
      } else {
          // otherwise just use the original jquery code.
          $el.trigger('click');
      }
  };
  
  /**
   * Keyboard commands with syntactic sugar.
   *
   * <strong>Usage:</strong>
   * <pre>
   * whenIType("gh").or("gd").goTo("/secure/Dashboard.jspa");
   * whenIType("c").click("#create_link");
   * </pre>
   *
   * @param keys - Key combinations, modifier keys are "+" deliminated. e.g "ctrl+b"
   */
  function whenIType(keys) {
      var boundKeyCombos = [];
      var executor = _jquery2.default.Callbacks();
  
      function keypressHandler(e) {
          if (!_dialog.popup.current && executor) {
              executor.fire(e);
          }
      }
  
      function defaultPreventionHandler(e) {
          e.preventDefault();
      }
  
      // Bind an arbitrary set of keys by calling bindKeyCombo on each triggering key combo.
      // A string like "abc 123" means (a then b then c) OR (1 then 2 then 3). abc is one key combo, 123 is another.
      function bindKeys(keys) {
          var keyCombos = keys && keys.split ? _jquery2.default.trim(keys).split(' ') : [keys];
  
          keyCombos.forEach(function (keyCombo) {
              bindKeyCombo(keyCombo);
          });
      }
  
      function hasUnprintables(keysArr) {
          // a bit of a heuristic, but works for everything we have. Only the unprintable characters are represented with > 1-character names.
          var i = keysArr.length;
          while (i--) {
              if (keysArr[i].length > 1 && keysArr[i] !== 'space') {
                  return true;
              }
          }
          return false;
      }
  
      // bind a single key combo to this handler
      // A string like "abc 123" means (a then b then c) OR (1 then 2 then 3). abc is one key combo, 123 is another.
      function bindKeyCombo(keyCombo) {
          var keysArr = keyCombo instanceof Array ? keyCombo : keyComboArrayFromString(keyCombo.toString());
          var eventType = hasUnprintables(keysArr) ? 'keydown' : 'keypress';
  
          boundKeyCombos.push(keysArr);
          (0, _jquery2.default)(document).bind(eventType, keysArr, keypressHandler);
  
          // Override browser/plugins
          (0, _jquery2.default)(document).bind(eventType + ' keyup', keysArr, defaultPreventionHandler);
      }
  
      // parse out an array of (modifier+key) presses from a single string
      // e.g. "12ctrl+3" becomes [ "1", "2", "ctrl+3" ]
      function keyComboArrayFromString(keyString) {
          var keysArr = [];
          var currModifiers = '';
  
          while (keyString.length) {
              var modifierMatch = keyString.match(/^(ctrl|meta|shift|alt)\+/i);
              var multiCharMatch = keyString.match(multiCharRegex);
  
              if (modifierMatch) {
                  currModifiers += modifierMatch[0];
                  keyString = keyString.substring(modifierMatch[0].length);
              } else if (multiCharMatch) {
                  keysArr.push(currModifiers + multiCharMatch[0]);
                  keyString = keyString.substring(multiCharMatch[0].length);
                  currModifiers = '';
              } else {
                  keysArr.push(currModifiers + keyString[0]);
                  keyString = keyString.substring(1);
                  currModifiers = '';
              }
          }
  
          return keysArr;
      }
  
      function addShortcutsToTitle(selector) {
          var elem = (0, _jquery2.default)(selector);
          var title = elem.attr('title') || '';
          var keyCombos = boundKeyCombos.slice();
          var existingCombos = elem.data('boundKeyCombos') || [];
          var shortcutInstructions = elem.data('kbShortcutAppended') || '';
          var isFirst = !shortcutInstructions;
          var originalTitle = isFirst ? title : title.substring(0, title.length - shortcutInstructions.length);
  
          while (keyCombos.length) {
              var keyCombo = keyCombos.shift();
              var comboAlreadyExists = existingCombos.some(function (existingCombo) {
                  return _underscore2.default.isEqual(keyCombo, existingCombo);
              });
              if (!comboAlreadyExists) {
                  shortcutInstructions = appendKeyComboInstructions(keyCombo.slice(), shortcutInstructions, isFirst);
                  isFirst = false;
              }
          }
  
          if (isMac) {
              shortcutInstructions = shortcutInstructions.replace(/Meta/ig, '\u2318') //Apple cmd key
              .replace(/Shift/ig, '\u21E7'); //Apple Shift symbol
          }
  
          elem.attr('title', originalTitle + shortcutInstructions);
          elem.data('kbShortcutAppended', shortcutInstructions);
          elem.data('boundKeyCombos', existingCombos.concat(boundKeyCombos));
      }
  
      function removeShortcutsFromTitle(selector) {
          var elem = (0, _jquery2.default)(selector);
          var shortcuts = elem.data('kbShortcutAppended');
  
          if (!shortcuts) {
              return;
          }
  
          var title = elem.attr('title');
          elem.attr('title', title.replace(shortcuts, ''));
          elem.removeData('kbShortcutAppended');
          elem.removeData('boundKeyCombos');
      }
  
      //
      function appendKeyComboInstructions(keyCombo, title, isFirst) {
          if (isFirst) {
              title += ' (' + AJS.I18n.getText('aui.keyboard.shortcut.type.x', keyCombo.shift());
          } else {
              title = title.replace(/\)$/, '');
              title += AJS.I18n.getText('aui.keyboard.shortcut.or.x', keyCombo.shift());
          }
  
          keyCombo.forEach(function (key) {
              title += ' ' + AJS.I18n.getText('aui.keyboard.shortcut.then.x', key);
          });
          title += ')';
  
          return title;
      }
  
      bindKeys(keys);
  
      return whenIType.makeShortcut({
          executor: executor,
          bindKeys: bindKeys,
          addShortcutsToTitle: addShortcutsToTitle,
          removeShortcutsFromTitle: removeShortcutsFromTitle,
          keypressHandler: keypressHandler,
          defaultPreventionHandler: defaultPreventionHandler
      });
  }
  
  whenIType.makeShortcut = function (options) {
      var executor = options.executor;
      var bindKeys = options.bindKeys;
      var addShortcutsToTitle = options.addShortcutsToTitle;
      var removeShortcutsFromTitle = options.removeShortcutsFromTitle;
      var keypressHandler = options.keypressHandler;
      var defaultPreventionHandler = options.defaultPreventionHandler;
  
      var selectorsWithTitlesModified = [];
  
      function makeMoveToFunction(getNewFocus) {
          return function (selector, options) {
              options = options || {};
              var focusedClass = options.focusedClass || 'focused';
              var wrapAround = options.hasOwnProperty('wrapAround') ? options.wrapAround : true;
              var escToCancel = options.hasOwnProperty('escToCancel') ? options.escToCancel : true;
  
              executor.add(function () {
  
                  var $items = (0, _jquery2.default)(selector);
                  var $focusedElem = $items.filter('.' + focusedClass);
                  var moveToOptions = $focusedElem.length === 0 ? undefined : { transition: true };
  
                  if (escToCancel) {
                      (0, _jquery2.default)(document).one('keydown', function (e) {
                          if (e.keyCode === _keyCode2.default.ESCAPE && $focusedElem) {
                              $focusedElem.removeClass(focusedClass);
                          }
                      });
                  }
  
                  if ($focusedElem.length) {
                      $focusedElem.removeClass(focusedClass);
                  }
  
                  $focusedElem = getNewFocus($focusedElem, $items, wrapAround);
  
                  if ($focusedElem && $focusedElem.length > 0) {
                      $focusedElem.addClass(focusedClass);
                      $focusedElem.moveTo(moveToOptions);
                      if ($focusedElem.is('a')) {
                          $focusedElem.focus();
                      } else {
                          $focusedElem.find('a:first').focus();
                      }
                  }
              });
              return this;
          };
      }
  
      return {
  
          /**
           * Scrolls to and adds <em>focused</em> class to the next item in the jQuery collection
           *
           * @method moveToNextItem
           * @param selector
           * @param options
           * @return {Object}
           */
          moveToNextItem: makeMoveToFunction(function ($focusedElem, $items, wrapAround) {
              var index;
  
              if (wrapAround && $focusedElem.length === 0) {
                  return $items.eq(0);
              } else {
                  index = _jquery2.default.inArray($focusedElem.get(0), $items);
                  if (index < $items.length - 1) {
                      index = index + 1;
                      return $items.eq(index);
                  } else if (wrapAround) {
                      return $items.eq(0);
                  }
              }
  
              return $focusedElem;
          }),
          /**
           * Scrolls to and adds <em>focused</em> class to the previous item in the jQuery collection
           *
           * @method moveToPrevItem
           * @param selector
           * @param focusedClass
           * @return {Object}
           */
          moveToPrevItem: makeMoveToFunction(function ($focusedElem, $items, wrapAround) {
              var index;
              if (wrapAround && $focusedElem.length === 0) {
                  return $items.filter(':last');
              } else {
                  index = _jquery2.default.inArray($focusedElem.get(0), $items);
                  if (index > 0) {
                      index = index - 1;
                      return $items.eq(index);
                  } else if (wrapAround) {
                      return $items.filter(':last');
                  }
              }
  
              return $focusedElem;
          }),
  
          /**
           * Clicks the element specified by the <em>selector</em> argument.
           *
           * @method click
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          click: function click(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function () {
                  var $el = (0, _jquery2.default)(selector);
                  triggerClickEvent($el);
              });
              return this;
          },
  
          /**
           * Navigates to specified <em>location</em>
           *
           * @method goTo
           * @param {String} location - http location
           * @return {Object}
           */
          goTo: function goTo(location) {
              executor.add(function () {
                  window.location.href = location;
              });
              return this;
          },
  
          /**
           * navigates browser window to link href
           *
           * @method followLink
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          followLink: function followLink(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function () {
                  var elem = (0, _jquery2.default)(selector)[0];
                  if (elem && { 'a': true, 'link': true }[elem.nodeName.toLowerCase()]) {
                      window.location.href = elem.href;
                  }
              });
              return this;
          },
  
          /**
           * Executes function
           *
           * @method execute
           * @param {function} func
           * @return {Object}
           */
          execute: function execute(func) {
              var self = this;
              executor.add(function () {
                  func.apply(self, arguments);
              });
              return this;
          },
  
          /**
           * @deprecated This implementation is uncool. Kept around to satisfy Confluence plugin devs in the short term.
           *
           * Executes the javascript provided by the shortcut plugin point _immediately_.
           *
           * @method evaluate
           * @param {Function} command - the function provided by the shortcut key plugin point
           */
          evaluate: function evaluate(command) {
              command.call(this);
          },
  
          /**
           * Scrolls to element if out of view, then clicks it.
           *
           * @method moveToAndClick
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          moveToAndClick: function moveToAndClick(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function () {
                  var $el = (0, _jquery2.default)(selector);
                  if ($el.length > 0) {
                      triggerClickEvent($el);
                      $el.moveTo();
                  }
              });
              return this;
          },
  
          /**
           * Scrolls to element if out of view, then focuses it
           *
           * @method moveToAndFocus
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          moveToAndFocus: function moveToAndFocus(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function (e) {
                  var $elem = (0, _jquery2.default)(selector);
                  if ($elem.length > 0) {
                      $elem.focus();
                      if ($elem.moveTo) {
                          $elem.moveTo();
                      }
                      if ($elem.is(':input')) {
                          e.preventDefault();
                      }
                  }
              });
              return this;
          },
  
          /**
           * Binds additional keyboard controls
           *
           * @method or
           * @param {String} keys - keys to bind
           * @return {Object}
           */
          or: function or(keys) {
              bindKeys(keys);
              return this;
          },
  
          /**
           * Unbinds shortcut keys
           *
           * @method unbind
           */
          unbind: function unbind() {
              (0, _jquery2.default)(document).unbind('keydown keypress', keypressHandler).unbind('keydown keypress keyup', defaultPreventionHandler);
  
              for (var i = 0, len = selectorsWithTitlesModified.length; i < len; i++) {
                  removeShortcutsFromTitle(selectorsWithTitlesModified[i]);
              }
              selectorsWithTitlesModified = [];
          }
      };
  };
  
  /**
   * Creates keyboard commands and their actions from json data. Format looks like:
   *
   * <pre>
   * [
   *   {
   *        "keys":[["g", "d"]],
   *        "context":"global",
   *        "op":"followLink",
   *        "param":"#home_link"
   *    },
   *    {
   *        "keys":[["g", "i"]],
   *        "context":"global",
   *        "op":"followLink",
   *        "param":"#find_link"
   *    },
   *    {
   *        "keys":[["/"]],
   *        "context":"global",
   *        "op":"moveToAndFocus",
   *        "param":"#quickSearchInput"
   *    },
   *    {
   *        "keys":[["c"]],
   *        "context":"global",
   *        "op":"moveToAndClick",
   *        "param":"#create_link"
   *    }
   * ]
   * </pre>
   *
   * @method fromJSON
   * @static
   * @param json
   */
  whenIType.fromJSON = function (json, switchCtrlToMetaOnMac) {
      var shortcuts = [];
  
      if (json) {
          _jquery2.default.each(json, function (i, item) {
              var operation = item.op;
              var param = item.param;
              var params = void 0;
  
              if (operation === 'execute' || operation === 'evaluate') {
                  // need to turn function string into function object
                  params = [new Function(param)];
              } else if (/^\[[^\]\[]*,[^\]\[]*\]$/.test(param)) {
                  // pass in an array to send multiple params
                  try {
                      params = JSON.parse(param);
                  } catch (e) {
                      logger.error('When using a parameter array, array must be in strict JSON format: ' + param);
                  }
  
                  if (!_jquery2.default.isArray(params)) {
                      logger.error('Badly formatted shortcut parameter. String or JSON Array of parameters required: ' + param);
                  }
              } else {
                  params = [param];
              }
  
              _jquery2.default.each(item.keys, function () {
  
                  var shortcutList = this;
                  if (switchCtrlToMetaOnMac && isMac) {
                      shortcutList = _jquery2.default.map(shortcutList, function (shortcutString) {
                          return shortcutString.replace(/ctrl/i, 'meta');
                      });
                  }
  
                  var newShortcut = whenIType(shortcutList);
                  newShortcut[operation].apply(newShortcut, params);
                  shortcuts.push(newShortcut);
              });
          });
      }
  
      return shortcuts;
  };
  
  // Trigger this event on an iframe if you want its keypress events to be propagated (Events to work in iframes).
  (0, _jquery2.default)(document).bind('iframeAppended', function (e, iframe) {
      (0, _jquery2.default)(iframe).load(function () {
          var target = (0, _jquery2.default)(iframe).contents();
  
          target.bind('keyup keydown keypress', function (e) {
              // safari propagates keypress events from iframes
              if (_jquery2.default.browser.safari && e.type === 'keypress') {
                  return;
              }
  
              if (!(0, _jquery2.default)(e.target).is(':input')) {
                  _jquery2.default.event.trigger(e, arguments, // Preserve original event data.
                  document, // Bubble this event from the iframe's document to its parent document.
                  true // Use the capturing phase to preserve original event.target.
                  );
              }
          });
      });
  });
  
  (0, _globalize2.default)('whenIType', whenIType);
  
  exports.default = whenIType;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/version.js
(typeof window === 'undefined' ? global : window).__399d6bb24e6280e2241deb4e98d541ff = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var version = '6.0.4';
  
  (0, _globalize2.default)('version', version);
  
  exports.default = version;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/setup.js
(typeof window === 'undefined' ? global : window).__9e53ace664f2009a19d8a8d4adf77670 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _populateParameters = __0210cf71af3a1c7fcbb0f421af87d03c;
  
  var _populateParameters2 = _interopRequireDefault(_populateParameters);
  
  var _version = __399d6bb24e6280e2241deb4e98d541ff;
  
  var _version2 = _interopRequireDefault(_version);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // Set the version.
  // Global setup that used to be in the main AJS namespace file.
  
  (0, _jquery2.default)(function () {
      var $body = (0, _jquery2.default)('body');
  
      if (!$body.data('auiVersion')) {
          $body.attr('data-aui-version', _version2.default);
      }
  
      (0, _populateParameters2.default)();
  });
  
  // Setting Traditional to handle our default param serialisation.
  // See http://api.jquery.com/jQuery.param/ for more information.
  _jquery2.default.ajaxSettings.traditional = true;
  (0, _globalize2.default)('$', _jquery2.default);
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui.js
(typeof window === 'undefined' ? global : window).__2a3851548b439fef56cc0d18ab878624 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  __935a5cbb862450a49a36c8831ebb8846;
  
  __6b53202d7e5920f946b3003fd2037f67;
  
  __9046514ee4273e195fc535faaba755b5;
  
  __55cc9a6466186ba6dac3b7d90666eefa;
  
  __74896855d42a16a84b35c202ab5bc9b4;
  
  __8eca5e5171c0c22be18ea931ed65c747;
  
  __bf6c7c62de0eb613e0ab12d56d9a6197;
  
  __1a99a68c34e660050a094f87fb28903d;
  
  __05b42b82bab2942063ea875333a900bb;
  
  __cf890abdf040e0993fb71f2f839bc972;
  
  __594942bfcf520d6e5a0843b1cfdd039a;
  
  __a2065e31477708e50a18b50a0ede61c2;
  
  __6ccb0f8a73a13028d85029aeb628b44d;
  
  __b7458c300fca6582c4952fdcceceaf52;
  
  __6160ee95bf90760449be557c1758e3db;
  
  __3991070589efec7bdc39ed4cd105d896;
  
  __68009f2830334905101f253fcd1d7207;
  
  __a2c859f35719ca3425471df788438a74;
  
  __7d40391c96767a3290496e157f1428e1;
  
  __05701638a79b5b92cc62cfe475ac143b;
  
  __7e7d65e26f310fe6f23f29f57edf55c9;
  
  __d909216fe400315d9bcd3c1a7748d78f;
  
  __92d9a6fcc35a9e99b2baea240928a821;
  
  __1c9e0b237fd336437964bc9b6dfa74ba;
  
  __57111a90131a66c211cf7209c7270167;
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  __9fa5e8acd81f0f9028180b8fcdcd9cb4;
  
  __2396162f5ca62936e832b63581d0b02d;
  
  __d350fbd2bc40ef24a63df8309bff4162;
  
  __8a05e920b7d8181524465449ac7de6d2;
  
  __2883f62e804d6ae6a52910b6c4a55520;
  
  __be88e4b5c5dd8d343902ce7534076e13;
  
  __2c1b431bb110038d1c7590dfbddac12c;
  
  __509557c937caa8763def39004fcf3193;
  
  __fe0cd0a7ef176e2ef4e0e105d1ce31f5;
  
  __5530e5d8d41ad2f3690318a3191759ae;
  
  __7f014f4563f4730ba724da8ae59dfe98;
  
  __ae9d29286cb1bf270e0b6093684e6bea;
  
  __7993d85ab19905f85e57d36cb0999580;
  
  __0210cf71af3a1c7fcbb0f421af87d03c;
  
  __0a2618b4f4b11d46cc024fa7624c6b00;
  
  __3b5a26bdd3080332ee26f12f39993af9;
  
  __2886f8ce6fcbda101b4cfd4ff7250339;
  
  __a6a0829fdd31675ae9bd1ab07593b9aa;
  
  __aeebc1cbc698431a10d11e14e8095d6e;
  
  __528cf2801debf7075d1fc56b34c7b259;
  
  __eb201a36d4829c396b434af7bad3dea4;
  
  __c420a05e11c25eb845523736179494b2;
  
  __ba5a7ce6790d1c3ae792c368216bffa8;
  
  __44bcf6c07add060bcccfeba49a3ce6b4;
  
  __28e4efe4472a2cec72985d259674db56;
  
  __9e53ace664f2009a19d8a8d4adf77670;
  
  exports.default = window.AJS;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/js/aui.js
(typeof window === 'undefined' ? global : window).__926e147e38f62e0612bb8166764a9b91 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  __84e1fe9bfd01961fdb8386c0cdd32066;
  
  var _aui = __2a3851548b439fef56cc0d18ab878624;
  
  var _aui2 = _interopRequireDefault(_aui);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // Fancy File Input is required by the refapp and assumed to be bundled in AUI.
  // It's exposed as a web resource in the plugin.
  // We might want to consider not bundling it.
  exports.default = _aui2.default;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);