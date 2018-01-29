/*!
 * @atlassian/aui - Atlassian User Interface Framework
 * @version v6.0.4
 * @link https://docs.atlassian.com/aui/latest/
 * @license Apache-2.0
 * @author [object Object]
 */
// .tmp/compiled-soy/atlassian-deps.js
(typeof window === 'undefined' ? global : window).__a53df2df65b0ae7b4b04f07d8928a73f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  window.atl_soy = window.atl_soy || {};
  
  atl_soy.concat = function(a, b) {
      // handle arrays
      if (a.concat) {
          return a.concat(b);
      }
  
      //handle object
      var ret = {};
      for (var key in a) if (a.hasOwnProperty(key)) ret[key] = a[key];
      for (var key in b) if (b.hasOwnProperty(key)) ret[key] = b[key];
      return ret;
  };
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/soyutils.js
(typeof window === 'undefined' ? global : window).__c7f0d65a5fb853466c83cd0b8b82cf8e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  goog = window.goog = window.goog || {};
  /*!
   * Copyright 2008 Google Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  
  /**
   * @fileoverview
   * Utility functions and classes for Soy.
   *
   * <p>
   * The top portion of this file contains utilities for Soy users:<ul>
   *   <li> soy.StringBuilder: Compatible with the 'stringbuilder' code style.
   *   <li> soy.renderElement: Render template and set as innerHTML of an element.
   *   <li> soy.renderAsFragment: Render template and return as HTML fragment.
   * </ul>
   *
   * <p>
   * The bottom portion of this file contains utilities that should only be called
   * by Soy-generated JS code. Please do not use these functions directly from
   * your hand-writen code. Their names all start with '$$'.
   *
   * @author Garrett Boyer
   * @author Mike Samuel
   * @author Kai Huang
   * @author Aharon Lanin
   */
  
  
  // COPIED FROM nogoog_shim.js
  
  // Create closure namespaces.
  var goog = goog || {};
  
  /**
   * Reference to the global context.  In most cases this will be 'window'.
   */
  goog.global = this;
  
  COMPILED = true;
  
  /**
   * A hook for overriding the define values in uncompiled mode.
   *
   * In uncompiled mode, {@code CLOSURE_UNCOMPILED_DEFINES} may be defined before
   * loading base.js.  If a key is defined in {@code CLOSURE_UNCOMPILED_DEFINES},
   * {@code goog.define} will use the value instead of the default value.  This
   * allows flags to be overwritten without compilation (this is normally
   * accomplished with the compilers "define" flag).
   *
   * Example:
   * <pre>
   *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
   * </pre>
   *
   * @type {Object<string, (string|number|boolean)>|undefined}
   */
  goog.global.CLOSURE_UNCOMPILED_DEFINES;
  
  /**
   * A hook for overriding the define values in uncompiled or compiled mode,
   * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
   * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
   *
   * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
   * string literals or the compiler will emit an error.
   *
   * While any @define value may be set, only those set with goog.define will be
   * effective for uncompiled code.
   *
   * Example:
   * <pre>
   *   var CLOSURE_DEFINES = {'goog.DEBUG': false} ;
   * </pre>
   *
   * @type {Object<string, (string|number|boolean)>|undefined}
   */
  goog.global.CLOSURE_DEFINES;
  
  
  /**
   * Returns true if the specified value is not undefined.
   * WARNING: Do not use this to test if an object has a property. Use the in
   * operator instead.
   *
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is defined.
   */
  goog.isDef = function(val) {
      // void 0 always evaluates to undefined and hence we do not need to depend on
      // the definition of the global variable named 'undefined'.
      return val !== void 0;
  };
  
  
  /**
   * Builds an object structure for the provided namespace path, ensuring that
   * names that already exist are not overwritten. For example:
   * "a.b.c" -> a = {};a.b={};a.b.c={};
   * Used by goog.provide and goog.exportSymbol.
   * @param {string} name name of the object that this file defines.
   * @param {*=} opt_object the object to expose at the end of the path.
   * @param {Object=} opt_objectToExportTo The object to add the path to; default
   *     is |goog.global|.
   * @private
   */
  goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
      var parts = name.split('.');
      var cur = opt_objectToExportTo || goog.global;
  
      // Internet Explorer exhibits strange behavior when throwing errors from
      // methods externed in this manner.  See the testExportSymbolExceptions in
      // base_test.html for an example.
      if (!(parts[0] in cur) && cur.execScript) {
          cur.execScript('var ' + parts[0]);
      }
  
      // Certain browsers cannot parse code in the form for((a in b); c;);
      // This pattern is produced by the JSCompiler when it collapses the
      // statement above into the conditional loop below. To prevent this from
      // happening, use a for-loop and reserve the init logic as below.
  
      // Parentheses added to eliminate strict JS warning in Firefox.
      for (var part; parts.length && (part = parts.shift());) {
          if (!parts.length && goog.isDef(opt_object)) {
              // last part and we have an object; use it
              cur[part] = opt_object;
          } else if (cur[part]) {
              cur = cur[part];
          } else {
              cur = cur[part] = {};
          }
      }
  };
  
  
  /**
   * Defines a named value. In uncompiled mode, the value is retreived from
   * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
   * has the property specified, and otherwise used the defined defaultValue.
   * When compiled the default can be overridden using the compiler
   * options or the value set in the CLOSURE_DEFINES object.
   *
   * @param {string} name The distinguished name to provide.
   * @param {string|number|boolean} defaultValue
   */
  goog.define = function(name, defaultValue) {
      var value = defaultValue;
      if (!COMPILED) {
          if (goog.global.CLOSURE_UNCOMPILED_DEFINES &&
              Object.prototype.hasOwnProperty.call(
                  goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
              value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
          } else if (goog.global.CLOSURE_DEFINES &&
              Object.prototype.hasOwnProperty.call(
                  goog.global.CLOSURE_DEFINES, name)) {
              value = goog.global.CLOSURE_DEFINES[name];
          }
      }
      goog.exportPath_(name, value);
  };
  
  
  /**
   * @define {boolean} DEBUG is provided as a convenience so that debugging code
   * that should not be included in a production js_binary can be easily stripped
   * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
   * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
   * because they are generally used for debugging purposes and it is difficult
   * for the JSCompiler to statically determine whether they are used.
   */
  goog.DEBUG = true;
  
  
  /**
   * @define {string} LOCALE defines the locale being used for compilation. It is
   * used to select locale specific data to be compiled in js binary. BUILD rule
   * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
   * option.
   *
   * Take into account that the locale code format is important. You should use
   * the canonical Unicode format with hyphen as a delimiter. Language must be
   * lowercase, Language Script - Capitalized, Region - UPPERCASE.
   * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
   *
   * See more info about locale codes here:
   * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
   *
   * For language codes you should use values defined by ISO 693-1. See it here
   * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
   * this rule: the Hebrew language. For legacy reasons the old code (iw) should
   * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
   */
  goog.define('goog.LOCALE', 'en');  // default to en
  
  
  /**
   * @define {boolean} Whether this code is running on trusted sites.
   *
   * On untrusted sites, several native functions can be defined or overridden by
   * external libraries like Prototype, Datejs, and JQuery and setting this flag
   * to false forces closure to use its own implementations when possible.
   *
   * If your JavaScript can be loaded by a third party site and you are wary about
   * relying on non-standard implementations, specify
   * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
   */
  goog.define('goog.TRUSTED_SITE', true);
  
  
  /**
   * @define {boolean} Whether a project is expected to be running in strict mode.
   *
   * This define can be used to trigger alternate implementations compatible with
   * running in EcmaScript Strict mode or warn about unavailable functionality.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
   *
   */
  goog.define('goog.STRICT_MODE_COMPATIBLE', false);
  
  
  /**
   * @define {boolean} Whether code that calls {@link goog.setTestOnly} should
   *     be disallowed in the compilation unit.
   */
  goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);
  
  
  /**
   * Defines a namespace in Closure.
   *
   * A namespace may only be defined once in a codebase. It may be defined using
   * goog.provide() or goog.module().
   *
   * The presence of one or more goog.provide() calls in a file indicates
   * that the file defines the given objects/namespaces.
   * Provided symbols must not be null or undefined.
   *
   * In addition, goog.provide() creates the object stubs for a namespace
   * (for example, goog.provide("goog.foo.bar") will create the object
   * goog.foo.bar if it does not already exist).
   *
   * Build tools also scan for provide/require/module statements
   * to discern dependencies, build dependency files (see deps.js), etc.
   *
   * @see goog.require
   * @see goog.module
   * @param {string} name Namespace provided by this file in the form
   *     "goog.package.part".
   */
  goog.provide = function(name) {
      if (!COMPILED) {
          // Ensure that the same namespace isn't provided twice.
          // A goog.module/goog.provide maps a goog.require to a specific file
          if (goog.isProvided_(name)) {
              throw Error('Namespace "' + name + '" already declared.');
          }
      }
  
      goog.constructNamespace_(name);
  };
  
  
  /**
   * @param {string} name Namespace provided by this file in the form
   *     "goog.package.part".
   * @param {Object=} opt_obj The object to embed in the namespace.
   * @private
   */
  goog.constructNamespace_ = function(name, opt_obj) {
      if (!COMPILED) {
          delete goog.implicitNamespaces_[name];
  
          var namespace = name;
          while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
              if (goog.getObjectByName(namespace)) {
                  break;
              }
              goog.implicitNamespaces_[namespace] = true;
          }
      }
  
      goog.exportPath_(name, opt_obj);
  };
  
  
  /**
   * Module identifier validation regexp.
   * Note: This is a conservative check, it is very possible to be more lienent,
   *   the primary exclusion here is "/" and "\" and a leading ".", these
   *   restrictions are intended to leave the door open for using goog.require
   *   with relative file paths rather than module identifiers.
   * @private
   */
  goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
  
  
  /**
   * Defines a module in Closure.
   *
   * Marks that this file must be loaded as a module and claims the namespace.
   *
   * A namespace may only be defined once in a codebase. It may be defined using
   * goog.provide() or goog.module().
   *
   * goog.module() has three requirements:
   * - goog.module may not be used in the same file as goog.provide.
   * - goog.module must be the first statement in the file.
   * - only one goog.module is allowed per file.
   *
   * When a goog.module annotated file is loaded, it is enclosed in
   * a strict function closure. This means that:
   * - any variables declared in a goog.module file are private to the file
   * (not global), though the compiler is expected to inline the module.
   * - The code must obey all the rules of "strict" JavaScript.
   * - the file will be marked as "use strict"
   *
   * NOTE: unlike goog.provide, goog.module does not declare any symbols by
   * itself. If declared symbols are desired, use
   * goog.module.declareLegacyNamespace().
   *
   *
   * See the public goog.module proposal: http://goo.gl/Va1hin
   *
   * @param {string} name Namespace provided by this file in the form
   *     "goog.package.part", is expected but not required.
   */
  goog.module = function(name) {
      if (!goog.isString(name) ||
          !name ||
          name.search(goog.VALID_MODULE_RE_) == -1) {
          throw Error('Invalid module identifier');
      }
      if (!goog.isInModuleLoader_()) {
          throw Error('Module ' + name + ' has been loaded incorrectly.');
      }
      if (goog.moduleLoaderState_.moduleName) {
          throw Error('goog.module may only be called once per module.');
      }
  
      // Store the module name for the loader.
      goog.moduleLoaderState_.moduleName = name;
      if (!COMPILED) {
          // Ensure that the same namespace isn't provided twice.
          // A goog.module/goog.provide maps a goog.require to a specific file
          if (goog.isProvided_(name)) {
              throw Error('Namespace "' + name + '" already declared.');
          }
          delete goog.implicitNamespaces_[name];
      }
  };
  
  
  /**
   * @param {string} name The module identifier.
   * @return {?} The module exports for an already loaded module or null.
   *
   * Note: This is not an alternative to goog.require, it does not
   * indicate a hard dependency, instead it is used to indicate
   * an optional dependency or to access the exports of a module
   * that has already been loaded.
   * @suppress {missingProvide}
   */
  goog.module.get = function(name) {
      return goog.module.getInternal_(name);
  };
  
  
  /**
   * @param {string} name The module identifier.
   * @return {?} The module exports for an already loaded module or null.
   * @private
   */
  goog.module.getInternal_ = function(name) {
      if (!COMPILED) {
          if (goog.isProvided_(name)) {
              // goog.require only return a value with-in goog.module files.
              return name in goog.loadedModules_ ?
                  goog.loadedModules_[name] :
                  goog.getObjectByName(name);
          } else {
              return null;
          }
      }
  };
  
  
  /**
   * @private {?{
   *   moduleName: (string|undefined),
   *   declareTestMethods: boolean
   * }}
   */
  goog.moduleLoaderState_ = null;
  
  
  /**
   * @private
   * @return {boolean} Whether a goog.module is currently being initialized.
   */
  goog.isInModuleLoader_ = function() {
      return goog.moduleLoaderState_ != null;
  };
  
  
  /**
   * Indicate that a module's exports that are known test methods should
   * be copied to the global object.  This makes the test methods visible to
   * test runners that inspect the global object.
   *
   * TODO(johnlenz): Make the test framework aware of goog.module so
   * that this isn't necessary. Alternately combine this with goog.setTestOnly
   * to minimize boiler plate.
   * @suppress {missingProvide}
   */
  goog.module.declareTestMethods = function() {
      if (!goog.isInModuleLoader_()) {
          throw new Error('goog.module.declareTestMethods must be called from ' +
              'within a goog.module');
      }
      goog.moduleLoaderState_.declareTestMethods = true;
  };
  
  
  /**
   * Provide the module's exports as a globally accessible object under the
   * module's declared name.  This is intended to ease migration to goog.module
   * for files that have existing usages.
   * @suppress {missingProvide}
   */
  goog.module.declareLegacyNamespace = function() {
      if (!COMPILED && !goog.isInModuleLoader_()) {
          throw new Error('goog.module.declareLegacyNamespace must be called from ' +
              'within a goog.module');
      }
      if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
          throw Error('goog.module must be called prior to ' +
              'goog.module.declareLegacyNamespace.');
      }
      goog.moduleLoaderState_.declareLegacyNamespace = true;
  };
  
  
  /**
   * Marks that the current file should only be used for testing, and never for
   * live code in production.
   *
   * In the case of unit tests, the message may optionally be an exact namespace
   * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
   * provide (if not explicitly defined in the code).
   *
   * @param {string=} opt_message Optional message to add to the error that's
   *     raised when used in production code.
   */
  goog.setTestOnly = function(opt_message) {
      if (goog.DISALLOW_TEST_ONLY_CODE) {
          opt_message = opt_message || '';
          throw Error('Importing test-only code into non-debug environment' +
              (opt_message ? ': ' + opt_message : '.'));
      }
  };
  
  
  /**
   * Forward declares a symbol. This is an indication to the compiler that the
   * symbol may be used in the source yet is not required and may not be provided
   * in compilation.
   *
   * The most common usage of forward declaration is code that takes a type as a
   * function parameter but does not need to require it. By forward declaring
   * instead of requiring, no hard dependency is made, and (if not required
   * elsewhere) the namespace may never be required and thus, not be pulled
   * into the JavaScript binary. If it is required elsewhere, it will be type
   * checked as normal.
   *
   *
   * @param {string} name The namespace to forward declare in the form of
   *     "goog.package.part".
   */
  goog.forwardDeclare = function(name) {};
  
  
  if (!COMPILED) {
  
      /**
       * Check if the given name has been goog.provided. This will return false for
       * names that are available only as implicit namespaces.
       * @param {string} name name of the object to look for.
       * @return {boolean} Whether the name has been provided.
       * @private
       */
      goog.isProvided_ = function(name) {
          return (name in goog.loadedModules_) ||
              (!goog.implicitNamespaces_[name] &&
                  goog.isDefAndNotNull(goog.getObjectByName(name)));
      };
  
      /**
       * Namespaces implicitly defined by goog.provide. For example,
       * goog.provide('goog.events.Event') implicitly declares that 'goog' and
       * 'goog.events' must be namespaces.
       *
       * @type {!Object<string, (boolean|undefined)>}
       * @private
       */
      goog.implicitNamespaces_ = {'goog.module': true};
  
      // NOTE: We add goog.module as an implicit namespace as goog.module is defined
      // here and because the existing module package has not been moved yet out of
      // the goog.module namespace. This satisifies both the debug loader and
      // ahead-of-time dependency management.
  }
  
  
  /**
   * Returns an object based on its fully qualified external name.  The object
   * is not found if null or undefined.  If you are using a compilation pass that
   * renames property names beware that using this function will not find renamed
   * properties.
   *
   * @param {string} name The fully qualified name.
   * @param {Object=} opt_obj The object within which to look; default is
   *     |goog.global|.
   * @return {?} The value (object or primitive) or, if not found, null.
   */
  goog.getObjectByName = function(name, opt_obj) {
      var parts = name.split('.');
      var cur = opt_obj || goog.global;
      for (var part; part = parts.shift(); ) {
          if (goog.isDefAndNotNull(cur[part])) {
              cur = cur[part];
          } else {
              return null;
          }
      }
      return cur;
  };
  
  
  /**
   * Globalizes a whole namespace, such as goog or goog.lang.
   *
   * @param {!Object} obj The namespace to globalize.
   * @param {Object=} opt_global The object to add the properties to.
   * @deprecated Properties may be explicitly exported to the global scope, but
   *     this should no longer be done in bulk.
   */
  goog.globalize = function(obj, opt_global) {
      var global = opt_global || goog.global;
      for (var x in obj) {
          global[x] = obj[x];
      }
  };
  
  
  /**
   * Adds a dependency from a file to the files it requires.
   * @param {string} relPath The path to the js file.
   * @param {!Array<string>} provides An array of strings with
   *     the names of the objects this file provides.
   * @param {!Array<string>} requires An array of strings with
   *     the names of the objects this file requires.
   * @param {boolean=} opt_isModule Whether this dependency must be loaded as
   *     a module as declared by goog.module.
   */
  goog.addDependency = function(relPath, provides, requires, opt_isModule) {
      if (goog.DEPENDENCIES_ENABLED) {
          var provide, require;
          var path = relPath.replace(/\\/g, '/');
          var deps = goog.dependencies_;
          for (var i = 0; provide = provides[i]; i++) {
              deps.nameToPath[provide] = path;
              deps.pathIsModule[path] = !!opt_isModule;
          }
          for (var j = 0; require = requires[j]; j++) {
              if (!(path in deps.requires)) {
                  deps.requires[path] = {};
              }
              deps.requires[path][require] = true;
          }
      }
  };
  
  
  
  
  // NOTE(nnaze): The debug DOM loader was included in base.js as an original way
  // to do "debug-mode" development.  The dependency system can sometimes be
  // confusing, as can the debug DOM loader's asynchronous nature.
  //
  // With the DOM loader, a call to goog.require() is not blocking -- the script
  // will not load until some point after the current script.  If a namespace is
  // needed at runtime, it needs to be defined in a previous script, or loaded via
  // require() with its registered dependencies.
  // User-defined namespaces may need their own deps file.  See http://go/js_deps,
  // http://go/genjsdeps, or, externally, DepsWriter.
  // https://developers.google.com/closure/library/docs/depswriter
  //
  // Because of legacy clients, the DOM loader can't be easily removed from
  // base.js.  Work is being done to make it disableable or replaceable for
  // different environments (DOM-less JavaScript interpreters like Rhino or V8,
  // for example). See bootstrap/ for more information.
  
  
  /**
   * @define {boolean} Whether to enable the debug loader.
   *
   * If enabled, a call to goog.require() will attempt to load the namespace by
   * appending a script tag to the DOM (if the namespace has been registered).
   *
   * If disabled, goog.require() will simply assert that the namespace has been
   * provided (and depend on the fact that some outside tool correctly ordered
   * the script).
   */
  goog.define('goog.ENABLE_DEBUG_LOADER', true);
  
  
  /**
   * @param {string} msg
   * @private
   */
  goog.logToConsole_ = function(msg) {
      if (goog.global.console) {
          goog.global.console['error'](msg);
      }
  };
  
  
  /**
   * Implements a system for the dynamic resolution of dependencies that works in
   * parallel with the BUILD system. Note that all calls to goog.require will be
   * stripped by the JSCompiler when the --closure_pass option is used.
   * @see goog.provide
   * @param {string} name Namespace to include (as was given in goog.provide()) in
   *     the form "goog.package.part".
   * @return {?} If called within a goog.module file, the associated namespace or
   *     module otherwise null.
   */
  goog.require = function(name) {
  
      // If the object already exists we do not need do do anything.
      if (!COMPILED) {
          if (goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_) {
              goog.maybeProcessDeferredDep_(name);
          }
  
          if (goog.isProvided_(name)) {
              if (goog.isInModuleLoader_()) {
                  return goog.module.getInternal_(name);
              } else {
                  return null;
              }
          }
  
          if (goog.ENABLE_DEBUG_LOADER) {
              var path = goog.getPathFromDeps_(name);
              if (path) {
                  goog.included_[path] = true;
                  goog.writeScripts_();
                  return null;
              }
          }
  
          var errorMessage = 'goog.require could not find: ' + name;
          goog.logToConsole_(errorMessage);
  
          throw Error(errorMessage);
      }
  };
  
  
  /**
   * Path for included scripts.
   * @type {string}
   */
  goog.basePath = '';
  
  
  /**
   * A hook for overriding the base path.
   * @type {string|undefined}
   */
  goog.global.CLOSURE_BASE_PATH;
  
  
  /**
   * Whether to write out Closure's deps file. By default, the deps are written.
   * @type {boolean|undefined}
   */
  goog.global.CLOSURE_NO_DEPS;
  
  
  /**
   * A function to import a single script. This is meant to be overridden when
   * Closure is being run in non-HTML contexts, such as web workers. It's defined
   * in the global scope so that it can be set before base.js is loaded, which
   * allows deps.js to be imported properly.
   *
   * The function is passed the script source, which is a relative URI. It should
   * return true if the script was imported, false otherwise.
   * @type {(function(string): boolean)|undefined}
   */
  goog.global.CLOSURE_IMPORT_SCRIPT;
  
  
  /**
   * Null function used for default values of callbacks, etc.
   * @return {void} Nothing.
   */
  goog.nullFunction = function() {};
  
  
  /**
   * The identity function. Returns its first argument.
   *
   * @param {*=} opt_returnValue The single value that will be returned.
   * @param {...*} var_args Optional trailing arguments. These are ignored.
   * @return {?} The first argument. We can't know the type -- just pass it along
   *      without type.
   * @deprecated Use goog.functions.identity instead.
   */
  goog.identityFunction = function(opt_returnValue, var_args) {
      return opt_returnValue;
  };
  
  
  /**
   * When defining a class Foo with an abstract method bar(), you can do:
   * Foo.prototype.bar = goog.abstractMethod
   *
   * Now if a subclass of Foo fails to override bar(), an error will be thrown
   * when bar() is invoked.
   *
   * Note: This does not take the name of the function to override as an argument
   * because that would make it more difficult to obfuscate our JavaScript code.
   *
   * @type {!Function}
   * @throws {Error} when invoked to indicate the method should be overridden.
   */
  goog.abstractMethod = function() {
      throw Error('unimplemented abstract method');
  };
  
  
  /**
   * Adds a {@code getInstance} static method that always returns the same
   * instance object.
   * @param {!Function} ctor The constructor for the class to add the static
   *     method to.
   */
  goog.addSingletonGetter = function(ctor) {
      ctor.getInstance = function() {
          if (ctor.instance_) {
              return ctor.instance_;
          }
          if (goog.DEBUG) {
              // NOTE: JSCompiler can't optimize away Array#push.
              goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
          }
          return ctor.instance_ = new ctor;
      };
  };
  
  
  /**
   * All singleton classes that have been instantiated, for testing. Don't read
   * it directly, use the {@code goog.testing.singleton} module. The compiler
   * removes this variable if unused.
   * @type {!Array<!Function>}
   * @private
   */
  goog.instantiatedSingletons_ = [];
  
  
  /**
   * @define {boolean} Whether to load goog.modules using {@code eval} when using
   * the debug loader.  This provides a better debugging experience as the
   * source is unmodified and can be edited using Chrome Workspaces or
   * similiar.  However in some environments the use of {@code eval} is banned
   * so we provide an alternative.
   */
  goog.define('goog.LOAD_MODULE_USING_EVAL', true);
  
  
  /**
   * @define {boolean} Whether the exports of goog.modules should be sealed when
   * possible.
   */
  goog.define('goog.SEAL_MODULE_EXPORTS', goog.DEBUG);
  
  
  /**
   * The registry of initialized modules:
   * the module identifier to module exports map.
   * @private @const {!Object<string, ?>}
   */
  goog.loadedModules_ = {};
  
  
  /**
   * True if goog.dependencies_ is available.
   * @const {boolean}
   */
  goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
  
  
  if (goog.DEPENDENCIES_ENABLED) {
      /**
       * Object used to keep track of urls that have already been added. This record
       * allows the prevention of circular dependencies.
       * @private {!Object<string, boolean>}
       */
      goog.included_ = {};
  
  
      /**
       * This object is used to keep track of dependencies and other data that is
       * used for loading scripts.
       * @private
       * @type {{
     *   pathIsModule: !Object<string, boolean>,
     *   nameToPath: !Object<string, string>,
     *   requires: !Object<string, !Object<string, boolean>>,
     *   visited: !Object<string, boolean>,
     *   written: !Object<string, boolean>,
     *   deferred: !Object<string, string>
     * }}
       */
      goog.dependencies_ = {
          pathIsModule: {}, // 1 to 1
  
          nameToPath: {}, // 1 to 1
  
          requires: {}, // 1 to many
  
          // Used when resolving dependencies to prevent us from visiting file twice.
          visited: {},
  
          written: {}, // Used to keep track of script files we have written.
  
          deferred: {} // Used to track deferred module evaluations in old IEs
      };
  
  
      /**
       * Tries to detect whether is in the context of an HTML document.
       * @return {boolean} True if it looks like HTML document.
       * @private
       */
      goog.inHtmlDocument_ = function() {
          var doc = goog.global.document;
          return typeof doc != 'undefined' &&
              'write' in doc;  // XULDocument misses write.
      };
  
  
      /**
       * Tries to detect the base path of base.js script that bootstraps Closure.
       * @private
       */
      goog.findBasePath_ = function() {
          if (goog.global.CLOSURE_BASE_PATH) {
              goog.basePath = goog.global.CLOSURE_BASE_PATH;
              return;
          } else if (!goog.inHtmlDocument_()) {
              return;
          }
          var doc = goog.global.document;
          var scripts = doc.getElementsByTagName('script');
          // Search backwards since the current script is in almost all cases the one
          // that has base.js.
          for (var i = scripts.length - 1; i >= 0; --i) {
              var script = /** @type {!HTMLScriptElement} */ (scripts[i]);
              var src = script.src;
              var qmark = src.lastIndexOf('?');
              var l = qmark == -1 ? src.length : qmark;
              if (src.substr(l - 7, 7) == 'base.js') {
                  goog.basePath = src.substr(0, l - 7);
                  return;
              }
          }
      };
  
  
      /**
       * Imports a script if, and only if, that script hasn't already been imported.
       * (Must be called at execution time)
       * @param {string} src Script source.
       * @param {string=} opt_sourceText The optionally source text to evaluate
       * @private
       */
      goog.importScript_ = function(src, opt_sourceText) {
          var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
              goog.writeScriptTag_;
          if (importScript(src, opt_sourceText)) {
              goog.dependencies_.written[src] = true;
          }
      };
  
  
      /** @const @private {boolean} */
      goog.IS_OLD_IE_ = goog.global.document &&
          goog.global.document.all && !goog.global.atob;
  
  
      /**
       * Given a URL initiate retrieval and execution of the module.
       * @param {string} src Script source URL.
       * @private
       */
      goog.importModule_ = function(src) {
          // In an attempt to keep browsers from timing out loading scripts using
          // synchronous XHRs, put each load in its own script block.
          var bootstrap = 'goog.retrieveAndExecModule_("' + src + '");';
  
          if (goog.importScript_('', bootstrap)) {
              goog.dependencies_.written[src] = true;
          }
      };
  
  
      /** @private {!Array<string>} */
      goog.queuedModules_ = [];
  
  
      /**
       * Return an appropriate module text. Suitable to insert into
       * a script tag (that is unescaped).
       * @param {string} srcUrl
       * @param {string} scriptText
       * @return {string}
       * @private
       */
      goog.wrapModule_ = function(srcUrl, scriptText) {
          if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
              return '' +
                  'goog.loadModule(function(exports) {' +
                  '"use strict";' +
                  scriptText +
                  '\n' + // terminate any trailing single line comment.
                  ';return exports' +
                  '});' +
                  '\n//# sourceURL=' + srcUrl + '\n';
          } else {
              return '' +
                  'goog.loadModule(' +
                  goog.global.JSON.stringify(
                          scriptText + '\n//# sourceURL=' + srcUrl + '\n') +
                  ');';
          }
      };
  
      // On IE9 and ealier, it is necessary to handle
      // deferred module loads. In later browsers, the
      // code to be evaluated is simply inserted as a script
      // block in the correct order. To eval deferred
      // code at the right time, we piggy back on goog.require to call
      // goog.maybeProcessDeferredDep_.
      //
      // The goog.requires are used both to bootstrap
      // the loading process (when no deps are available) and
      // declare that they should be available.
      //
      // Here we eval the sources, if all the deps are available
      // either already eval'd or goog.require'd.  This will
      // be the case when all the dependencies have already
      // been loaded, and the dependent module is loaded.
      //
      // But this alone isn't sufficient because it is also
      // necessary to handle the case where there is no root
      // that is not deferred.  For that there we register for an event
      // and trigger goog.loadQueuedModules_ handle any remaining deferred
      // evaluations.
  
      /**
       * Handle any remaining deferred goog.module evals.
       * @private
       */
      goog.loadQueuedModules_ = function() {
          var count = goog.queuedModules_.length;
          if (count > 0) {
              var queue = goog.queuedModules_;
              goog.queuedModules_ = [];
              for (var i = 0; i < count; i++) {
                  var path = queue[i];
                  goog.maybeProcessDeferredPath_(path);
              }
          }
      };
  
  
      /**
       * Eval the named module if its dependencies are
       * available.
       * @param {string} name The module to load.
       * @private
       */
      goog.maybeProcessDeferredDep_ = function(name) {
          if (goog.isDeferredModule_(name) &&
              goog.allDepsAreAvailable_(name)) {
              var path = goog.getPathFromDeps_(name);
              goog.maybeProcessDeferredPath_(goog.basePath + path);
          }
      };
  
      /**
       * @param {string} name The module to check.
       * @return {boolean} Whether the name represents a
       *     module whose evaluation has been deferred.
       * @private
       */
      goog.isDeferredModule_ = function(name) {
          var path = goog.getPathFromDeps_(name);
          if (path && goog.dependencies_.pathIsModule[path]) {
              var abspath = goog.basePath + path;
              return (abspath) in goog.dependencies_.deferred;
          }
          return false;
      };
  
      /**
       * @param {string} name The module to check.
       * @return {boolean} Whether the name represents a
       *     module whose declared dependencies have all been loaded
       *     (eval'd or a deferred module load)
       * @private
       */
      goog.allDepsAreAvailable_ = function(name) {
          var path = goog.getPathFromDeps_(name);
          if (path && (path in goog.dependencies_.requires)) {
              for (var requireName in goog.dependencies_.requires[path]) {
                  if (!goog.isProvided_(requireName) &&
                      !goog.isDeferredModule_(requireName)) {
                      return false;
                  }
              }
          }
          return true;
      };
  
  
      /**
       * @param {string} abspath
       * @private
       */
      goog.maybeProcessDeferredPath_ = function(abspath) {
          if (abspath in goog.dependencies_.deferred) {
              var src = goog.dependencies_.deferred[abspath];
              delete goog.dependencies_.deferred[abspath];
              goog.globalEval(src);
          }
      };
  
  
      /**
       * @param {function(?):?|string} moduleDef The module definition.
       */
      goog.loadModule = function(moduleDef) {
          // NOTE: we allow function definitions to be either in the from
          // of a string to eval (which keeps the original source intact) or
          // in a eval forbidden environment (CSP) we allow a function definition
          // which in its body must call {@code goog.module}, and return the exports
          // of the module.
          var previousState = goog.moduleLoaderState_;
          try {
              goog.moduleLoaderState_ = {
                  moduleName: undefined, declareTestMethods: false};
              var exports;
              if (goog.isFunction(moduleDef)) {
                  exports = moduleDef.call(goog.global, {});
              } else if (goog.isString(moduleDef)) {
                  exports = goog.loadModuleFromSource_.call(goog.global, moduleDef);
              } else {
                  throw Error('Invalid module definition');
              }
  
              var moduleName = goog.moduleLoaderState_.moduleName;
              if (!goog.isString(moduleName) || !moduleName) {
                  throw Error('Invalid module name \"' + moduleName + '\"');
              }
  
              // Don't seal legacy namespaces as they may be uses as a parent of
              // another namespace
              if (goog.moduleLoaderState_.declareLegacyNamespace) {
                  goog.constructNamespace_(moduleName, exports);
              } else if (goog.SEAL_MODULE_EXPORTS && Object.seal) {
                  Object.seal(exports);
              }
  
              goog.loadedModules_[moduleName] = exports;
              if (goog.moduleLoaderState_.declareTestMethods) {
                  for (var entry in exports) {
                      if (entry.indexOf('test', 0) === 0 ||
                          entry == 'tearDown' ||
                          entry == 'setUp' ||
                          entry == 'setUpPage' ||
                          entry == 'tearDownPage') {
                          goog.global[entry] = exports[entry];
                      }
                  }
              }
          } finally {
              goog.moduleLoaderState_ = previousState;
          }
      };
  
  
      /**
       * @param {string} source
       * @return {!Object}
       * @private
       */
      goog.loadModuleFromSource_ = function(source) {
          // NOTE: we avoid declaring parameters or local variables here to avoid
          // masking globals or leaking values into the module definition.
          var exports = {};
          eval(arguments[0]);
          return exports;
      };
  
  
      /**
       * The default implementation of the import function. Writes a script tag to
       * import the script.
       *
       * @param {string} src The script url.
       * @param {string=} opt_sourceText The optionally source text to evaluate
       * @return {boolean} True if the script was imported, false otherwise.
       * @private
       */
      goog.writeScriptTag_ = function(src, opt_sourceText) {
          if (goog.inHtmlDocument_()) {
              var doc = goog.global.document;
  
              // If the user tries to require a new symbol after document load,
              // something has gone terribly wrong. Doing a document.write would
              // wipe out the page.
              if (doc.readyState == 'complete') {
                  // Certain test frameworks load base.js multiple times, which tries
                  // to write deps.js each time. If that happens, just fail silently.
                  // These frameworks wipe the page between each load of base.js, so this
                  // is OK.
                  var isDeps = /\bdeps.js$/.test(src);
                  if (isDeps) {
                      return false;
                  } else {
                      throw Error('Cannot write "' + src + '" after document load');
                  }
              }
  
              var isOldIE = goog.IS_OLD_IE_;
  
              if (opt_sourceText === undefined) {
                  if (!isOldIE) {
                      doc.write(
                              '<script type="text/javascript" src="' +
                              src + '"></' + 'script>');
                  } else {
                      var state = " onreadystatechange='goog.onScriptLoad_(this, " +
                          ++goog.lastNonModuleScriptIndex_ + ")' ";
                      doc.write(
                              '<script type="text/javascript" src="' +
                              src + '"' + state + '></' + 'script>');
                  }
              } else {
                  doc.write(
                          '<script type="text/javascript">' +
                          opt_sourceText +
                          '</' + 'script>');
              }
              return true;
          } else {
              return false;
          }
      };
  
  
      /** @private {number} */
      goog.lastNonModuleScriptIndex_ = 0;
  
  
      /**
       * A readystatechange handler for legacy IE
       * @param {!HTMLScriptElement} script
       * @param {number} scriptIndex
       * @return {boolean}
       * @private
       */
      goog.onScriptLoad_ = function(script, scriptIndex) {
          // for now load the modules when we reach the last script,
          // later allow more inter-mingling.
          if (script.readyState == 'complete' &&
              goog.lastNonModuleScriptIndex_ == scriptIndex) {
              goog.loadQueuedModules_();
          }
          return true;
      };
  
      /**
       * Resolves dependencies based on the dependencies added using addDependency
       * and calls importScript_ in the correct order.
       * @private
       */
      goog.writeScripts_ = function() {
          /** @type {!Array<string>} The scripts we need to write this time. */
          var scripts = [];
          var seenScript = {};
          var deps = goog.dependencies_;
  
          /** @param {string} path */
          function visitNode(path) {
              if (path in deps.written) {
                  return;
              }
  
              // We have already visited this one. We can get here if we have cyclic
              // dependencies.
              if (path in deps.visited) {
                  if (!(path in seenScript)) {
                      seenScript[path] = true;
                      scripts.push(path);
                  }
                  return;
              }
  
              deps.visited[path] = true;
  
              if (path in deps.requires) {
                  for (var requireName in deps.requires[path]) {
                      // If the required name is defined, we assume that it was already
                      // bootstrapped by other means.
                      if (!goog.isProvided_(requireName)) {
                          if (requireName in deps.nameToPath) {
                              visitNode(deps.nameToPath[requireName]);
                          } else {
                              throw Error('Undefined nameToPath for ' + requireName);
                          }
                      }
                  }
              }
  
              if (!(path in seenScript)) {
                  seenScript[path] = true;
                  scripts.push(path);
              }
          }
  
          for (var path in goog.included_) {
              if (!deps.written[path]) {
                  visitNode(path);
              }
          }
  
          // record that we are going to load all these scripts.
          for (var i = 0; i < scripts.length; i++) {
              var path = scripts[i];
              goog.dependencies_.written[path] = true;
          }
  
          // If a module is loaded synchronously then we need to
          // clear the current inModuleLoader value, and restore it when we are
          // done loading the current "requires".
          var moduleState = goog.moduleLoaderState_;
          goog.moduleLoaderState_ = null;
  
          var loadingModule = false;
          for (var i = 0; i < scripts.length; i++) {
              var path = scripts[i];
              if (path) {
                  if (!deps.pathIsModule[path]) {
                      goog.importScript_(goog.basePath + path);
                  } else {
                      loadingModule = true;
                      goog.importModule_(goog.basePath + path);
                  }
              } else {
                  goog.moduleLoaderState_ = moduleState;
                  throw Error('Undefined script input');
              }
          }
  
          // restore the current "module loading state"
          goog.moduleLoaderState_ = moduleState;
      };
  
  
      /**
       * Looks at the dependency rules and tries to determine the script file that
       * fulfills a particular rule.
       * @param {string} rule In the form goog.namespace.Class or project.script.
       * @return {?string} Url corresponding to the rule, or null.
       * @private
       */
      goog.getPathFromDeps_ = function(rule) {
          if (rule in goog.dependencies_.nameToPath) {
              return goog.dependencies_.nameToPath[rule];
          } else {
              return null;
          }
      };
  
      goog.findBasePath_();
  
      // Allow projects to manage the deps files themselves.
      if (!goog.global.CLOSURE_NO_DEPS) {
          goog.importScript_(goog.basePath + 'deps.js');
      }
  }
  
  
  /**
   * Normalize a file path by removing redundant ".." and extraneous "." file
   * path components.
   * @param {string} path
   * @return {string}
   * @private
   */
  goog.normalizePath_ = function(path) {
      var components = path.split('/');
      var i = 0;
      while (i < components.length) {
          if (components[i] == '.') {
              components.splice(i, 1);
          } else if (i && components[i] == '..' &&
              components[i - 1] && components[i - 1] != '..') {
              components.splice(--i, 2);
          } else {
              i++;
          }
      }
      return components.join('/');
  };
  
  
  /**
   * Retrieve and execute a module.
   * @param {string} src Script source URL.
   * @private
   */
  goog.retrieveAndExecModule_ = function(src) {
      if (!COMPILED) {
          // The full but non-canonicalized URL for later use.
          var originalPath = src;
          // Canonicalize the path, removing any /./ or /../ since Chrome's debugging
          // console doesn't auto-canonicalize XHR loads as it does <script> srcs.
          src = goog.normalizePath_(src);
  
          var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
              goog.writeScriptTag_;
  
          var scriptText = null;
  
          var xhr = new goog.global['XMLHttpRequest']();
  
          /** @this {Object} */
          xhr.onload = function() {
              scriptText = this.responseText;
          };
          xhr.open('get', src, false);
          xhr.send();
  
          scriptText = xhr.responseText;
  
          if (scriptText != null) {
              var execModuleScript = goog.wrapModule_(src, scriptText);
              var isOldIE = goog.IS_OLD_IE_;
              if (isOldIE) {
                  goog.dependencies_.deferred[originalPath] = execModuleScript;
                  goog.queuedModules_.push(originalPath);
              } else {
                  importScript(src, execModuleScript);
              }
          } else {
              throw new Error('load of ' + src + 'failed');
          }
      }
  };
  
  
  //==============================================================================
  // Language Enhancements
  //==============================================================================
  
  
  /**
   * This is a "fixed" version of the typeof operator.  It differs from the typeof
   * operator in such a way that null returns 'null' and arrays return 'array'.
   * @param {*} value The value to get the type of.
   * @return {string} The name of the type.
   */
  goog.typeOf = function(value) {
      var s = typeof value;
      if (s == 'object') {
          if (value) {
              // Check these first, so we can avoid calling Object.prototype.toString if
              // possible.
              //
              // IE improperly marshals tyepof across execution contexts, but a
              // cross-context object will still return false for "instanceof Object".
              if (value instanceof Array) {
                  return 'array';
              } else if (value instanceof Object) {
                  return s;
              }
  
              // HACK: In order to use an Object prototype method on the arbitrary
              //   value, the compiler requires the value be cast to type Object,
              //   even though the ECMA spec explicitly allows it.
              var className = Object.prototype.toString.call(
                  /** @type {Object} */ (value));
              // In Firefox 3.6, attempting to access iframe window objects' length
              // property throws an NS_ERROR_FAILURE, so we need to special-case it
              // here.
              if (className == '[object Window]') {
                  return 'object';
              }
  
              // We cannot always use constructor == Array or instanceof Array because
              // different frames have different Array objects. In IE6, if the iframe
              // where the array was created is destroyed, the array loses its
              // prototype. Then dereferencing val.splice here throws an exception, so
              // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
              // so that will work. In this case, this function will return false and
              // most array functions will still work because the array is still
              // array-like (supports length and []) even though it has lost its
              // prototype.
              // Mark Miller noticed that Object.prototype.toString
              // allows access to the unforgeable [[Class]] property.
              //  15.2.4.2 Object.prototype.toString ( )
              //  When the toString method is called, the following steps are taken:
              //      1. Get the [[Class]] property of this object.
              //      2. Compute a string value by concatenating the three strings
              //         "[object ", Result(1), and "]".
              //      3. Return Result(2).
              // and this behavior survives the destruction of the execution context.
              if ((className == '[object Array]' ||
                  // In IE all non value types are wrapped as objects across window
                  // boundaries (not iframe though) so we have to do object detection
                  // for this edge case.
                  typeof value.length == 'number' &&
                  typeof value.splice != 'undefined' &&
                  typeof value.propertyIsEnumerable != 'undefined' &&
                  !value.propertyIsEnumerable('splice')
  
                  )) {
                  return 'array';
              }
              // HACK: There is still an array case that fails.
              //     function ArrayImpostor() {}
              //     ArrayImpostor.prototype = [];
              //     var impostor = new ArrayImpostor;
              // this can be fixed by getting rid of the fast path
              // (value instanceof Array) and solely relying on
              // (value && Object.prototype.toString.vall(value) === '[object Array]')
              // but that would require many more function calls and is not warranted
              // unless closure code is receiving objects from untrusted sources.
  
              // IE in cross-window calls does not correctly marshal the function type
              // (it appears just as an object) so we cannot use just typeof val ==
              // 'function'. However, if the object has a call property, it is a
              // function.
              if ((className == '[object Function]' ||
                  typeof value.call != 'undefined' &&
                  typeof value.propertyIsEnumerable != 'undefined' &&
                  !value.propertyIsEnumerable('call'))) {
                  return 'function';
              }
  
          } else {
              return 'null';
          }
  
      } else if (s == 'function' && typeof value.call == 'undefined') {
          // In Safari typeof nodeList returns 'function', and on Firefox typeof
          // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
          // would like to return object for those and we can detect an invalid
          // function by making sure that the function object has a call method.
          return 'object';
      }
      return s;
  };
  
  
  /**
   * Returns true if the specified value is null.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is null.
   */
  goog.isNull = function(val) {
      return val === null;
  };
  
  
  /**
   * Returns true if the specified value is defined and not null.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is defined and not null.
   */
  goog.isDefAndNotNull = function(val) {
      // Note that undefined == null.
      return val != null;
  };
  
  
  /**
   * Returns true if the specified value is an array.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is an array.
   */
  goog.isArray = function(val) {
      return goog.typeOf(val) == 'array';
  };
  
  
  /**
   * Returns true if the object looks like an array. To qualify as array like
   * the value needs to be either a NodeList or an object with a Number length
   * property. As a special case, a function value is not array like, because its
   * length property is fixed to correspond to the number of expected arguments.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is an array.
   */
  goog.isArrayLike = function(val) {
      var type = goog.typeOf(val);
      // We do not use goog.isObject here in order to exclude function values.
      return type == 'array' || type == 'object' && typeof val.length == 'number';
  };
  
  
  /**
   * Returns true if the object looks like a Date. To qualify as Date-like the
   * value needs to be an object and have a getFullYear() function.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a like a Date.
   */
  goog.isDateLike = function(val) {
      return goog.isObject(val) && typeof val.getFullYear == 'function';
  };
  
  
  /**
   * Returns true if the specified value is a string.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a string.
   */
  goog.isString = function(val) {
      return typeof val == 'string';
  };
  
  
  /**
   * Returns true if the specified value is a boolean.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is boolean.
   */
  goog.isBoolean = function(val) {
      return typeof val == 'boolean';
  };
  
  
  /**
   * Returns true if the specified value is a number.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a number.
   */
  goog.isNumber = function(val) {
      return typeof val == 'number';
  };
  
  
  /**
   * Returns true if the specified value is a function.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a function.
   */
  goog.isFunction = function(val) {
      return goog.typeOf(val) == 'function';
  };
  
  
  /**
   * Returns true if the specified value is an object.  This includes arrays and
   * functions.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is an object.
   */
  goog.isObject = function(val) {
      var type = typeof val;
      return type == 'object' && val != null || type == 'function';
      // return Object(val) === val also works, but is slower, especially if val is
      // not an object.
  };
  
  
  /**
   * Gets a unique ID for an object. This mutates the object so that further calls
   * with the same object as a parameter returns the same value. The unique ID is
   * guaranteed to be unique across the current session amongst objects that are
   * passed into {@code getUid}. There is no guarantee that the ID is unique or
   * consistent across sessions. It is unsafe to generate unique ID for function
   * prototypes.
   *
   * @param {Object} obj The object to get the unique ID for.
   * @return {number} The unique ID for the object.
   */
  goog.getUid = function(obj) {
      // TODO(arv): Make the type stricter, do not accept null.
  
      // In Opera window.hasOwnProperty exists but always returns false so we avoid
      // using it. As a consequence the unique ID generated for BaseClass.prototype
      // and SubClass.prototype will be the same.
      return obj[goog.UID_PROPERTY_] ||
          (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
  };
  
  
  /**
   * Whether the given object is alreay assigned a unique ID.
   *
   * This does not modify the object.
   *
   * @param {!Object} obj The object to check.
   * @return {boolean} Whether there an assigned unique id for the object.
   */
  goog.hasUid = function(obj) {
      return !!obj[goog.UID_PROPERTY_];
  };
  
  
  /**
   * Removes the unique ID from an object. This is useful if the object was
   * previously mutated using {@code goog.getUid} in which case the mutation is
   * undone.
   * @param {Object} obj The object to remove the unique ID field from.
   */
  goog.removeUid = function(obj) {
      // TODO(arv): Make the type stricter, do not accept null.
  
      // In IE, DOM nodes are not instances of Object and throw an exception if we
      // try to delete.  Instead we try to use removeAttribute.
      if ('removeAttribute' in obj) {
          obj.removeAttribute(goog.UID_PROPERTY_);
      }
      /** @preserveTry */
      try {
          delete obj[goog.UID_PROPERTY_];
      } catch (ex) {
      }
  };
  
  
  /**
   * Name for unique ID property. Initialized in a way to help avoid collisions
   * with other closure JavaScript on the same page.
   * @type {string}
   * @private
   */
  goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);
  
  
  /**
   * Counter for UID.
   * @type {number}
   * @private
   */
  goog.uidCounter_ = 0;
  
  
  /**
   * Adds a hash code field to an object. The hash code is unique for the
   * given object.
   * @param {Object} obj The object to get the hash code for.
   * @return {number} The hash code for the object.
   * @deprecated Use goog.getUid instead.
   */
  goog.getHashCode = goog.getUid;
  
  
  /**
   * Removes the hash code field from an object.
   * @param {Object} obj The object to remove the field from.
   * @deprecated Use goog.removeUid instead.
   */
  goog.removeHashCode = goog.removeUid;
  
  
  /**
   * Clones a value. The input may be an Object, Array, or basic type. Objects and
   * arrays will be cloned recursively.
   *
   * WARNINGS:
   * <code>goog.cloneObject</code> does not detect reference loops. Objects that
   * refer to themselves will cause infinite recursion.
   *
   * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
   * UIDs created by <code>getUid</code> into cloned results.
   *
   * @param {*} obj The value to clone.
   * @return {*} A clone of the input value.
   * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
   */
  goog.cloneObject = function(obj) {
      var type = goog.typeOf(obj);
      if (type == 'object' || type == 'array') {
          if (obj.clone) {
              return obj.clone();
          }
          var clone = type == 'array' ? [] : {};
          for (var key in obj) {
              clone[key] = goog.cloneObject(obj[key]);
          }
          return clone;
      }
  
      return obj;
  };
  
  
  /**
   * A native implementation of goog.bind.
   * @param {Function} fn A function to partially apply.
   * @param {Object|undefined} selfObj Specifies the object which this should
   *     point to when the function is run.
   * @param {...*} var_args Additional arguments that are partially applied to the
   *     function.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   * @private
   * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
   *     deprecated because some people have declared a pure-JS version.
   *     Only the pure-JS version is truly deprecated.
   */
  goog.bindNative_ = function(fn, selfObj, var_args) {
      return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
  };
  
  
  /**
   * A pure-JS implementation of goog.bind.
   * @param {Function} fn A function to partially apply.
   * @param {Object|undefined} selfObj Specifies the object which this should
   *     point to when the function is run.
   * @param {...*} var_args Additional arguments that are partially applied to the
   *     function.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   * @private
   */
  goog.bindJs_ = function(fn, selfObj, var_args) {
      if (!fn) {
          throw new Error();
      }
  
      if (arguments.length > 2) {
          var boundArgs = Array.prototype.slice.call(arguments, 2);
          return function() {
              // Prepend the bound arguments to the current arguments.
              var newArgs = Array.prototype.slice.call(arguments);
              Array.prototype.unshift.apply(newArgs, boundArgs);
              return fn.apply(selfObj, newArgs);
          };
  
      } else {
          return function() {
              return fn.apply(selfObj, arguments);
          };
      }
  };
  
  
  /**
   * Partially applies this function to a particular 'this object' and zero or
   * more arguments. The result is a new function with some arguments of the first
   * function pre-filled and the value of this 'pre-specified'.
   *
   * Remaining arguments specified at call-time are appended to the pre-specified
   * ones.
   *
   * Also see: {@link #partial}.
   *
   * Usage:
   * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
   * barMethBound('arg3', 'arg4');</pre>
   *
   * @param {?function(this:T, ...)} fn A function to partially apply.
   * @param {T} selfObj Specifies the object which this should point to when the
   *     function is run.
   * @param {...*} var_args Additional arguments that are partially applied to the
   *     function.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   * @template T
   * @suppress {deprecated} See above.
   */
  goog.bind = function(fn, selfObj, var_args) {
      // TODO(nicksantos): narrow the type signature.
      if (Function.prototype.bind &&
          // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
          // extension environment. This means that for Chrome extensions, they get
          // the implementation of Function.prototype.bind that calls goog.bind
          // instead of the native one. Even worse, we don't want to introduce a
          // circular dependency between goog.bind and Function.prototype.bind, so
          // we have to hack this to make sure it works correctly.
          Function.prototype.bind.toString().indexOf('native code') != -1) {
          goog.bind = goog.bindNative_;
      } else {
          goog.bind = goog.bindJs_;
      }
      return goog.bind.apply(null, arguments);
  };
  
  
  /**
   * Like bind(), except that a 'this object' is not required. Useful when the
   * target function is already bound.
   *
   * Usage:
   * var g = partial(f, arg1, arg2);
   * g(arg3, arg4);
   *
   * @param {Function} fn A function to partially apply.
   * @param {...*} var_args Additional arguments that are partially applied to fn.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   */
  goog.partial = function(fn, var_args) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function() {
          // Clone the array (with slice()) and append additional arguments
          // to the existing arguments.
          var newArgs = args.slice();
          newArgs.push.apply(newArgs, arguments);
          return fn.apply(this, newArgs);
      };
  };
  
  
  /**
   * Copies all the members of a source object to a target object. This method
   * does not work on all browsers for all objects that contain keys such as
   * toString or hasOwnProperty. Use goog.object.extend for this purpose.
   * @param {Object} target Target.
   * @param {Object} source Source.
   */
  goog.mixin = function(target, source) {
      for (var x in source) {
          target[x] = source[x];
      }
  
      // For IE7 or lower, the for-in-loop does not contain any properties that are
      // not enumerable on the prototype object (for example, isPrototypeOf from
      // Object.prototype) but also it will not include 'replace' on objects that
      // extend String and change 'replace' (not that it is common for anyone to
      // extend anything except Object).
  };
  
  
  /**
   * @return {number} An integer value representing the number of milliseconds
   *     between midnight, January 1, 1970 and the current time.
   */
  goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
      // Unary plus operator converts its operand to a number which in the case of
      // a date is done by calling getTime().
      return +new Date();
  });
  
  
  /**
   * Evals JavaScript in the global scope.  In IE this uses execScript, other
   * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
   * global scope (for example, in Safari), appends a script tag instead.
   * Throws an exception if neither execScript or eval is defined.
   * @param {string} script JavaScript string.
   */
  goog.globalEval = function(script) {
      if (goog.global.execScript) {
          goog.global.execScript(script, 'JavaScript');
      } else if (goog.global.eval) {
          // Test to see if eval works
          if (goog.evalWorksForGlobals_ == null) {
              goog.global.eval('var _et_ = 1;');
              if (typeof goog.global['_et_'] != 'undefined') {
                  delete goog.global['_et_'];
                  goog.evalWorksForGlobals_ = true;
              } else {
                  goog.evalWorksForGlobals_ = false;
              }
          }
  
          if (goog.evalWorksForGlobals_) {
              goog.global.eval(script);
          } else {
              var doc = goog.global.document;
              var scriptElt = doc.createElement('script');
              scriptElt.type = 'text/javascript';
              scriptElt.defer = false;
              // Note(user): can't use .innerHTML since "t('<test>')" will fail and
              // .text doesn't work in Safari 2.  Therefore we append a text node.
              scriptElt.appendChild(doc.createTextNode(script));
              doc.body.appendChild(scriptElt);
              doc.body.removeChild(scriptElt);
          }
      } else {
          throw Error('goog.globalEval not available');
      }
  };
  
  
  /**
   * Indicates whether or not we can call 'eval' directly to eval code in the
   * global scope. Set to a Boolean by the first call to goog.globalEval (which
   * empirically tests whether eval works for globals). @see goog.globalEval
   * @type {?boolean}
   * @private
   */
  goog.evalWorksForGlobals_ = null;
  
  
  /**
   * Optional map of CSS class names to obfuscated names used with
   * goog.getCssName().
   * @private {!Object<string, string>|undefined}
   * @see goog.setCssNameMapping
   */
  goog.cssNameMapping_;
  
  
  /**
   * Optional obfuscation style for CSS class names. Should be set to either
   * 'BY_WHOLE' or 'BY_PART' if defined.
   * @type {string|undefined}
   * @private
   * @see goog.setCssNameMapping
   */
  goog.cssNameMappingStyle_;
  
  
  /**
   * Handles strings that are intended to be used as CSS class names.
   *
   * This function works in tandem with @see goog.setCssNameMapping.
   *
   * Without any mapping set, the arguments are simple joined with a hyphen and
   * passed through unaltered.
   *
   * When there is a mapping, there are two possible styles in which these
   * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
   * of the passed in css name is rewritten according to the map. In the BY_WHOLE
   * style, the full css name is looked up in the map directly. If a rewrite is
   * not specified by the map, the compiler will output a warning.
   *
   * When the mapping is passed to the compiler, it will replace calls to
   * goog.getCssName with the strings from the mapping, e.g.
   *     var x = goog.getCssName('foo');
   *     var y = goog.getCssName(this.baseClass, 'active');
   *  becomes:
   *     var x= 'foo';
   *     var y = this.baseClass + '-active';
   *
   * If one argument is passed it will be processed, if two are passed only the
   * modifier will be processed, as it is assumed the first argument was generated
   * as a result of calling goog.getCssName.
   *
   * @param {string} className The class name.
   * @param {string=} opt_modifier A modifier to be appended to the class name.
   * @return {string} The class name or the concatenation of the class name and
   *     the modifier.
   */
  goog.getCssName = function(className, opt_modifier) {
      var getMapping = function(cssName) {
          return goog.cssNameMapping_[cssName] || cssName;
      };
  
      var renameByParts = function(cssName) {
          // Remap all the parts individually.
          var parts = cssName.split('-');
          var mapped = [];
          for (var i = 0; i < parts.length; i++) {
              mapped.push(getMapping(parts[i]));
          }
          return mapped.join('-');
      };
  
      var rename;
      if (goog.cssNameMapping_) {
          rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
              getMapping : renameByParts;
      } else {
          rename = function(a) {
              return a;
          };
      }
  
      if (opt_modifier) {
          return className + '-' + rename(opt_modifier);
      } else {
          return rename(className);
      }
  };
  
  
  /**
   * Sets the map to check when returning a value from goog.getCssName(). Example:
   * <pre>
   * goog.setCssNameMapping({
   *   "goog": "a",
   *   "disabled": "b",
   * });
   *
   * var x = goog.getCssName('goog');
   * // The following evaluates to: "a a-b".
   * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
   * </pre>
   * When declared as a map of string literals to string literals, the JSCompiler
   * will replace all calls to goog.getCssName() using the supplied map if the
   * --closure_pass flag is set.
   *
   * @param {!Object} mapping A map of strings to strings where keys are possible
   *     arguments to goog.getCssName() and values are the corresponding values
   *     that should be returned.
   * @param {string=} opt_style The style of css name mapping. There are two valid
   *     options: 'BY_PART', and 'BY_WHOLE'.
   * @see goog.getCssName for a description.
   */
  goog.setCssNameMapping = function(mapping, opt_style) {
      goog.cssNameMapping_ = mapping;
      goog.cssNameMappingStyle_ = opt_style;
  };
  
  
  /**
   * To use CSS renaming in compiled mode, one of the input files should have a
   * call to goog.setCssNameMapping() with an object literal that the JSCompiler
   * can extract and use to replace all calls to goog.getCssName(). In uncompiled
   * mode, JavaScript code should be loaded before this base.js file that declares
   * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
   * to ensure that the mapping is loaded before any calls to goog.getCssName()
   * are made in uncompiled mode.
   *
   * A hook for overriding the CSS name mapping.
   * @type {!Object<string, string>|undefined}
   */
  goog.global.CLOSURE_CSS_NAME_MAPPING;
  
  
  if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
      // This does not call goog.setCssNameMapping() because the JSCompiler
      // requires that goog.setCssNameMapping() be called with an object literal.
      goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
  }
  
  
  /**
   * Gets a localized message.
   *
   * This function is a compiler primitive. If you give the compiler a localized
   * message bundle, it will replace the string at compile-time with a localized
   * version, and expand goog.getMsg call to a concatenated string.
   *
   * Messages must be initialized in the form:
   * <code>
   * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
   * </code>
   *
   * @param {string} str Translatable string, places holders in the form {$foo}.
   * @param {Object<string, string>=} opt_values Maps place holder name to value.
   * @return {string} message with placeholders filled.
   */
  goog.getMsg = function(str, opt_values) {
      if (opt_values) {
          str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
              return key in opt_values ? opt_values[key] : match;
          });
      }
      return str;
  };
  
  
  /**
   * Gets a localized message. If the message does not have a translation, gives a
   * fallback message.
   *
   * This is useful when introducing a new message that has not yet been
   * translated into all languages.
   *
   * This function is a compiler primitive. Must be used in the form:
   * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
   * where MSG_A and MSG_B were initialized with goog.getMsg.
   *
   * @param {string} a The preferred message.
   * @param {string} b The fallback message.
   * @return {string} The best translated message.
   */
  goog.getMsgWithFallback = function(a, b) {
      return a;
  };
  
  
  /**
   * Exposes an unobfuscated global namespace path for the given object.
   * Note that fields of the exported object *will* be obfuscated, unless they are
   * exported in turn via this function or goog.exportProperty.
   *
   * Also handy for making public items that are defined in anonymous closures.
   *
   * ex. goog.exportSymbol('public.path.Foo', Foo);
   *
   * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
   *     public.path.Foo.staticFunction();
   *
   * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
   *                       Foo.prototype.myMethod);
   *     new public.path.Foo().myMethod();
   *
   * @param {string} publicPath Unobfuscated name to export.
   * @param {*} object Object the name should point to.
   * @param {Object=} opt_objectToExportTo The object to add the path to; default
   *     is goog.global.
   */
  goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
      goog.exportPath_(publicPath, object, opt_objectToExportTo);
  };
  
  
  /**
   * Exports a property unobfuscated into the object's namespace.
   * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
   * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
   * @param {Object} object Object whose static property is being exported.
   * @param {string} publicName Unobfuscated name to export.
   * @param {*} symbol Object the name should point to.
   */
  goog.exportProperty = function(object, publicName, symbol) {
      object[publicName] = symbol;
  };
  
  
  /**
   * Inherit the prototype methods from one constructor into another.
   *
   * Usage:
   * <pre>
   * function ParentClass(a, b) { }
   * ParentClass.prototype.foo = function(a) { };
   *
   * function ChildClass(a, b, c) {
   *   ChildClass.base(this, 'constructor', a, b);
   * }
   * goog.inherits(ChildClass, ParentClass);
   *
   * var child = new ChildClass('a', 'b', 'see');
   * child.foo(); // This works.
   * </pre>
   *
   * @param {Function} childCtor Child class.
   * @param {Function} parentCtor Parent class.
   */
  goog.inherits = function(childCtor, parentCtor) {
      /** @constructor */
      function tempCtor() {};
      tempCtor.prototype = parentCtor.prototype;
      childCtor.superClass_ = parentCtor.prototype;
      childCtor.prototype = new tempCtor();
      /** @override */
      childCtor.prototype.constructor = childCtor;
  
      /**
       * Calls superclass constructor/method.
       *
       * This function is only available if you use goog.inherits to
       * express inheritance relationships between classes.
       *
       * NOTE: This is a replacement for goog.base and for superClass_
       * property defined in childCtor.
       *
       * @param {!Object} me Should always be "this".
       * @param {string} methodName The method name to call. Calling
       *     superclass constructor can be done with the special string
       *     'constructor'.
       * @param {...*} var_args The arguments to pass to superclass
       *     method/constructor.
       * @return {*} The return value of the superclass method/constructor.
       */
      childCtor.base = function(me, methodName, var_args) {
          // Copying using loop to avoid deop due to passing arguments object to
          // function. This is faster in many JS engines as of late 2014.
          var args = new Array(arguments.length - 2);
          for (var i = 2; i < arguments.length; i++) {
              args[i - 2] = arguments[i];
          }
          return parentCtor.prototype[methodName].apply(me, args);
      };
  };
  
  
  /**
   * Call up to the superclass.
   *
   * If this is called from a constructor, then this calls the superclass
   * constructor with arguments 1-N.
   *
   * If this is called from a prototype method, then you must pass the name of the
   * method as the second argument to this function. If you do not, you will get a
   * runtime error. This calls the superclass' method with arguments 2-N.
   *
   * This function only works if you use goog.inherits to express inheritance
   * relationships between your classes.
   *
   * This function is a compiler primitive. At compile-time, the compiler will do
   * macro expansion to remove a lot of the extra overhead that this function
   * introduces. The compiler will also enforce a lot of the assumptions that this
   * function makes, and treat it as a compiler error if you break them.
   *
   * @param {!Object} me Should always be "this".
   * @param {*=} opt_methodName The method name if calling a super method.
   * @param {...*} var_args The rest of the arguments.
   * @return {*} The return value of the superclass method.
   * @suppress {es5Strict} This method can not be used in strict mode, but
   *     all Closure Library consumers must depend on this file.
   */
  goog.base = function(me, opt_methodName, var_args) {
      var caller = arguments.callee.caller;
  
      if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
          throw Error('arguments.caller not defined.  goog.base() cannot be used ' +
              'with strict mode code. See ' +
              'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
      }
  
      if (caller.superClass_) {
          // Copying using loop to avoid deop due to passing arguments object to
          // function. This is faster in many JS engines as of late 2014.
          var ctorArgs = new Array(arguments.length - 1);
          for (var i = 1; i < arguments.length; i++) {
              ctorArgs[i - 1] = arguments[i];
          }
          // This is a constructor. Call the superclass constructor.
          return caller.superClass_.constructor.apply(me, ctorArgs);
      }
  
      // Copying using loop to avoid deop due to passing arguments object to
      // function. This is faster in many JS engines as of late 2014.
      var args = new Array(arguments.length - 2);
      for (var i = 2; i < arguments.length; i++) {
          args[i - 2] = arguments[i];
      }
      var foundCaller = false;
      for (var ctor = me.constructor;
           ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
          if (ctor.prototype[opt_methodName] === caller) {
              foundCaller = true;
          } else if (foundCaller) {
              return ctor.prototype[opt_methodName].apply(me, args);
          }
      }
  
      // If we did not find the caller in the prototype chain, then one of two
      // things happened:
      // 1) The caller is an instance method.
      // 2) This method was not called by the right caller.
      if (me[opt_methodName] === caller) {
          return me.constructor.prototype[opt_methodName].apply(me, args);
      } else {
          throw Error(
                  'goog.base called from a method of one name ' +
                  'to a method of a different name');
      }
  };
  
  
  /**
   * Allow for aliasing within scope functions.  This function exists for
   * uncompiled code - in compiled code the calls will be inlined and the aliases
   * applied.  In uncompiled code the function is simply run since the aliases as
   * written are valid JavaScript.
   *
   *
   * @param {function()} fn Function to call.  This function can contain aliases
   *     to namespaces (e.g. "var dom = goog.dom") or classes
   *     (e.g. "var Timer = goog.Timer").
   */
  goog.scope = function(fn) {
      fn.call(goog.global);
  };
  
  
  /*
   * To support uncompiled, strict mode bundles that use eval to divide source
   * like so:
   *    eval('someSource;//# sourceUrl sourcefile.js');
   * We need to export the globally defined symbols "goog" and "COMPILED".
   * Exporting "goog" breaks the compiler optimizations, so we required that
   * be defined externally.
   * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
   * extern generation when that compiler option is enabled.
   */
  if (!COMPILED) {
      goog.global['COMPILED'] = COMPILED;
  }
  
  
  
  //==============================================================================
  // goog.defineClass implementation
  //==============================================================================
  
  
  /**
   * Creates a restricted form of a Closure "class":
   *   - from the compiler's perspective, the instance returned from the
   *     constructor is sealed (no new properties may be added).  This enables
   *     better checks.
   *   - the compiler will rewrite this definition to a form that is optimal
   *     for type checking and optimization (initially this will be a more
   *     traditional form).
   *
   * @param {Function} superClass The superclass, Object or null.
   * @param {goog.defineClass.ClassDescriptor} def
   *     An object literal describing the
   *     the class.  It may have the following properties:
   *     "constructor": the constructor function
   *     "statics": an object literal containing methods to add to the constructor
   *        as "static" methods or a function that will receive the constructor
   *        function as its only parameter to which static properties can
   *        be added.
   *     all other properties are added to the prototype.
   * @return {!Function} The class constructor.
   */
  goog.defineClass = function(superClass, def) {
      // TODO(johnlenz): consider making the superClass an optional parameter.
      var constructor = def.constructor;
      var statics = def.statics;
      // Wrap the constructor prior to setting up the prototype and static methods.
      if (!constructor || constructor == Object.prototype.constructor) {
          constructor = function() {
              throw Error('cannot instantiate an interface (no constructor defined).');
          };
      }
  
      var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
      if (superClass) {
          goog.inherits(cls, superClass);
      }
  
      // Remove all the properties that should not be copied to the prototype.
      delete def.constructor;
      delete def.statics;
  
      goog.defineClass.applyProperties_(cls.prototype, def);
      if (statics != null) {
          if (statics instanceof Function) {
              statics(cls);
          } else {
              goog.defineClass.applyProperties_(cls, statics);
          }
      }
  
      return cls;
  };
  
  
  /**
   * @typedef {
   *     !Object|
   *     {constructor:!Function}|
   *     {constructor:!Function, statics:(Object|function(Function):void)}}
   * @suppress {missingProvide}
   */
  goog.defineClass.ClassDescriptor;
  
  
  /**
   * @define {boolean} Whether the instances returned by
   * goog.defineClass should be sealed when possible.
   */
  goog.define('goog.defineClass.SEAL_CLASS_INSTANCES', goog.DEBUG);
  
  
  /**
   * If goog.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
   * defined, this function will wrap the constructor in a function that seals the
   * results of the provided constructor function.
   *
   * @param {!Function} ctr The constructor whose results maybe be sealed.
   * @param {Function} superClass The superclass constructor.
   * @return {!Function} The replacement constructor.
   * @private
   */
  goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
      if (goog.defineClass.SEAL_CLASS_INSTANCES &&
          Object.seal instanceof Function) {
          // Don't seal subclasses of unsealable-tagged legacy classes.
          if (superClass && superClass.prototype &&
              superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
              return ctr;
          }
          /**
           * @this {*}
           * @return {?}
           */
          var wrappedCtr = function() {
              // Don't seal an instance of a subclass when it calls the constructor of
              // its super class as there is most likely still setup to do.
              var instance = ctr.apply(this, arguments) || this;
              instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
              if (this.constructor === wrappedCtr) {
                  Object.seal(instance);
              }
              return instance;
          };
          return wrappedCtr;
      }
      return ctr;
  };
  
  
  // TODO(johnlenz): share these values with the goog.object
  /**
   * The names of the fields that are defined on Object.prototype.
   * @type {!Array<string>}
   * @private
   * @const
   */
  goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf'
  ];
  
  
  // TODO(johnlenz): share this function with the goog.object
  /**
   * @param {!Object} target The object to add properties to.
   * @param {!Object} source The object to copy properites from.
   * @private
   */
  goog.defineClass.applyProperties_ = function(target, source) {
      // TODO(johnlenz): update this to support ES5 getters/setters
  
      var key;
      for (key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
          }
      }
  
      // For IE the for-in-loop does not contain any properties that are not
      // enumerable on the prototype object (for example isPrototypeOf from
      // Object.prototype) and it will also not include 'replace' on objects that
      // extend String and change 'replace' (not that it is common for anyone to
      // extend anything except Object).
      for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
          key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
          if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
          }
      }
  };
  
  
  /**
   * Sealing classes breaks the older idiom of assigning properties on the
   * prototype rather than in the constructor.  As such, goog.defineClass
   * must not seal subclasses of these old-style classes until they are fixed.
   * Until then, this marks a class as "broken", instructing defineClass
   * not to seal subclasses.
   * @param {!Function} ctr The legacy constructor to tag as unsealable.
   */
  goog.tagUnsealableClass = function(ctr) {
      if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
          ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
      }
  };
  
  
  /**
   * Name for unsealable tag property.
   * @const @private {string}
   */
  goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = 'goog_defineClass_legacy_unsealable';
  
  goog.DEBUG = false;
  
  
  goog.inherits = function(childCtor, parentCtor) {
    /** @constructor */
    function tempCtor() {};
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
  
    /**
     * Calls superclass constructor/method.
     * @param {!Object} me Should always be "this".
     * @param {string} methodName
     * @param {...*} var_args
     * @return {?} The return value of the superclass method/constructor.
     */
    childCtor.base = function(me, methodName, var_args) {
      var args = Array.prototype.slice.call(arguments, 2);
      return parentCtor.prototype[methodName].apply(me, args);
    };
  };
  
  
  // Just enough browser detection for this file.
  if (!goog.userAgent) {
    goog.userAgent = (function() {
      var userAgent = "";
      if ("undefined" !== typeof navigator && navigator
          && "string" == typeof navigator.userAgent) {
        userAgent = navigator.userAgent;
      }
      var isOpera = userAgent.indexOf('Opera') == 0;
      return {
        jscript: {
          /**
           * @type {boolean}
           */
          HAS_JSCRIPT: 'ScriptEngine' in this
        },
        /**
         * @type {boolean}
         */
        OPERA: isOpera,
        /**
         * @type {boolean}
         */
        IE: !isOpera && userAgent.indexOf('MSIE') != -1,
        /**
         * @type {boolean}
         */
        WEBKIT: !isOpera && userAgent.indexOf('WebKit') != -1
      };
    })();
  }
  
  if (!goog.asserts) {
    goog.asserts = {
      /**
       * @param {*} condition Condition to check.
       */
      assert: function (condition) {
        if (!condition) {
          throw Error('Assertion error');
        }
      },
      /**
       * @param {...*} var_args
       */
      fail: function (var_args) {}
    };
  }
  
  
  // Stub out the document wrapper used by renderAs*.
  if (!goog.dom) {
    goog.dom = {};
    /**
     * @param {Document=} d
     * @constructor
     */
    goog.dom.DomHelper = function(d) {
      this.document_ = d || document;
    };
    /**
     * @return {!Document}
     */
    goog.dom.DomHelper.prototype.getDocument = function() {
      return this.document_;
    };
    /**
     * Creates a new element.
     * @param {string} name Tag name.
     * @return {!Element}
     */
    goog.dom.DomHelper.prototype.createElement = function(name) {
      return this.document_.createElement(name);
    };
    /**
     * Creates a new document fragment.
     * @return {!DocumentFragment}
     */
    goog.dom.DomHelper.prototype.createDocumentFragment = function() {
      return this.document_.createDocumentFragment();
    };
  }
  
  
  if (!goog.format) {
    goog.format = {
      insertWordBreaks: function(str, maxCharsBetweenWordBreaks) {
        str = String(str);
  
        var resultArr = [];
        var resultArrLen = 0;
  
        // These variables keep track of important state inside str.
        var isInTag = false;  // whether we're inside an HTML tag
        var isMaybeInEntity = false;  // whether we might be inside an HTML entity
        var numCharsWithoutBreak = 0;  // number of chars since last word break
        var flushIndex = 0;  // index of first char not yet flushed to resultArr
  
        for (var i = 0, n = str.length; i < n; ++i) {
          var charCode = str.charCodeAt(i);
  
          // If hit maxCharsBetweenWordBreaks, and not space next, then add <wbr>.
          if (numCharsWithoutBreak >= maxCharsBetweenWordBreaks &&
              // space
              charCode != 32) {
            resultArr[resultArrLen++] = str.substring(flushIndex, i);
            flushIndex = i;
            resultArr[resultArrLen++] = goog.format.WORD_BREAK;
            numCharsWithoutBreak = 0;
          }
  
          if (isInTag) {
            // If inside an HTML tag and we see '>', it's the end of the tag.
            if (charCode == 62) {
              isInTag = false;
            }
  
          } else if (isMaybeInEntity) {
            switch (charCode) {
              // Inside an entity, a ';' is the end of the entity.
              // The entity that just ended counts as one char, so increment
              // numCharsWithoutBreak.
            case 59:  // ';'
              isMaybeInEntity = false;
              ++numCharsWithoutBreak;
              break;
              // If maybe inside an entity and we see '<', we weren't actually in
              // an entity. But now we're inside and HTML tag.
            case 60:  // '<'
              isMaybeInEntity = false;
              isInTag = true;
              break;
              // If maybe inside an entity and we see ' ', we weren't actually in
              // an entity. Just correct the state and reset the
              // numCharsWithoutBreak since we just saw a space.
            case 32:  // ' '
              isMaybeInEntity = false;
              numCharsWithoutBreak = 0;
              break;
            }
  
          } else {  // !isInTag && !isInEntity
            switch (charCode) {
              // When not within a tag or an entity and we see '<', we're now
              // inside an HTML tag.
            case 60:  // '<'
              isInTag = true;
              break;
              // When not within a tag or an entity and we see '&', we might be
              // inside an entity.
            case 38:  // '&'
              isMaybeInEntity = true;
              break;
              // When we see a space, reset the numCharsWithoutBreak count.
            case 32:  // ' '
              numCharsWithoutBreak = 0;
              break;
              // When we see a non-space, increment the numCharsWithoutBreak.
            default:
              ++numCharsWithoutBreak;
              break;
            }
          }
        }
  
        // Flush the remaining chars at the end of the string.
        resultArr[resultArrLen++] = str.substring(flushIndex);
  
        return resultArr.join('');
      },
      /**
       * String inserted as a word break by insertWordBreaks(). Safari requires
       * <wbr></wbr>, Opera needs the &shy; entity, though this will give a
       * visible hyphen at breaks. IE8+ use a zero width space. Other browsers
       * just use <wbr>.
       * @type {string}
       * @private
       */
      WORD_BREAK:
          goog.userAgent.WEBKIT ? '<wbr></wbr>' :
          goog.userAgent.OPERA ? '&shy;' :
          goog.userAgent.IE ? '&#8203;' :
          '<wbr>'
    };
  }
  
  
  if (!goog.i18n) {
    goog.i18n = {
      bidi: {}
    };
  }
  
  
  /**
   * Constant that defines whether or not the current locale is an RTL locale.
   *
   * @type {boolean}
   */
  goog.i18n.bidi.IS_RTL = false;
  
  
  /**
   * Directionality enum.
   * @enum {number}
   */
  goog.i18n.bidi.Dir = {
    /**
     * Left-to-right.
     */
    LTR: 1,
  
    /**
     * Right-to-left.
     */
    RTL: -1,
  
    /**
     * Neither left-to-right nor right-to-left.
     */
    NEUTRAL: 0,
  
    /**
     * A historical misnomer for NEUTRAL.
     * @deprecated For "neutral", use NEUTRAL; for "unknown", use null.
     */
    UNKNOWN: 0
  };
  
  
  /**
   * Convert a directionality given in various formats to a goog.i18n.bidi.Dir
   * constant. Useful for interaction with different standards of directionality
   * representation.
   *
   * @param {goog.i18n.bidi.Dir|number|boolean|null} givenDir Directionality given
   *     in one of the following formats:
   *     1. A goog.i18n.bidi.Dir constant.
   *     2. A number (positive = LTR, negative = RTL, 0 = neutral).
   *     3. A boolean (true = RTL, false = LTR).
   *     4. A null for unknown directionality.
   * @param {boolean=} opt_noNeutral Whether a givenDir of zero or
   *     goog.i18n.bidi.Dir.NEUTRAL should be treated as null, i.e. unknown, in
   *     order to preserve legacy behavior.
   * @return {?goog.i18n.bidi.Dir} A goog.i18n.bidi.Dir constant matching the
   *     given directionality. If given null, returns null (i.e. unknown).
   */
  goog.i18n.bidi.toDir = function(givenDir, opt_noNeutral) {
    if (typeof givenDir == 'number') {
      // This includes the non-null goog.i18n.bidi.Dir case.
      return givenDir > 0 ? goog.i18n.bidi.Dir.LTR :
          givenDir < 0 ? goog.i18n.bidi.Dir.RTL :
          opt_noNeutral ? null : goog.i18n.bidi.Dir.NEUTRAL;
    } else if (givenDir == null) {
      return null;
    } else {
      // Must be typeof givenDir == 'boolean'.
      return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
    }
  };
  
  
  /**
   * Estimates the directionality of a string based on relative word counts.
   * If the number of RTL words is above a certain percentage of the total number
   * of strongly directional words, returns RTL.
   * Otherwise, if any words are strongly or weakly LTR, returns LTR.
   * Otherwise, returns NEUTRAL.
   * Numbers are counted as weakly LTR.
   * @param {string} str The string to be checked.
   * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
   *     Default: false.
   * @return {goog.i18n.bidi.Dir} Estimated overall directionality of {@code str}.
   */
  goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
    var rtlCount = 0;
    var totalCount = 0;
    var hasWeaklyLtr = false;
    var tokens = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml).
        split(soyshim.$$bidiWordSeparatorRe_);
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (soyshim.$$bidiRtlDirCheckRe_.test(token)) {
        rtlCount++;
        totalCount++;
      } else if (soyshim.$$bidiIsRequiredLtrRe_.test(token)) {
        hasWeaklyLtr = true;
      } else if (soyshim.$$bidiLtrCharRe_.test(token)) {
        totalCount++;
      } else if (soyshim.$$bidiHasNumeralsRe_.test(token)) {
        hasWeaklyLtr = true;
      }
    }
  
    return totalCount == 0 ?
        (hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.NEUTRAL) :
        (rtlCount / totalCount > soyshim.$$bidiRtlDetectionThreshold_ ?
            goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR);
  };
  
  
  /**
   * Utility class for formatting text for display in a potentially
   * opposite-directionality context without garbling. Provides the following
   * functionality:
   *
   * @param {goog.i18n.bidi.Dir|number|boolean|null} dir The context
   *     directionality, in one of the following formats:
   *     1. A goog.i18n.bidi.Dir constant. NEUTRAL is treated the same as null,
   *        i.e. unknown, for backward compatibility with legacy calls.
   *     2. A number (positive = LTR, negative = RTL, 0 = unknown).
   *     3. A boolean (true = RTL, false = LTR).
   *     4. A null for unknown directionality.
   * @constructor
   */
  goog.i18n.BidiFormatter = function(dir) {
    /**
     * The overall directionality of the context in which the formatter is being
     * used.
     * @type {?goog.i18n.bidi.Dir}
     * @private
     */
    this.dir_ = goog.i18n.bidi.toDir(dir, true /* opt_noNeutral */);
  };
  
  /**
   * @return {?goog.i18n.bidi.Dir} The context directionality.
   */
  goog.i18n.BidiFormatter.prototype.getContextDir = function() {
    return this.dir_;
  };
  
  /**
   * Returns 'dir="ltr"' or 'dir="rtl"', depending on the given directionality, if
   * it is not the same as the context directionality. Otherwise, returns the
   * empty string.
   *
   * @param {goog.i18n.bidi.Dir} dir A directionality.
   * @return {string} 'dir="rtl"' for RTL text in non-RTL context; 'dir="ltr"' for
   *     LTR text in non-LTR context; else, the empty string.
   */
  goog.i18n.BidiFormatter.prototype.knownDirAttr = function(dir) {
    return !dir || dir == this.dir_ ? '' : dir < 0 ? 'dir="rtl"' : 'dir="ltr"';
  };
  
  /**
   * Returns the trailing horizontal edge, i.e. "right" or "left", depending on
   * the global bidi directionality.
   * @return {string} "left" for RTL context and "right" otherwise.
   */
  goog.i18n.BidiFormatter.prototype.endEdge = function () {
    return this.dir_ < 0 ? 'left' : 'right';
  };
  
  /**
   * Returns the Unicode BiDi mark matching the context directionality (LRM for
   * LTR context directionality, RLM for RTL context directionality), or the
   * empty string for unknown context directionality.
   *
   * @return {string} LRM for LTR context directionality and RLM for RTL context
   *     directionality.
   */
  goog.i18n.BidiFormatter.prototype.mark = function () {
    return (
        (this.dir_ > 0) ? '\u200E' /*LRM*/ :
        (this.dir_ < 0) ? '\u200F' /*RLM*/ :
        '');
  };
  
  /**
   * Returns a Unicode bidi mark matching the context directionality (LRM or RLM)
   * if the directionality or the exit directionality of {@code text} are opposite
   * to the context directionality. Otherwise returns the empty string.
   * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
   * in text, making the logic suitable for HTML and HTML-escaped text.
   * @param {?goog.i18n.bidi.Dir} textDir {@code text}'s overall directionality,
   *     or null if unknown and needs to be estimated.
   * @param {string} text The text whose directionality is to be estimated.
   * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
   *     Default: false.
   * @return {string} A Unicode bidi mark matching the context directionality, or
   *     the empty string when either the context directionality is unknown or
   *     neither the text's overall nor its exit directionality is opposite to it.
   */
  goog.i18n.BidiFormatter.prototype.markAfterKnownDir = function (
      textDir, text, opt_isHtml) {
    if (textDir == null) {
      textDir = goog.i18n.bidi.estimateDirection(text, opt_isHtml);
    }
    return (
        this.dir_ > 0 && (textDir < 0 ||
            soyshim.$$bidiIsRtlExitText_(text, opt_isHtml)) ? '\u200E' : // LRM
        this.dir_ < 0 && (textDir > 0 ||
            soyshim.$$bidiIsLtrExitText_(text, opt_isHtml)) ? '\u200F' : // RLM
        '');
  };
  
  /**
   * Formats an HTML string for use in HTML output of the context directionality,
   * so an opposite-directionality string is neither garbled nor garbles what
   * follows it.
   *
   * @param {?goog.i18n.bidi.Dir} textDir {@code str}'s overall directionality, or
   *     null if unknown and needs to be estimated.
   * @param {string} str The input text (HTML or HTML-escaped).
   * @param {boolean=} placeholder This argument exists for consistency with the
   *     Closure Library. Specifying it has no effect.
   * @return {string} The input text after applying the above processing.
   */
  goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir = function(
      textDir, str, placeholder) {
    if (textDir == null) {
      textDir = goog.i18n.bidi.estimateDirection(str, true);
    }
    var reset = this.markAfterKnownDir(textDir, str, true);
    if (textDir > 0 && this.dir_ <= 0) {
      str = '<span dir="ltr">' + str + '</span>';
    } else if (textDir < 0 && this.dir_ >= 0) {
      str = '<span dir="rtl">' + str + '</span>';
    }
    return str + reset;
  };
  
  /**
   * Returns the leading horizontal edge, i.e. "left" or "right", depending on
   * the global bidi directionality.
   * @return {string} "right" for RTL context and "left" otherwise.
   */
  goog.i18n.BidiFormatter.prototype.startEdge = function () {
    return this.dir_ < 0 ? 'right' : 'left';
  };
  
  /**
   * Formats an HTML-escaped string for use in HTML output of the context
   * directionality, so an opposite-directionality string is neither garbled nor
   * garbles what follows it.
   * As opposed to {@link #spanWrapWithKnownDir}, this makes use of unicode bidi
   * formatting characters. In HTML, it should only be used inside attribute
   * values and elements that do not allow markup, e.g. an 'option' tag.
   *
   * @param {?goog.i18n.bidi.Dir} textDir {@code str}'s overall directionality, or
   *     null if unknown and needs to be estimated.
   * @param {string} str The input text (HTML-escaped).
   * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
   *     Default: false.
   * @return {string} The input text after applying the above processing.
   */
  goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir = function(
      textDir, str, opt_isHtml) {
    if (textDir == null) {
      textDir = goog.i18n.bidi.estimateDirection(str, opt_isHtml);
    }
    var reset = this.markAfterKnownDir(textDir, str, opt_isHtml);
    if (textDir > 0 && this.dir_ <= 0) {
      str = '\u202A' + str + '\u202C';
    } else if (textDir < 0 && this.dir_ >= 0) {
      str = '\u202B' + str + '\u202C';
    }
    return str + reset;
  };
  
  
  if (!goog.string) {
    goog.string = {
      /**
       * Converts \r\n, \r, and \n to <br>s
       * @param {*} str The string in which to convert newlines.
       * @param {boolean=} opt_xml Whether to use XML compatible tags.
       * @return {string} A copy of {@code str} with converted newlines.
       */
      newLineToBr: function(str, opt_xml) {
  
        str = String(str);
  
        // This quick test helps in the case when there are no chars to replace,
        // in the worst case this makes barely a difference to the time taken.
        if (!goog.string.NEWLINE_TO_BR_RE_.test(str)) {
          return str;
        }
  
        return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
      },
      urlEncode: encodeURIComponent,
      /**
       * Regular expression used within newlineToBr().
       * @type {RegExp}
       * @private
       */
      NEWLINE_TO_BR_RE_: /[\r\n]/
    };
  }
  
  /**
   * Utility class to facilitate much faster string concatenation in IE,
   * using Array.join() rather than the '+' operator. For other browsers
   * we simply use the '+' operator.
   *
   * @param {Object|number|string|boolean=} opt_a1 Optional first initial item
   *     to append.
   * @param {...Object|number|string|boolean} var_args Other initial items to
   *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
   * @constructor
   */
  goog.string.StringBuffer = function(opt_a1, var_args) {
    /**
     * Internal buffer for the string to be concatenated.
     * @type {string|Array}
     * @private
     */
    this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : '';
  
    if (opt_a1 != null) {
      this.append.apply(this, arguments);
    }
  };
  
  
  /**
   * Length of internal buffer (faster than calling buffer_.length).
   * Only used for IE.
   * @type {number}
   * @private
   */
  goog.string.StringBuffer.prototype.bufferLength_ = 0;
  
  /**
   * Appends one or more items to the string.
   *
   * Calling this with null, undefined, or empty arguments is an error.
   *
   * @param {Object|number|string|boolean} a1 Required first string.
   * @param {Object|number|string|boolean=} opt_a2 Optional second string.
   * @param {...Object|number|string|boolean} var_args Other items to append,
   *     e.g., sb.append('foo', 'bar', 'baz').
   * @return {goog.string.StringBuffer} This same StringBuilder object.
   */
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
  
    if (goog.userAgent.jscript.HAS_JSCRIPT) {
      if (opt_a2 == null) {  // no second argument (note: undefined == null)
        // Array assignment is 2x faster than Array push. Also, use a1
        // directly to avoid arguments instantiation, another 2x improvement.
        this.buffer_[this.bufferLength_++] = a1;
      } else {
        var arr = /**@type {Array.<number|string|boolean>}*/(this.buffer_);
        arr.push.apply(arr, arguments);
        this.bufferLength_ = this.buffer_.length;
      }
  
    } else {
  
      // Use a1 directly to avoid arguments instantiation for single-arg case.
      this.buffer_ += a1;
      if (opt_a2 != null) {  // no second argument (note: undefined == null)
        for (var i = 1; i < arguments.length; i++) {
          this.buffer_ += arguments[i];
        }
      }
    }
  
    return this;
  };
  
  
  /**
   * Clears the string.
   */
  goog.string.StringBuffer.prototype.clear = function() {
  
    if (goog.userAgent.jscript.HAS_JSCRIPT) {
       this.buffer_.length = 0;  // reuse array to avoid creating new object
       this.bufferLength_ = 0;
  
     } else {
       this.buffer_ = '';
     }
  };
  
  
  /**
   * Returns the concatenated string.
   *
   * @return {string} The concatenated string.
   */
  goog.string.StringBuffer.prototype.toString = function() {
  
    if (goog.userAgent.jscript.HAS_JSCRIPT) {
      var str = this.buffer_.join('');
      // Given a string with the entire contents, simplify the StringBuilder by
      // setting its contents to only be this string, rather than many fragments.
      this.clear();
      if (str) {
        this.append(str);
      }
      return str;
  
    } else {
      return /** @type {string} */ (this.buffer_);
    }
  };
  
  
  if (!goog.soy) goog.soy = {
    /**
     * Helper function to render a Soy template and then set the
     * output string as the innerHTML of an element. It is recommended
     * to use this helper function instead of directly setting
     * innerHTML in your hand-written code, so that it will be easier
     * to audit the code for cross-site scripting vulnerabilities.
     *
     * @param {Function} template The Soy template defining element's content.
     * @param {Object=} opt_templateData The data for the template.
     * @param {Object=} opt_injectedData The injected data for the template.
     * @param {(goog.dom.DomHelper|Document)=} opt_dom The context in which DOM
     *     nodes will be created.
     */
    renderAsElement: function(
      template, opt_templateData, opt_injectedData, opt_dom) {
      return /** @type {!Element} */ (soyshim.$$renderWithWrapper_(
          template, opt_templateData, opt_dom, true /* asElement */,
          opt_injectedData));
    },
    /**
     * Helper function to render a Soy template into a single node or
     * a document fragment. If the rendered HTML string represents a
     * single node, then that node is returned (note that this is
     * *not* a fragment, despite them name of the method). Otherwise a
     * document fragment is returned containing the rendered nodes.
     *
     * @param {Function} template The Soy template defining element's content.
     * @param {Object=} opt_templateData The data for the template.
     * @param {Object=} opt_injectedData The injected data for the template.
     * @param {(goog.dom.DomHelper|Document)=} opt_dom The context in which DOM
     *     nodes will be created.
     * @return {!Node} The resulting node or document fragment.
     */
    renderAsFragment: function(
      template, opt_templateData, opt_injectedData, opt_dom) {
      return soyshim.$$renderWithWrapper_(
          template, opt_templateData, opt_dom, false /* asElement */,
          opt_injectedData);
    },
    /**
     * Helper function to render a Soy template and then set the output string as
     * the innerHTML of an element. It is recommended to use this helper function
     * instead of directly setting innerHTML in your hand-written code, so that it
     * will be easier to audit the code for cross-site scripting vulnerabilities.
     *
     * NOTE: New code should consider using goog.soy.renderElement instead.
     *
     * @param {Element} element The element whose content we are rendering.
     * @param {Function} template The Soy template defining the element's content.
     * @param {Object=} opt_templateData The data for the template.
     * @param {Object=} opt_injectedData The injected data for the template.
     */
    renderElement: function(
        element, template, opt_templateData, opt_injectedData) {
      element.innerHTML = template(opt_templateData, null, opt_injectedData);
    },
    data: {}
  };
  
  
  /**
   * A type of textual content.
   *
   * This is an enum of type Object so that these values are unforgeable.
   *
   * @enum {!Object}
   */
  goog.soy.data.SanitizedContentKind = {
  
    /**
     * A snippet of HTML that does not start or end inside a tag, comment, entity,
     * or DOCTYPE; and that does not contain any executable code
     * (JS, {@code <object>}s, etc.) from a different trust domain.
     */
    HTML: goog.DEBUG ? {sanitizedContentKindHtml: true} : {},
  
    /**
     * Executable Javascript code or expression, safe for insertion in a
     * script-tag or event handler context, known to be free of any
     * attacker-controlled scripts. This can either be side-effect-free
     * Javascript (such as JSON) or Javascript that's entirely under Google's
     * control.
     */
    JS: goog.DEBUG ? {sanitizedContentJsChars: true} : {},
  
    /**
     * A sequence of code units that can appear between quotes (either kind) in a
     * JS program without causing a parse error, and without causing any side
     * effects.
     * <p>
     * The content should not contain unescaped quotes, newlines, or anything else
     * that would cause parsing to fail or to cause a JS parser to finish the
     * string its parsing inside the content.
     * <p>
     * The content must also not end inside an escape sequence ; no partial octal
     * escape sequences or odd number of '{@code \}'s at the end.
     */
    JS_STR_CHARS: goog.DEBUG ? {sanitizedContentJsStrChars: true} : {},
  
    /** A properly encoded portion of a URI. */
    URI: goog.DEBUG ? {sanitizedContentUri: true} : {},
  
    /**
     * Repeated attribute names and values. For example,
     * {@code dir="ltr" foo="bar" onclick="trustedFunction()" checked}.
     */
    ATTRIBUTES: goog.DEBUG ? {sanitizedContentHtmlAttribute: true} : {},
  
    // TODO: Consider separating rules, declarations, and values into
    // separate types, but for simplicity, we'll treat explicitly blessed
    // SanitizedContent as allowed in all of these contexts.
    /**
     * A CSS3 declaration, property, value or group of semicolon separated
     * declarations.
     */
    CSS: goog.DEBUG ? {sanitizedContentCss: true} : {},
  
    /**
     * Unsanitized plain-text content.
     *
     * This is effectively the "null" entry of this enum, and is sometimes used
     * to explicitly mark content that should never be used unescaped. Since any
     * string is safe to use as text, being of ContentKind.TEXT makes no
     * guarantees about its safety in any other context such as HTML.
     */
    TEXT: goog.DEBUG ? {sanitizedContentKindText: true} : {}
  };
  
  
  
  /**
   * A string-like object that carries a content-type and a content direction.
   *
   * IMPORTANT! Do not create these directly, nor instantiate the subclasses.
   * Instead, use a trusted, centrally reviewed library as endorsed by your team
   * to generate these objects. Otherwise, you risk accidentally creating
   * SanitizedContent that is attacker-controlled and gets evaluated unescaped in
   * templates.
   *
   * @constructor
   */
  goog.soy.data.SanitizedContent = function() {
    throw Error('Do not instantiate directly');
  };
  
  
  /**
   * The context in which this content is safe from XSS attacks.
   * @type {goog.soy.data.SanitizedContentKind}
   */
  goog.soy.data.SanitizedContent.prototype.contentKind;
  
  
  /**
   * The content's direction; null if unknown and thus to be estimated when
   * necessary.
   * @type {?goog.i18n.bidi.Dir}
   */
  goog.soy.data.SanitizedContent.prototype.contentDir = null;
  
  
  /**
   * The already-safe content.
   * @type {string}
   */
  goog.soy.data.SanitizedContent.prototype.content;
  
  
  /** @override */
  goog.soy.data.SanitizedContent.prototype.toString = function() {
    return this.content;
  };
  
  
  var soy = { esc: {} };
  var soydata = {};
  soydata.VERY_UNSAFE = {};
  var soyshim = { $$DEFAULT_TEMPLATE_DATA_: {} };
  /**
   * Helper function to render a Soy template into a single node or a document
   * fragment. If the rendered HTML string represents a single node, then that
   * node is returned. Otherwise a document fragment is created and returned
   * (wrapped in a DIV element if #opt_singleNode is true).
   *
   * @param {Function} template The Soy template defining the element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {(goog.dom.DomHelper|Document)=} opt_dom The context in which DOM
   *     nodes will be created.
   * @param {boolean=} opt_asElement Whether to wrap the fragment in an
   *     element if the template does not render a single element. If true,
   *     result is always an Element.
   * @param {Object=} opt_injectedData The injected data for the template.
   * @return {!Node} The resulting node or document fragment.
   * @private
   */
  soyshim.$$renderWithWrapper_ = function(
      template, opt_templateData, opt_dom, opt_asElement, opt_injectedData) {
  
    var dom = opt_dom || document;
    var wrapper = dom.createElement('div');
    wrapper.innerHTML = template(
      opt_templateData || soyshim.$$DEFAULT_TEMPLATE_DATA_, undefined,
      opt_injectedData);
  
    // If the template renders as a single element, return it.
    if (wrapper.childNodes.length == 1) {
      var firstChild = wrapper.firstChild;
      if (!opt_asElement || firstChild.nodeType == 1 /* Element */) {
        return /** @type {!Node} */ (firstChild);
      }
    }
  
    // If we're forcing it to be a single element, return the wrapper DIV.
    if (opt_asElement) {
      return wrapper;
    }
  
    // Otherwise, create and return a fragment.
    var fragment = dom.createDocumentFragment();
    while (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
    }
    return fragment;
  };
  
  
  /**
   * Strips str of any HTML mark-up and escapes. Imprecise in several ways, but
   * precision is not very important, since the result is only meant to be used
   * for directionality detection.
   * Based on goog.i18n.bidi.stripHtmlIfNeeded_().
   * @param {string} str The string to be stripped.
   * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
   *     Default: false.
   * @return {string} The stripped string.
   * @private
   */
  soyshim.$$bidiStripHtmlIfNecessary_ = function(str, opt_isHtml) {
    return opt_isHtml ? str.replace(soyshim.$$BIDI_HTML_SKIP_RE_, '') : str;
  };
  
  
  /**
   * Simplified regular expression for am HTML tag (opening or closing) or an HTML
   * escape - the things we want to skip over in order to ignore their ltr
   * characters.
   * Copied from goog.i18n.bidi.htmlSkipReg_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$BIDI_HTML_SKIP_RE_ = /<[^>]*>|&[^;]+;/g;
  
  
  /**
   * A practical pattern to identify strong LTR character. This pattern is not
   * theoretically correct according to unicode standard. It is simplified for
   * performance and small code size.
   * Copied from goog.i18n.bidi.ltrChars_.
   * @type {string}
   * @private
   */
  soyshim.$$bidiLtrChars_ =
      'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
      '\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF';
  
  
  /**
   * A practical pattern to identify strong RTL character. This pattern is not
   * theoretically correct according to unicode standard. It is simplified for
   * performance and small code size.
   * Copied from goog.i18n.bidi.rtlChars_.
   * @type {string}
   * @private
   */
  soyshim.$$bidiRtlChars_ = '\u0591-\u07FF\u200F\uFB1D-\uFDFF\uFE70-\uFEFC';
  
  
  /**
   * Regular expressions to check if a piece of text is of RTL directionality
   * on first character with strong directionality.
   * Based on goog.i18n.bidi.rtlDirCheckRe_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiRtlDirCheckRe_ = new RegExp(
      '^[^' + soyshim.$$bidiLtrChars_ + ']*[' + soyshim.$$bidiRtlChars_ + ']');
  
  
  /**
   * Regular expression to check for LTR characters.
   * Based on goog.i18n.bidi.ltrCharReg_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiLtrCharRe_ = new RegExp('[' + soyshim.$$bidiLtrChars_ + ']');
  
  
  /**
   * Regular expression to check if a string looks like something that must
   * always be LTR even in RTL text, e.g. a URL. When estimating the
   * directionality of text containing these, we treat these as weakly LTR,
   * like numbers.
   * Copied from goog.i18n.bidi.isRequiredLtrRe_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiIsRequiredLtrRe_ = /^http:\/\/.*/;
  
  
  /**
   * Regular expression to check if a string contains any numerals. Used to
   * differentiate between completely neutral strings and those containing
   * numbers, which are weakly LTR.
   * Copied from goog.i18n.bidi.hasNumeralsRe_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiHasNumeralsRe_ = /\d/;
  
  
  /**
   * Regular expression to split a string into "words" for directionality
   * estimation based on relative word counts.
   * Copied from goog.i18n.bidi.wordSeparatorRe_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiWordSeparatorRe_ = /\s+/;
  
  
  /**
   * This constant controls threshold of rtl directionality.
   * Copied from goog.i18n.bidi.rtlDetectionThreshold_.
   * @type {number}
   * @private
   */
  soyshim.$$bidiRtlDetectionThreshold_ = 0.40;
  
  /**
   * Regular expressions to check if the last strongly-directional character in a
   * piece of text is LTR.
   * Based on goog.i18n.bidi.ltrExitDirCheckRe_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiLtrExitDirCheckRe_ = new RegExp(
      '[' + soyshim.$$bidiLtrChars_ + '][^' + soyshim.$$bidiRtlChars_ + ']*$');
  
  
  /**
   * Regular expressions to check if the last strongly-directional character in a
   * piece of text is RTL.
   * Based on goog.i18n.bidi.rtlExitDirCheckRe_.
   * @type {RegExp}
   * @private
   */
  soyshim.$$bidiRtlExitDirCheckRe_ = new RegExp(
      '[' + soyshim.$$bidiRtlChars_ + '][^' + soyshim.$$bidiLtrChars_ + ']*$');
  
  
  /**
   * Check if the exit directionality a piece of text is LTR, i.e. if the last
   * strongly-directional character in the string is LTR.
   * Based on goog.i18n.bidi.endsWithLtr().
   * @param {string} str string being checked.
   * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
   *     Default: false.
   * @return {boolean} Whether LTR exit directionality was detected.
   * @private
   */
  soyshim.$$bidiIsLtrExitText_ = function(str, opt_isHtml) {
    str = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
    return soyshim.$$bidiLtrExitDirCheckRe_.test(str);
  };
  
  
  /**
   * Check if the exit directionality a piece of text is RTL, i.e. if the last
   * strongly-directional character in the string is RTL.
   * Based on goog.i18n.bidi.endsWithRtl().
   * @param {string} str string being checked.
   * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
   *     Default: false.
   * @return {boolean} Whether RTL exit directionality was detected.
   * @private
   */
  soyshim.$$bidiIsRtlExitText_ = function(str, opt_isHtml) {
    str = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
    return soyshim.$$bidiRtlExitDirCheckRe_.test(str);
  };
  
  
  // =============================================================================
  // COPIED FROM soyutils_usegoog.js
  
  
  // -----------------------------------------------------------------------------
  // StringBuilder (compatible with the 'stringbuilder' code style).
  
  
  /**
   * Utility class to facilitate much faster string concatenation in IE,
   * using Array.join() rather than the '+' operator. For other browsers
   * we simply use the '+' operator.
   *
   * @param {Object} var_args Initial items to append,
   *     e.g., new soy.StringBuilder('foo', 'bar').
   * @constructor
   */
  soy.StringBuilder = goog.string.StringBuffer;
  
  
  // -----------------------------------------------------------------------------
  // soydata: Defines typed strings, e.g. an HTML string {@code "a<b>c"} is
  // semantically distinct from the plain text string {@code "a<b>c"} and smart
  // templates can take that distinction into account.
  
  /**
   * A type of textual content.
   *
   * This is an enum of type Object so that these values are unforgeable.
   *
   * @enum {!Object}
   */
  soydata.SanitizedContentKind = goog.soy.data.SanitizedContentKind;
  
  
  /**
   * Checks whether a given value is of a given content kind.
   *
   * @param {*} value The value to be examined.
   * @param {soydata.SanitizedContentKind} contentKind The desired content
   *     kind.
   * @return {boolean} Whether the given value is of the given kind.
   * @private
   */
  soydata.isContentKind = function(value, contentKind) {
    // TODO(user): This function should really include the assert on
    // value.constructor that is currently sprinkled at most of the call sites.
    // Unfortunately, that would require a (debug-mode-only) switch statement.
    // TODO(user): Perhaps we should get rid of the contentKind property
    // altogether and only at the constructor.
    return value != null && value.contentKind === contentKind;
  };
  
  
  /**
   * Returns a given value's contentDir property, constrained to a
   * goog.i18n.bidi.Dir value or null. Returns null if the value is null,
   * undefined, a primitive or does not have a contentDir property, or the
   * property's value is not 1 (for LTR), -1 (for RTL), or 0 (for neutral).
   *
   * @param {*} value The value whose contentDir property, if any, is to
   *     be returned.
   * @return {?goog.i18n.bidi.Dir} The contentDir property.
   */
  soydata.getContentDir = function(value) {
    if (value != null) {
      switch (value.contentDir) {
        case goog.i18n.bidi.Dir.LTR:
          return goog.i18n.bidi.Dir.LTR;
        case goog.i18n.bidi.Dir.RTL:
          return goog.i18n.bidi.Dir.RTL;
        case goog.i18n.bidi.Dir.NEUTRAL:
          return goog.i18n.bidi.Dir.NEUTRAL;
      }
    }
    return null;
  };
  
  
  /**
   * Content of type {@link soydata.SanitizedContentKind.HTML}.
   *
   * The content is a string of HTML that can safely be embedded in a PCDATA
   * context in your app.  If you would be surprised to find that an HTML
   * sanitizer produced {@code s} (e.g.  it runs code or fetches bad URLs) and
   * you wouldn't write a template that produces {@code s} on security or privacy
   * grounds, then don't pass {@code s} here. The default content direction is
   * unknown, i.e. to be estimated when necessary.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedHtml = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedHtml, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.SanitizedHtml.prototype.contentKind = soydata.SanitizedContentKind.HTML;
  
  /**
   * Returns a SanitizedHtml object for a particular value. The content direction
   * is preserved.
   *
   * This HTML-escapes the value unless it is already SanitizedHtml.
   *
   * @param {*} value The value to convert. If it is already a SanitizedHtml
   *     object, it is left alone.
   * @return {!soydata.SanitizedHtml} A SanitizedHtml object derived from the
   *     stringified value. It is escaped unless the input is SanitizedHtml.
   */
  soydata.SanitizedHtml.from = function(value) {
    // The check is soydata.isContentKind() inlined for performance.
    if (value != null &&
        value.contentKind === soydata.SanitizedContentKind.HTML) {
      goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
      return /** @type {!soydata.SanitizedHtml} */ (value);
    }
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(
        soy.esc.$$escapeHtmlHelper(String(value)), soydata.getContentDir(value));
  };
  
  
  /**
   * Content of type {@link soydata.SanitizedContentKind.JS}.
   *
   * The content is Javascript source that when evaluated does not execute any
   * attacker-controlled scripts. The content direction is LTR.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedJs = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedJs, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.SanitizedJs.prototype.contentKind =
      soydata.SanitizedContentKind.JS;
  
  /** @override */
  soydata.SanitizedJs.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
  
  
  /**
   * Content of type {@link soydata.SanitizedContentKind.JS_STR_CHARS}.
   *
   * The content can be safely inserted as part of a single- or double-quoted
   * string without terminating the string. The default content direction is
   * unknown, i.e. to be estimated when necessary.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedJsStrChars = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedJsStrChars, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.SanitizedJsStrChars.prototype.contentKind =
      soydata.SanitizedContentKind.JS_STR_CHARS;
  
  /**
   * Content of type {@link soydata.SanitizedContentKind.URI}.
   *
   * The content is a URI chunk that the caller knows is safe to emit in a
   * template. The content direction is LTR.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedUri = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedUri, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.SanitizedUri.prototype.contentKind = soydata.SanitizedContentKind.URI;
  
  /** @override */
  soydata.SanitizedUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
  
  
  /**
   * Content of type {@link soydata.SanitizedContentKind.ATTRIBUTES}.
   *
   * The content should be safely embeddable within an open tag, such as a
   * key="value" pair. The content direction is LTR.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedHtmlAttribute = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedHtmlAttribute, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.SanitizedHtmlAttribute.prototype.contentKind =
      soydata.SanitizedContentKind.ATTRIBUTES;
  
  /** @override */
  soydata.SanitizedHtmlAttribute.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
  
  
  /**
   * Content of type {@link soydata.SanitizedContentKind.CSS}.
   *
   * The content is non-attacker-exploitable CSS, such as {@code color:#c3d9ff}.
   * The content direction is LTR.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedCss = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedCss, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.SanitizedCss.prototype.contentKind =
      soydata.SanitizedContentKind.CSS;
  
  /** @override */
  soydata.SanitizedCss.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
  
  
  /**
   * Unsanitized plain text string.
   *
   * While all strings are effectively safe to use as a plain text, there are no
   * guarantees about safety in any other context such as HTML. This is
   * sometimes used to mark that should never be used unescaped.
   *
   * @param {*} content Plain text with no guarantees.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.UnsanitizedText = function(content, opt_contentDir) {
    /** @override */
    this.content = String(content);
    this.contentDir = opt_contentDir != null ? opt_contentDir : null;
  };
  goog.inherits(soydata.UnsanitizedText, goog.soy.data.SanitizedContent);
  
  /** @override */
  soydata.UnsanitizedText.prototype.contentKind =
      soydata.SanitizedContentKind.TEXT;
  
  
  /**
   * Empty string, used as a type in Soy templates.
   * @enum {string}
   * @private
   */
  soydata.$$EMPTY_STRING_ = {
    VALUE: ''
  };
  
  
  /**
   * Creates a factory for SanitizedContent types.
   *
   * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
   * instantiate Sanitized* classes, without making the Sanitized* constructors
   * publicly usable. Requiring all construction to use the VERY_UNSAFE names
   * helps callers and their reviewers easily tell that creating SanitizedContent
   * is not always safe and calls for careful review.
   *
   * @param {function(new: T)} ctor A constructor.
   * @return {!function(*, ?goog.i18n.bidi.Dir=): T} A factory that takes
   *     content and an optional content direction and returns a new instance. If
   *     the content direction is undefined, ctor.prototype.contentDir is used.
   * @template T
   * @private
   */
  soydata.$$makeSanitizedContentFactory_ = function(ctor) {
    /** @type {function(new: goog.soy.data.SanitizedContent)} */
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    /**
     * Creates a ctor-type SanitizedContent instance.
     *
     * @param {*} content The content to put in the instance.
     * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction. If
     *     undefined, ctor.prototype.contentDir is used.
     * @return {goog.soy.data.SanitizedContent} The new instance. It is actually
     *     of type T above (ctor's type, a descendant of SanitizedContent), but
     *     there is no way to express that here.
     */
    function sanitizedContentFactory(content, opt_contentDir) {
      var result = new InstantiableCtor();
      result.content = String(content);
      if (opt_contentDir !== undefined) {
        result.contentDir = opt_contentDir;
      }
      return result;
    }
    return sanitizedContentFactory;
  };
  
  
  /**
   * Creates a factory for SanitizedContent types that should always have their
   * default directionality.
   *
   * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
   * instantiate Sanitized* classes, without making the Sanitized* constructors
   * publicly usable. Requiring all construction to use the VERY_UNSAFE names
   * helps callers and their reviewers easily tell that creating SanitizedContent
   * is not always safe and calls for careful review.
   *
   * @param {function(new: T, string)} ctor A constructor.
   * @return {!function(*): T} A factory that takes content and returns a new
   *     instance (with default directionality, i.e. ctor.prototype.contentDir).
   * @template T
   * @private
   */
  soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_ = function(ctor) {
    /** @type {function(new: goog.soy.data.SanitizedContent)} */
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    /**
     * Creates a ctor-type SanitizedContent instance.
     *
     * @param {*} content The content to put in the instance.
     * @return {goog.soy.data.SanitizedContent} The new instance. It is actually
     *     of type T above (ctor's type, a descendant of SanitizedContent), but
     *     there is no way to express that here.
     */
    function sanitizedContentFactory(content) {
      var result = new InstantiableCtor();
      result.content = String(content);
      return result;
    }
    return sanitizedContentFactory;
  };
  
  
  // -----------------------------------------------------------------------------
  // Sanitized content ordainers. Please use these with extreme caution (with the
  // exception of markUnsanitizedText). A good recommendation is to limit usage
  // of these to just a handful of files in your source tree where usages can be
  // carefully audited.
  
  
  /**
   * Protects a string from being used in an noAutoescaped context.
   *
   * This is useful for content where there is significant risk of accidental
   * unescaped usage in a Soy template. A great case is for user-controlled
   * data that has historically been a source of vulernabilities.
   *
   * @param {*} content Text to protect.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @return {!soydata.UnsanitizedText} A wrapper that is rejected by the
   *     Soy noAutoescape print directive.
   */
  soydata.markUnsanitizedText = function(content, opt_contentDir) {
    return new soydata.UnsanitizedText(content, opt_contentDir);
  };
  
  
  /**
   * Takes a leap of faith that the provided content is "safe" HTML.
   *
   * @param {*} content A string of HTML that can safely be embedded in
   *     a PCDATA context in your app. If you would be surprised to find that an
   *     HTML sanitizer produced {@code s} (e.g. it runs code or fetches bad URLs)
   *     and you wouldn't write a template that produces {@code s} on security or
   *     privacy grounds, then don't pass {@code s} here.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @return {!soydata.SanitizedHtml} Sanitized content wrapper that
   *     indicates to Soy not to escape when printed as HTML.
   */
  soydata.VERY_UNSAFE.ordainSanitizedHtml =
      soydata.$$makeSanitizedContentFactory_(soydata.SanitizedHtml);
  
  
  /**
   * Takes a leap of faith that the provided content is "safe" (non-attacker-
   * controlled, XSS-free) Javascript.
   *
   * @param {*} content Javascript source that when evaluated does not
   *     execute any attacker-controlled scripts.
   * @return {!soydata.SanitizedJs} Sanitized content wrapper that indicates to
   *     Soy not to escape when printed as Javascript source.
   */
  soydata.VERY_UNSAFE.ordainSanitizedJs =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
          soydata.SanitizedJs);
  
  
  // TODO: This function is probably necessary, either externally or internally
  // as an implementation detail. Generally, plain text will always work here,
  // as there's no harm to unescaping the string and then re-escaping when
  // finally printed.
  /**
   * Takes a leap of faith that the provided content can be safely embedded in
   * a Javascript string without re-esacping.
   *
   * @param {*} content Content that can be safely inserted as part of a
   *     single- or double-quoted string without terminating the string.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @return {!soydata.SanitizedJsStrChars} Sanitized content wrapper that
   *     indicates to Soy not to escape when printed in a JS string.
   */
  soydata.VERY_UNSAFE.ordainSanitizedJsStrChars =
      soydata.$$makeSanitizedContentFactory_(soydata.SanitizedJsStrChars);
  
  
  /**
   * Takes a leap of faith that the provided content is "safe" to use as a URI
   * in a Soy template.
   *
   * This creates a Soy SanitizedContent object which indicates to Soy there is
   * no need to escape it when printed as a URI (e.g. in an href or src
   * attribute), such as if it's already been encoded or  if it's a Javascript:
   * URI.
   *
   * @param {*} content A chunk of URI that the caller knows is safe to
   *     emit in a template.
   * @return {!soydata.SanitizedUri} Sanitized content wrapper that indicates to
   *     Soy not to escape or filter when printed in URI context.
   */
  soydata.VERY_UNSAFE.ordainSanitizedUri =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
          soydata.SanitizedUri);
  
  
  /**
   * Takes a leap of faith that the provided content is "safe" to use as an
   * HTML attribute.
   *
   * @param {*} content An attribute name and value, such as
   *     {@code dir="ltr"}.
   * @return {!soydata.SanitizedHtmlAttribute} Sanitized content wrapper that
   *     indicates to Soy not to escape when printed as an HTML attribute.
   */
  soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
          soydata.SanitizedHtmlAttribute);
  
  
  /**
   * Takes a leap of faith that the provided content is "safe" to use as CSS
   * in a style attribute or block.
   *
   * @param {*} content CSS, such as {@code color:#c3d9ff}.
   * @return {!soydata.SanitizedCss} Sanitized CSS wrapper that indicates to
   *     Soy there is no need to escape or filter when printed in CSS context.
   */
  soydata.VERY_UNSAFE.ordainSanitizedCss =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
          soydata.SanitizedCss);
  
  
  // -----------------------------------------------------------------------------
  // Public utilities.
  
  
  /**
   * Helper function to render a Soy template and then set the output string as
   * the innerHTML of an element. It is recommended to use this helper function
   * instead of directly setting innerHTML in your hand-written code, so that it
   * will be easier to audit the code for cross-site scripting vulnerabilities.
   *
   * NOTE: New code should consider using goog.soy.renderElement instead.
   *
   * @param {Element} element The element whose content we are rendering.
   * @param {Function} template The Soy template defining the element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {Object=} opt_injectedData The injected data for the template.
   */
  soy.renderElement = goog.soy.renderElement;
  
  
  /**
   * Helper function to render a Soy template into a single node or a document
   * fragment. If the rendered HTML string represents a single node, then that
   * node is returned (note that this is *not* a fragment, despite them name of
   * the method). Otherwise a document fragment is returned containing the
   * rendered nodes.
   *
   * NOTE: New code should consider using goog.soy.renderAsFragment
   * instead (note that the arguments are different).
   *
   * @param {Function} template The Soy template defining the element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {Document=} opt_document The document used to create DOM nodes. If not
   *     specified, global document object is used.
   * @param {Object=} opt_injectedData The injected data for the template.
   * @return {!Node} The resulting node or document fragment.
   */
  soy.renderAsFragment = function(
      template, opt_templateData, opt_document, opt_injectedData) {
    return goog.soy.renderAsFragment(
        template, opt_templateData, opt_injectedData,
        new goog.dom.DomHelper(opt_document));
  };
  
  
  /**
   * Helper function to render a Soy template into a single node. If the rendered
   * HTML string represents a single node, then that node is returned. Otherwise,
   * a DIV element is returned containing the rendered nodes.
   *
   * NOTE: New code should consider using goog.soy.renderAsElement
   * instead (note that the arguments are different).
   *
   * @param {Function} template The Soy template defining the element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {Document=} opt_document The document used to create DOM nodes. If not
   *     specified, global document object is used.
   * @param {Object=} opt_injectedData The injected data for the template.
   * @return {!Element} Rendered template contents, wrapped in a parent DIV
   *     element if necessary.
   */
  soy.renderAsElement = function(
      template, opt_templateData, opt_document, opt_injectedData) {
    return goog.soy.renderAsElement(
        template, opt_templateData, opt_injectedData,
        new goog.dom.DomHelper(opt_document));
  };
  
  
  // -----------------------------------------------------------------------------
  // Below are private utilities to be used by Soy-generated code only.
  
  
  /**
   * Whether the locale is right-to-left.
   *
   * @type {boolean}
   */
  soy.$$IS_LOCALE_RTL = goog.i18n.bidi.IS_RTL;
  
  
  /**
   * Builds an augmented map. The returned map will contain mappings from both
   * the base map and the additional map. If the same key appears in both, then
   * the value from the additional map will be visible, while the value from the
   * base map will be hidden. The base map will be used, but not modified.
   *
   * @param {!Object} baseMap The original map to augment.
   * @param {!Object} additionalMap A map containing the additional mappings.
   * @return {!Object} An augmented map containing both the original and
   *     additional mappings.
   */
  soy.$$augmentMap = function(baseMap, additionalMap) {
  
    // Create a new map whose '__proto__' field is set to baseMap.
    /** @constructor */
    function TempCtor() {}
    TempCtor.prototype = baseMap;
    var augmentedMap = new TempCtor();
  
    // Add the additional mappings to the new map.
    for (var key in additionalMap) {
      augmentedMap[key] = additionalMap[key];
    }
  
    return augmentedMap;
  };
  
  
  /**
   * Checks that the given map key is a string.
   * @param {*} key Key to check.
   * @return {string} The given key.
   */
  soy.$$checkMapKey = function(key) {
    // TODO: Support map literal with nonstring key.
    if ((typeof key) != 'string') {
      throw Error(
          'Map literal\'s key expression must evaluate to string' +
          ' (encountered type "' + (typeof key) + '").');
    }
    return key;
  };
  
  
  /**
   * Gets the keys in a map as an array. There are no guarantees on the order.
   * @param {Object} map The map to get the keys of.
   * @return {Array.<string>} The array of keys in the given map.
   */
  soy.$$getMapKeys = function(map) {
    var mapKeys = [];
    for (var key in map) {
      mapKeys.push(key);
    }
    return mapKeys;
  };
  
  
  /**
   * Gets a consistent unique id for the given delegate template name. Two calls
   * to this function will return the same id if and only if the input names are
   * the same.
   *
   * <p> Important: This function must always be called with a string constant.
   *
   * <p> If Closure Compiler is not being used, then this is just this identity
   * function. If Closure Compiler is being used, then each call to this function
   * will be replaced with a short string constant, which will be consistent per
   * input name.
   *
   * @param {string} delTemplateName The delegate template name for which to get a
   *     consistent unique id.
   * @return {string} A unique id that is consistent per input name.
   *
   * @consistentIdGenerator
   */
  soy.$$getDelTemplateId = function(delTemplateName) {
    return delTemplateName;
  };
  
  
  /**
   * Map from registered delegate template key to the priority of the
   * implementation.
   * @type {Object}
   * @private
   */
  soy.$$DELEGATE_REGISTRY_PRIORITIES_ = {};
  
  /**
   * Map from registered delegate template key to the implementation function.
   * @type {Object}
   * @private
   */
  soy.$$DELEGATE_REGISTRY_FUNCTIONS_ = {};
  
  
  /**
   * Registers a delegate implementation. If the same delegate template key (id
   * and variant) has been registered previously, then priority values are
   * compared and only the higher priority implementation is stored (if
   * priorities are equal, an error is thrown).
   *
   * @param {string} delTemplateId The delegate template id.
   * @param {string} delTemplateVariant The delegate template variant (can be
   *     empty string).
   * @param {number} delPriority The implementation's priority value.
   * @param {Function} delFn The implementation function.
   */
  soy.$$registerDelegateFn = function(
      delTemplateId, delTemplateVariant, delPriority, delFn) {
  
    var mapKey = 'key_' + delTemplateId + ':' + delTemplateVariant;
    var currPriority = soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey];
    if (currPriority === undefined || delPriority > currPriority) {
      // Registering new or higher-priority function: replace registry entry.
      soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey] = delPriority;
      soy.$$DELEGATE_REGISTRY_FUNCTIONS_[mapKey] = delFn;
    } else if (delPriority == currPriority) {
      // Registering same-priority function: error.
      throw Error(
          'Encountered two active delegates with the same priority ("' +
              delTemplateId + ':' + delTemplateVariant + '").');
    } else {
      // Registering lower-priority function: do nothing.
    }
  };
  
  
  /**
   * Retrieves the (highest-priority) implementation that has been registered for
   * a given delegate template key (id and variant). If no implementation has
   * been registered for the key, then the fallback is the same id with empty
   * variant. If the fallback is also not registered, and allowsEmptyDefault is
   * true, then returns an implementation that is equivalent to an empty template
   * (i.e. rendered output would be empty string).
   *
   * @param {string} delTemplateId The delegate template id.
   * @param {string|number} delTemplateVariant The delegate template variant (can
   *     be an empty string, or a number when a global is used).
   * @param {boolean} allowsEmptyDefault Whether to default to the empty template
   *     function if there's no active implementation.
   * @return {Function} The retrieved implementation function.
   */
  soy.$$getDelegateFn = function(
      delTemplateId, delTemplateVariant, allowsEmptyDefault) {
  
    var delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_[
        'key_' + delTemplateId + ':' + delTemplateVariant];
    if (! delFn && delTemplateVariant != '') {
      // Fallback to empty variant.
      delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_['key_' + delTemplateId + ':'];
    }
  
    if (delFn) {
      return delFn;
    } else if (allowsEmptyDefault) {
      return soy.$$EMPTY_TEMPLATE_FN_;
    } else {
      throw Error(
          'Found no active impl for delegate call to "' + delTemplateId + ':' +
              delTemplateVariant + '" (and not allowemptydefault="true").');
    }
  };
  
  
  /**
   * Private helper soy.$$getDelegateFn(). This is the empty template function
   * that is returned whenever there's no delegate implementation found.
   *
   * @param {Object.<string, *>=} opt_data
   * @param {soy.StringBuilder=} opt_sb
   * @param {Object.<string, *>=} opt_ijData
   * @return {string}
   * @private
   */
  soy.$$EMPTY_TEMPLATE_FN_ = function(opt_data, opt_sb, opt_ijData) {
    return '';
  };
  
  
  // -----------------------------------------------------------------------------
  // Internal sanitized content wrappers.
  
  
  /**
   * Creates a SanitizedContent factory for SanitizedContent types for internal
   * Soy let and param blocks.
   *
   * This is a hack within Soy so that SanitizedContent objects created via let
   * and param blocks will truth-test as false if they are empty string.
   * Tricking the Javascript runtime to treat empty SanitizedContent as falsey is
   * not possible, and changing the Soy compiler to wrap every boolean statement
   * for just this purpose is impractical.  Instead, we just avoid wrapping empty
   * string as SanitizedContent, since it's a no-op for empty strings anyways.
   *
   * @param {function(new: T)} ctor A constructor.
   * @return {!function(*, ?goog.i18n.bidi.Dir=): (T|soydata.$$EMPTY_STRING_)}
   *     A factory that takes content and an optional content direction and
   *     returns a new instance, or an empty string. If the content direction is
   *     undefined, ctor.prototype.contentDir is used.
   * @template T
   * @private
   */
  soydata.$$makeSanitizedContentFactoryForInternalBlocks_ = function(ctor) {
    /** @type {function(new: goog.soy.data.SanitizedContent)} */
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    /**
     * Creates a ctor-type SanitizedContent instance.
     *
     * @param {*} content The content to put in the instance.
     * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction. If
     *     undefined, ctor.prototype.contentDir is used.
     * @return {goog.soy.data.SanitizedContent|soydata.$$EMPTY_STRING_} The new
     *     instance, or an empty string. A new instance is actually of type T
     *     above (ctor's type, a descendant of SanitizedContent), but there's no
     *     way to express that here.
     */
    function sanitizedContentFactory(content, opt_contentDir) {
      var contentString = String(content);
      if (!contentString) {
        return soydata.$$EMPTY_STRING_.VALUE;
      }
      var result = new InstantiableCtor();
      result.content = String(content);
      if (opt_contentDir !== undefined) {
        result.contentDir = opt_contentDir;
      }
      return result;
    }
    return sanitizedContentFactory;
  };
  
  
  /**
   * Creates a SanitizedContent factory for SanitizedContent types that should
   * always have their default directionality for internal Soy let and param
   * blocks.
   *
   * This is a hack within Soy so that SanitizedContent objects created via let
   * and param blocks will truth-test as false if they are empty string.
   * Tricking the Javascript runtime to treat empty SanitizedContent as falsey is
   * not possible, and changing the Soy compiler to wrap every boolean statement
   * for just this purpose is impractical.  Instead, we just avoid wrapping empty
   * string as SanitizedContent, since it's a no-op for empty strings anyways.
   *
   * @param {function(new: T)} ctor A constructor.
   * @return {!function(*): (T|soydata.$$EMPTY_STRING_)} A
   *     factory that takes content and returns a
   *     new instance (with default directionality, i.e.
   *     ctor.prototype.contentDir), or an empty string.
   * @template T
   * @private
   */
  soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_ =
      function(ctor) {
    /** @type {function(new: goog.soy.data.SanitizedContent)} */
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    /**
     * Creates a ctor-type SanitizedContent instance.
     *
     * @param {*} content The content to put in the instance.
     * @return {goog.soy.data.SanitizedContent|soydata.$$EMPTY_STRING_} The new
     *     instance, or an empty string. A new instance is actually of type T
     *     above (ctor's type, a descendant of SanitizedContent), but there's no
     *     way to express that here.
     */
    function sanitizedContentFactory(content) {
      var contentString = String(content);
      if (!contentString) {
        return soydata.$$EMPTY_STRING_.VALUE;
      }
      var result = new InstantiableCtor();
      result.content = String(content);
      return result;
    }
    return sanitizedContentFactory;
  };
  
  
  /**
   * Creates kind="text" block contents (internal use only).
   *
   * @param {*} content Text.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @return {!soydata.UnsanitizedText|soydata.$$EMPTY_STRING_} Wrapped result.
   */
  soydata.$$markUnsanitizedTextForInternalBlocks = function(
      content, opt_contentDir) {
    var contentString = String(content);
    if (!contentString) {
      return soydata.$$EMPTY_STRING_.VALUE;
    }
    return new soydata.UnsanitizedText(contentString, opt_contentDir);
  };
  
  
  /**
   * Creates kind="html" block contents (internal use only).
   *
   * @param {*} content Text.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @return {soydata.SanitizedHtml|soydata.$$EMPTY_STRING_} Wrapped result.
   */
  soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks =
      soydata.$$makeSanitizedContentFactoryForInternalBlocks_(
          soydata.SanitizedHtml);
  
  
  /**
   * Creates kind="js" block contents (internal use only).
   *
   * @param {*} content Text.
   * @return {soydata.SanitizedJs|soydata.$$EMPTY_STRING_} Wrapped result.
   */
  soydata.VERY_UNSAFE.$$ordainSanitizedJsForInternalBlocks =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
          soydata.SanitizedJs);
  
  
  /**
   * Creates kind="uri" block contents (internal use only).
   *
   * @param {*} content Text.
   * @return {soydata.SanitizedUri|soydata.$$EMPTY_STRING_} Wrapped result.
   */
  soydata.VERY_UNSAFE.$$ordainSanitizedUriForInternalBlocks =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
          soydata.SanitizedUri);
  
  
  /**
   * Creates kind="attributes" block contents (internal use only).
   *
   * @param {*} content Text.
   * @return {soydata.SanitizedHtmlAttribute|soydata.$$EMPTY_STRING_} Wrapped
   *     result.
   */
  soydata.VERY_UNSAFE.$$ordainSanitizedAttributesForInternalBlocks =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
          soydata.SanitizedHtmlAttribute);
  
  
  /**
   * Creates kind="css" block contents (internal use only).
   *
   * @param {*} content Text.
   * @return {soydata.SanitizedCss|soydata.$$EMPTY_STRING_} Wrapped result.
   */
  soydata.VERY_UNSAFE.$$ordainSanitizedCssForInternalBlocks =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
          soydata.SanitizedCss);
  
  
  // -----------------------------------------------------------------------------
  // Escape/filter/normalize.
  
  
  /**
   * Returns a SanitizedHtml object for a particular value. The content direction
   * is preserved.
   *
   * This HTML-escapes the value unless it is already SanitizedHtml. Escapes
   * double quote '"' in addition to '&', '<', and '>' so that a string can be
   * included in an HTML tag attribute value within double quotes.
   *
   * @param {*} value The value to convert. If it is already a SanitizedHtml
   *     object, it is left alone.
   * @return {!soydata.SanitizedHtml} An escaped version of value.
   */
  soy.$$escapeHtml = function(value) {
    return soydata.SanitizedHtml.from(value);
  };
  
  
  /**
   * Strips unsafe tags to convert a string of untrusted HTML into HTML that
   * is safe to embed. The content direction is preserved.
   *
   * @param {*} value The string-like value to be escaped. May not be a string,
   *     but the value will be coerced to a string.
   * @return {!soydata.SanitizedHtml} A sanitized and normalized version of value.
   */
  soy.$$cleanHtml = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
      return /** @type {!soydata.SanitizedHtml} */ (value);
    }
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(
        soy.$$stripHtmlTags(value, soy.esc.$$SAFE_TAG_WHITELIST_),
        soydata.getContentDir(value));
  };
  
  
  /**
   * Escapes HTML special characters in a string so that it can be embedded in
   * RCDATA.
   * <p>
   * Escapes HTML special characters so that the value will not prematurely end
   * the body of a tag like {@code <textarea>} or {@code <title>}. RCDATA tags
   * cannot contain other HTML entities, so it is not strictly necessary to escape
   * HTML special characters except when part of that text looks like an HTML
   * entity or like a close tag : {@code </textarea>}.
   * <p>
   * Will normalize known safe HTML to make sure that sanitized HTML (which could
   * contain an innocuous {@code </textarea>} don't prematurely end an RCDATA
   * element.
   *
   * @param {*} value The string-like value to be escaped. May not be a string,
   *     but the value will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeHtmlRcdata = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
      return soy.esc.$$normalizeHtmlHelper(value.content);
    }
    return soy.esc.$$escapeHtmlHelper(value);
  };
  
  
  /**
   * Matches any/only HTML5 void elements' start tags.
   * See http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
   * @type {RegExp}
   * @private
   */
  soy.$$HTML5_VOID_ELEMENTS_ = new RegExp(
      '^<(?:area|base|br|col|command|embed|hr|img|input' +
      '|keygen|link|meta|param|source|track|wbr)\\b');
  
  
  /**
   * Removes HTML tags from a string of known safe HTML.
   * If opt_tagWhitelist is not specified or is empty, then
   * the result can be used as an attribute value.
   *
   * @param {*} value The HTML to be escaped. May not be a string, but the
   *     value will be coerced to a string.
   * @param {Object.<string, number>=} opt_tagWhitelist Has an own property whose
   *     name is a lower-case tag name and whose value is {@code 1} for
   *     each element that is allowed in the output.
   * @return {string} A representation of value without disallowed tags,
   *     HTML comments, or other non-text content.
   */
  soy.$$stripHtmlTags = function(value, opt_tagWhitelist) {
    if (!opt_tagWhitelist) {
      // If we have no white-list, then use a fast track which elides all tags.
      return String(value).replace(soy.esc.$$HTML_TAG_REGEX_, '')
          // This is just paranoia since callers should normalize the result
          // anyway, but if they didn't, it would be necessary to ensure that
          // after the first replace non-tag uses of < do not recombine into
          // tags as in "<<foo>script>alert(1337)</<foo>script>".
          .replace(soy.esc.$$LT_REGEX_, '&lt;');
    }
  
    // Escapes '[' so that we can use [123] below to mark places where tags
    // have been removed.
    var html = String(value).replace(/\[/g, '&#91;');
  
    // Consider all uses of '<' and replace whitelisted tags with markers like
    // [1] which are indices into a list of approved tag names.
    // Replace all other uses of < and > with entities.
    var tags = [];
    html = html.replace(
      soy.esc.$$HTML_TAG_REGEX_,
      function(tok, tagName) {
        if (tagName) {
          tagName = tagName.toLowerCase();
          if (opt_tagWhitelist.hasOwnProperty(tagName) &&
              opt_tagWhitelist[tagName]) {
            var start = tok.charAt(1) === '/' ? '</' : '<';
            var index = tags.length;
            tags[index] = start + tagName + '>';
            return '[' + index + ']';
          }
        }
        return '';
      });
  
    // Escape HTML special characters. Now there are no '<' in html that could
    // start a tag.
    html = soy.esc.$$normalizeHtmlHelper(html);
  
    var finalCloseTags = soy.$$balanceTags_(tags);
  
    // Now html contains no tags or less-than characters that could become
    // part of a tag via a replacement operation and tags only contains
    // approved tags.
    // Reinsert the white-listed tags.
    html = html.replace(
         /\[(\d+)\]/g, function(_, index) { return tags[index]; });
  
    // Close any still open tags.
    // This prevents unclosed formatting elements like <ol> and <table> from
    // breaking the layout of containing HTML.
    return html + finalCloseTags;
  };
  
  
  /**
   * Throw out any close tags that don't correspond to start tags.
   * If {@code <table>} is used for formatting, embedded HTML shouldn't be able
   * to use a mismatched {@code </table>} to break page layout.
   *
   * @param {Array.<string>} tags an array of tags that will be modified in place
   *    include tags, the empty string, or concatenations of empty tags.
   * @return {string} zero or more closed tags that close all elements that are
   *    opened in tags but not closed.
   * @private
   */
  soy.$$balanceTags_ = function(tags) {
    var open = [];
    for (var i = 0, n = tags.length; i < n; ++i) {
      var tag = tags[i];
      if (tag.charAt(1) === '/') {
        var openTagIndex = open.length - 1;
        // NOTE: This is essentially lastIndexOf, but it's not supported in IE.
        while (openTagIndex >= 0 && open[openTagIndex] != tag) {
          openTagIndex--;
        }
        if (openTagIndex < 0) {
          tags[i] = '';  // Drop close tag.
        } else {
          tags[i] = open.slice(openTagIndex).reverse().join('');
          open.length = openTagIndex;
        }
      } else if (!soy.$$HTML5_VOID_ELEMENTS_.test(tag)) {
        open.push('</' + tag.substring(1));
      }
    }
    return open.reverse().join('');
  };
  
  
  /**
   * Escapes HTML special characters in an HTML attribute value.
   *
   * @param {*} value The HTML to be escaped. May not be a string, but the
   *     value will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeHtmlAttribute = function(value) {
    // NOTE: We don't accept ATTRIBUTES here because ATTRIBUTES is actually not
    // the attribute value context, but instead k/v pairs.
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
      // NOTE: After removing tags, we also escape quotes ("normalize") so that
      // the HTML can be embedded in attribute context.
      goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
      return soy.esc.$$normalizeHtmlHelper(soy.$$stripHtmlTags(value.content));
    }
    return soy.esc.$$escapeHtmlHelper(value);
  };
  
  
  /**
   * Escapes HTML special characters in a string including space and other
   * characters that can end an unquoted HTML attribute value.
   *
   * @param {*} value The HTML to be escaped. May not be a string, but the
   *     value will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeHtmlAttributeNospace = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
      return soy.esc.$$normalizeHtmlNospaceHelper(
          soy.$$stripHtmlTags(value.content));
    }
    return soy.esc.$$escapeHtmlNospaceHelper(value);
  };
  
  
  /**
   * Filters out strings that cannot be a substring of a valid HTML attribute.
   *
   * Note the input is expected to be key=value pairs.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} A valid HTML attribute name part or name/value pair.
   *     {@code "zSoyz"} if the input is invalid.
   */
  soy.$$filterHtmlAttributes = function(value) {
    // NOTE: Explicitly no support for SanitizedContentKind.HTML, since that is
    // meaningless in this context, which is generally *between* html attributes.
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.ATTRIBUTES)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedHtmlAttribute);
      // Add a space at the end to ensure this won't get merged into following
      // attributes, unless the interpretation is unambiguous (ending with quotes
      // or a space).
      return value.content.replace(/([^"'\s])$/, '$1 ');
    }
    // TODO: Dynamically inserting attributes that aren't marked as trusted is
    // probably unnecessary.  Any filtering done here will either be inadequate
    // for security or not flexible enough.  Having clients use kind="attributes"
    // in parameters seems like a wiser idea.
    return soy.esc.$$filterHtmlAttributesHelper(value);
  };
  
  
  /**
   * Filters out strings that cannot be a substring of a valid HTML element name.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} A valid HTML element name part.
   *     {@code "zSoyz"} if the input is invalid.
   */
  soy.$$filterHtmlElementName = function(value) {
    // NOTE: We don't accept any SanitizedContent here. HTML indicates valid
    // PCDATA, not tag names. A sloppy developer shouldn't be able to cause an
    // exploit:
    // ... {let userInput}script src=http://evil.com/evil.js{/let} ...
    // ... {param tagName kind="html"}{$userInput}{/param} ...
    // ... <{$tagName}>Hello World</{$tagName}>
    return soy.esc.$$filterHtmlElementNameHelper(value);
  };
  
  
  /**
   * Escapes characters in the value to make it valid content for a JS string
   * literal.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   * @deprecated
   */
  soy.$$escapeJs = function(value) {
    return soy.$$escapeJsString(value);
  };
  
  
  /**
   * Escapes characters in the value to make it valid content for a JS string
   * literal.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeJsString = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.JS_STR_CHARS)) {
      // TODO: It might still be worthwhile to normalize it to remove
      // unescaped quotes, null, etc: replace(/(?:^|[^\])['"]/g, '\\$
      goog.asserts.assert(value.constructor === soydata.SanitizedJsStrChars);
      return value.content;
    }
    return soy.esc.$$escapeJsStringHelper(value);
  };
  
  
  /**
   * Encodes a value as a JavaScript literal.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} A JavaScript code representation of the input.
   */
  soy.$$escapeJsValue = function(value) {
    // We surround values with spaces so that they can't be interpolated into
    // identifiers by accident.
    // We could use parentheses but those might be interpreted as a function call.
    if (value == null) {  // Intentionally matches undefined.
      // Java returns null from maps where there is no corresponding key while
      // JS returns undefined.
      // We always output null for compatibility with Java which does not have a
      // distinct undefined value.
      return ' null ';
    }
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.JS)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedJs);
      return value.content;
    }
    switch (typeof value) {
      case 'boolean': case 'number':
        return ' ' + value + ' ';
      default:
        return "'" + soy.esc.$$escapeJsStringHelper(String(value)) + "'";
    }
  };
  
  
  /**
   * Escapes characters in the string to make it valid content for a JS regular
   * expression literal.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeJsRegex = function(value) {
    return soy.esc.$$escapeJsRegexHelper(value);
  };
  
  
  /**
   * Matches all URI mark characters that conflict with HTML attribute delimiters
   * or that cannot appear in a CSS uri.
   * From <a href="http://www.w3.org/TR/CSS2/grammar.html">G.2: CSS grammar</a>
   * <pre>
   *     url        ([!#$%&*-~]|{nonascii}|{escape})*
   * </pre>
   *
   * @type {RegExp}
   * @private
   */
  soy.$$problematicUriMarks_ = /['()]/g;
  
  /**
   * @param {string} ch A single character in {@link soy.$$problematicUriMarks_}.
   * @return {string}
   * @private
   */
  soy.$$pctEncode_ = function(ch) {
    return '%' + ch.charCodeAt(0).toString(16);
  };
  
  /**
   * Escapes a string so that it can be safely included in a URI.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeUri = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.URI)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedUri);
      return soy.$$normalizeUri(value);
    }
    // Apostophes and parentheses are not matched by encodeURIComponent.
    // They are technically special in URIs, but only appear in the obsolete mark
    // production in Appendix D.2 of RFC 3986, so can be encoded without changing
    // semantics.
    var encoded = soy.esc.$$escapeUriHelper(value);
    soy.$$problematicUriMarks_.lastIndex = 0;
    if (soy.$$problematicUriMarks_.test(encoded)) {
      return encoded.replace(soy.$$problematicUriMarks_, soy.$$pctEncode_);
    }
    return encoded;
  };
  
  
  /**
   * Removes rough edges from a URI by escaping any raw HTML/JS string delimiters.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$normalizeUri = function(value) {
    return soy.esc.$$normalizeUriHelper(value);
  };
  
  
  /**
   * Vets a URI's protocol and removes rough edges from a URI by escaping
   * any raw HTML/JS string delimiters.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$filterNormalizeUri = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.URI)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedUri);
      return soy.$$normalizeUri(value);
    }
    return soy.esc.$$filterNormalizeUriHelper(value);
  };
  
  
  /**
   * Allows only data-protocol image URI's.
   *
   * @param {*} value The value to process. May not be a string, but the value
   *     will be coerced to a string.
   * @return {!soydata.SanitizedUri} An escaped version of value.
   */
  soy.$$filterImageDataUri = function(value) {
    // NOTE: Even if it's a SanitizedUri, we will still filter it.
    return soydata.VERY_UNSAFE.ordainSanitizedUri(
        soy.esc.$$filterImageDataUriHelper(value));
  };
  
  
  /**
   * Escapes a string so it can safely be included inside a quoted CSS string.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} An escaped version of value.
   */
  soy.$$escapeCssString = function(value) {
    return soy.esc.$$escapeCssStringHelper(value);
  };
  
  
  /**
   * Encodes a value as a CSS identifier part, keyword, or quantity.
   *
   * @param {*} value The value to escape. May not be a string, but the value
   *     will be coerced to a string.
   * @return {string} A safe CSS identifier part, keyword, or quanitity.
   */
  soy.$$filterCssValue = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.CSS)) {
      goog.asserts.assert(value.constructor === soydata.SanitizedCss);
      return value.content;
    }
    // Uses == to intentionally match null and undefined for Java compatibility.
    if (value == null) {
      return '';
    }
    return soy.esc.$$filterCssValueHelper(value);
  };
  
  
  /**
   * Sanity-checks noAutoescape input for explicitly tainted content.
   *
   * SanitizedContentKind.TEXT is used to explicitly mark input that was never
   * meant to be used unescaped.
   *
   * @param {*} value The value to filter.
   * @return {*} The value, that we dearly hope will not cause an attack.
   */
  soy.$$filterNoAutoescape = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.TEXT)) {
      // Fail in development mode.
      goog.asserts.fail(
          'Tainted SanitizedContentKind.TEXT for |noAutoescape: `%s`',
          [value.content]);
      // Return innocuous data in production.
      return 'zSoyz';
    }
  
    return value;
  };
  
  
  // -----------------------------------------------------------------------------
  // Basic directives/functions.
  
  
  /**
   * Converts \r\n, \r, and \n to <br>s
   * @param {*} value The string in which to convert newlines.
   * @return {string|!soydata.SanitizedHtml} A copy of {@code value} with
   *     converted newlines. If {@code value} is SanitizedHtml, the return value
   *     is also SanitizedHtml, of the same known directionality.
   */
  soy.$$changeNewlineToBr = function(value) {
    var result = goog.string.newLineToBr(String(value), false);
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
      return soydata.VERY_UNSAFE.ordainSanitizedHtml(
          result, soydata.getContentDir(value));
    }
    return result;
  };
  
  
  /**
   * Inserts word breaks ('wbr' tags) into a HTML string at a given interval. The
   * counter is reset if a space is encountered. Word breaks aren't inserted into
   * HTML tags or entities. Entites count towards the character count; HTML tags
   * do not.
   *
   * @param {*} value The HTML string to insert word breaks into. Can be other
   *     types, but the value will be coerced to a string.
   * @param {number} maxCharsBetweenWordBreaks Maximum number of non-space
   *     characters to allow before adding a word break.
   * @return {string|!soydata.SanitizedHtml} The string including word
   *     breaks. If {@code value} is SanitizedHtml, the return value
   *     is also SanitizedHtml, of the same known directionality.
   */
  soy.$$insertWordBreaks = function(value, maxCharsBetweenWordBreaks) {
    var result = goog.format.insertWordBreaks(
        String(value), maxCharsBetweenWordBreaks);
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
      return soydata.VERY_UNSAFE.ordainSanitizedHtml(
          result, soydata.getContentDir(value));
    }
    return result;
  };
  
  
  /**
   * Truncates a string to a given max length (if it's currently longer),
   * optionally adding ellipsis at the end.
   *
   * @param {*} str The string to truncate. Can be other types, but the value will
   *     be coerced to a string.
   * @param {number} maxLen The maximum length of the string after truncation
   *     (including ellipsis, if applicable).
   * @param {boolean} doAddEllipsis Whether to add ellipsis if the string needs
   *     truncation.
   * @return {string} The string after truncation.
   */
  soy.$$truncate = function(str, maxLen, doAddEllipsis) {
  
    str = String(str);
    if (str.length <= maxLen) {
      return str;  // no need to truncate
    }
  
    // If doAddEllipsis, either reduce maxLen to compensate, or else if maxLen is
    // too small, just turn off doAddEllipsis.
    if (doAddEllipsis) {
      if (maxLen > 3) {
        maxLen -= 3;
      } else {
        doAddEllipsis = false;
      }
    }
  
    // Make sure truncating at maxLen doesn't cut up a unicode surrogate pair.
    if (soy.$$isHighSurrogate_(str.charAt(maxLen - 1)) &&
        soy.$$isLowSurrogate_(str.charAt(maxLen))) {
      maxLen -= 1;
    }
  
    // Truncate.
    str = str.substring(0, maxLen);
  
    // Add ellipsis.
    if (doAddEllipsis) {
      str += '...';
    }
  
    return str;
  };
  
  /**
   * Private helper for $$truncate() to check whether a char is a high surrogate.
   * @param {string} ch The char to check.
   * @return {boolean} Whether the given char is a unicode high surrogate.
   * @private
   */
  soy.$$isHighSurrogate_ = function(ch) {
    return 0xD800 <= ch && ch <= 0xDBFF;
  };
  
  /**
   * Private helper for $$truncate() to check whether a char is a low surrogate.
   * @param {string} ch The char to check.
   * @return {boolean} Whether the given char is a unicode low surrogate.
   * @private
   */
  soy.$$isLowSurrogate_ = function(ch) {
    return 0xDC00 <= ch && ch <= 0xDFFF;
  };
  
  
  // -----------------------------------------------------------------------------
  // Bidi directives/functions.
  
  
  /**
   * Cache of bidi formatter by context directionality, so we don't keep on
   * creating new objects.
   * @type {!Object.<!goog.i18n.BidiFormatter>}
   * @private
   */
  soy.$$bidiFormatterCache_ = {};
  
  
  /**
   * Returns cached bidi formatter for bidiGlobalDir, or creates a new one.
   * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
   *     if rtl, 0 if unknown.
   * @return {goog.i18n.BidiFormatter} A formatter for bidiGlobalDir.
   * @private
   */
  soy.$$getBidiFormatterInstance_ = function(bidiGlobalDir) {
    return soy.$$bidiFormatterCache_[bidiGlobalDir] ||
           (soy.$$bidiFormatterCache_[bidiGlobalDir] =
               new goog.i18n.BidiFormatter(bidiGlobalDir));
  };
  
  
  /**
   * Estimate the overall directionality of text. If opt_isHtml, makes sure to
   * ignore the LTR nature of the mark-up and escapes in text, making the logic
   * suitable for HTML and HTML-escaped text.
   * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
   * estimating the directionality.
   *
   * @param {*} text The content whose directionality is to be estimated.
   * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
   *     Default: false.
   * @return {number} 1 if text is LTR, -1 if it is RTL, and 0 if it is neutral.
   */
  soy.$$bidiTextDir = function(text, opt_isHtml) {
    var contentDir = soydata.getContentDir(text);
    if (contentDir != null) {
      return contentDir;
    }
    var isHtml = opt_isHtml ||
        soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    return goog.i18n.bidi.estimateDirection(text + '', isHtml);
  };
  
  
  /**
   * Returns 'dir="ltr"' or 'dir="rtl"', depending on text's estimated
   * directionality, if it is not the same as bidiGlobalDir.
   * Otherwise, returns the empty string.
   * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
   * in text, making the logic suitable for HTML and HTML-escaped text.
   * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
   * estimating the directionality.
   *
   * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
   *     if rtl, 0 if unknown.
   * @param {*} text The content whose directionality is to be estimated.
   * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
   *     Default: false.
   * @return {soydata.SanitizedHtmlAttribute} 'dir="rtl"' for RTL text in non-RTL
   *     context; 'dir="ltr"' for LTR text in non-LTR context;
   *     else, the empty string.
   */
  soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
    var contentDir = soydata.getContentDir(text);
    if (contentDir == null) {
      var isHtml = opt_isHtml ||
          soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
      contentDir = goog.i18n.bidi.estimateDirection(text + '', isHtml);
    }
    return soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute(
        formatter.knownDirAttr(contentDir));
  };
  
  
  /**
   * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
   * directionality or the exit directionality of text are opposite to
   * bidiGlobalDir. Otherwise returns the empty string.
   * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
   * in text, making the logic suitable for HTML and HTML-escaped text.
   * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
   * estimating the directionality.
   *
   * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
   *     if rtl, 0 if unknown.
   * @param {*} text The content whose directionality is to be estimated.
   * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
   *     Default: false.
   * @return {string} A Unicode bidi mark matching bidiGlobalDir, or the empty
   *     string when text's overall and exit directionalities both match
   *     bidiGlobalDir, or bidiGlobalDir is 0 (unknown).
   */
  soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
    var isHtml = opt_isHtml ||
        soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    return formatter.markAfterKnownDir(soydata.getContentDir(text), text + '',
        isHtml);
  };
  
  
  /**
   * Returns text wrapped in a <span dir="ltr|rtl"> according to its
   * directionality - but only if that is neither neutral nor the same as the
   * global context. Otherwise, returns text unchanged.
   * Always treats text as HTML/HTML-escaped, i.e. ignores mark-up and escapes
   * when estimating text's directionality.
   * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
   * estimating the directionality.
   *
   * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
   *     if rtl, 0 if unknown.
   * @param {*} text The string to be wrapped. Can be other types, but the value
   *     will be coerced to a string.
   * @return {!goog.soy.data.SanitizedContent|string} The wrapped text.
   */
  soy.$$bidiSpanWrap = function(bidiGlobalDir, text) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  
    // We always treat the value as HTML, because span-wrapping is only useful
    // when its output will be treated as HTML (without escaping), and because
    // |bidiSpanWrap is not itself specified to do HTML escaping in Soy. (Both
    // explicit and automatic HTML escaping, if any, is done before calling
    // |bidiSpanWrap because the BidiSpanWrapDirective Java class implements
    // SanitizedContentOperator, but this does not mean that the input has to be
    // HTML SanitizedContent. In legacy usage, a string that is not
    // SanitizedContent is often printed in an autoescape="false" template or by
    // a print with a |noAutoescape, in which case our input is just SoyData.) If
    // the output will be treated as HTML, the input had better be safe
    // HTML/HTML-escaped (even if it isn't HTML SanitizedData), or we have an XSS
    // opportunity and a much bigger problem than bidi garbling.
    var wrappedText = formatter.spanWrapWithKnownDir(
        soydata.getContentDir(text), text + '', true /* opt_isHtml */);
  
    // Like other directives whose Java class implements SanitizedContentOperator,
    // |bidiSpanWrap is called after the escaping (if any) has already been done,
    // and thus there is no need for it to produce actual SanitizedContent.
    return wrappedText;
  };
  
  
  /**
   * Returns text wrapped in Unicode BiDi formatting characters according to its
   * directionality, i.e. either LRE or RLE at the beginning and PDF at the end -
   * but only if text's directionality is neither neutral nor the same as the
   * global context. Otherwise, returns text unchanged.
   * Only treats soydata.SanitizedHtml as HTML/HTML-escaped, i.e. ignores mark-up
   * and escapes when estimating text's directionality.
   * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
   * estimating the directionality.
   *
   * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
   *     if rtl, 0 if unknown.
   * @param {*} text The string to be wrapped. Can be other types, but the value
   *     will be coerced to a string.
   * @return {!goog.soy.data.SanitizedContent|string} The wrapped string.
   */
  soy.$$bidiUnicodeWrap = function(bidiGlobalDir, text) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  
    // We treat the value as HTML if and only if it says it's HTML, even though in
    // legacy usage, we sometimes have an HTML string (not SanitizedContent) that
    // is passed to an autoescape="false" template or a {print $foo|noAutoescape},
    // with the output going into an HTML context without escaping. We simply have
    // no way of knowing if this is what is happening when we get
    // non-SanitizedContent input, and most of the time it isn't.
    var isHtml = soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    var wrappedText = formatter.unicodeWrapWithKnownDir(
        soydata.getContentDir(text), text + '', isHtml);
  
    // Bidi-wrapping a value converts it to the context directionality. Since it
    // does not cost us anything, we will indicate this known direction in the
    // output SanitizedContent, even though the intended consumer of that
    // information - a bidi wrapping directive - has already been run.
    var wrappedTextDir = formatter.getContextDir();
  
    // Unicode-wrapping UnsanitizedText gives UnsanitizedText.
    // Unicode-wrapping safe HTML or JS string data gives valid, safe HTML or JS
    // string data.
    // ATTENTION: Do these need to be ...ForInternalBlocks()?
    if (soydata.isContentKind(text, soydata.SanitizedContentKind.TEXT)) {
      return new soydata.UnsanitizedText(wrappedText, wrappedTextDir);
    }
    if (isHtml) {
      return soydata.VERY_UNSAFE.ordainSanitizedHtml(wrappedText, wrappedTextDir);
    }
    if (soydata.isContentKind(text, soydata.SanitizedContentKind.JS_STR_CHARS)) {
      return soydata.VERY_UNSAFE.ordainSanitizedJsStrChars(
          wrappedText, wrappedTextDir);
    }
  
    // Unicode-wrapping does not conform to the syntax of the other types of
    // content. For lack of anything better to do, we we do not declare a content
    // kind at all by falling through to the non-SanitizedContent case below.
    // TODO(user): Consider throwing a runtime error on receipt of
    // SanitizedContent other than TEXT, HTML, or JS_STR_CHARS.
  
    // The input was not SanitizedContent, so our output isn't SanitizedContent
    // either.
    return wrappedText;
  };
  
  
  // -----------------------------------------------------------------------------
  // Generated code.
  
  
  
  
  
  
  
  
  // START GENERATED CODE FOR ESCAPERS.
  
  /**
   * @type {function (*) : string}
   */
  soy.esc.$$escapeUriHelper = function(v) {
    return encodeURIComponent(String(v));
  };
  
  /**
   * Maps characters to the escaped versions for the named escape directives.
   * @type {Object.<string, string>}
   * @private
   */
  soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = {
    '\x00': '\x26#0;',
    '\x22': '\x26quot;',
    '\x26': '\x26amp;',
    '\x27': '\x26#39;',
    '\x3c': '\x26lt;',
    '\x3e': '\x26gt;',
    '\x09': '\x26#9;',
    '\x0a': '\x26#10;',
    '\x0b': '\x26#11;',
    '\x0c': '\x26#12;',
    '\x0d': '\x26#13;',
    ' ': '\x26#32;',
    '-': '\x26#45;',
    '\/': '\x26#47;',
    '\x3d': '\x26#61;',
    '`': '\x26#96;',
    '\x85': '\x26#133;',
    '\xa0': '\x26#160;',
    '\u2028': '\x26#8232;',
    '\u2029': '\x26#8233;'
  };
  
  /**
   * A function that can be used with String.replace.
   * @param {string} ch A single character matched by a compatible matcher.
   * @return {string} A token in the output language.
   * @private
   */
  soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_[ch];
  };
  
  /**
   * Maps characters to the escaped versions for the named escape directives.
   * @type {Object.<string, string>}
   * @private
   */
  soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = {
    '\x00': '\\x00',
    '\x08': '\\x08',
    '\x09': '\\t',
    '\x0a': '\\n',
    '\x0b': '\\x0b',
    '\x0c': '\\f',
    '\x0d': '\\r',
    '\x22': '\\x22',
    '\x26': '\\x26',
    '\x27': '\\x27',
    '\/': '\\\/',
    '\x3c': '\\x3c',
    '\x3d': '\\x3d',
    '\x3e': '\\x3e',
    '\\': '\\\\',
    '\x85': '\\x85',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
    '$': '\\x24',
    '(': '\\x28',
    ')': '\\x29',
    '*': '\\x2a',
    '+': '\\x2b',
    ',': '\\x2c',
    '-': '\\x2d',
    '.': '\\x2e',
    ':': '\\x3a',
    '?': '\\x3f',
    '[': '\\x5b',
    ']': '\\x5d',
    '^': '\\x5e',
    '{': '\\x7b',
    '|': '\\x7c',
    '}': '\\x7d'
  };
  
  /**
   * A function that can be used with String.replace.
   * @param {string} ch A single character matched by a compatible matcher.
   * @return {string} A token in the output language.
   * @private
   */
  soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_[ch];
  };
  
  /**
   * Maps characters to the escaped versions for the named escape directives.
   * @type {Object.<string, string>}
   * @private
   */
  soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_ = {
    '\x00': '\\0 ',
    '\x08': '\\8 ',
    '\x09': '\\9 ',
    '\x0a': '\\a ',
    '\x0b': '\\b ',
    '\x0c': '\\c ',
    '\x0d': '\\d ',
    '\x22': '\\22 ',
    '\x26': '\\26 ',
    '\x27': '\\27 ',
    '(': '\\28 ',
    ')': '\\29 ',
    '*': '\\2a ',
    '\/': '\\2f ',
    ':': '\\3a ',
    ';': '\\3b ',
    '\x3c': '\\3c ',
    '\x3d': '\\3d ',
    '\x3e': '\\3e ',
    '@': '\\40 ',
    '\\': '\\5c ',
    '{': '\\7b ',
    '}': '\\7d ',
    '\x85': '\\85 ',
    '\xa0': '\\a0 ',
    '\u2028': '\\2028 ',
    '\u2029': '\\2029 '
  };
  
  /**
   * A function that can be used with String.replace.
   * @param {string} ch A single character matched by a compatible matcher.
   * @return {string} A token in the output language.
   * @private
   */
  soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_[ch];
  };
  
  /**
   * Maps characters to the escaped versions for the named escape directives.
   * @type {Object.<string, string>}
   * @private
   */
  soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = {
    '\x00': '%00',
    '\x01': '%01',
    '\x02': '%02',
    '\x03': '%03',
    '\x04': '%04',
    '\x05': '%05',
    '\x06': '%06',
    '\x07': '%07',
    '\x08': '%08',
    '\x09': '%09',
    '\x0a': '%0A',
    '\x0b': '%0B',
    '\x0c': '%0C',
    '\x0d': '%0D',
    '\x0e': '%0E',
    '\x0f': '%0F',
    '\x10': '%10',
    '\x11': '%11',
    '\x12': '%12',
    '\x13': '%13',
    '\x14': '%14',
    '\x15': '%15',
    '\x16': '%16',
    '\x17': '%17',
    '\x18': '%18',
    '\x19': '%19',
    '\x1a': '%1A',
    '\x1b': '%1B',
    '\x1c': '%1C',
    '\x1d': '%1D',
    '\x1e': '%1E',
    '\x1f': '%1F',
    ' ': '%20',
    '\x22': '%22',
    '\x27': '%27',
    '(': '%28',
    ')': '%29',
    '\x3c': '%3C',
    '\x3e': '%3E',
    '\\': '%5C',
    '{': '%7B',
    '}': '%7D',
    '\x7f': '%7F',
    '\x85': '%C2%85',
    '\xa0': '%C2%A0',
    '\u2028': '%E2%80%A8',
    '\u2029': '%E2%80%A9',
    '\uff01': '%EF%BC%81',
    '\uff03': '%EF%BC%83',
    '\uff04': '%EF%BC%84',
    '\uff06': '%EF%BC%86',
    '\uff07': '%EF%BC%87',
    '\uff08': '%EF%BC%88',
    '\uff09': '%EF%BC%89',
    '\uff0a': '%EF%BC%8A',
    '\uff0b': '%EF%BC%8B',
    '\uff0c': '%EF%BC%8C',
    '\uff0f': '%EF%BC%8F',
    '\uff1a': '%EF%BC%9A',
    '\uff1b': '%EF%BC%9B',
    '\uff1d': '%EF%BC%9D',
    '\uff1f': '%EF%BC%9F',
    '\uff20': '%EF%BC%A0',
    '\uff3b': '%EF%BC%BB',
    '\uff3d': '%EF%BC%BD'
  };
  
  /**
   * A function that can be used with String.replace.
   * @param {string} ch A single character matched by a compatible matcher.
   * @return {string} A token in the output language.
   * @private
   */
  soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_[ch];
  };
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_ESCAPE_HTML_ = /[\x00\x22\x26\x27\x3c\x3e]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_ = /[\x00\x22\x27\x3c\x3e]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x26\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_ = /[\x00\x08-\x0d\x22\x26\x27\/\x3c-\x3e\\\x85\u2028\u2029]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_ = /[\x00\x08-\x0d\x22\x24\x26-\/\x3a\x3c-\x3f\x5b-\x5e\x7b-\x7d\x85\u2028\u2029]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_ = /[\x00\x08-\x0d\x22\x26-\x2a\/\x3a-\x3e@\\\x7b\x7d\x85\xa0\u2028\u2029]/g;
  
  /**
   * Matches characters that need to be escaped for the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = /[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g;
  
  /**
   * A pattern that vets values produced by the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_ = /^(?!-*(?:expression|(?:moz-)?binding))(?:[.#]?-?(?:[_a-z0-9-]+)(?:-[_a-z0-9-]+)*-?|-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[a-z]{1,2}|%)?|!important|)$/i;
  
  /**
   * A pattern that vets values produced by the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_ = /^(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i;
  
  /**
   * A pattern that vets values produced by the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_ = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+\/]+=*$/i;
  
  /**
   * A pattern that vets values produced by the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_ = /^(?!style|on|action|archive|background|cite|classid|codebase|data|dsync|href|longdesc|src|usemap)(?:[a-z0-9_$:-]*)$/i;
  
  /**
   * A pattern that vets values produced by the named directives.
   * @type RegExp
   * @private
   */
  soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_ = /^(?!script|style|title|textarea|xmp|no)[a-z0-9_$:-]*$/i;
  
  /**
   * A helper for the Soy directive |escapeHtml
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$escapeHtmlHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_ESCAPE_HTML_,
        soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
  };
  
  /**
   * A helper for the Soy directive |normalizeHtml
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$normalizeHtmlHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_,
        soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
  };
  
  /**
   * A helper for the Soy directive |escapeHtmlNospace
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$escapeHtmlNospaceHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_,
        soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
  };
  
  /**
   * A helper for the Soy directive |normalizeHtmlNospace
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$normalizeHtmlNospaceHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_,
        soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
  };
  
  /**
   * A helper for the Soy directive |escapeJsString
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$escapeJsStringHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_,
        soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
  };
  
  /**
   * A helper for the Soy directive |escapeJsRegex
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$escapeJsRegexHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_,
        soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
  };
  
  /**
   * A helper for the Soy directive |escapeCssString
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$escapeCssStringHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_,
        soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_);
  };
  
  /**
   * A helper for the Soy directive |filterCssValue
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$filterCssValueHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_.test(str)) {
      return 'zSoyz';
    }
    return str;
  };
  
  /**
   * A helper for the Soy directive |normalizeUri
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$normalizeUriHelper = function(value) {
    var str = String(value);
    return str.replace(
        soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_,
        soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
  };
  
  /**
   * A helper for the Soy directive |filterNormalizeUri
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$filterNormalizeUriHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_.test(str)) {
      return '#zSoyz';
    }
    return str.replace(
        soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_,
        soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
  };
  
  /**
   * A helper for the Soy directive |filterImageDataUri
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$filterImageDataUriHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_.test(str)) {
      return 'data:image/gif;base64,zSoyz';
    }
    return str;
  };
  
  /**
   * A helper for the Soy directive |filterHtmlAttributes
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$filterHtmlAttributesHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_.test(str)) {
      return 'zSoyz';
    }
    return str;
  };
  
  /**
   * A helper for the Soy directive |filterHtmlElementName
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$filterHtmlElementNameHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_.test(str)) {
      return 'zSoyz';
    }
    return str;
  };
  
  /**
   * Matches all tags, HTML comments, and DOCTYPEs in tag soup HTML.
   * By removing these, and replacing any '<' or '>' characters with
   * entities we guarantee that the result can be embedded into a
   * an attribute without introducing a tag boundary.
   *
   * @type {RegExp}
   * @private
   */
  soy.esc.$$HTML_TAG_REGEX_ = /<(?:!|\/?([a-zA-Z][a-zA-Z0-9:\-]*))(?:[^>'"]|"[^"]*"|'[^']*')*>/g;
  
  /**
   * Matches all occurrences of '<'.
   *
   * @type {RegExp}
   * @private
   */
  soy.esc.$$LT_REGEX_ = /</g;
  
  /**
   * Maps lower-case names of innocuous tags to 1.
   *
   * @type {Object.<string,number>}
   * @private
   */
  soy.esc.$$SAFE_TAG_WHITELIST_ = {'b': 1, 'br': 1, 'em': 1, 'i': 1, 's': 1, 'sub': 1, 'sup': 1, 'u': 1};
  
  // END GENERATED CODE
  
  window.soy = soy;
  window.soydata = soydata;
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/aui.js
(typeof window === 'undefined' ? global : window).__e6e8b453903e65b16809f2a71873f682 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from aui.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  
  
  aui.renderExtraAttributes = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    var output = '';
    if (opt_data.extraAttributes) {
      if (Object.prototype.toString.call(opt_data.extraAttributes) === '[object Object]') {
        var attrList7 = soy.$$getMapKeys(opt_data.extraAttributes);
        var attrListLen7 = attrList7.length;
        for (var attrIndex7 = 0; attrIndex7 < attrListLen7; attrIndex7++) {
          var attrData7 = attrList7[attrIndex7];
          output += ' ' + soy.$$escapeHtml(attrData7) + '="' + soy.$$escapeHtml(opt_data.extraAttributes[attrData7]) + '"';
        }
      } else {
        output += ' ' + soy.$$filterNoAutoescape(opt_data.extraAttributes);
      }
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.renderExtraAttributes.soyTemplateName = 'aui.renderExtraAttributes';
  }
  
  
  aui.renderExtraClasses = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    var output = '';
    if (opt_data.extraClasses) {
      if ((opt_data.extraClasses) instanceof Array) {
        var classList23 = opt_data.extraClasses;
        var classListLen23 = classList23.length;
        for (var classIndex23 = 0; classIndex23 < classListLen23; classIndex23++) {
          var classData23 = classList23[classIndex23];
          output += ' ' + soy.$$escapeHtml(classData23);
        }
      } else {
        output += ' ' + soy.$$escapeHtml(opt_data.extraClasses);
      }
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.renderExtraClasses.soyTemplateName = 'aui.renderExtraClasses';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/avatar.js
(typeof window === 'undefined' ? global : window).__9d22df7541593b4d86613387110910ac = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from avatar.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.avatar.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.avatar == 'undefined') { aui.avatar = {}; }
  
  
  aui.avatar.avatar = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-avatar aui-avatar-' + soy.$$escapeHtml(opt_data.size) + soy.$$escapeHtml(opt_data.isProject ? ' aui-avatar-project' : '') + soy.$$escapeHtml(opt_data.badgeContent ? ' aui-avatar-badged' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><span class="aui-avatar-inner"><img src="' + soy.$$escapeHtml(opt_data.avatarImageUrl) + '"' + ((opt_data.accessibilityText) ? ' alt="' + soy.$$escapeHtml(opt_data.accessibilityText) + '"' : '') + ((opt_data.title) ? ' title="' + soy.$$escapeHtml(opt_data.title) + '"' : '') + ((opt_data.imageClasses) ? ' class="' + soy.$$escapeHtml(opt_data.imageClasses) + '"' : '') + ' /></span>' + ((opt_data.badgeContent) ? soy.$$filterNoAutoescape(opt_data.badgeContent) : '') + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + '>';
  };
  if (goog.DEBUG) {
    aui.avatar.avatar.soyTemplateName = 'aui.avatar.avatar';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/badges.js
(typeof window === 'undefined' ? global : window).__d31f281a2025c9f44381c53e5186b35c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from badges.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.badges.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.badges == 'undefined') { aui.badges = {}; }
  
  
  aui.badges.badge = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-badge' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$escapeHtml(opt_data.text) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + '>';
  };
  if (goog.DEBUG) {
    aui.badges.badge.soyTemplateName = 'aui.badges.badge';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/buttons.js
(typeof window === 'undefined' ? global : window).__03c64869a9b592cb1b6adcc71c8d6e41 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from buttons.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.buttons.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.buttons == 'undefined') { aui.buttons = {}; }
  
  
  aui.buttons.button = function(opt_data, opt_ignored) {
    var output = '';
    if (opt_data.href || opt_data.href == '') {
      output += '<a href="' + soy.$$escapeHtml(opt_data.href) + '"' + aui.buttons.buttonAttributes(soy.$$augmentMap(opt_data, {tagName: 'a'})) + '>' + aui.buttons.buttonIcon(opt_data) + ((opt_data.hasLabel) ? '<span class="aui-button-label">' : '') + soy.$$escapeHtml(opt_data.text) + ((opt_data.hasLabel) ? '</span>' : '') + '</a>';
    } else if (opt_data.tagName == 'input') {
      output += '<input type="' + soy.$$escapeHtml(opt_data.inputType ? opt_data.inputType : 'button') + '" ' + aui.buttons.buttonAttributes(opt_data) + ' value="' + soy.$$escapeHtml(opt_data.text) + '" />';
    } else {
      var theTagName__soy29 = opt_data.tagName ? opt_data.tagName : 'button';
      output += '<' + soy.$$escapeHtml(theTagName__soy29) + aui.buttons.buttonAttributes(soy.$$augmentMap(opt_data, {tagName: theTagName__soy29})) + '>' + aui.buttons.buttonIcon(opt_data) + ((opt_data.hasLabel) ? '<span class="aui-button-label">' : '') + soy.$$escapeHtml(opt_data.text) + ((opt_data.hasLabel) ? '</span>' : '') + '</' + soy.$$escapeHtml(theTagName__soy29) + '>';
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.buttons.button.soyTemplateName = 'aui.buttons.button';
  }
  
  
  aui.buttons.buttons = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-buttons' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div>';
  };
  if (goog.DEBUG) {
    aui.buttons.buttons.soyTemplateName = 'aui.buttons.buttons';
  }
  
  
  aui.buttons.buttonAttributes = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    var output = ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-button' + ((opt_data.splitButtonType == 'main') ? ' aui-button-split-main' : '') + ((opt_data.dropdown2Target) ? ' aui-dropdown2-trigger' + ((opt_data.splitButtonType == 'more') ? ' aui-button-split-more' : '') : '');
    switch (opt_data.type) {
      case 'primary':
        output += ' aui-button-primary';
        break;
      case 'link':
        output += ' aui-button-link';
        break;
      case 'subtle':
        output += ' aui-button-subtle';
        break;
      case 'text':
        output += ' aui-button-text';
        break;
    }
    output += aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + ((opt_data.isPressed) ? ' aria-pressed="' + soy.$$escapeHtml(opt_data.isPressed) + '"' : '') + ((opt_data.isDisabled) ? ' aria-disabled="' + soy.$$escapeHtml(opt_data.isDisabled) + '"' + ((opt_data.isDisabled == true) ? (opt_data.tagName == 'button' || opt_data.tagName == 'input') ? ' disabled="disabled" ' : '' : '') : '') + ((opt_data.dropdown2Target) ? ' aria-owns="' + soy.$$escapeHtml(opt_data.dropdown2Target) + '" aria-haspopup="true"' : '') + ((opt_data.tagName == 'a') ? ' tabindex="0"' : '');
    return output;
  };
  if (goog.DEBUG) {
    aui.buttons.buttonAttributes.soyTemplateName = 'aui.buttons.buttonAttributes';
  }
  
  
  aui.buttons.buttonIcon = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '' + ((opt_data.iconType) ? '<span class="' + ((opt_data.iconType == 'aui') ? 'aui-icon' : '') + ((opt_data.iconClass) ? ' ' + soy.$$escapeHtml(opt_data.iconClass) : '') + '">' + ((opt_data.iconText) ? soy.$$escapeHtml(opt_data.iconText) + ' ' : '') + '</span>' : '');
  };
  if (goog.DEBUG) {
    aui.buttons.buttonIcon.soyTemplateName = 'aui.buttons.buttonIcon';
  }
  
  
  aui.buttons.splitButton = function(opt_data, opt_ignored) {
    return '' + aui.buttons.button(soy.$$augmentMap(opt_data.splitButtonMain, {splitButtonType: 'main'})) + aui.buttons.button(soy.$$augmentMap(opt_data.splitButtonMore, {splitButtonType: 'more'}));
  };
  if (goog.DEBUG) {
    aui.buttons.splitButton.soyTemplateName = 'aui.buttons.splitButton';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/dialog2.js
(typeof window === 'undefined' ? global : window).__c3e9394c661b8d56890453a06f3ec31f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from dialog2.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.dialog.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.dialog == 'undefined') { aui.dialog = {}; }
  
  
  aui.dialog.dialog2 = function(opt_data, opt_ignored) {
    return '' + aui.dialog.dialog2Chrome({id: opt_data.id, titleId: opt_data.id ? opt_data.id + '-dialog-title' : null, modal: opt_data.modal, tagName: opt_data.tagName, removeOnHide: opt_data.removeOnHide, visible: opt_data.visible, size: opt_data.size, extraClasses: opt_data.extraClasses, extraAttributes: opt_data.extraAttributes, content: '' + aui.dialog.dialog2Content({id: null, titleText: opt_data.titleText, titleContent: opt_data.titleContent, headerActionContent: opt_data.headerActionContent, headerSecondaryContent: opt_data.headerSecondaryContent, modal: opt_data.modal, content: opt_data.content, footerHintText: opt_data.footerHintText, footerHintContent: opt_data.footerHintContent, footerActionContent: opt_data.footerActionContent})});
  };
  if (goog.DEBUG) {
    aui.dialog.dialog2.soyTemplateName = 'aui.dialog.dialog2';
  }
  
  
  aui.dialog.dialog2Chrome = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'section') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.titleId) ? ' aria-labelledby="' + soy.$$escapeHtml(opt_data.titleId) + '"' : '') + ' role="dialog" class=" aui-layer aui-dialog2 aui-dialog2-' + soy.$$escapeHtml(opt_data.size ? opt_data.size : 'medium') + aui.renderExtraClasses(opt_data) + '"' + ((opt_data.modal) ? 'data-aui-modal="true"' : '') + ((opt_data.removeOnHide) ? 'data-aui-remove-on-hide="true"' : '') + ((opt_data.visible != true) ? 'aria-hidden="true"' : '') + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'section') + '>';
  };
  if (goog.DEBUG) {
    aui.dialog.dialog2Chrome.soyTemplateName = 'aui.dialog.dialog2Chrome';
  }
  
  
  aui.dialog.dialog2Content = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '' + aui.dialog.dialog2Header({titleId: opt_data.id ? opt_data.id + '-dialog-title' : null, titleText: opt_data.titleText, titleContent: opt_data.titleContent, actionContent: opt_data.headerActionContent, secondaryContent: opt_data.headerSecondaryContent, modal: opt_data.modal}) + aui.dialog.dialog2Panel(opt_data) + aui.dialog.dialog2Footer({hintText: opt_data.footerHintText, hintContent: opt_data.footerHintContent, actionContent: opt_data.footerActionContent});
  };
  if (goog.DEBUG) {
    aui.dialog.dialog2Content.soyTemplateName = 'aui.dialog.dialog2Content';
  }
  
  
  aui.dialog.dialog2Header = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<header' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dialog2-header' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><h2 ' + ((opt_data.titleId) ? ' id="' + soy.$$escapeHtml(opt_data.titleId) + '"' : '') + ' class="aui-dialog2-header-main">' + ((opt_data.titleText) ? soy.$$escapeHtml(opt_data.titleText) : '') + ((opt_data.titleContent) ? soy.$$filterNoAutoescape(opt_data.titleContent) : '') + '</h2>' + ((opt_data.actionContent) ? '<div class="aui-dialog2-header-actions">' + soy.$$filterNoAutoescape(opt_data.actionContent) + '</div>' : '') + ((opt_data.secondaryContent) ? '<div class="aui-dialog2-header-secondary">' + soy.$$filterNoAutoescape(opt_data.secondaryContent) + '</div>' : '') + ((opt_data.modal != true) ? '<a class="aui-dialog2-header-close"><span class="aui-icon aui-icon-small aui-iconfont-close-dialog">' + soy.$$escapeHtml("aui.words.close") + '</span></a>' : '') + '</header>';
  };
  if (goog.DEBUG) {
    aui.dialog.dialog2Header.soyTemplateName = 'aui.dialog.dialog2Header';
  }
  
  
  aui.dialog.dialog2Footer = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<footer' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dialog2-footer' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.actionContent) ? '<div class="aui-dialog2-footer-actions">' + soy.$$filterNoAutoescape(opt_data.actionContent) + '</div>' : '') + ((opt_data.hintText || opt_data.hintContent) ? '<div class="aui-dialog2-footer-hint">' + ((opt_data.hintText) ? soy.$$escapeHtml(opt_data.hintText) : '') + ((opt_data.hintContent) ? soy.$$filterNoAutoescape(opt_data.hintContent) : '') + '</div>' : '') + '</footer>';
  };
  if (goog.DEBUG) {
    aui.dialog.dialog2Footer.soyTemplateName = 'aui.dialog.dialog2Footer';
  }
  
  
  aui.dialog.dialog2Panel = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dialog2-content' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + '</div>';
  };
  if (goog.DEBUG) {
    aui.dialog.dialog2Panel.soyTemplateName = 'aui.dialog.dialog2Panel';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/dropdown.js
(typeof window === 'undefined' ? global : window).__6e3a7fa2dc6cd0f405730d126997feeb = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from dropdown.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.dropdown.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.dropdown == 'undefined') { aui.dropdown = {}; }
  
  
  aui.dropdown.trigger = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<a' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dd-trigger' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><span class="dropdown-text">' + ((opt_data.accessibilityText) ? soy.$$escapeHtml(opt_data.accessibilityText) : '') + '</span>' + ((! (opt_data.showIcon == false)) ? '<span class="icon icon-dropdown"></span>' : '') + '</a>';
  };
  if (goog.DEBUG) {
    aui.dropdown.trigger.soyTemplateName = 'aui.dropdown.trigger';
  }
  
  
  aui.dropdown.menu = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'ul') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dropdown hidden' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'ul') + '>';
  };
  if (goog.DEBUG) {
    aui.dropdown.menu.soyTemplateName = 'aui.dropdown.menu';
  }
  
  
  aui.dropdown.parent = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dd-parent' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.dropdown.parent.soyTemplateName = 'aui.dropdown.parent';
  }
  
  
  aui.dropdown.item = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'li') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="dropdown-item' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><a href="' + soy.$$escapeHtml(opt_data.url ? opt_data.url : '#') + '">' + soy.$$escapeHtml(opt_data.text) + '</a></' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'li') + '>';
  };
  if (goog.DEBUG) {
    aui.dropdown.item.soyTemplateName = 'aui.dropdown.item';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/dropdown2.js
(typeof window === 'undefined' ? global : window).__eeffe1213d8a3c1161023e531e0d3385 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from dropdown2.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.dropdown2.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.dropdown2 == 'undefined') { aui.dropdown2 = {}; }
  
  
  aui.dropdown2.dropdown2 = function(opt_data, opt_ignored) {
    return '' + aui.dropdown2.trigger(soy.$$augmentMap(opt_data.trigger, {menu: opt_data.menu})) + aui.dropdown2.contents(opt_data.menu);
  };
  if (goog.DEBUG) {
    aui.dropdown2.dropdown2.soyTemplateName = 'aui.dropdown2.dropdown2';
  }
  
  
  aui.dropdown2.trigger = function(opt_data, opt_ignored) {
    return '' + aui.trigger.trigger(soy.$$augmentMap(opt_data, {extraClasses: 'aui-dropdown2-trigger' + aui.renderExtraClasses(opt_data)}));
  };
  if (goog.DEBUG) {
    aui.dropdown2.trigger.soyTemplateName = 'aui.dropdown2.trigger';
  }
  
  
  aui.dropdown2.contents = function(opt_data, opt_ignored) {
    return '<div id="' + soy.$$escapeHtml(opt_data.id) + '" class="aui-dropdown2' + aui.renderExtraClasses(opt_data) + '" role="menu" aria-hidden="true"' + aui.renderExtraAttributes(opt_data) + '><div role="application">' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + '</div></div>';
  };
  if (goog.DEBUG) {
    aui.dropdown2.contents.soyTemplateName = 'aui.dropdown2.contents';
  }
  
  
  aui.dropdown2.section = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-dropdown2-section' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.label) ? '<strong role="presentation" class="aui-dropdown2-heading">' + soy.$$escapeHtml(opt_data.label) + '</strong>' : '') + soy.$$filterNoAutoescape(opt_data.content) + '</div>';
  };
  if (goog.DEBUG) {
    aui.dropdown2.section.soyTemplateName = 'aui.dropdown2.section';
  }
  
  
  aui.dropdown2.itemGroup = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<div ' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' role="presentation" class="aui-dropdown2-section' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.label) ? '<strong role="presentation" class="aui-dropdown2-heading">' + soy.$$escapeHtml(opt_data.label) + '</strong>' : '') + '<div role="group"' + ((opt_data.label) ? ' aria-label="' + soy.$$escapeHtml(opt_data.label) + '"' : '') + '>' + aui.dropdown2.itemList(opt_data) + '</div></div>';
  };
  if (goog.DEBUG) {
    aui.dropdown2.itemGroup.soyTemplateName = 'aui.dropdown2.itemGroup';
  }
  
  
  aui.dropdown2.itemList = function(opt_data, opt_ignored) {
    var output = '<ul' + ((opt_data.isTruncated) ? ' class="aui-list-truncate"' : '') + ' role="presentation">';
    var itemList76 = opt_data.items;
    var itemListLen76 = itemList76.length;
    for (var itemIndex76 = 0; itemIndex76 < itemListLen76; itemIndex76++) {
      var itemData76 = itemList76[itemIndex76];
      output += '<li ' + ((itemData76.isHidden) ? 'class="aui-dropdown2-hidden" aria-hidden="true"' : '') + ' role="presentation">';
      switch (itemData76.itemType) {
        case 'checkbox':
          output += aui.dropdown2.menuCheckbox(itemData76);
          break;
        case 'radio':
          output += aui.dropdown2.menuRadio(itemData76);
          break;
        default:
          output += aui.dropdown2.menuLink(itemData76);
      }
      output += '</li>';
    }
    output += '</ul>';
    return output;
  };
  if (goog.DEBUG) {
    aui.dropdown2.itemList.soyTemplateName = 'aui.dropdown2.itemList';
  }
  
  
  aui.dropdown2.menuLink = function(opt_data, opt_ignored) {
    return '<a role="menuitem" tabindex="-1" class="' + aui.renderExtraClasses(opt_data) + ((opt_data.submenuTarget) ? ' aui-dropdown2-sub-trigger' : '') + ((opt_data.isDisabled) ? ' aui-dropdown2-disabled' : '') + '"' + ((opt_data.href) ? ' href="' + soy.$$escapeHtml(opt_data.href) + '"' : '') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.isDisabled) ? ' aria-disabled="' + soy.$$escapeHtml(opt_data.isDisabled) + '"' : '') + ((opt_data.submenuTarget) ? ' aria-controls="' + soy.$$escapeHtml(opt_data.submenuTarget) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + soy.$$escapeHtml(opt_data.text) + '</a>';
  };
  if (goog.DEBUG) {
    aui.dropdown2.menuLink.soyTemplateName = 'aui.dropdown2.menuLink';
  }
  
  
  aui.dropdown2.menuCheckbox = function(opt_data, opt_ignored) {
    return '<span role="menuitemcheckbox" tabindex="-1" class="aui-dropdown2-checkbox' + ((opt_data.isInteractive) ? ' aui-dropdown2-interactive' : '') + ((opt_data.isDisabled) ? ' aui-dropdown2-disabled' : '') + ((opt_data.isChecked) ? ' aui-dropdown2-checked' : '') + aui.renderExtraClasses(opt_data) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.isChecked) ? ' aria-checked="' + soy.$$escapeHtml(opt_data.isChecked) + '"' : ' aria-checked="false"') + ((opt_data.isDisabled) ? ' aria-disabled="' + soy.$$escapeHtml(opt_data.isDisabled) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + soy.$$escapeHtml(opt_data.text) + '</span>';
  };
  if (goog.DEBUG) {
    aui.dropdown2.menuCheckbox.soyTemplateName = 'aui.dropdown2.menuCheckbox';
  }
  
  
  aui.dropdown2.menuRadio = function(opt_data, opt_ignored) {
    return '<span role="menuitemradio" tabindex="-1" class="aui-dropdown2-radio' + ((opt_data.isInteractive) ? ' aui-dropdown2-interactive' : '') + ((opt_data.isDisabled) ? ' aui-dropdown2-disabled' : '') + ((opt_data.isChecked) ? ' aui-dropdown2-checked' : '') + aui.renderExtraClasses(opt_data) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.isChecked) ? ' aria-checked="' + soy.$$escapeHtml(opt_data.isChecked) + '"' : ' aria-checked="false"') + ((opt_data.isDisabled) ? ' aria-disabled="' + soy.$$escapeHtml(opt_data.isDisabled) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + soy.$$escapeHtml(opt_data.text) + '</span>';
  };
  if (goog.DEBUG) {
    aui.dropdown2.menuRadio.soyTemplateName = 'aui.dropdown2.menuRadio';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/expander.js
(typeof window === 'undefined' ? global : window).__9f80ef85a2a9d6e966b169d413b1cafa = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from expander.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.expander.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.expander == 'undefined') { aui.expander = {}; }
  
  
  aui.expander.content = function(opt_data, opt_ignored) {
    return '<div id="' + soy.$$escapeHtml(opt_data.id) + '" class="aui-expander-content' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + ((opt_data.initiallyExpanded) ? ' aria-expanded="' + soy.$$escapeHtml(opt_data.initiallyExpanded) + '"' : '') + '>' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + '</div>';
  };
  if (goog.DEBUG) {
    aui.expander.content.soyTemplateName = 'aui.expander.content';
  }
  
  
  aui.expander.trigger = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tag ? opt_data.tag : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.replaceText) ? ' data-replace-text="' + soy.$$escapeHtml(opt_data.replaceText) + '"' : '') + ((opt_data.replaceSelector) ? ' data-replace-selector="' + soy.$$escapeHtml(opt_data.replaceSelector) + '"' : '') + ' class="aui-expander-trigger' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + ' aria-controls="' + soy.$$escapeHtml(opt_data.contentId) + '"' + ((opt_data.collapsible) ? ' data-collapsible="' + soy.$$escapeHtml(opt_data.collapsible) + '"' : '') + '>' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + '</' + soy.$$escapeHtml(opt_data.tag ? opt_data.tag : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.expander.trigger.soyTemplateName = 'aui.expander.trigger';
  }
  
  
  aui.expander.revealText = function(opt_data, opt_ignored) {
    return '' + aui.expander.content({id: opt_data.contentId, content: '' + soy.$$escapeHtml(opt_data.contentContent) + aui.expander.trigger({id: opt_data.triggerId, contentId: opt_data.contentId, tag: 'a', content: '<span class=\'reveal-text-trigger-text\'>Show more</span>', replaceSelector: '.reveal-text-trigger-text', replaceText: 'Show less', extraAttributes: opt_data.triggerExtraAttributes, extraClasses: ((opt_data.triggerExtraClasses) ? soy.$$escapeHtml(opt_data.triggerExtraClasses) + '  ' : '') + ' aui-expander-reveal-text'}), extraAttributes: opt_data.contentExtraAttributes, extraClasses: opt_data.contentExtraClasses});
  };
  if (goog.DEBUG) {
    aui.expander.revealText.soyTemplateName = 'aui.expander.revealText';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/form.js
(typeof window === 'undefined' ? global : window).__bc379a60ab5fa5921e706adee99ce083 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from form.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.form.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.form == 'undefined') { aui.form = {}; }
  
  
  aui.form.form = function(opt_data, opt_ignored) {
    return '<form' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui' + ((opt_data.isUnsectioned) ? ' unsectioned' : '') + ((opt_data.isLongLabels) ? ' long-label' : '') + ((opt_data.isTopLabels) ? ' top-label' : '') + aui.renderExtraClasses(opt_data) + '" action="' + soy.$$escapeHtml(opt_data.action) + '" method="' + soy.$$escapeHtml(opt_data.method ? opt_data.method : 'post') + '"' + ((opt_data.enctype) ? ' enctype="' + soy.$$escapeHtml(opt_data.enctype) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</form>';
  };
  if (goog.DEBUG) {
    aui.form.form.soyTemplateName = 'aui.form.form';
  }
  
  
  aui.form.formDescription = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="field-group' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div>';
  };
  if (goog.DEBUG) {
    aui.form.formDescription.soyTemplateName = 'aui.form.formDescription';
  }
  
  
  aui.form.fieldset = function(opt_data, opt_ignored) {
    var output = '';
    var hasClass__soy51 = opt_data.isInline || opt_data.isDateSelect || opt_data.isGroup || opt_data.extraClasses;
    output += '<fieldset' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((hasClass__soy51) ? ' class="' + soy.$$escapeHtml(opt_data.isInline ? 'inline' : opt_data.isDateSelect ? 'date-select' : opt_data.isGroup ? 'group' : '') + aui.renderExtraClasses(opt_data) + '"' : '') + aui.renderExtraAttributes(opt_data) + '><legend><span>' + soy.$$filterNoAutoescape(opt_data.legendContent) + '</span></legend>' + soy.$$filterNoAutoescape(opt_data.content) + '</fieldset>';
    return output;
  };
  if (goog.DEBUG) {
    aui.form.fieldset.soyTemplateName = 'aui.form.fieldset';
  }
  
  
  aui.form.fieldGroup = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="field-group' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div>';
  };
  if (goog.DEBUG) {
    aui.form.fieldGroup.soyTemplateName = 'aui.form.fieldGroup';
  }
  
  
  aui.form.buttons = function(opt_data, opt_ignored) {
    return '<div class="buttons-container' + ((opt_data.alignment) ? ' ' + soy.$$escapeHtml(opt_data.alignment) : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><div class="buttons">' + soy.$$filterNoAutoescape(opt_data.content) + '</div></div>';
  };
  if (goog.DEBUG) {
    aui.form.buttons.soyTemplateName = 'aui.form.buttons';
  }
  
  
  aui.form.label = function(opt_data, opt_ignored) {
    return '<label' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.forField) ? ' for="' + soy.$$escapeHtml(opt_data.forField) + '"' : '') + ((opt_data.extraClasses) ? ' class="' + aui.renderExtraClasses(opt_data) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + ((opt_data.isRequired) ? '<span class="aui-icon icon-required"></span>' : '') + '</label>';
  };
  if (goog.DEBUG) {
    aui.form.label.soyTemplateName = 'aui.form.label';
  }
  
  
  aui.form.input = function(opt_data, opt_ignored) {
    var output = '';
    var baseType__soy126 = '';
    switch (opt_data.type) {
      case 'password':
      case 'email':
      case 'url':
      case 'tel':
      case 'search':
        baseType__soy126 += 'text';
        break;
      case 'submit':
      case 'reset':
        baseType__soy126 += 'button';
        break;
      default:
        baseType__soy126 += soy.$$escapeHtml(opt_data.type);
    }
    output += '<input class="' + soy.$$escapeHtml(baseType__soy126) + aui.renderExtraClasses(opt_data) + ((opt_data.icon && baseType__soy126 == 'text') ? ' aui-field-has-icon' : '') + '" type="' + soy.$$escapeHtml(opt_data.type) + '" name="' + ((opt_data.name) ? soy.$$escapeHtml(opt_data.name) : soy.$$escapeHtml(opt_data.id)) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.value) ? ' value="' + soy.$$escapeHtml(opt_data.value) + '"' : '') + (((opt_data.type == 'checkbox' || opt_data.type == 'radio') && opt_data.isChecked) ? ' checked="checked"' : '') + ((baseType__soy126 == 'text' && opt_data.type != 'password' && opt_data.maxLength) ? ' maxlength="' + soy.$$escapeHtml(opt_data.maxLength) + '"' : '') + ((baseType__soy126 == 'text' && opt_data.type != 'password' && opt_data.size) ? ' size="' + soy.$$escapeHtml(opt_data.size) + '"' : '') + ((baseType__soy126 == 'text' && opt_data.placeholderText) ? ' placeholder="' + soy.$$escapeHtml(opt_data.placeholderText) + '"' : '') + ((baseType__soy126 == 'text' && opt_data.autocomplete) ? ' autocomplete="' + soy.$$escapeHtml(opt_data.autocomplete) + '"' : '') + ((opt_data.isDisabled) ? ' disabled' : '') + ((opt_data.isAutofocus) ? ' autofocus' : '') + aui.renderExtraAttributes(opt_data) + aui.form.renderValidationArguments(opt_data) + aui.form.renderInfoMessage(opt_data) + aui.form.renderFieldComponentAttribute(opt_data) + aui.form.renderTooltipArguments(opt_data) + '/>' + ((opt_data.icon && baseType__soy126 == 'text') ? aui.icons.icon({icon: opt_data.icon, useIconFont: true, size: 'small'}) : '');
    return output;
  };
  if (goog.DEBUG) {
    aui.form.input.soyTemplateName = 'aui.form.input';
  }
  
  
  aui.form.renderValidationArguments = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    var output = '';
    if (opt_data.validationArguments) {
      var argumentList203 = soy.$$getMapKeys(opt_data.validationArguments);
      var argumentListLen203 = argumentList203.length;
      for (var argumentIndex203 = 0; argumentIndex203 < argumentListLen203; argumentIndex203++) {
        var argumentData203 = argumentList203[argumentIndex203];
        output += (argumentData203 == 'required' || argumentData203 == 'pattern' || argumentData203 == 'min' || argumentData203 == 'max' || argumentData203 == 'minlength' || argumentData203 == 'maxlength') ? ' ' + soy.$$escapeHtml(argumentData203) + '="' + soy.$$escapeHtml(opt_data.validationArguments[argumentData203]) + '"' : ' ' + soy.$$escapeHtml('data-aui-validation-' + argumentData203) + '="' + soy.$$escapeHtml(opt_data.validationArguments[argumentData203]) + '"';
      }
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.form.renderValidationArguments.soyTemplateName = 'aui.form.renderValidationArguments';
  }
  
  
  aui.form.renderTooltipArguments = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    var output = '';
    if (opt_data.tooltipArguments) {
      var argumentList221 = soy.$$getMapKeys(opt_data.tooltipArguments);
      var argumentListLen221 = argumentList221.length;
      for (var argumentIndex221 = 0; argumentIndex221 < argumentListLen221; argumentIndex221++) {
        var argumentData221 = argumentList221[argumentIndex221];
        output += ' ' + soy.$$escapeHtml('data-aui-notification-' + argumentData221) + '="' + soy.$$escapeHtml(opt_data.tooltipArguments[argumentData221]) + '"';
      }
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.form.renderTooltipArguments.soyTemplateName = 'aui.form.renderTooltipArguments';
  }
  
  
  aui.form.renderInfoMessage = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '' + ((opt_data.infoMessage) ? ' data-aui-notification-info="' + soy.$$escapeHtml(opt_data.infoMessage) + '"' : '');
  };
  if (goog.DEBUG) {
    aui.form.renderInfoMessage.soyTemplateName = 'aui.form.renderInfoMessage';
  }
  
  
  aui.form.renderFieldComponentAttribute = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '' + ((opt_data.infoMessage) ? ' data-aui-notification-field' : '') + ((opt_data.validationArguments) ? ' data-aui-validation-field' : '');
  };
  if (goog.DEBUG) {
    aui.form.renderFieldComponentAttribute.soyTemplateName = 'aui.form.renderFieldComponentAttribute';
  }
  
  
  aui.form.submit = function(opt_data, opt_ignored) {
    return '' + aui.form.button(soy.$$augmentMap(opt_data, {tagName: 'input', inputType: 'submit'}));
  };
  if (goog.DEBUG) {
    aui.form.submit.soyTemplateName = 'aui.form.submit';
  }
  
  
  aui.form.button = function(opt_data, opt_ignored) {
    return '' + aui.buttons.button(soy.$$augmentMap(opt_data, {extraClasses: opt_data.extraClasses, extraAttributes: '' + ((opt_data.name) ? 'name="' + soy.$$escapeHtml(opt_data.name) + '"' : '') + aui.renderExtraAttributes(opt_data)}));
  };
  if (goog.DEBUG) {
    aui.form.button.soyTemplateName = 'aui.form.button';
  }
  
  
  aui.form.linkButton = function(opt_data, opt_ignored) {
    return '' + aui.buttons.button(soy.$$augmentMap(opt_data, {tagName: 'a', type: 'link', href: opt_data.href ? opt_data.href : opt_data.url, extraClasses: 'cancel' + aui.renderExtraClasses(opt_data), extraAttributes: '' + ((opt_data.name) ? 'name="' + soy.$$escapeHtml(opt_data.name) + '"' : '') + aui.renderExtraAttributes(opt_data)}));
  };
  if (goog.DEBUG) {
    aui.form.linkButton.soyTemplateName = 'aui.form.linkButton';
  }
  
  
  aui.form.textarea = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<textarea name="' + ((opt_data.name) ? soy.$$escapeHtml(opt_data.name) : soy.$$escapeHtml(opt_data.id)) + '" class="textarea' + aui.renderExtraClasses(opt_data) + ' ' + ((opt_data.icon) ? 'aui-field-has-icon' : '') + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.rows) ? ' rows="' + soy.$$escapeHtml(opt_data.rows) + '"' : '') + ((opt_data.cols) ? ' cols="' + soy.$$escapeHtml(opt_data.cols) + '"' : '') + ((opt_data.autocomplete) ? ' autocomplete="' + soy.$$escapeHtml(opt_data.autocomplete) + '"' : '') + ((opt_data.isDisabled) ? ' disabled' : '') + ((opt_data.isAutofocus) ? ' autofocus' : '') + ((opt_data.placeholderText) ? ' placeholder="' + soy.$$escapeHtml(opt_data.placeholderText) + '"' : '') + aui.renderExtraAttributes(opt_data) + aui.form.renderValidationArguments(opt_data) + aui.form.renderInfoMessage(opt_data) + aui.form.renderFieldComponentAttribute(opt_data) + aui.form.renderTooltipArguments(opt_data) + '>' + ((opt_data.value) ? soy.$$escapeHtml(opt_data.value) : '') + '</textarea>' + ((opt_data.icon) ? aui.icons.icon({icon: opt_data.icon, useIconFont: true, size: 'small'}) : '');
  };
  if (goog.DEBUG) {
    aui.form.textarea.soyTemplateName = 'aui.form.textarea';
  }
  
  
  aui.form.select = function(opt_data, opt_ignored) {
    var output = '<select' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' name="' + ((opt_data.name) ? soy.$$escapeHtml(opt_data.name) : soy.$$escapeHtml(opt_data.id)) + '" class="' + soy.$$escapeHtml(opt_data.isMultiple ? 'multi-select' : 'select') + aui.renderExtraClasses(opt_data) + '"' + ((opt_data.size) ? ' size="' + soy.$$escapeHtml(opt_data.size) + '"' : '') + ((opt_data.isDisabled) ? ' disabled' : '') + ((opt_data.isAutofocus) ? ' autofocus' : '') + ((opt_data.isMultiple) ? ' multiple' : '') + aui.renderExtraAttributes(opt_data) + aui.form.renderValidationArguments(opt_data) + aui.form.renderInfoMessage(opt_data) + aui.form.renderFieldComponentAttribute(opt_data) + aui.form.renderTooltipArguments(opt_data) + '>';
    var optionList375 = opt_data.options;
    var optionListLen375 = optionList375.length;
    for (var optionIndex375 = 0; optionIndex375 < optionListLen375; optionIndex375++) {
      var optionData375 = optionList375[optionIndex375];
      output += aui.form.optionOrOptgroup(soy.$$augmentMap(optionData375, {defaultValue: opt_data.value}));
    }
    output += '</select>';
    return output;
  };
  if (goog.DEBUG) {
    aui.form.select.soyTemplateName = 'aui.form.select';
  }
  
  
  aui.form.optionOrOptgroup = function(opt_data, opt_ignored) {
    var output = '';
    if (opt_data.options) {
      output += '<optgroup label="' + soy.$$escapeHtml(opt_data.text) + '"' + ((opt_data.disabled) ? ' disabled' : '') + '>';
      var optionList390 = opt_data.options;
      var optionListLen390 = optionList390.length;
      for (var optionIndex390 = 0; optionIndex390 < optionListLen390; optionIndex390++) {
        var optionData390 = optionList390[optionIndex390];
        output += aui.form.optionOrOptgroup(soy.$$augmentMap(optionData390, {defaultValue: opt_data.defaultValue}));
      }
      output += '</optgroup>';
    } else {
      output += '<option value="' + soy.$$escapeHtml(opt_data.value) + '"' + ((opt_data.selected || opt_data.defaultValue == opt_data.value) ? ' selected' : '') + ((opt_data.disabled) ? ' disabled' : '') + '>' + soy.$$escapeHtml(opt_data.text) + '</option>';
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.form.optionOrOptgroup.soyTemplateName = 'aui.form.optionOrOptgroup';
  }
  
  
  aui.form.value = function(opt_data, opt_ignored) {
    return '<span' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="field-value' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</span>';
  };
  if (goog.DEBUG) {
    aui.form.value.soyTemplateName = 'aui.form.value';
  }
  
  
  aui.form.field = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    var output = '';
    var isCheckboxOrRadio__soy424 = opt_data.type == 'checkbox' || opt_data.type == 'radio';
    var fieldWidthClass__soy425 = opt_data.fieldWidth ? opt_data.fieldWidth + '-field ' : '';
    var fieldClasses__soy426 = fieldWidthClass__soy425 + (opt_data.extraFieldClasses ? opt_data.extraFieldClasses : '');
    output += '<div class="' + ((isCheckboxOrRadio__soy424) ? soy.$$escapeHtml(opt_data.type) : 'field-group') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.labelContent && ! isCheckboxOrRadio__soy424) ? aui.form.label({forField: opt_data.id, isRequired: opt_data.isRequired, content: opt_data.labelContent}) : '');
    switch (opt_data.type) {
      case 'textarea':
        output += aui.form.textarea({id: opt_data.id, name: opt_data.name, value: opt_data.value, rows: opt_data.rows, cols: opt_data.cols, autocomplete: opt_data.autocomplete, placeholderText: opt_data.placeholderText, isDisabled: opt_data.isDisabled ? true : false, isAutofocus: opt_data.isAutofocus, extraClasses: fieldClasses__soy426, icon: opt_data.icon, validationArguments: opt_data.validationArguments, infoMessage: opt_data.infoMessage, tooltipArguments: opt_data.tooltipArguments});
        break;
      case 'select':
        output += aui.form.select({id: opt_data.id, name: opt_data.name, value: opt_data.value, options: opt_data.options, isMultiple: opt_data.isMultiple, size: opt_data.size, isDisabled: opt_data.isDisabled ? true : false, isAutofocus: opt_data.isAutofocus, extraClasses: fieldClasses__soy426, validationArguments: opt_data.validationArguments, infoMessage: opt_data.infoMessage, tooltipArguments: opt_data.tooltipArguments});
        break;
      case 'value':
        output += aui.form.value({id: opt_data.id, content: '' + soy.$$escapeHtml(opt_data.value), extraClasses: fieldClasses__soy426});
        break;
      case 'text':
      case 'password':
      case 'email':
      case 'url':
      case 'tel':
      case 'search':
      case 'file':
      case 'radio':
      case 'checkbox':
      case 'button':
      case 'submit':
      case 'reset':
        output += aui.form.input({id: opt_data.id, name: opt_data.name, type: opt_data.type, value: opt_data.value, maxLength: opt_data.maxLength, size: opt_data.size, autocomplete: opt_data.autocomplete, placeholderText: opt_data.placeholderText, isChecked: opt_data.isChecked, isDisabled: opt_data.isDisabled ? true : false, isAutofocus: opt_data.isAutofocus, extraClasses: fieldClasses__soy426, icon: opt_data.icon, validationArguments: opt_data.validationArguments, infoMessage: opt_data.infoMessage, tooltipArguments: opt_data.tooltipArguments});
        break;
    }
    output += ((opt_data.labelContent && isCheckboxOrRadio__soy424) ? aui.form.label({forField: opt_data.id, isRequired: opt_data.isRequired, content: opt_data.labelContent}) : '') + ((opt_data.descriptionText || opt_data.descriptionContent) ? aui.form.fieldDescription({text: opt_data.descriptionText, content: opt_data.descriptionContent}) : '');
    if (opt_data.errorTexts) {
      var errorList512 = opt_data.errorTexts;
      var errorListLen512 = errorList512.length;
      for (var errorIndex512 = 0; errorIndex512 < errorListLen512; errorIndex512++) {
        var errorData512 = errorList512[errorIndex512];
        output += aui.form.fieldError({message: errorData512});
      }
    }
    output += '</div>';
    return output;
  };
  if (goog.DEBUG) {
    aui.form.field.soyTemplateName = 'aui.form.field';
  }
  
  
  aui.form.fieldError = function(opt_data, opt_ignored) {
    return '<div class="error' + aui.renderExtraClasses(opt_data) + '">' + soy.$$escapeHtml(opt_data.message) + '</div>';
  };
  if (goog.DEBUG) {
    aui.form.fieldError.soyTemplateName = 'aui.form.fieldError';
  }
  
  
  aui.form.fieldDescription = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '<div class="description' + aui.renderExtraClasses(opt_data) + '">' + ((opt_data.text) ? soy.$$escapeHtml(opt_data.text) : (opt_data.message) ? soy.$$escapeHtml(opt_data.message) : soy.$$filterNoAutoescape(opt_data.content)) + '</div>';
  };
  if (goog.DEBUG) {
    aui.form.fieldDescription.soyTemplateName = 'aui.form.fieldDescription';
  }
  
  
  aui.form.textField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'text'}));
  };
  if (goog.DEBUG) {
    aui.form.textField.soyTemplateName = 'aui.form.textField';
  }
  
  
  aui.form.textareaField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'textarea'}));
  };
  if (goog.DEBUG) {
    aui.form.textareaField.soyTemplateName = 'aui.form.textareaField';
  }
  
  
  aui.form.passwordField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'password'}));
  };
  if (goog.DEBUG) {
    aui.form.passwordField.soyTemplateName = 'aui.form.passwordField';
  }
  
  
  aui.form.fileField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'file'}));
  };
  if (goog.DEBUG) {
    aui.form.fileField.soyTemplateName = 'aui.form.fileField';
  }
  
  
  aui.form.selectField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'select'}));
  };
  if (goog.DEBUG) {
    aui.form.selectField.soyTemplateName = 'aui.form.selectField';
  }
  
  
  aui.form.checkboxField = function(opt_data, opt_ignored) {
    var param557 = '' + ((opt_data.isMatrix) ? '<div class="matrix">' : '');
    var fieldList561 = opt_data.fields;
    var fieldListLen561 = fieldList561.length;
    for (var fieldIndex561 = 0; fieldIndex561 < fieldListLen561; fieldIndex561++) {
      var fieldData561 = fieldList561[fieldIndex561];
      param557 += aui.form.field(soy.$$augmentMap(fieldData561, {type: 'checkbox', labelContent: '' + soy.$$escapeHtml(fieldData561.labelText), extraFieldClasses: opt_data.extraFieldClasses}));
    }
    param557 += ((opt_data.isMatrix) ? '</div>' : '') + ((opt_data.descriptionText || opt_data.descriptionContent || opt_data.errorTexts && opt_data.errorTexts.length) ? aui.form.field({descriptionText: opt_data.descriptionText, descriptionContent: opt_data.descriptionContent, errorTexts: opt_data.errorTexts, isDisabled: false}) : '');
    var output = '' + aui.form.fieldset({legendContent: opt_data.legendContent + (opt_data.isRequired ? '<span class="aui-icon icon-required"></span>' : ''), isGroup: true, id: opt_data.id, extraClasses: opt_data.extraClasses, extraAttributes: opt_data.extraAttributes, content: param557});
    return output;
  };
  if (goog.DEBUG) {
    aui.form.checkboxField.soyTemplateName = 'aui.form.checkboxField';
  }
  
  
  aui.form.radioField = function(opt_data, opt_ignored) {
    var param585 = '' + ((opt_data.isMatrix) ? '<div class="matrix">' : '');
    var fieldList589 = opt_data.fields;
    var fieldListLen589 = fieldList589.length;
    for (var fieldIndex589 = 0; fieldIndex589 < fieldListLen589; fieldIndex589++) {
      var fieldData589 = fieldList589[fieldIndex589];
      param585 += aui.form.field(soy.$$augmentMap(fieldData589, {type: 'radio', name: opt_data.name ? opt_data.name : opt_data.id, labelContent: '' + soy.$$escapeHtml(fieldData589.labelText), extraFieldClasses: opt_data.extraFieldClasses}));
    }
    param585 += ((opt_data.isMatrix) ? '</div>' : '') + ((opt_data.descriptionText || opt_data.descriptionContent || opt_data.errorTexts && opt_data.errorTexts.length) ? aui.form.field({descriptionText: opt_data.descriptionText, descriptionContent: opt_data.descriptionContent, errorTexts: opt_data.errorTexts, isDisabled: false}) : '');
    var output = '' + aui.form.fieldset({legendContent: opt_data.legendContent + (opt_data.isRequired ? '<span class="aui-icon icon-required"></span>' : ''), isGroup: true, id: opt_data.id, extraClasses: opt_data.extraClasses, extraAttributes: opt_data.extraAttributes, content: param585});
    return output;
  };
  if (goog.DEBUG) {
    aui.form.radioField.soyTemplateName = 'aui.form.radioField';
  }
  
  
  aui.form.valueField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'value'}));
  };
  if (goog.DEBUG) {
    aui.form.valueField.soyTemplateName = 'aui.form.valueField';
  }
  
  
  aui.form.emailField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'email'}));
  };
  if (goog.DEBUG) {
    aui.form.emailField.soyTemplateName = 'aui.form.emailField';
  }
  
  
  aui.form.urlField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'url'}));
  };
  if (goog.DEBUG) {
    aui.form.urlField.soyTemplateName = 'aui.form.urlField';
  }
  
  
  aui.form.telephoneField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'tel'}));
  };
  if (goog.DEBUG) {
    aui.form.telephoneField.soyTemplateName = 'aui.form.telephoneField';
  }
  
  
  aui.form.searchField = function(opt_data, opt_ignored) {
    return '' + aui.form.field(soy.$$augmentMap(opt_data, {type: 'search'}));
  };
  if (goog.DEBUG) {
    aui.form.searchField.soyTemplateName = 'aui.form.searchField';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/group.js
(typeof window === 'undefined' ? global : window).__2491d7d57a2f7801b7fac97a9ec6cc8d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from group.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.group.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.group == 'undefined') { aui.group = {}; }
  
  
  aui.group.group = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-group' + ((opt_data.isSplit) ? ' aui-group-split' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.group.group.soyTemplateName = 'aui.group.group';
  }
  
  
  aui.group.item = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-item' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.group.item.soyTemplateName = 'aui.group.item';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/icons.js
