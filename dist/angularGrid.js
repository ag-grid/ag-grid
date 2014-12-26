//Angular Grid

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['angular'], factory);
    } else {
        // Browser globals
        root.angularGrid = factory(root.angular);
    }
}(this, function (angular) {/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                    hasProp(waiting, depName) ||
                    hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
define("../tools/almond", function(){});

/*
 * Require-CSS RequireJS css! loader plugin
 * 0.1.2
 * Guy Bedford 2013
 * MIT
 */

/*
 *
 * Usage:
 *  require(['css!./mycssFile']);
 *
 * Tested and working in (up to latest versions as of March 2013):
 * Android
 * iOS 6
 * IE 6 - 10
 * Chome 3 - 26
 * Firefox 3.5 - 19
 * Opera 10 - 12
 * 
 * browserling.com used for virtual testing environment
 *
 * Credit to B Cavalier & J Hann for the IE 6 - 9 method,
 * refined with help from Martin Cermak
 * 
 * Sources that helped along the way:
 * - https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
 * - http://www.phpied.com/when-is-a-stylesheet-really-loaded/
 * - https://github.com/cujojs/curl/blob/master/src/curl/plugin/css.js
 *
 */

define('css',[],function() {
    if (typeof window == 'undefined')
        return { load: function(n, r, load){ load() } };

    var head = document.getElementsByTagName('head')[0];

    var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;

    // use <style> @import load method (IE < 9, Firefox < 18)
    var useImportLoad = false;

    // set to false for explicit <link> load checking when onload doesn't work perfectly (webkit)
    var useOnload = true;

    // trident / msie
    if (engine[1] || engine[7])
        useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
    // webkit
    else if (engine[2] || engine[8])
        useOnload = false;
    // gecko
    else if (engine[4])
        useImportLoad = parseInt(engine[4]) < 18;

    //main api object
    var cssAPI = {};

    cssAPI.pluginBuilder = './css-builder';

    // <style> @import load method
    var curStyle, curSheet;
    var createStyle = function () {
        curStyle = document.createElement('style');
        head.appendChild(curStyle);
        curSheet = curStyle.styleSheet || curStyle.sheet;
    }
    var ieCnt = 0;
    var ieLoads = [];
    var ieCurCallback;

    var createIeLoad = function(url) {
        ieCnt++;
        if (ieCnt == 32) {
            createStyle();
            ieCnt = 0;
        }
        curSheet.addImport(url);
        curStyle.onload = function(){ processIeLoad() };
    }
    var processIeLoad = function() {
        ieCurCallback();

        var nextLoad = ieLoads.shift();

        if (!nextLoad) {
            ieCurCallback = null;
            return;
        }

        ieCurCallback = nextLoad[1];
        createIeLoad(nextLoad[0]);
    }
    var importLoad = function(url, callback) {
        if (!curSheet || !curSheet.addImport)
            createStyle();

        if (curSheet && curSheet.addImport) {
            // old IE
            if (ieCurCallback) {
                ieLoads.push([url, callback]);
            }
            else {
                createIeLoad(url);
                ieCurCallback = callback;
            }
        }
        else {
            // old Firefox
            curStyle.textContent = '@import "' + url + '";';

            var loadInterval = setInterval(function() {
                try {
                    curStyle.sheet.cssRules;
                    clearInterval(loadInterval);
                    callback();
                } catch(e) {}
            }, 10);
        }
    }

    // <link> load method
    var linkLoad = function(url, callback) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        if (useOnload)
            link.onload = function() {
                link.onload = function() {};
                // for style dimensions queries, a short delay can still be necessary
                setTimeout(callback, 7);
            }
        else
            var loadInterval = setInterval(function() {
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var sheet = document.styleSheets[i];
                    if (sheet.href == link.href) {
                        clearInterval(loadInterval);
                        return callback();
                    }
                }
            }, 10);
        link.href = url;
        head.appendChild(link);
    }

    cssAPI.normalize = function(name, normalize) {
        if (name.substr(name.length - 4, 4) == '.css')
            name = name.substr(0, name.length - 4);

        return normalize(name);
    }

    cssAPI.load = function(cssId, req, load, config) {

        (useImportLoad ? importLoad : linkLoad)(req.toUrl(cssId + '.css'), load);

    }

    return cssAPI;
});

define('../src/littleQuery',[], function() {

    function LittleQuery() {

    }

    LittleQuery.prototype.removeFromArray = function() {
        console.log("little query remove from array");
    };

    return new LittleQuery();

});
/*
 * css.normalize.js
 *
 * CSS Normalization
 *
 * CSS paths are normalized based on an optional basePath and the RequireJS config
 *
 * Usage:
 *   normalize(css, fromBasePath, toBasePath);
 *
 * css: the stylesheet content to normalize
 * fromBasePath: the absolute base path of the css relative to any root (but without ../ backtracking)
 * toBasePath: the absolute new base path of the css relative to the same root
 *
 * Absolute dependencies are left untouched.
 *
 * Urls in the CSS are picked up by regular expressions.
 * These will catch all statements of the form:
 *
 * url(*)
 * url('*')
 * url("*")
 *
 * @import '*'
 * @import "*"
 *
 * (and so also @import url(*) variations)
 *
 * For urls needing normalization
 *
 */

define('normalize',[],function() {

    // regular expression for removing double slashes
    // eg http://www.example.com//my///url/here -> http://www.example.com/my/url/here
    var slashes = /([^:])\/+/g
    var removeDoubleSlashes = function(uri) {
        return uri.replace(slashes, '$1/');
    }

    // given a relative URI, and two absolute base URIs, convert it from one base to another
    var protocolRegEx = /[^\:\/]*:\/\/([^\/])*/;
    var absUrlRegEx = /^(\/|data:)/;
    function convertURIBase(uri, fromBase, toBase) {
        if (uri.match(absUrlRegEx) || uri.match(protocolRegEx))
            return uri;
        uri = removeDoubleSlashes(uri);
        // if toBase specifies a protocol path, ensure this is the same protocol as fromBase, if not
        // use absolute path at fromBase
        var toBaseProtocol = toBase.match(protocolRegEx);
        var fromBaseProtocol = fromBase.match(protocolRegEx);
        if (fromBaseProtocol && (!toBaseProtocol || toBaseProtocol[1] != fromBaseProtocol[1] || toBaseProtocol[2] != fromBaseProtocol[2]))
            return absoluteURI(uri, fromBase);

        else {
            return relativeURI(absoluteURI(uri, fromBase), toBase);
        }
    };

    // given a relative URI, calculate the absolute URI
    function absoluteURI(uri, base) {
        if (uri.substr(0, 2) == './')
            uri = uri.substr(2);

        // absolute urls are left in tact
        if (uri.match(absUrlRegEx) || uri.match(protocolRegEx))
            return uri;

        var baseParts = base.split('/');
        var uriParts = uri.split('/');

        baseParts.pop();

        while (curPart = uriParts.shift())
            if (curPart == '..')
                baseParts.pop();
            else
                baseParts.push(curPart);

        return baseParts.join('/');
    };


    // given an absolute URI, calculate the relative URI
    function relativeURI(uri, base) {

        // reduce base and uri strings to just their difference string
        var baseParts = base.split('/');
        baseParts.pop();
        base = baseParts.join('/') + '/';
        i = 0;
        while (base.substr(i, 1) == uri.substr(i, 1))
            i++;
        while (base.substr(i, 1) != '/')
            i--;
        base = base.substr(i + 1);
        uri = uri.substr(i + 1);

        // each base folder difference is thus a backtrack
        baseParts = base.split('/');
        var uriParts = uri.split('/');
        out = '';
        while (baseParts.shift())
            out += '../';

        // finally add uri parts
        while (curPart = uriParts.shift())
            out += curPart + '/';

        return out.substr(0, out.length - 1);
    };

    var normalizeCSS = function(source, fromBase, toBase) {

        fromBase = removeDoubleSlashes(fromBase);
        toBase = removeDoubleSlashes(toBase);

        var urlRegEx = /@import\s*("([^"]*)"|'([^']*)')|url\s*\((?!#)\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/ig;
        var result, url, source;

        while (result = urlRegEx.exec(source)) {
            url = result[3] || result[2] || result[5] || result[6] || result[4];
            var newUrl;
            newUrl = convertURIBase(url, fromBase, toBase);
            var quoteLen = result[5] || result[6] ? 1 : 0;
            source = source.substr(0, urlRegEx.lastIndex - url.length - quoteLen - 1) + newUrl + source.substr(urlRegEx.lastIndex - quoteLen - 1);
            urlRegEx.lastIndex = urlRegEx.lastIndex + (newUrl.length - url.length);
        }

        return source;
    };

    normalizeCSS.convertURIBase = convertURIBase;
    normalizeCSS.absoluteURI = absoluteURI;
    normalizeCSS.relativeURI = relativeURI;

    return normalizeCSS;
});

define('css!../src/angularGrid',[],function(){});

//todo:
//todo: advanced filtering
//todo: moving columns
//todo: grouping
//todo: put events into angular digest