(typeof window === 'undefined' ? global : window).__9c1b7337681b51fdcaf9d08e89451a80 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from icons.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.icons.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.icons == 'undefined') { aui.icons = {}; }
  
  
  aui.icons.icon = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-icon' + ((opt_data.useIconFont) ? ' aui-icon-' + soy.$$escapeHtml(opt_data.size ? opt_data.size : 'small') : '') + ' aui' + soy.$$escapeHtml(opt_data.useIconFont ? '-iconfont' : '-icon') + soy.$$escapeHtml(opt_data.iconFontSet ? '-' + opt_data.iconFontSet : '') + '-' + soy.$$escapeHtml(opt_data.icon) + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.accessibilityText) ? soy.$$escapeHtml(opt_data.accessibilityText) : '') + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + '>';
  };
  if (goog.DEBUG) {
    aui.icons.icon.soyTemplateName = 'aui.icons.icon';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/inline-dialog2.js
(typeof window === 'undefined' ? global : window).__194a9fd0ae14a072592c1deef136de6d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from inline-dialog2.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.inlineDialog2.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.inlineDialog2 == 'undefined') { aui.inlineDialog2 = {}; }
  
  
  aui.inlineDialog2.inlineDialog2 = function(opt_data, opt_ignored) {
    return '<aui-inline-dialog' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="' + aui.renderExtraClasses(opt_data) + '"' + ((opt_data.alignment) ? ' alignment="' + soy.$$escapeHtml(opt_data.alignment) + '"' : '') + ((opt_data.open) ? ' open' : '') + ((opt_data.persistent) ? ' persistent' : '') + ((opt_data.respondsTo) ? ' responds-to="' + soy.$$escapeHtml(opt_data.respondsTo) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + '</aui-inline-dialog>';
  };
  if (goog.DEBUG) {
    aui.inlineDialog2.inlineDialog2.soyTemplateName = 'aui.inlineDialog2.inlineDialog2';
  }
  
  
  aui.inlineDialog2.trigger = function(opt_data, opt_ignored) {
    return '' + aui.trigger.trigger(soy.$$augmentMap(opt_data, {showIcon: opt_data.showIcon ? opt_data.showIcon : false}));
  };
  if (goog.DEBUG) {
    aui.inlineDialog2.trigger.soyTemplateName = 'aui.inlineDialog2.trigger';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/labels.js
(typeof window === 'undefined' ? global : window).__7e203be84c77a093634a30adb1404c0e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from labels.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.labels.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.labels == 'undefined') { aui.labels = {}; }
  
  
  aui.labels.label = function(opt_data, opt_ignored) {
    return '' + ((opt_data.url && opt_data.isCloseable == true) ? '<span' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-label aui-label-closeable aui-label-split' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><a class="aui-label-split-main" href="' + soy.$$escapeHtml(opt_data.url) + '">' + soy.$$escapeHtml(opt_data.text) + '</a><span class="aui-label-split-close" >' + aui.labels.closeIcon(opt_data) + '</span></span>' : '<' + soy.$$escapeHtml(opt_data.url ? 'a' : 'span') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-label' + ((opt_data.isCloseable) ? ' aui-label-closeable' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + ((opt_data.url) ? ' href="' + soy.$$escapeHtml(opt_data.url) + '"' : '') + '>' + soy.$$escapeHtml(opt_data.text) + ((opt_data.isCloseable) ? aui.labels.closeIcon(opt_data) : '') + '</' + soy.$$escapeHtml(opt_data.url ? 'a' : 'span') + '>');
  };
  if (goog.DEBUG) {
    aui.labels.label.soyTemplateName = 'aui.labels.label';
  }
  
  
  aui.labels.closeIcon = function(opt_data, opt_ignored) {
    return '<span tabindex="0" class="aui-icon aui-icon-close"' + ((opt_data.hasTitle != false) ? ' title="' + aui.labels.closeIconText(opt_data) + '"' : '') + '>' + aui.labels.closeIconText(opt_data) + '</span>';
  };
  if (goog.DEBUG) {
    aui.labels.closeIcon.soyTemplateName = 'aui.labels.closeIcon';
  }
  
  
  aui.labels.closeIconText = function(opt_data, opt_ignored) {
    return '' + ((opt_data.closeIconText) ? soy.$$escapeHtml(opt_data.closeIconText) : '(' + soy.$$escapeHtml("aui.words.remove") + ' ' + soy.$$escapeHtml(opt_data.text) + ')');
  };
  if (goog.DEBUG) {
    aui.labels.closeIconText.soyTemplateName = 'aui.labels.closeIconText';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/lozenges.js
(typeof window === 'undefined' ? global : window).__d5dae2abe4b583c20a4ecdf7e3162990 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from lozenges.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.lozenges.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.lozenges == 'undefined') { aui.lozenges = {}; }
  
  
  aui.lozenges.lozenge = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.title) ? ' title="' + soy.$$escapeHtml(opt_data.title) + '"' : '') + ' class="aui-lozenge' + soy.$$escapeHtml(opt_data.type ? ' aui-lozenge-' + opt_data.type : '') + soy.$$escapeHtml(opt_data.isSubtle ? ' aui-lozenge-subtle' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.maxLength) ? soy.$$truncate(soy.$$escapeHtml(opt_data.text), opt_data.maxLength, true) : soy.$$escapeHtml(opt_data.text)) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'span') + '>';
  };
  if (goog.DEBUG) {
    aui.lozenges.lozenge.soyTemplateName = 'aui.lozenges.lozenge';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/message.js
(typeof window === 'undefined' ? global : window).__1cda3f6491b733eed5044d14fd39352f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from message.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.message.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.message == 'undefined') { aui.message = {}; }
  
  
  aui.message.info = function(opt_data, opt_ignored) {
    return '' + aui.message.message(soy.$$augmentMap(opt_data, {type: 'info'}));
  };
  if (goog.DEBUG) {
    aui.message.info.soyTemplateName = 'aui.message.info';
  }
  
  
  aui.message.warning = function(opt_data, opt_ignored) {
    return '' + aui.message.message(soy.$$augmentMap(opt_data, {type: 'warning'}));
  };
  if (goog.DEBUG) {
    aui.message.warning.soyTemplateName = 'aui.message.warning';
  }
  
  
  aui.message.error = function(opt_data, opt_ignored) {
    return '' + aui.message.message(soy.$$augmentMap(opt_data, {type: 'error'}));
  };
  if (goog.DEBUG) {
    aui.message.error.soyTemplateName = 'aui.message.error';
  }
  
  
  aui.message.success = function(opt_data, opt_ignored) {
    return '' + aui.message.message(soy.$$augmentMap(opt_data, {type: 'success'}));
  };
  if (goog.DEBUG) {
    aui.message.success.soyTemplateName = 'aui.message.success';
  }
  
  
  aui.message.hint = function(opt_data, opt_ignored) {
    return '' + aui.message.message(soy.$$augmentMap(opt_data, {type: 'hint'}));
  };
  if (goog.DEBUG) {
    aui.message.hint.soyTemplateName = 'aui.message.hint';
  }
  
  
  aui.message.generic = function(opt_data, opt_ignored) {
    return '' + aui.message.message(soy.$$augmentMap(opt_data, {type: 'generic'}));
  };
  if (goog.DEBUG) {
    aui.message.generic.soyTemplateName = 'aui.message.generic';
  }
  
  
  aui.message.message = function(opt_data, opt_ignored) {
    var output = '';
    var theTagName__soy21 = opt_data.tagName ? opt_data.tagName : 'div';
    var theType__soy22 = opt_data.type ? opt_data.type : 'generic';
    output += '<' + soy.$$escapeHtml(theTagName__soy21) + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-message aui-message-' + soy.$$escapeHtml(theType__soy22) + ' ' + soy.$$escapeHtml(theType__soy22) + ((opt_data.isCloseable) ? ' closeable' : '') + ((opt_data.isShadowed) ? ' shadowed' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.titleContent) ? '<p class="title"><strong>' + soy.$$filterNoAutoescape(opt_data.titleContent) + '</strong></p>' : '') + soy.$$filterNoAutoescape(opt_data.content) + ((opt_data.isCloseable) ? '<span class="aui-icon icon-close" role="button" tabindex="0"></span>' : '') + '</' + soy.$$escapeHtml(theTagName__soy21) + '>';
    return output;
  };
  if (goog.DEBUG) {
    aui.message.message.soyTemplateName = 'aui.message.message';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/navigation.js
(typeof window === 'undefined' ? global : window).__142eeba3c8b5f31a0cd3c953cc9c340e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from navigation.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.navigation.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.navigation == 'undefined') { aui.navigation = {}; }
  
  
  aui.navigation.item = function(opt_data, opt_ignored) {
    return '<li class="' + ((opt_data.isSelected || opt_data.key && opt_data.selectedItemKey == opt_data.key) ? 'aui-nav-selected' : '') + aui.renderExtraClasses(opt_data) + '"' + ((opt_data.isCollapsible && opt_data.children && opt_data.children.length > 0) ? 'aria-expanded="' + ((opt_data.isCollapsed) ? 'false' : 'true') + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.children && opt_data.children.length > 0 && opt_data.isCollapsible) ? '<a href="#" class="aui-nav-subtree-toggle">' + aui.icons.icon({icon: opt_data.isCollapsed ? 'collapsed' : 'expanded', size: 'small', useIconFont: true}) + '</a>' : '') + '<a class="aui-nav-item" href="' + soy.$$escapeHtml(opt_data.href) + '">' + ((opt_data.iconClass && ! opt_data.isChild) ? aui.icons.icon({icon: opt_data.iconClass, size: 'small', useIconFont: true}) : '') + ((opt_data.count == 0 || opt_data.count) ? '<span class="aui-badge">' + soy.$$escapeHtml(opt_data.count) + '</span>' : '') + '<span class="aui-nav-item-label">' + soy.$$escapeHtml(opt_data.label) + '</span></a>' + ((opt_data.children && opt_data.children.length > 0) ? aui.navigation.nav({items: opt_data.children, selectedItemKey: opt_data.selectedItemKey, isChild: true}) : '') + '</li>';
  };
  if (goog.DEBUG) {
    aui.navigation.item.soyTemplateName = 'aui.navigation.item';
  }
  
  
  aui.navigation.nav = function(opt_data, opt_ignored) {
    var output = '<ul class="aui-nav' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>';
    var itemList58 = opt_data.items;
    var itemListLen58 = itemList58.length;
    for (var itemIndex58 = 0; itemIndex58 < itemListLen58; itemIndex58++) {
      var itemData58 = itemList58[itemIndex58];
      output += aui.navigation.item(soy.$$augmentMap(itemData58, {isChild: opt_data.isChild, selectedItemKey: opt_data.selectedItemKey}));
    }
    output += '</ul>';
    return output;
  };
  if (goog.DEBUG) {
    aui.navigation.nav.soyTemplateName = 'aui.navigation.nav';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/page.js
(typeof window === 'undefined' ? global : window).__6c08a5cf1f2e92b97236babad5808ad6 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from page.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.page.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.page == 'undefined') { aui.page = {}; }
  
  
  aui.page.document = function(opt_data, opt_ignored, opt_ijData) {
    return '<!DOCTYPE html><html lang="' + soy.$$escapeHtml(opt_ijData.language ? opt_ijData.language : 'en') + '">' + aui.page.documentHTMLContent(opt_data, null, opt_ijData) + '</html>';
  };
  if (goog.DEBUG) {
    aui.page.document.soyTemplateName = 'aui.page.document';
  }
  
  
  aui.page.documentHTMLContent = function(opt_data, opt_ignored, opt_ijData) {
    var output = '';
    var thePageSize__soy9 = opt_data.pageSize ? opt_data.pageSize : opt_data.focusedPageSize ? opt_data.focusedPageSize : 'xlarge';
    output += '<head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>' + soy.$$escapeHtml(opt_data.windowTitle) + '</title>' + ((opt_data.headContent) ? soy.$$filterNoAutoescape(opt_data.headContent) : '') + '</head><body' + ((opt_data.pageType) ? (opt_data.pageType == 'generic') ? (opt_data.extraClasses) ? ' class="' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' : '' : (opt_data.pageType == 'focused') ? ' class="aui-page-focused aui-page-focused-' + soy.$$escapeHtml(thePageSize__soy9) + ' aui-page-size-' + soy.$$escapeHtml(thePageSize__soy9) + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' : (opt_data.pageType == 'notification') ? ' class="aui-page-notification aui-page-size-' + soy.$$escapeHtml(thePageSize__soy9) + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' : (opt_data.pageType == 'sidebar') ? ' class="aui-page-sidebar' + soy.$$escapeHtml(opt_data.sidebarState ? ' aui-sidebar-' + opt_data.sidebarState : '') + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' : ' class="aui-page-' + soy.$$escapeHtml(opt_data.pageType) + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' : ' class="' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</body>';
    return output;
  };
  if (goog.DEBUG) {
    aui.page.documentHTMLContent.soyTemplateName = 'aui.page.documentHTMLContent';
  }
  
  
  aui.page.page = function(opt_data, opt_ignored, opt_ijData) {
    return '<div id="page"><header id="header" role="banner">' + soy.$$filterNoAutoescape(opt_data.headerContent) + '</header><!-- #header --><section id="content" role="main">' + soy.$$filterNoAutoescape(opt_data.contentContent) + '</section><!-- #content --><footer id="footer" role="contentinfo">' + soy.$$filterNoAutoescape(opt_data.footerContent) + '</footer><!-- #footer --></div><!-- #page -->';
  };
  if (goog.DEBUG) {
    aui.page.page.soyTemplateName = 'aui.page.page';
  }
  
  
  aui.page.header = function(opt_data, opt_ignored, opt_ijData) {
    return ((opt_data.bannerContent) ? '<div class="aui-banner aui-banner-error" role="banner">' + soy.$$filterNoAutoescape(opt_data.bannerContent) + '</div>' : '') + '<nav' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-header aui-dropdown2-trigger-group' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + aui.renderExtraAttributes(opt_data, null, opt_ijData) + ' role="navigation"><div class="aui-header-inner">' + ((opt_data.headerBeforeContent) ? '<div class="aui-header-before">' + soy.$$filterNoAutoescape(opt_data.headerBeforeContent) + '</div>' : '') + '<div class="aui-header-primary"><h1 id="logo" class="aui-header-logo' + ((opt_data.headerLogoImageUrl) ? ' aui-header-logo-custom' : (opt_data.logo) ? ' aui-header-logo-' + soy.$$escapeHtml(opt_data.logo) : '') + '' + soy.$$escapeHtml(opt_data.headerLink ? opt_data.headerLink : '"><a href="/">') + '' + ((opt_data.headerLogoImageUrl) ? '<img src="' + soy.$$escapeHtml(opt_data.headerLogoImageUrl) + '" alt="' + soy.$$escapeHtml(opt_data.headerLogoText) + '" />' : '<span class="aui-header-logo-device">' + soy.$$escapeHtml(opt_data.headerLogoText ? opt_data.headerLogoText : '') + '</span>') + ((opt_data.headerText) ? '<span class="aui-header-logo-text">' + soy.$$escapeHtml(opt_data.headerText) + '</span>' : '') + '</a></h1>' + ((opt_data.primaryNavContent) ? soy.$$filterNoAutoescape(opt_data.primaryNavContent) : '') + '</div>' + ((opt_data.secondaryNavContent) ? '<div class="aui-header-secondary">' + soy.$$filterNoAutoescape(opt_data.secondaryNavContent) + '</div>' : '') + ((opt_data.headerAfterContent) ? '<div class="aui-header-after">' + soy.$$filterNoAutoescape(opt_data.headerAfterContent) + '</div>' : '') + '</div><!-- .aui-header-inner--></nav><!-- .aui-header -->';
  };
  if (goog.DEBUG) {
    aui.page.header.soyTemplateName = 'aui.page.header';
  }
  
  
  aui.page.pagePanel = function(opt_data, opt_ignored, opt_ijData) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ' class="aui-page-panel' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '><div class="aui-page-panel-inner">' + soy.$$filterNoAutoescape(opt_data.content) + '</div><!-- .aui-page-panel-inner --></' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '><!-- .aui-page-panel -->';
  };
  if (goog.DEBUG) {
    aui.page.pagePanel.soyTemplateName = 'aui.page.pagePanel';
  }
  
  
  aui.page.pagePanelNav = function(opt_data, opt_ignored, opt_ijData) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ' class="aui-page-panel-nav' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '><!-- .aui-page-panel-nav -->';
  };
  if (goog.DEBUG) {
    aui.page.pagePanelNav.soyTemplateName = 'aui.page.pagePanelNav';
  }
  
  
  aui.page.pagePanelContent = function(opt_data, opt_ignored, opt_ijData) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'section') + ' class="aui-page-panel-content' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'section') + '><!-- .aui-page-panel-content -->';
  };
  if (goog.DEBUG) {
    aui.page.pagePanelContent.soyTemplateName = 'aui.page.pagePanelContent';
  }
  
  
  aui.page.pagePanelSidebar = function(opt_data, opt_ignored, opt_ijData) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'aside') + ' class="aui-page-panel-sidebar' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'aside') + '><!-- .aui-page-panel-sidebar -->';
  };
  if (goog.DEBUG) {
    aui.page.pagePanelSidebar.soyTemplateName = 'aui.page.pagePanelSidebar';
  }
  
  
  aui.page.pagePanelItem = function(opt_data, opt_ignored, opt_ijData) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'section') + ' class="aui-page-panel-item' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'section') + '><!-- .aui-page-panel-item -->';
  };
  if (goog.DEBUG) {
    aui.page.pagePanelItem.soyTemplateName = 'aui.page.pagePanelItem';
  }
  
  
  aui.page.pageHeader = function(opt_data, opt_ignored, opt_ijData) {
    return '<header class="aui-page-header' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '><div class="aui-page-header-inner">' + soy.$$filterNoAutoescape(opt_data.content) + '</div><!-- .aui-page-header-inner --></header><!-- .aui-page-header -->';
  };
  if (goog.DEBUG) {
    aui.page.pageHeader.soyTemplateName = 'aui.page.pageHeader';
  }
  
  
  aui.page.pageHeaderImage = function(opt_data, opt_ignored, opt_ijData) {
    return '<div class="aui-page-header-image' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div><!-- .aui-page-header-image -->';
  };
  if (goog.DEBUG) {
    aui.page.pageHeaderImage.soyTemplateName = 'aui.page.pageHeaderImage';
  }
  
  
  aui.page.pageHeaderMain = function(opt_data, opt_ignored, opt_ijData) {
    return '<div class="aui-page-header-main' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div><!-- .aui-page-header-main -->';
  };
  if (goog.DEBUG) {
    aui.page.pageHeaderMain.soyTemplateName = 'aui.page.pageHeaderMain';
  }
  
  
  aui.page.pageHeaderActions = function(opt_data, opt_ignored, opt_ijData) {
    return '<div class="aui-page-header-actions' + aui.renderExtraClasses(opt_data, null, opt_ijData) + '"' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + aui.renderExtraAttributes(opt_data, null, opt_ijData) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div><!-- .aui-page-header-actions -->';
  };
  if (goog.DEBUG) {
    aui.page.pageHeaderActions.soyTemplateName = 'aui.page.pageHeaderActions';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/panel.js
(typeof window === 'undefined' ? global : window).__2bfffbec66d0768d2f7f46e7963427bd = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from panel.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  
  
  aui.panel = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-panel' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.panel.soyTemplateName = 'aui.panel';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/progress-tracker.js
(typeof window === 'undefined' ? global : window).__3475d727e9b91f1423781e6284d7cbc9 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from progress-tracker.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.progressTracker.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.progressTracker == 'undefined') { aui.progressTracker = {}; }
  
  
  aui.progressTracker.progressTracker = function(opt_data, opt_ignored) {
    var output = '<ol' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-progress-tracker' + ((opt_data.isInverted) ? ' aui-progress-tracker-inverted' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>';
    var param18 = '';
    var currentStepList19 = opt_data.steps;
    var currentStepListLen19 = currentStepList19.length;
    for (var currentStepIndex19 = 0; currentStepIndex19 < currentStepListLen19; currentStepIndex19++) {
      var currentStepData19 = currentStepList19[currentStepIndex19];
      if (currentStepData19['isCurrent']) {
        var stepList22 = opt_data.steps;
        var stepListLen22 = stepList22.length;
        for (var stepIndex22 = 0; stepIndex22 < stepListLen22; stepIndex22++) {
          var stepData22 = stepList22[stepIndex22];
          param18 += aui.progressTracker.step(soy.$$augmentMap(stepData22, {width: Math.round(100 / opt_data.steps.length * 10000) / 10000, href: stepIndex22 < currentStepIndex19 ? stepData22['href'] : null}));
        }
      }
    }
    output += aui.progressTracker.content({steps: opt_data.steps, content: param18});
    output += '</ol>';
    return output;
  };
  if (goog.DEBUG) {
    aui.progressTracker.progressTracker.soyTemplateName = 'aui.progressTracker.progressTracker';
  }
  
  
  aui.progressTracker.content = function(opt_data, opt_ignored) {
    var output = '';
    if (opt_data.content != '') {
      output += soy.$$filterNoAutoescape(opt_data.content);
    } else {
      var stepList36 = opt_data.steps;
      var stepListLen36 = stepList36.length;
      for (var stepIndex36 = 0; stepIndex36 < stepListLen36; stepIndex36++) {
        var stepData36 = stepList36[stepIndex36];
        output += aui.progressTracker.step(soy.$$augmentMap(stepData36, {isCurrent: stepIndex36 == 0, width: Math.round(100 / opt_data.steps.length * 10000) / 10000, href: null}));
      }
    }
    return output;
  };
  if (goog.DEBUG) {
    aui.progressTracker.content.soyTemplateName = 'aui.progressTracker.content';
  }
  
  
  aui.progressTracker.step = function(opt_data, opt_ignored) {
    return '<li' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-progress-tracker-step' + ((opt_data.isCurrent) ? ' aui-progress-tracker-step-current' : '') + aui.renderExtraClasses(opt_data) + '" style="width: ' + soy.$$escapeHtml(opt_data.width) + '%;"' + aui.renderExtraAttributes(opt_data) + '><' + soy.$$escapeHtml(opt_data.href ? 'a' : 'span') + ((opt_data.href) ? ' href="' + soy.$$escapeHtml(opt_data.href) + '"' : '') + '>' + soy.$$escapeHtml(opt_data.text) + '</' + soy.$$escapeHtml(opt_data.href ? 'a' : 'span') + '></li>';
  };
  if (goog.DEBUG) {
    aui.progressTracker.step.soyTemplateName = 'aui.progressTracker.step';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/sidebar.js
(typeof window === 'undefined' ? global : window).__33aed7dbb90662f3568d927cfadac855 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from sidebar.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.sidebar.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.sidebar == 'undefined') { aui.sidebar = {}; }
  
  
  aui.sidebar.sidebar = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ((opt_data.state) ? ' aria-expanded="' + ((opt_data.state == 'collapsed') ? 'false' : 'true') + '"' : '') + ' class="aui-sidebar ' + ((opt_data.isAnimated) ? 'aui-is-animated' : '') + aui.renderExtraClasses(opt_data) + '" ' + ((opt_data.isResponsive == false) ? 'data-aui-responsive="false"' : '') + aui.renderExtraAttributes(opt_data) + '><div class="aui-sidebar-wrapper"><div class="aui-sidebar-body">' + soy.$$filterNoAutoescape(opt_data.headerContent) + soy.$$filterNoAutoescape(opt_data.content) + '</div><div class="aui-sidebar-footer">' + ((opt_data.footerContent) ? soy.$$filterNoAutoescape(opt_data.footerContent) : (opt_data.settingsButtonUrl && opt_data.settingsText) ? '<a href="' + soy.$$escapeHtml(opt_data.settingsButtonUrl) + '" class="aui-button aui-button-subtle aui-sidebar-settings-button' + ((opt_data.isSettingsButtonSelected) ? ' aui-sidebar-settings-selected' : '') + '" data-tooltip="' + soy.$$escapeHtml(opt_data.settingsTooltip ? opt_data.settingsTooltip : opt_data.settingsText) + '"><span class="aui-icon aui-icon-small aui-iconfont-configure"></span><span class="aui-button-label">' + soy.$$escapeHtml(opt_data.settingsText) + '</span></a>' : '') + '<a class="aui-button aui-button-subtle aui-sidebar-toggle aui-sidebar-footer-tipsy" data-tooltip="' + soy.$$escapeHtml("aui.sidebar.expand.tooltip") + '" href="#"><span class="aui-icon aui-icon-small"></span></a></div>' + ((opt_data.isResizable) ? '<div class="aui-sidebar-handle"></div>' : '') + '</div></' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.sidebar.sidebar.soyTemplateName = 'aui.sidebar.sidebar';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/table.js