define('../src/angularGrid',[
    "angular",
    "./littleQuery",
    "css!./angularGrid"
], function(angular, lq) {

    lq.removeFromArray();

    var module = angular.module("angularGrid", []);

    var MIN_COL_WIDTH = 10;
    var DEFAULT_ROW_HEIGHT = 30;

    var SVG_NS = "http://www.w3.org/2000/svg";

    var ASC = "asc";
    var DESC = "desc";

    var SORT_STYLE_SHOW = "fill:grey; visibility:visible;";
    var SORT_STYLE_HIDE = "fill:grey; visibility:hidden;";

    var template =
        "<div class='ag-root'>" +
        // header
          "<div class='ag-header'>" +
            "<div class='ag-pinned-header'></div>" +
            "<div class='ag-header-viewport'>" +
              "<div class='ag-header-container'></div>" +
            "</div>" +
          "</div>" +
        // body
          "<div class='ag-body'>" +
            "<div class='ag-pinned-cols-viewport'>" +
              "<div class='ag-pinned-cols-container'></div>" +
            "</div>" +
            "<div class='ag-body-viewport-wrapper'>" +
              "<div class='ag-body-viewport'>" +
                "<div class='ag-body-container'></div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";

    module.directive("angularGrid", function() {
        return {
            restrict: "A",
            template: template,
            controller: ["$scope", "$element", Grid],
            scope: {
                angularGrid: "="
            }
        };
    });

    function Grid($scope, $element) {

        var _this = this;
        $scope.grid = this;
        this.gridOptions = $scope.angularGrid;
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function(newFilter) {
            _this.onQuickFilterChanged(newFilter);
        });

        this.gridOptions.selectedRows = [];

        //done once
        //for virtualisation, maps keep track of which elements are attached to the dom
        this.rowsInBodyContainer = {};
        this.rowsInPinnedContainer = {};
        this.addApi();
        this.findAllElements($element);
        this.gridOptions.rowHeight = (this.gridOptions.rowHeight ? this.gridOptions.rowHeight : DEFAULT_ROW_HEIGHT); //default row height to 30

        this.addScrollListener();

        this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes

        //done when cols change
        this.setupColumns();

        //done when rows change
        this.setupRows();

        //flag to mark when the directive is destroyed
        this.finished = false;
        var _this = this;
        $scope.$on("$destroy", function(){
            _this.finished = true;
        });
    }

    Grid.prototype.onQuickFilterChanged = function(newFilter) {
        if (newFilter===undefined||newFilter==="") {
            newFilter = null;
        }
        if (this.quickFilter!==newFilter) {
            if (newFilter!==null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            this.setupRows();
        }
    };

    Grid.prototype.onRowClicked = function(rowIndex) {
        //if no selection method enabled, do nothing
        if (this.gridOptions.rowSelection!=="single" && this.gridOptions.rowSelection!=="multiple") {
            return;
        }
        var row = this.gridOptions.rowDataAfterSortAndFilter[rowIndex];

        //if not in array, then it's a new selection, thus selected = true
        var selected = this.gridOptions.selectedRows.indexOf(row)<0;

        if (selected) {
            if (this.gridOptions.rowSelected && typeof this.gridOptions.rowSelected==="function") {
                this.gridOptions.rowSelected(row);
            }
            //if single selection, clear any previous
            if (selected && this.gridOptions.rowSelection === "single") {
                this.gridOptions.selectedRows.length = 0;
                var eRowsWithSelectedClass = this.eBody.querySelectorAll(".ag-row-selected");
                for (var i = 0; i < eRowsWithSelectedClass.length; i++) {
                    removeCssClass(eRowsWithSelectedClass[i], "ag-row-selected");
                }
            }
            this.gridOptions.selectedRows.push(row);
        } else {
            removeFromArray(this.gridOptions.selectedRows, row);
        }

        //update css class on selected row
        var eRows = this.eBody.querySelectorAll("[row='"+rowIndex+"']");
        for (var i = 0; i<eRows.length; i++) {
            if (selected) {
                addCssClass(eRows[i], "ag-row-selected")
            } else {
                removeCssClass(eRows[i], "ag-row-selected")
            }
        }

        if (this.gridOptions.selectionChanged && typeof this.gridOptions.selectionChanged==="function") {
            this.gridOptions.selectionChanged();
        }

    };

    Grid.prototype.doFilter = function() {
        var _this = this;
        if (this.quickFilter) {
            this.gridOptions.rowDataAfterFilter = [];
            this.gridOptions.rowData.forEach(function(item) {
                if (!item._quickFilterAggregateText) {
                    _this.aggregateRowForQuickFilter(item);
                }
                if (item._quickFilterAggregateText.indexOf(_this.quickFilter)>=0) {
                    _this.gridOptions.rowDataAfterFilter.push(item);
                }
            });
        } else {
            this.gridOptions.rowDataAfterFilter = this.gridOptions.rowData.slice(0);
        }
    };
    
    Grid.prototype.aggregateRowForQuickFilter = function(rowItem) {
        var aggregatedText = "";
        this.gridOptions.columnDefs.forEach(function(colDef) {
            var value = rowItem[colDef.field];
            if (value && value!=="") {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        rowItem._quickFilterAggregateText = aggregatedText;
    };
    
    Grid.prototype.setupColumns = function() {
        this.ensureEachColHasSize();
        this.insertPinnedHeader();
        this.insertScrollingHeader();
        this.setPinnedColContainerWidth();
        this.setBodyContainerWidth();
    };

    Grid.prototype.setBodyContainerWidth = function() {
        var mainRowWidth = this.getTotalUnpinnedColWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.setupRows = function() {

        this.doFilter();
        this.doSort();

        //in time, replace this with filter
        //this.gridOptions.rowDataAfterFilter = this.gridOptions.rowData.slice(0);
        //this.gridOptions.rowDataAfterSortAndFilter = this.gridOptions.rowData.slice(0);

        var rowCount = this.gridOptions.rowDataAfterFilter.length;
        var containerHeight = this.gridOptions.rowHeight * rowCount;
        this.eBodyContainer.style.height = containerHeight+"px";
        this.ePinnedColsContainer.style.height = containerHeight+"px";

        this.refreshAllVirtualRows();
    };
    
    Grid.prototype.refreshAllVirtualRows = function() {
        //remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);

        //add in new rows
        this.drawVirtualRows();
    };

    Grid.prototype.doSort = function() {
        //see if there is a col we are sorting by
        var colDefForSorting = null;
        this.gridOptions.columnDefs.forEach(function(colDef) {
            if (colDef.sort) {
                colDefForSorting = colDef;
            }
        });

        if (colDefForSorting) {
            var keyForSort = colDefForSorting.field;
            var ascending = colDefForSorting.sort === ASC;
            var result1 = ascending ? -1 : 1;
            var result2 = ascending ? 1 : -1;

            this.gridOptions.rowDataAfterSortAndFilter.sort(function(objA, objB) {
                //hack to stop crashing, in case user isn't supplying objects
                if (objA===null || objA===undefined || objB===null || objB===undefined) {
                    return 0;
                }
                var valueA = objA[keyForSort];
                var valueB = objB[keyForSort];

                if (valueA < valueB) {
                    return result1;
                } else if (valueA > valueB) {
                    return result2;
                } else {
                    return 0;
                }
            });
        } else {
            this.gridOptions.rowDataAfterSortAndFilter = this.gridOptions.rowDataAfterFilter.slice(0);
        }

        this.refreshAllVirtualRows();
    };

    Grid.prototype.addApi = function() {
        var _this = this;
        var api = {
            onNewRows: function() {
                _this.gridOptions.selectedRows.length = 0;
                _this.setupRows();
            },
            onNewCols: function() {
                _this.setupColumns();
                _this.setupRows();
            }
        };
        this.gridOptions.api = api;
    };

    Grid.prototype.findAllElements = function($element) {
        var eGrid = $element[0];
        this.eGrid = eGrid;
        this.eRoot = eGrid.querySelector(".ag-root");
        this.eBody = eGrid.querySelector(".ag-body");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
        this.ePinnedColsViewport = eGrid.querySelector(".ag-pinned-cols-viewport");
        //this.eBodyViewportWrapper = eGrid.querySelector(".ag-body-viewport-wrapper");
        this.eHeader = eGrid.querySelector(".ag-header");
    };

    Grid.prototype.setPinnedColContainerWidth = function() {
        var pinnedColWidth = this.getTotalPinnedColWidth();
        this.ePinnedColsContainer.style.width = pinnedColWidth+"px";
    };

    Grid.prototype.ensureRowsRendered = function(start, finish) {
        var pinnedColumnCount = this.getPinnedColCount();
        var mainRowWidth = this.getTotalUnpinnedColWidth();
        var _this = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);

        //add in new rows
        for (var rowIndex = start; rowIndex<=finish; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString())>=0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            var data = this.gridOptions.rowDataAfterSortAndFilter[rowIndex];
            if (data) {
                _this.insertRow(data, rowIndex, mainRowWidth, pinnedColumnCount);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    };

    //takes array of row id's
    Grid.prototype.removeVirtualRows = function(rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function(indexToRemove) {
            var pinnedRowToRemove = _this.rowsInPinnedContainer[indexToRemove];
            _this.ePinnedColsContainer.removeChild(pinnedRowToRemove);
            delete _this.rowsInPinnedContainer[indexToRemove];

            var bodyRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eBodyContainer.removeChild(bodyRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };

    Grid.prototype.ensureEachColHasSize = function() {
        this.gridOptions.columnDefs.forEach(function(colDef) {
            if (!colDef.width || colDef.width<10) {
                colDef.actualWidth = MIN_COL_WIDTH;
            } else {
                colDef.actualWidth = colDef.width;
            }
        });
    };

    //see if a grey box is needed at the bottom of the pinned col
    Grid.prototype.setPinnedColHeight = function() {
        var bodyHeight = pixelStringToNumber(this.eBody.style.height);
        var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        if (scrollShowing) {
            this.ePinnedColsViewport.style.height = (bodyHeight-20) + "px";
        } else {
            this.ePinnedColsViewport.style.height = bodyHeight + "px";
        }
    };

    //todo: make this only happen if size changes, and only when visible
    Grid.prototype.setBodySize = function() {
        //if (this.eGrid.is(":visible")) {
        if (true) {
            var availableHeight = this.eGrid.offsetHeight;
            var headerHeight = this.eHeader.offsetHeight;
            var bodyHeight = availableHeight - headerHeight;
            if (bodyHeight<0) {
                bodyHeight = 0;
            }

            if (this.bodyHeightLastTime != bodyHeight) {
                this.bodyHeightLastTime = bodyHeight;
                this.eBody.style.height = bodyHeight + "px";
                //only draw virtual rows if done sort & filter - this
                //means we don't draw rows if table is not yet initialised
                if (this.gridOptions.rowDataAfterSortAndFilter) {
                    this.drawVirtualRows();
                }
            }

            //because of change in height, scroll may now be present
            this.setPinnedColHeight();
        }

        var _this = this;
        //the table can change size, so keep calling his to keep it fresh.
        //not using angular $timeout, do not want to trigger a digest cycle
        if (!this.finished) {
            setTimeout(function() {
                _this.setBodySize();
            }, 200);
        }
    };

    Grid.prototype.getTotalPinnedColWidth = function() {
        var pinnedColCount = this.getPinnedColCount();
        var widthSoFar = 0;
        var colCount = pinnedColCount;
        if (this.gridOptions.columnDefs.length < pinnedColCount) {
            colCount = this.gridOptions.columnDefs.length;
        }
        for (var colIndex = 0; colIndex<colCount; colIndex++) {
            widthSoFar += this.gridOptions.columnDefs[colIndex].actualWidth;
        }
        return widthSoFar;
    };

    Grid.prototype.getTotalUnpinnedColWidth = function() {
        var widthSoFar = 0;
        var pinnedColCount = this.getPinnedColCount();

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            if (index>=pinnedColCount) {
                widthSoFar += colDef.actualWidth;
            }
        });

        return widthSoFar;
    };

    Grid.prototype.getPinnedColCount = function() {
        if (this.gridOptions.pinnedColumnCount) {
            //in case user puts in a string, cast to number
            return Number(this.gridOptions.pinnedColumnCount);
        } else {
            return 0;
        }
    };

    Grid.prototype.insertPinnedHeader = function() {
        var ePinnedHeader = this.ePinnedHeader;
        removeAllChildren(ePinnedHeader);
        var pinnedColumnCount = this.getPinnedColCount();
        var _this = this;

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            //only include the first x cols
            if (index<pinnedColumnCount) {
                var headerCell = _this.createHeaderCell(colDef, index, true);
                ePinnedHeader.appendChild(headerCell);
            }
        });
    };

    Grid.prototype.createHeaderCell = function(colDef, colIndex, colPinned) {
        var headerCell = document.createElement("div");

        headerCell.className = "ag-header-cell";

        if (this.gridOptions.enableColResize) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            headerCell.appendChild(headerCellResize);
            this.addColResizeHandling(headerCellResize, headerCell, colDef, colIndex, colPinned);
        }

        //label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";
        //add in sort icon
        if (this.gridOptions.enableSorting) {
            var headerSortIcon = createSortArrow(colIndex);
            headerCellLabel.appendChild(headerSortIcon);
            this.addSortHandling(headerCellLabel, colDef);
        }
        //add in text label
        var eInnerText = document.createElement("span");
        eInnerText.innerHTML = colDef.displayName;
        headerCellLabel.appendChild(eInnerText);

        headerCell.appendChild(headerCellLabel);
        headerCell.style.width = this.formatWidth(colDef.actualWidth);

        return headerCell;
    };

    Grid.prototype.addSortHandling = function(headerCellLabel, colDef) {
        var _this = this;
        headerCellLabel.addEventListener("click", function() {

            //update sort on current col
            if (colDef.sort === ASC) {
                colDef.sort = DESC;
            } else if (colDef.sort === DESC) {
                colDef.sort = null
            } else {
                colDef.sort = ASC;
            }

            //clear sort on all columns except this one, and update the icons
            _this.gridOptions.columnDefs.forEach(function(colToClear, colIndex) {
                if (colToClear!==colDef) {
                    colToClear.sort = null;
                }

                //update visibility of icons
                var sortAscending = colToClear.sort===ASC;
                var sortDescending = colToClear.sort===DESC;

                var eSortAscending = _this.eHeader.querySelector(".ag-header-cell-sort-asc-" + colIndex);
                eSortAscending.setAttribute("style", sortAscending ? SORT_STYLE_SHOW : SORT_STYLE_HIDE);

                var eSortDescending = _this.eHeader.querySelector(".ag-header-cell-sort-desc-" + colIndex);
                eSortDescending.setAttribute("style", sortDescending ? SORT_STYLE_SHOW : SORT_STYLE_HIDE);
            });

            _this.doSort();
        });
    };

    Grid.prototype.addColResizeHandling = function(headerCellResize, headerCell, colDef, colIndex, colPinned) {
        var _this = this;
        headerCellResize.onmousedown = function(downEvent) {
            _this.eRoot.style.cursor = "col-resize";
            _this.dragStartX = downEvent.clientX;
            _this.colWidthStart = colDef.actualWidth;

            _this.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - _this.dragStartX;
                var newWidth = _this.colWidthStart + change;
                if (newWidth < MIN_COL_WIDTH) {
                    newWidth = MIN_COL_WIDTH;
                }
                var newWidthPx = newWidth + "px";
                var selectorForAllColsInCell = ".cell-col-"+colIndex;
                var cellsForThisCol = _this.eRoot.querySelectorAll(selectorForAllColsInCell);
                for (var i = 0; i<cellsForThisCol.length; i++) {
                    cellsForThisCol[i].style.width = newWidthPx;
                }

                headerCell.style.width = newWidthPx;
                colDef.actualWidth = newWidth;

                if (colPinned) {
                    _this.setPinnedColContainerWidth();
                } else {
                    _this.setMainRowWidths();
                    _this.setBodyContainerWidth();
                }
            };
            _this.eRoot.onmouseup = function() {
                _this.eRoot.style.cursor = "";
                _this.stopDragging();
            };
            _this.eRoot.onmouseleave = function() {
                _this.stopDragging();
            };
        };
    };

    Grid.prototype.stopDragging = function() {
        this.eRoot.style.cursor = "";
        this.eRoot.onmouseup = null;
        this.eRoot.onmouseleave = null;
        this.eRoot.onmousemove = null;
    };

    Grid.prototype.addScrollListener = function() {
        var _this = this;

        this.eBodyViewport.addEventListener("scroll", function() {
            _this.scrollHeaderAndPinned();
            _this.drawVirtualRows();
        });
    };

    Grid.prototype.drawVirtualRows = function() {
        var topPixel = this.eBodyViewport.scrollTop;
        var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / this.gridOptions.rowHeight);
        var lastRow = Math.floor(bottomPixel / this.gridOptions.rowHeight);

        this.ensureRowsRendered(firstRow, lastRow);
    };

    Grid.prototype.scrollHeaderAndPinned = function() {
        this.eHeaderContainer.style.left = -this.eBodyViewport.scrollLeft + "px";
        this.ePinnedColsContainer.style.top = -this.eBodyViewport.scrollTop + "px";
    };

    Grid.prototype.setMainRowWidths = function() {
        var mainRowWidth = this.getTotalUnpinnedColWidth() + "px";

        var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
        for (var i = 0; i<unpinnedRows.length; i++) {
            unpinnedRows[i].style.width = mainRowWidth;
        }
    };

    Grid.prototype.insertRow = function(data, rowIndex, mainRowWidth, pinnedColumnCount) {
        var ePinnedRow = this.createRowContainer(rowIndex, data);
        var eMainRow = this.createRowContainer(rowIndex, data);
        var _this = this;

        this.rowsInBodyContainer[rowIndex] = eMainRow;
        this.rowsInPinnedContainer[rowIndex] = ePinnedRow;

        eMainRow.style.width = mainRowWidth+"px";

        this.gridOptions.columnDefs.forEach(function(colDef, colIndex) {
            var eGridCell = _this.createCell(colDef, data[colDef.field], rowIndex, colIndex);

            if (colIndex>=pinnedColumnCount) {
                eMainRow.appendChild(eGridCell);
            } else {
                ePinnedRow.appendChild(eGridCell);
            }
        });

        this.ePinnedColsContainer.appendChild(ePinnedRow);
        this.eBodyContainer.appendChild(eMainRow);
    };

    Grid.prototype.createRowContainer = function(rowIndex, row) {
        var eRow = document.createElement("div");
        var classesList = ["ag-row"];
        classesList.push(rowIndex%2==0 ? "ag-row-even" : "ag-row-odd");
        if (this.gridOptions.selectedRows.indexOf(row)>=0) {
            classesList.push("ag-row-selected");
        }
        var classes = classesList.join(" ");

        eRow.className = classes;

        eRow.setAttribute("row", rowIndex);

        eRow.style.top = (this.gridOptions.rowHeight * rowIndex) + "px";
        eRow.style.height = (this.gridOptions.rowHeight) + "px";

        var _this = this;
        eRow.addEventListener("click", function() {
            _this.onRowClicked(Number(this.getAttribute("row")))
        });

        return eRow;
    }

    Grid.prototype.createCell = function(colDef, value, rowIndex, colIndex) {
        var eGridCell = document.createElement("div");
        eGridCell.className = "ag-cell cell-col-"+colIndex;

        if (value) {
            eGridCell.innerText = value;
        } else {
            eGridCell.innerHTML = "&nbsp;";
        }

        if (colDef.cellCss) {
            Object.keys(colDef.cellCss).forEach(function(key) {
                eGridCell.style[key] = colDef.cellCss[key];
            });
        }

        if (this.gridOptions.cellCssFormatter) {
            var cssStyles = this.gridOptions.cssCellFormatter(rowIndex, colIndex);
            if (cssStyles) {
                Object.keys(cssStyles).forEach(function(key) {
                    eGridCell.style[key] = cssStyles[key];
                });
            }
        }

        if (this.gridOptions.cellClassFormatter) {
            var classes = this.gridOptions.cellClassFormatter(rowIndex, colIndex);
            if (classes) {
                var newClassesString = classes.join(" ");
                if (eGridCell.className) {
                    newClassesString = eGridCell.className + " " + newClassesString;
                }
                eGridCell.className = newClassesString;
            }
        }

        eGridCell.style.width = this.formatWidth(colDef.actualWidth);

        return eGridCell;
    };

    Grid.prototype.formatWidth = function(width) {
        if (typeof width === "number") {
            return width + "px";
        } else {
            return width;
        }
    };

    Grid.prototype.insertScrollingHeader = function() {
        var eHeaderContainer = this.eHeaderContainer;
        removeAllChildren(eHeaderContainer);
        var pinnedColumnCount = this.getPinnedColCount();
        var _this = this;
        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            if (index<pinnedColumnCount) {
                return;
            }
            var headerCell = _this.createHeaderCell(colDef, index, false);
            eHeaderContainer.appendChild(headerCell);
        });
    };

    //follows small util functions
    function removeAllChildren(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }

    //if passed '42px' then returns the number 42
    function pixelStringToNumber(val) {
        if (typeof val === "string") {
            if (val.indexOf("px")>=0) {
                val.replace("px","");
            }
            return parseInt(val);
        } else {
            return val;
        }
    }

    function addCssClass(element, className) {
        var oldClasses = element.className;
        if (oldClasses.indexOf(className)>=0) {
            return;
        }
        element.className = oldClasses + " " + className;;
    }

    function removeCssClass(element, className) {
        var oldClasses = element.className;
        if (oldClasses.indexOf(className)<0) {
            return;
        }
        var newClasses = oldClasses.replace(" " + className, "");
        newClasses = newClasses.replace(className + " ", "");
        if (newClasses==className) {
            newClasses = "";
        }
        element.className = newClasses;
    }

    function removeFromArray(array, object) {
        array.splice(array.indexOf(object));
    }

    function createSortArrow(colIndex) {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        eSvg.setAttribute("class", "ag-header-cell-sort");

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,10 5,0 10,10");
        eDescIcon.setAttribute("style", SORT_STYLE_HIDE);
        eDescIcon.setAttribute("class", "ag-header-cell-sort-desc-"+colIndex);
        eSvg.appendChild(eDescIcon);

        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", "0,0 10,0 5,10");
        eAscIcon.setAttribute("style", SORT_STYLE_HIDE);
        eAscIcon.setAttribute("class", "ag-header-cell-sort-asc-"+colIndex);
        eSvg.appendChild(eAscIcon);

        return eSvg;
    }
});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('\r\n.ag-root {\r\n    height: 100%;\r\n    font-size: 14px;\r\n    cursor: default;\r\n\r\n    /*disable user mouse selection */\r\n    -webkit-touch-callout: none;\r\n    -webkit-user-select: none;\r\n    -khtml-user-select: none;\r\n    -moz-user-select: none;\r\n    -ms-user-select: none;\r\n    user-select: none;\r\n}\r\n\r\n.ag-header {\r\n    white-space: nowrap;\r\n    box-sizing: border-box;\r\n    overflow: hidden;\r\n    height: 25px;\r\n}\r\n\r\n.ag-pinned-header {\r\n    box-sizing: border-box;\r\n    display: inline-block;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-viewport {\r\n    box-sizing: border-box;\r\n    display: inline-block;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-container {\r\n    box-sizing: border-box;\r\n    position: relative;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-cell {\r\n    box-sizing: border-box;\r\n    font-weight: bold;\r\n    vertical-align: bottom;\r\n    text-align: center;\r\n    display: inline-block;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-cell-label {\r\n    padding: 4px;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-header-cell-sort {\r\n    padding-right: 2px;\r\n}\r\n\r\n.ag-header-cell-resize {\r\n    height: 100%;\r\n    width: 4px;\r\n    float: right;\r\n    cursor: col-resize;\r\n}\r\n\r\n.ag-body {\r\n}\r\n\r\n.ag-pinned-cols-viewport {\r\n    float: left;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-pinned-cols-container {\r\n    display: inline-block;\r\n    position: relative;\r\n}\r\n\r\n.ag-body-viewport-wrapper {\r\n    height: 100%;\r\n}\r\n\r\n.ag-body-viewport {\r\n    overflow: auto;\r\n    height: 100%;\r\n}\r\n\r\n.ag-body-container {\r\n    position: relative;\r\n}\r\n\r\n.ag-row {\r\n    white-space: nowrap;\r\n    position: absolute;\r\n}\r\n\r\n.ag-row-odd {\r\n}\r\n\r\n.ag-row-even {\r\n}\r\n\r\n.ag-row-selected {\r\n}\r\n\r\n.agile-gird-row:hover {\r\n    background-color: aliceblue;\r\n}\r\n\r\n.ag-cell {\r\n    display: inline-block;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n    box-sizing: border-box;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    padding: 4px;\r\n}\r\n\r\n\r\n.ag-standard .ag-root {\r\n    border: 1px solid black;\r\n}\r\n\r\n.ag-standard .ag-cell {\r\n    border-right: 1px solid grey;\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-standard .ag-header {\r\n    background: #C0C0C0;\r\n    border-bottom: 1px solid black;\r\n}\r\n\r\n.ag-standard .ag-header-cell {\r\n    border-right: 1px solid black;\r\n}\r\n\r\n.ag-standard .ag-row-selected {\r\n    background-color: #b0b0b0;\r\n}\r\n\r\n\r\n.ag-fresh .ag-root {\r\n    border: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header {\r\n    background: -webkit-linear-gradient(white, lightgrey); /* For Safari 5.1 to 6.0 */\r\n    background: -o-linear-gradient(white, lightgrey); /* For Opera 11.1 to 12.0 */\r\n    background: -moz-linear-gradient(white, lightgrey); /* For Firefox 3.6 to 15 */\r\n    background: linear-gradient(white, lightgrey); /* Standard syntax */\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-row-odd {\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-fresh .ag-row-even {\r\n    background-color: white;\r\n}\r\n\r\n.ag-fresh .ag-body {\r\n    background-color: #ffffff;\r\n}\r\n\r\n.ag-fresh .ag-row-selected {\r\n    background-color: #b0b0b0;\r\n}\r\n\r\n\r\n.ag-dark .ag-root {\r\n    border: 1px solid grey;\r\n    color: #e0e0e0;\r\n}\r\n\r\n.ag-dark .ag-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header {\r\n    background-color: #430000;\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-row-odd {\r\n    background-color: #302E2E;\r\n}\r\n\r\n.ag-dark .ag-row-even {\r\n    background-color: #403E3E;\r\n}\r\n\r\n.ag-dark .ag-body {\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-dark .ag-row-selected {\r\n    background-color: #000000;\r\n}\r\n\r\n.ag-large .ag-root {\r\n    font-size: 20px;\r\n}\r\n');
    //Register in the values from the outer closure for common dependencies
    //as local almond modules
    define('angular', function () {
        return angular;
    });

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    var result = require('../src/angularGrid');
    return result;
}));