(typeof window === 'undefined' ? global : window).__0797f013555fa4c8b6ea99b79447a802 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from table.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  
  
  aui.table = function(opt_data, opt_ignored) {
    return '<table' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.columnsContent) ? soy.$$filterNoAutoescape(opt_data.columnsContent) : '') + ((opt_data.captionContent) ? '<caption>' + soy.$$filterNoAutoescape(opt_data.captionContent) + '</caption>' : '') + ((opt_data.theadContent) ? '<thead>' + soy.$$filterNoAutoescape(opt_data.theadContent) + '</thead>' : '') + ((opt_data.tfootContent) ? '<tfoot>' + soy.$$filterNoAutoescape(opt_data.tfootContent) + '</tfoot>' : '') + ((! opt_data.contentIncludesTbody) ? '<tbody>' : '') + soy.$$filterNoAutoescape(opt_data.content) + ((! opt_data.contentIncludesTbody) ? '</tbody>' : '') + '</table>';
  };
  if (goog.DEBUG) {
    aui.table.soyTemplateName = 'aui.table';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/tabs.js
(typeof window === 'undefined' ? global : window).__3ba45eddbe385e289e50deff16d80d4e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from tabs.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  
  
  aui.tabs = function(opt_data, opt_ignored) {
    var output = '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-tabs ' + soy.$$escapeHtml(opt_data.isVertical ? 'vertical-tabs' : 'horizontal-tabs') + ((opt_data.isDisabled) ? ' aui-tabs-disabled' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><ul class="tabs-menu">';
    var itemList19 = opt_data.menuItems;
    var itemListLen19 = itemList19.length;
    for (var itemIndex19 = 0; itemIndex19 < itemListLen19; itemIndex19++) {
      var itemData19 = itemList19[itemIndex19];
      output += aui.tabMenuItem(itemData19);
    }
    output += '</ul>' + soy.$$filterNoAutoescape(opt_data.paneContent) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
    return output;
  };
  if (goog.DEBUG) {
    aui.tabs.soyTemplateName = 'aui.tabs';
  }
  
  
  aui.tabMenuItem = function(opt_data, opt_ignored) {
    return '<li' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="menu-item' + ((opt_data.isActive) ? ' active-tab' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '><a href="' + soy.$$escapeHtml(opt_data.url) + '">' + soy.$$escapeHtml(opt_data.text) + '</a></li>';
  };
  if (goog.DEBUG) {
    aui.tabMenuItem.soyTemplateName = 'aui.tabMenuItem';
  }
  
  
  aui.tabPane = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="tabs-pane' + ((opt_data.isActive) ? ' active-pane' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.tabPane.soyTemplateName = 'aui.tabPane';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/toolbar.js
(typeof window === 'undefined' ? global : window).__35620d0900fba76a29c47593fb08f5cd = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from toolbar.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.toolbar.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.toolbar == 'undefined') { aui.toolbar = {}; }
  
  
  aui.toolbar.toolbar = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-toolbar' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.toolbar.toolbar.soyTemplateName = 'aui.toolbar.toolbar';
  }
  
  
  aui.toolbar.split = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="toolbar-split toolbar-split-' + soy.$$escapeHtml(opt_data.split) + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'div') + '>';
  };
  if (goog.DEBUG) {
    aui.toolbar.split.soyTemplateName = 'aui.toolbar.split';
  }
  
  
  aui.toolbar.group = function(opt_data, opt_ignored) {
    return '<ul' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="toolbar-group' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</ul>';
  };
  if (goog.DEBUG) {
    aui.toolbar.group.soyTemplateName = 'aui.toolbar.group';
  }
  
  
  aui.toolbar.item = function(opt_data, opt_ignored) {
    return '<li ' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="toolbar-item' + ((opt_data.isPrimary) ? ' primary' : '') + ((opt_data.isActive) ? ' active' : '') + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</li>';
  };
  if (goog.DEBUG) {
    aui.toolbar.item.soyTemplateName = 'aui.toolbar.item';
  }
  
  
  aui.toolbar.trigger = function(opt_data, opt_ignored) {
    return '<a' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="toolbar-trigger' + aui.renderExtraClasses(opt_data) + '" href="' + soy.$$escapeHtml(opt_data.url ? opt_data.url : '#') + '"' + ((opt_data.title) ? ' title="' + soy.$$escapeHtml(opt_data.title) + '"' : '') + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</a>';
  };
  if (goog.DEBUG) {
    aui.toolbar.trigger.soyTemplateName = 'aui.toolbar.trigger';
  }
  
  
  aui.toolbar.button = function(opt_data, opt_ignored) {
    opt_data = opt_data || {};
    return '' + aui.toolbar.item({isActive: opt_data.isActive, isPrimary: opt_data.isPrimary, id: opt_data.id, extraClasses: opt_data.extraClasses, extraAttributes: opt_data.extraAttributes, content: '' + aui.toolbar.trigger({url: opt_data.url, title: opt_data.title, content: '' + ((opt_data.iconClass) ? '<span class="icon ' + soy.$$escapeHtml(opt_data.iconClass) + '"></span>' : '') + ((opt_data.text) ? '<span class="trigger-text">' + soy.$$escapeHtml(opt_data.text) + '</span>' : '')})});
  };
  if (goog.DEBUG) {
    aui.toolbar.button.soyTemplateName = 'aui.toolbar.button';
  }
  
  
  aui.toolbar.link = function(opt_data, opt_ignored) {
    return '' + aui.toolbar.item({id: opt_data.id, extraClasses: 'toolbar-item-link' + aui.renderExtraClasses(opt_data), extraAttributes: opt_data.extraAttributes, content: '' + aui.toolbar.trigger({url: opt_data.url, content: '' + soy.$$escapeHtml(opt_data.text)})});
  };
  if (goog.DEBUG) {
    aui.toolbar.link.soyTemplateName = 'aui.toolbar.link';
  }
  
  
  aui.toolbar.dropdownInternal = function(opt_data, opt_ignored) {
    return '' + aui.toolbar.item({isPrimary: opt_data.isPrimary, id: opt_data.id, extraClasses: '' + soy.$$filterNoAutoescape(opt_data.itemClass) + aui.renderExtraClasses(opt_data), extraAttributes: opt_data.extraAttributes, content: '' + ((opt_data.splitButtonContent) ? soy.$$filterNoAutoescape(opt_data.splitButtonContent) : '') + aui.dropdown.parent({content: '' + aui.dropdown.trigger({extraClasses: 'toolbar-trigger', accessibilityText: opt_data.text}) + aui.dropdown.menu({content: opt_data.dropdownItemsContent})})});
  };
  if (goog.DEBUG) {
    aui.toolbar.dropdownInternal.soyTemplateName = 'aui.toolbar.dropdownInternal';
  }
  
  
  aui.toolbar.dropdown = function(opt_data, opt_ignored) {
    return '' + aui.toolbar.dropdownInternal({isPrimary: opt_data.isPrimary, id: opt_data.id, itemClass: 'toolbar-dropdown', extraClasses: opt_data.extraClasses, extraAttributes: opt_data.extraAttributes, text: opt_data.text, dropdownItemsContent: opt_data.dropdownItemsContent});
  };
  if (goog.DEBUG) {
    aui.toolbar.dropdown.soyTemplateName = 'aui.toolbar.dropdown';
  }
  
  
  aui.toolbar.splitButton = function(opt_data, opt_ignored) {
    return '' + aui.toolbar.dropdownInternal({isPrimary: opt_data.isPrimary, id: opt_data.id, itemClass: 'toolbar-splitbutton', extraClasses: opt_data.extraClasses, extraAttributes: opt_data.extraAttributes, dropdownItemsContent: opt_data.dropdownItemsContent, splitButtonContent: '' + aui.toolbar.trigger({url: opt_data.url, content: '' + soy.$$escapeHtml(opt_data.text)})});
  };
  if (goog.DEBUG) {
    aui.toolbar.splitButton.soyTemplateName = 'aui.toolbar.splitButton';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/toolbar2.js
(typeof window === 'undefined' ? global : window).__7354daa4f1caccec6f311bd6691c7717 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from toolbar2.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.toolbar2.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.toolbar2 == 'undefined') { aui.toolbar2 = {}; }
  
  
  aui.toolbar2.toolbar2 = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-toolbar2' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + ' role="toolbar"><div class="aui-toolbar2-inner">' + soy.$$filterNoAutoescape(opt_data.content) + '</div></div>';
  };
  if (goog.DEBUG) {
    aui.toolbar2.toolbar2.soyTemplateName = 'aui.toolbar2.toolbar2';
  }
  
  
  aui.toolbar2.item = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-toolbar2-' + soy.$$escapeHtml(opt_data.item) + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div>';
  };
  if (goog.DEBUG) {
    aui.toolbar2.item.soyTemplateName = 'aui.toolbar2.item';
  }
  
  
  aui.toolbar2.group = function(opt_data, opt_ignored) {
    return '<div' + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '"' : '') + ' class="aui-toolbar2-group' + aui.renderExtraClasses(opt_data) + '"' + aui.renderExtraAttributes(opt_data) + '>' + soy.$$filterNoAutoescape(opt_data.content) + '</div>';
  };
  if (goog.DEBUG) {
    aui.toolbar2.group.soyTemplateName = 'aui.toolbar2.group';
  }
  
  }());
  
  return module.exports;
}).call(this);
// .tmp/compiled-soy/trigger.js
(typeof window === 'undefined' ? global : window).__d4bc2b8438f1b1f16cb3e32bc902e68f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  (function(){
  aui = window.aui = window.aui || {}
  // This file was automatically generated from trigger.soy.
  // Please don't edit this file by hand.
  
  /**
   * @fileoverview Templates in namespace aui.trigger.
   */
  
  if (typeof aui == 'undefined') { var aui = {}; }
  if (typeof aui.trigger == 'undefined') { aui.trigger = {}; }
  
  
  aui.trigger.trigger = function(opt_data, opt_ignored) {
    return '<' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'a') + ((opt_data.id) ? ' id="' + soy.$$escapeHtml(opt_data.id) + '" ' : '') + ' class="' + aui.renderExtraClasses(opt_data) + '" aria-controls="' + soy.$$escapeHtml(opt_data.menu.id) + '" aria-haspopup="true" role="button"' + ((opt_data.title) ? ' title="' + soy.$$escapeHtml(opt_data.title) + '"' : '') + ((opt_data.container) ? ' data-container="' + soy.$$escapeHtml(opt_data.container) + '"' : '') + (((! opt_data.tagName || opt_data.tagName == 'a') && (! opt_data.extraAttributes || Object.prototype.toString.call(opt_data.extraAttributes) === '[object Object]' && ! opt_data.extraAttributes.href && ! opt_data.extraAttributes.tabindex || (! opt_data.extraAttributes.href || ! opt_data.extraAttributes.tabindex))) ? ' tabindex="0"' : '') + ' data-aui-trigger' + aui.renderExtraAttributes(opt_data) + '>' + ((opt_data.content) ? soy.$$filterNoAutoescape(opt_data.content) : '') + ((opt_data.text) ? soy.$$escapeHtml(opt_data.text) : '') + ((! (opt_data.showIcon == false)) ? '<span class="icon ' + soy.$$escapeHtml(opt_data.iconClasses ? opt_data.iconClasses : 'aui-icon-dropdown') + '">' + ((opt_data.iconText) ? soy.$$escapeHtml(opt_data.iconText) : '') + '</span>' : '') + '</' + soy.$$escapeHtml(opt_data.tagName ? opt_data.tagName : 'a') + '>';
  };
  if (goog.DEBUG) {
    aui.trigger.trigger.soyTemplateName = 'aui.trigger.trigger';
  }
  
  }());
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui-soy.js
(typeof window === 'undefined' ? global : window).__c53680a07922ae943535a83f0b8705ee = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  __a53df2df65b0ae7b4b04f07d8928a73f;
  
  __c7f0d65a5fb853466c83cd0b8b82cf8e;
  
  __e6e8b453903e65b16809f2a71873f682;
  
  __9d22df7541593b4d86613387110910ac;
  
  __d31f281a2025c9f44381c53e5186b35c;
  
  __03c64869a9b592cb1b6adcc71c8d6e41;
  
  __c3e9394c661b8d56890453a06f3ec31f;
  
  __6e3a7fa2dc6cd0f405730d126997feeb;
  
  __eeffe1213d8a3c1161023e531e0d3385;
  
  __9f80ef85a2a9d6e966b169d413b1cafa;
  
  __bc379a60ab5fa5921e706adee99ce083;
  
  __2491d7d57a2f7801b7fac97a9ec6cc8d;
  
  __9c1b7337681b51fdcaf9d08e89451a80;
  
  __194a9fd0ae14a072592c1deef136de6d;
  
  __7e203be84c77a093634a30adb1404c0e;
  
  __d5dae2abe4b583c20a4ecdf7e3162990;
  
  __1cda3f6491b733eed5044d14fd39352f;
  
  __142eeba3c8b5f31a0cd3c953cc9c340e;
  
  __6c08a5cf1f2e92b97236babad5808ad6;
  
  __2bfffbec66d0768d2f7f46e7963427bd;
  
  __3475d727e9b91f1423781e6284d7cbc9;
  
  __33aed7dbb90662f3568d927cfadac855;
  
  __0797f013555fa4c8b6ea99b79447a802;
  
  __3ba45eddbe385e289e50deff16d80d4e;
  
  __35620d0900fba76a29c47593fb08f5cd;
  
  __7354daa4f1caccec6f311bd6691c7717;
  
  __d4bc2b8438f1b1f16cb3e32bc902e68f;
  
  exports.default = window.aui;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/js/aui-soy.js
(typeof window === 'undefined' ? global : window).__84d76d7f558f28a9e875a8c7404d7b5e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _auiSoy = __c53680a07922ae943535a83f0b8705ee;
  
  var _auiSoy2 = _interopRequireDefault(_auiSoy);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _auiSoy2.default;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);