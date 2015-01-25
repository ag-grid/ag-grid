// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com

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
/**
* @license RequireJS text 2.0.12 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
* Available via the MIT or new BSD license.
* see: http://github.com/requirejs/text for details
    */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
 define, window, process, Packages,
 java, location, Components, FileUtils */

define('text',['module'], function (module) {
    

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.12',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                    name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                    text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                        parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                    "define(function () { return '" +
                    content +
                    "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
            //Use a '.js' file name so that it indicates it is a
            //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
        typeof process !== "undefined" &&
        process.versions &&
        !!process.versions.node &&
        !process.versions['node-webkit'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
        text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
        typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
        typeof Components !== 'undefined' && Components.classes &&
        Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                    .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                    .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                    Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});

define('text!../src/angularGrid.html',[],function () { return '<div class=\'ag-root\'>\r\n    <!-- header -->\r\n    <div class=\'ag-header\'>\r\n        <div class=\'ag-pinned-header\'></div><div class=\'ag-header-viewport\'><div class=\'ag-header-container\'></div></div>\r\n    </div>\r\n    <!-- body -->\r\n    <div class=\'ag-body\'>\r\n        <div class=\'ag-pinned-cols-viewport\'>\r\n            <div class=\'ag-pinned-cols-container\'></div>\r\n        </div>\r\n        <div class=\'ag-body-viewport-wrapper\'>\r\n            <div class=\'ag-body-viewport\'>\r\n                <div class=\'ag-body-container\'></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>';});

/** Singleton util class, with jquery and underscore like features. */
define('../src/utils',[], function() {

    

    function Utils() {
    }

    //Returns true if it is a DOM node
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.prototype.isNode = function(o) {
        return (
            typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
    };

    //Returns true if it is a DOM element
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.prototype.isElement = function(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    };

    //adds all type of change listeners to an element, intended to be a text field
    Utils.prototype.addChangeListener = function(element, listener) {
        element.addEventListener("changed", listener);
        element.addEventListener("paste", listener);
        element.addEventListener("input", listener);
    };

    //if value is undefined, null or blank, returns null, othrewise returns the value
    Utils.prototype.makeNull = function(value) {
        if (value===null || value===undefined || value==="") {
            return null;
        } else {
            return value;
        }
    };

    Utils.prototype.uniqueValues = function(list, key) {
        var uniqueCheck = {};
        var result = [];
        for(var i = 0, l = list.length; i < l; i++){
            var value = list[i][key];
            if (value==="" || value===undefined) {
                value = null;
            }
            if(!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }
        return result;
    };

    Utils.prototype.removeAllChildren = function(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    };

    //adds an element to a div, but also adds a background checking for clicks,
    //so that when the background is clicked, the child is removed again, giving
    //a model look to popups.
    Utils.prototype.addAsModalPopup = function(eParent, eChild) {
        var eBackdrop = document.createElement("div");
        eBackdrop.className = "ag-popup-backdrop";

        eBackdrop.onclick = function() {
            eParent.removeChild(eChild);
            eParent.removeChild(eBackdrop);
        };

        eParent.appendChild(eBackdrop);
        eParent.appendChild(eChild);
    };

    //loads the template and returns it as an element. makes up for no simple way in
    //the dom api to load html directly, eg we cannot do this: document.createElement(template)
    Utils.prototype.loadTemplate = function(template) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        return tempDiv.firstChild;
    };

    //if passed '42px' then returns the number 42
    Utils.prototype.pixelStringToNumber = function(val) {
        if (typeof val === "string") {
            if (val.indexOf("px")>=0) {
                val.replace("px","");
            }
            return parseInt(val);
        } else {
            return val;
        }
    };

    Utils.prototype.addCssClass = function(element, className) {
        var oldClasses = element.className;
        if (oldClasses.indexOf(className)>=0) {
            return;
        }
        element.className = oldClasses + " " + className;;
    };

    Utils.prototype.removeCssClass = function(element, className) {
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
    };

    Utils.prototype.removeFromArray = function(array, object) {
        array.splice(array.indexOf(object), 1);
    };

    Utils.prototype.defaultComparator = function(valueA, valueB) {
        var valueAMissing = valueA===null || valueA===undefined;
        var valueBMissing = valueB===null || valueB===undefined;
        if (valueAMissing && valueBMissing) {return 0;}
        if (valueAMissing) {return -1;}
        if (valueBMissing) {return 1;}

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    };

    Utils.prototype.formatWidth = function(width) {
        if (typeof width === "number") {
            return width + "px";
        } else {
            return width;
        }
    };

    return new Utils();

});

define('text!../src/filter.html',[],function () { return '<div class="ag-filter">\r\n    <div class="ag-filter-header-container">\r\n        <input class="ag-filter-filter" type="text" placeholder="search..."/>\r\n    </div>\r\n    <div class="ag-filter-header-container">\r\n        <label>\r\n            <input id="selectAll" type="checkbox"/>\r\n            (Select All)\r\n        </label>\r\n    </div>\r\n    <div class="ag-filter-list-viewport">\r\n        <div class="ag-filter-list-container">\r\n            <div id="itemForRepeat" class="ag-filter-item">\r\n                <label>\r\n                    <input type="checkbox" class="ag-filter-checkbox"/>\r\n                    <span class="ag-filter-value"></span>\r\n                </label>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n';});

define('../src/filterComponent',[
    "./utils",
    "text!./filter.html",
], function(utils, template) {

    var DEFAULT_ROW_HEIGHT = 20;

    function Filter(model, grid, colDef) {
        this.rowHeiht = colDef.filterCellHeight ? colDef.filterCellHeight : DEFAULT_ROW_HEIGHT;
        this.model = model;
        this.grid = grid;
        this.rowsInBodyContainer = {};
        this.colDef = colDef;
        this.createGui();
        this.addScrollListener();
    }

    Filter.prototype.getGui = function () {
        return this.eGui;
    };

    Filter.prototype.createGui = function () {
        var _this = this;

        this.eGui = utils.loadTemplate(template);

        this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
        this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
        this.eSelectAll = this.eGui.querySelector("#selectAll");
        this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
        this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
        this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeiht) + "px";

        this.setContainerHeight();
        this.eMiniFilter.value = this.model.getMiniFilter();
        utils.addChangeListener(this.eMiniFilter, function() {_this.onFilterChanged();} );
        utils.removeAllChildren(this.eListContainer);

        this.eSelectAll.onclick = function () { _this.onSelectAll();}

        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        } else if (this.model.isNothingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        } else {
            this.eSelectAll.indeterminate = true;
        }
    };

    Filter.prototype.setContainerHeight = function() {
        this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeiht) + "px";
    };

    Filter.prototype.drawVirtualRows = function () {
        var topPixel = this.eListViewport.scrollTop;
        var bottomPixel = topPixel + this.eListViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / this.rowHeiht);
        var lastRow = Math.floor(bottomPixel / this.rowHeiht);

        this.ensureRowsRendered(firstRow, lastRow);
    };

    Filter.prototype.ensureRowsRendered = function (start, finish) {
        var _this = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);

        //add in new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            if (this.model.getDisplayedValueCount() > rowIndex) {
                var value = this.model.getDisplayedValue(rowIndex);
                _this.insertRow(value, rowIndex);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    };

    //takes array of row id's
    Filter.prototype.removeVirtualRows = function(rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function(indexToRemove) {
            var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eListContainer.removeChild(eRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };

    Filter.prototype.insertRow = function(value, rowIndex) {
        var _this = this;

        var eFilterValue = this.eFilterValueTemplate.cloneNode(true);

        var valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (this.colDef.filterCellRenderer) {
            //renderer provided, so use it
            var resultFromRenderer = this.colDef.filterCellRenderer(value);

            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                valueElement.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                valueElement.innerHTML = resultFromRenderer;
            }

        } else {
            //otherwise display as a string
            var displayNameOfValue = value === null ? "(Blanks)" : value;
            valueElement.innerText = displayNameOfValue;
        }
        var eCheckbox = eFilterValue.querySelector("input");
        eCheckbox.checked = this.model.isValueSelected(value);

        eCheckbox.onclick = function () { _this.onCheckboxClicked(eCheckbox, value); }

        eFilterValue.style.top = (this.rowHeiht * rowIndex) + "px";

        this.eListContainer.appendChild(eFilterValue);
        this.rowsInBodyContainer[rowIndex] = eFilterValue;
    };

    Filter.prototype.onCheckboxClicked = function(eCheckbox, value) {
        var checked = eCheckbox.checked;
        if (checked) {
            this.model.selectValue(value);
            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        } else {
            this.model.unselectValue(value);
            //if set is empty, nothing is selected
            if (this.model.isNothingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        }

        this.grid.onFilterChanged();
    };

    Filter.prototype.onFilterChanged = function() {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.setContainerHeight();
            this.clearVirtualRows();
            this.drawVirtualRows();
        }
    };

    Filter.prototype.clearVirtualRows = function() {
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);
    };

    Filter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        } else {
            this.model.selectNothing();
        }
        this.updateAllCheckboxes(checked);
        this.grid.onFilterChanged();
    };

    Filter.prototype.updateAllCheckboxes = function(checked) {
        var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll(".ag-filter-checkbox");
        for (var i = 0, l = currentlyDisplayedCheckboxes.length; i<l; i++) {
            currentlyDisplayedCheckboxes[i].checked = checked;
        }
    }

    Filter.prototype.addScrollListener = function() {
        var _this = this;

        this.eListViewport.addEventListener("scroll", function() {
            _this.drawVirtualRows();
        });
    };

    //we need to have the gui attached before we can draw the virtual rows, as the
    //virtual row logic needs info about the gui state
    Filter.prototype.guiAttached = function() {
        this.drawVirtualRows();
    };

    return function(model, grid, colDef) {
        return new Filter(model, grid, colDef);
    };

});
define('../src/filterModel',["./utils"], function(utils) {

    

    function FilterModel(uniqueValues) {
        this.uniqueValues = uniqueValues;
        this.displayedValues = uniqueValues;
        this.miniFilter = null;
        //we use a map rather than an array for the selected values as the lookup
        //for a map is much faster than the lookup for an array, especially when
        //the length of the array is thousands of records long
        this.selectedValuesMap = {};
        this.selectEverything();
    }

    //sets mini filter. returns true if it changed from last value, otherwise false
    FilterModel.prototype.setMiniFilter = function(newMiniFilter) {
        newMiniFilter = utils.makeNull(newMiniFilter);
        if (this.miniFilter===newMiniFilter) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilter = newMiniFilter;
        this.filterDisplayedValues();
        return true;
    };

    FilterModel.prototype.getMiniFilter = function() {
        return this.miniFilter;
    };

    FilterModel.prototype.filterDisplayedValues = function() {
        //if no filter, just use the unique values
        if (this.miniFilter===null) {
            this.displayedValues = this.uniqueValues;
            return;
        }

        //if filter present, we filter down the list
        this.displayedValues = [];
        var miniFilterUpperCase = this.miniFilter.toUpperCase();
        for (var i = 0, l = this.uniqueValues.length; i<l; i++) {
            var uniqueValue = this.uniqueValues[i];
            if (uniqueValue!==null && uniqueValue.toString().toUpperCase().indexOf(miniFilterUpperCase)>=0) {
                this.displayedValues.push(uniqueValue);
            }
        }

    };

    FilterModel.prototype.getDisplayedValueCount = function() {
        return this.displayedValues.length;
    };

    FilterModel.prototype.getDisplayedValue = function(index) {
        return this.displayedValues[index];
    };

    FilterModel.prototype.doesFilterPass = function(value) {
        //if no filter, always pass
        if (this.isEverythingSelected()) { return true; }
        //if nothing selected in filter, always fail
        if (this.isNothingSelected()) { return false; }

        value = utils.makeNull(value);
        var filterPassed = this.selectedValuesMap[value]!==undefined;
        return filterPassed;
    };

    FilterModel.prototype.selectEverything = function() {
        var count = this.uniqueValues.length;
        for (var i = 0; i<count; i++) {
            var value = this.uniqueValues[i];
            this.selectedValuesMap[value] = null;
        }
        this.selectedValuesCount = count;
    };

    FilterModel.prototype.isFilterActive = function() {
        return this.uniqueValues.length!==this.selectedValuesCount;
    };

    FilterModel.prototype.selectNothing = function() {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    };

    FilterModel.prototype.getUniqueValueCount = function() {
        return this.uniqueValues.length;
    };

    FilterModel.prototype.unselectValue = function(value) {
        if (this.selectedValuesMap[value]!==undefined) {
            delete this.selectedValuesMap[value];
            this.selectedValuesCount--;
        }
    };

    FilterModel.prototype.selectValue = function(value) {
        if (this.selectedValuesMap[value]===undefined) {
            this.selectedValuesMap[value] = null;
            this.selectedValuesCount++;
        }
    };

    FilterModel.prototype.isValueSelected = function(value) {
        return this.selectedValuesMap[value] !== undefined;
    };

    FilterModel.prototype.isEverythingSelected = function() {
        return this.uniqueValues.length === this.selectedValuesCount;
    };

    FilterModel.prototype.isNothingSelected = function() {
        return this.uniqueValues.length === 0;
    };

    return function(uniqueValues) {
        return new FilterModel(uniqueValues);
    };

});
define('../src/filterManager',[
    "./utils",
    "./filterComponent",
    "./filterModel"
], function(utils, filterComponentFactory, filterModelFactory) {

    function FilterManager(grid, rowModel) {
        this.grid = grid;
        this.rowModel = rowModel;
        this.colModels = {};
    }

    FilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.colModels).length > 0;
    };

    FilterManager.prototype.isFilterPresentForCol = function (key) {
        var model =  this.colModels[key];
        var filterPresent = model!==undefined && model.isFilterActive();
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.colModels);
        for (var i = 0, l = fields.length; i < l; i++) {

            var field = fields[i];
            var model = this.colModels[field];

            //if no filter, always pass
            if (model===undefined) {
                continue;
            }

            var value = item[field];
            if (!model.doesFilterPass(value)) {
                return false;
            }

        }
        //all filters passed
        return true;
    };

    FilterManager.prototype.clearAllFilters = function() {
        this.colModels = {};
    };

    FilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = ePopupRoot.getBoundingClientRect();

        var x = sourceRect.left - parentRect.left;
        var y = sourceRect.top - parentRect.top + sourceRect.height;

        //if popup is overflowing to the right, move it left
        var widthOfPopup = 200; //this is set in the css
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX =  widthOfParent - widthOfPopup - 20; //20 pixels grace
        if (x > maxX) { //move position left, back into view
            x = maxX;
        }
        if (x < 0) { //in case the popup has a negative value
            x = 0;
        }

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDef, eventSource) {

        var model = this.colModels[colDef.field];
        if (!model) {
            var rowData = this.rowModel.getAllRows();
            var uniqueValues = utils.uniqueValues(rowData, colDef.field);
            if (colDef.comparator) {
                uniqueValues.sort(colDef.comparator);
            } else {
                uniqueValues.sort(utils.defaultComparator);
            }
            model = filterModelFactory(uniqueValues);
            this.colModels[colDef.field] = model;
        }

        var ePopupParent = this.grid.getPopupParent();
        var filterComponent = filterComponentFactory(model, this.grid, colDef);
        var eFilterGui = filterComponent.getGui();

        this.positionPopup(eventSource, eFilterGui, ePopupParent);

        utils.addAsModalPopup(ePopupParent, eFilterGui);

        filterComponent.guiAttached();
    };

    return FilterManager;

});

define('../src/rowModel',[], function() {

    // pipeline is: group -> filter -> sort -> map
    function RowModel() {
        this.allRows = null;
        this.rowsAfterGroup = null;
        this.rowsAfterFilter = null;
        this.rowsAfterSort = null;
        this.rowsAfterMap = null;
    }

    RowModel.prototype.getAllRows = function() { return this.allRows; };
    RowModel.prototype.setAllRows = function(allRows) { this.allRows = allRows; };

    RowModel.prototype.getRowsAfterGroup = function() { return this.rowsAfterGroup; };
    RowModel.prototype.setRowsAfterGroup = function(rowsAfterGroup) { this.rowsAfterGroup = rowsAfterGroup; };

    RowModel.prototype.getRowsAfterFilter = function() { return this.rowsAfterFilter; };
    RowModel.prototype.setRowsAfterFilter = function(rowsAfterFilter) { this.rowsAfterFilter = rowsAfterFilter; };

    RowModel.prototype.getRowsAfterSort = function() { return this.rowsAfterSort; };
    RowModel.prototype.setRowsAfterSort = function(rowsAfterSort) { this.rowsAfterSort = rowsAfterSort; };

    RowModel.prototype.getRowsAfterMap = function() { return this.rowsAfterMap; };
    RowModel.prototype.setRowsAfterMap = function(rowsAfterMap) { this.rowsAfterMap = rowsAfterMap; };

    return RowModel;

});
define('../src/groupCreator',[
],function() {

    function GroupCreator() {
    }

    GroupCreator.prototype.group = function(rowData, groupByFields, aggFunction, expandByDefault) {

        var topMostGroup = {
            level: -1,
            children: [],
            childrenMap: {}
        };

        var allGroups = [];
        allGroups.push(topMostGroup);

        var levelToInsertChild = groupByFields.length - 1;
        var i, currentLevel, item, currentGroup, groupByField, groupKey, nextGroup;

        for (i = 0; i<rowData.length; i++) {
            item = rowData[i];

            for (currentLevel = 0; currentLevel<groupByFields.length; currentLevel++) {
                groupByField = groupByFields[currentLevel];
                groupKey = item[groupByField];

                if (currentLevel==0) {
                    currentGroup = topMostGroup;
                }

                //if group doesn't exist yet, create it
                nextGroup = currentGroup.childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = {
                        _angularGrid_group: true,
                        field: groupByField,
                        key: groupKey,
                        expanded: expandByDefault,
                        children: [],
                        allChildrenCount: 0,
                        level: currentGroup.level + 1,
                        childrenMap: {}//this is a temporary map, we remove at the end of this method
                    };
                    currentGroup.childrenMap[groupKey] = nextGroup;
                    currentGroup.children.push(nextGroup);
                    allGroups.push(nextGroup);
                }

                nextGroup.allChildrenCount++;

                if (currentLevel==levelToInsertChild) {
                    nextGroup.children.push(item);
                } else {
                    currentGroup = nextGroup;
                }
            }

        }

        //remove the temporary map
        for (i = 0; i<allGroups.length; i++) {
            delete allGroups[i].childrenMap;
        }

        //create data items
        if (aggFunction) {
            this.createAggData(topMostGroup.children, aggFunction);
        }

        return topMostGroup.children;
    };

    GroupCreator.prototype.createAggData = function(children, aggFunction) {
        for (var i = 0, l = children.length; i<l; i++) {
            var item = children[i];
            var itemIsAGroup = item._angularGrid_group;
            if (itemIsAGroup) {
                //agg function needs to start at the bottom, so traverse first
                this.createAggData(item.children, aggFunction);
                //after traversal, we can now do the agg at this level
                var data = aggFunction(item.children);
                item.aggData = data;
            }
        }
    };

    return new GroupCreator();

});
define('../src/constants',[], function() {
    var constants = {};

    constants.STEP_EVERYTHING = 0;
    constants.STEP_FILTER = 1;
    constants.STEP_SORT = 2;
    constants.STEP_MAP = 3;

    constants.ASC = "asc";
    constants.DESC = "desc";

    constants.ROW_BUFFER_SIZE = 5;

    constants.SORT_STYLE_SHOW = "display:inline;";
    constants.SORT_STYLE_HIDE = "display:none;";

    constants.MIN_COL_WIDTH = 10;

    return constants;
});
define('../src/rowController',[
    "./groupCreator",
    "./utils",
    "./constants"
], function(groupCreator, utils, constants) {

    function RowController(gridOptionsWrapper, rowModel, angularGrid, filterManager) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.rowModel = rowModel;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
    }

    RowController.prototype.updateModel = function(step) {

        //fallthrough in below switch is on purpose
        switch (step) {
            case constants.STEP_EVERYTHING :
                this.doGrouping();
            case constants.STEP_FILTER :
                this.doFilter();
            case constants.STEP_SORT :
                this.doSort();
            case constants.STEP_MAP :
                this.doGroupMapping();
        }

    };

    RowController.prototype.doSort = function () {
        //see if there is a col we are sorting by
        var colDefForSorting = null;
        this.gridOptionsWrapper.getColumnDefs().forEach(function (colDef) {
            if (colDef.sort) {
                colDefForSorting = colDef;
            }
        });

        var rowsAfterSort = this.rowModel.getRowsAfterFilter().slice(0);

        if (colDefForSorting) {
            var keyForSort = colDefForSorting.field;
            var ascending = colDefForSorting.sort === constants.ASC;
            var inverter = ascending ? 1 : -1;

            this.sortList(rowsAfterSort, keyForSort, colDefForSorting, inverter);
        } else {
            //if no sorting, set all group children after sort to the original list
            this.resetSortInGroups(rowsAfterSort);
        }

        this.rowModel.setRowsAfterSort(rowsAfterSort);
    };

    RowController.prototype.resetSortInGroups = function(items) {
        for (var i = 0, l = items.length; i<l; i++) {
            var item = items[i];
            var rowIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup) {
                item.childrenAfterSort = item.children;
                this.resetSortInGroups(item.children);
            }
        }
    };

    RowController.prototype.sortList = function (listForSorting, keyForSort, colDefForSorting, inverter) {

        //sort any groups recursively
        for (var i = 0, l = listForSorting.length; i<l; i++) {
            var item = listForSorting[i];
            var rowIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup) {
                item.childrenAfterSort = item.children.slice(0);
                this.sortList(item.childrenAfterSort, keyForSort, colDefForSorting, inverter);
            }
        }

        listForSorting.sort(function (objA, objB) {
            var valueA = objA[keyForSort];
            var valueB = objB[keyForSort];

            if (colDefForSorting.comparator) {
                //if comparator provided, use it
                return colDefForSorting.comparator(valueA, valueB) * inverter;
            } else {
                //otherwise do our own comparison
                return utils.defaultComparator(valueA, valueB) * inverter;
            }

        });
    };

    RowController.prototype.doGrouping = function () {
        var rowsAfterGroup;
        if (this.gridOptionsWrapper.getGroupKeys()) {
            var expandByDefault = this.gridOptionsWrapper.isGroupDefaultExpanded();
            rowsAfterGroup = groupCreator.group(this.rowModel.getAllRows(), this.gridOptionsWrapper.getGroupKeys(),
                this.gridOptionsWrapper.getAggFunction(), expandByDefault);
        } else {
            rowsAfterGroup = this.rowModel.getAllRows();
        }
        this.rowModel.setRowsAfterGroup(rowsAfterGroup);
    };

    RowController.prototype.doFilter = function () {
        var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
        var advancedFilterPresent = this.filterManager.isFilterPresent();
        var filterPresent = quickFilterPresent || advancedFilterPresent;

        var rowsAfterFilter;
        if (filterPresent) {
            rowsAfterFilter = this.filterItems(this.rowModel.getRowsAfterGroup(), quickFilterPresent, advancedFilterPresent);
        } else {
            rowsAfterFilter = this.rowModel.getRowsAfterGroup();
        }
        this.rowModel.setRowsAfterFilter(rowsAfterFilter);
    };

    RowController.prototype.filterItems = function (items, quickFilterPresent, advancedFilterPresent) {
        var result = [];

        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];

            var itemIsAGroup = item._angularGrid_group;
            if (itemIsAGroup) {
                //deal with group
                var filteredChildren = this.filterItems(item.children, quickFilterPresent, advancedFilterPresent);
                if (filteredChildren.length>0) {
                    var allChildrenCount = this.getTotalChildCount(filteredChildren);
                    var newGroup = this.copyGroup(item, filteredChildren, allChildrenCount);
                    result.push(newGroup);
                }
            } else {
                if (this.doesRowPassFilter(item, quickFilterPresent, advancedFilterPresent)) {
                    result.push(item);
                }
            }
        }

        return result;
    };

    RowController.prototype.getTotalChildCount = function(items) {
        var count = 0;
        for (var i = 0, l = items.length; i<l; i++) {
            var item = items[i];
            var itemIsAGroup = item._angularGrid_group;
            if (itemIsAGroup) {
                count += item.allChildrenCount;
            } else {
                count++;
            }
        }
        return count;
    };

    RowController.prototype.copyGroup = function (group, children, allChildrenCount) {
        return {
            _angularGrid_group: true,
            field: group.field,
            key: group.key,
            expanded: group.expanded,
            children: children,
            allChildrenCount: allChildrenCount,
            level: group.level
        };
    };

    RowController.prototype.doGroupMapping = function () {
        var rowsAfterMap;
        if (this.gridOptionsWrapper.getGroupKeys()) {
            rowsAfterMap = [];
            this.addToMap(rowsAfterMap, this.rowModel.getRowsAfterSort());
        } else {
            rowsAfterMap = this.rowModel.getRowsAfterSort();
        }
        this.rowModel.setRowsAfterMap(rowsAfterMap);
    };

    RowController.prototype.addToMap = function (mappedData, originalList) {
        for (var i = 0; i<originalList.length; i++) {
            var data = originalList[i];
            mappedData.push(data);
            var rowIsAGroup = data._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup && data.expanded) {
                this.addToMap(mappedData, data.childrenAfterSort);
            }
        }
    };

    RowController.prototype.doesRowPassFilter = function(item, quickFilterPresent, advancedFilterPresent) {
        //first up, check quick filter
        if (quickFilterPresent) {
            if (!item._quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(item);
            }
            if (item._quickFilterAggregateText.indexOf(this.angularGrid.getQuickFilter()) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }

        //second, check advanced filter
        if (advancedFilterPresent) {
            if (!this.filterManager.doesFilterPass(item)) {
                return false;
            }
        }

        //got this far, all filters pass
        return true;
    };

    RowController.prototype.aggregateRowForQuickFilter = function (rowItem) {
        var aggregatedText = "";
        this.gridOptionsWrapper.getColumnDefs().forEach(function (colDef) {
            var value = rowItem[colDef.field];
            if (value && value !== "") {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        rowItem._quickFilterAggregateText = aggregatedText;
    };

    return RowController;
});
define('../src/svgFactory',["./constants"], function(constants) {

    var SVG_NS = "http://www.w3.org/2000/svg";

    function SvgFactory() {
    }

    SvgFactory.prototype.createFilterSvg = function() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");

        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    };

    SvgFactory.prototype.createMenuSvg = function() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        var size = "12"
        eSvg.setAttribute("width", size);
        eSvg.setAttribute("height", size);

        ["0","5","10"].forEach(function(y) {
            var eLine = document.createElementNS(SVG_NS, "rect");
            eLine.setAttribute("y", y);
            eLine.setAttribute("width", size);
            eLine.setAttribute("height", "2");
            eLine.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eLine);
        });

        return eSvg;
    };

    SvgFactory.prototype.createSortArrowSvg  = function(colIndex) {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        eSvg.setAttribute("class", "ag-header-cell-sort");

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,10 5,0 10,10");
        eDescIcon.setAttribute("style", constants.SORT_STYLE_HIDE);
        eDescIcon.setAttribute("class", "ag-header-icon ag-header-cell-sort-desc-"+colIndex);
        eSvg.appendChild(eDescIcon);

        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", "0,0 10,0 5,10");
        eAscIcon.setAttribute("style", constants.SORT_STYLE_HIDE);
        eAscIcon.setAttribute("class", "ag-header-icon ag-header-cell-sort-asc-"+colIndex);
        eSvg.appendChild(eAscIcon);

        return eSvg;
    };


    SvgFactory.prototype.createGroupSvg = function(expanded) {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        eSvg.setAttribute("class", "ag-header-cell-sort");

        if (expanded) {
            var eAscIcon = document.createElementNS(SVG_NS, "polygon");
            eAscIcon.setAttribute("points", "0,0 10,0 5,10");
            eSvg.appendChild(eAscIcon);
        } else {
            var eDescIcon = document.createElementNS(SVG_NS, "polygon");
            eDescIcon.setAttribute("points", "0,0 10,5 0,10");
            eSvg.appendChild(eDescIcon);
        }

        return eSvg;
    };

    return SvgFactory;

});
define('../src/rowRenderer',["./constants","./svgFactory","./utils"], function(constants, SvgFactory, utils) {

    var svgFactory = new SvgFactory();

    function RowRenderer(gridOptions, rowModel, gridOptionsWrapper, eGrid, angularGrid, $compile, $scope) {
        this.gridOptions = gridOptions;
        this.rowModel = rowModel;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.findAllElements(eGrid);
        this.$compile = $compile;
        this.$scope = $scope;

        //done once
        //for virtualisation, maps keep track of which elements are attached to the dom
        this.rowsInBodyContainer = {};
        this.rowsInPinnedContainer = {};
        this.childScopesForRows = {};
    }

    RowRenderer.prototype.setMainRowWidths = function() {
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth() + "px";

        var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
        for (var i = 0; i<unpinnedRows.length; i++) {
            unpinnedRows[i].style.width = mainRowWidth;
        }
    };

    RowRenderer.prototype.findAllElements = function (eGrid) {
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
    };

    RowRenderer.prototype.refreshView = function() {
        var rowCount = this.rowModel.getRowsAfterMap().length;
        var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
        this.eBodyContainer.style.height = containerHeight + "px";
        this.ePinnedColsContainer.style.height = containerHeight + "px";

        this.refreshAllVirtualRows();
    };

    RowRenderer.prototype.refreshAllVirtualRows = function () {
        //remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);

        //add in new rows
        this.drawVirtualRows();
    };

    //takes array of row id's
    RowRenderer.prototype.removeVirtualRows = function (rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var pinnedRowToRemove = _this.rowsInPinnedContainer[indexToRemove];
            _this.ePinnedColsContainer.removeChild(pinnedRowToRemove);
            delete _this.rowsInPinnedContainer[indexToRemove];

            var bodyRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eBodyContainer.removeChild(bodyRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];

            var childScopeToDelete = _this.childScopesForRows[indexToRemove];
            if (childScopeToDelete) {
                childScopeToDelete.$destroy();
                delete _this.childScopesForRows[indexToRemove];
            }
        });
    };

    RowRenderer.prototype.drawVirtualRows = function() {
        var topPixel = this.eBodyViewport.scrollTop;
        var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / this.gridOptionsWrapper.getRowHeight());
        var lastRow = Math.floor(bottomPixel / this.gridOptionsWrapper.getRowHeight());

        //add in buffer
        firstRow = firstRow - constants.ROW_BUFFER_SIZE;
        lastRow = lastRow + constants.ROW_BUFFER_SIZE;

        this.ensureRowsRendered(firstRow, lastRow);
    };

    RowRenderer.prototype.ensureRowsRendered = function (start, finish) {
        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth();
        var _this = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);

        //add in new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            var data = this.rowModel.getRowsAfterMap()[rowIndex];
            if (data) {
                _this.insertRow(data, rowIndex, mainRowWidth, pinnedColumnCount);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);

        //if we are doing angular compiling, then do it here if not in digest
        //this.$scope.$$phase || this.$scope.$apply();
        //if(this.gridOptions.angularCompile && !this.$scope.$$phase) {
        //    this.$scope.$apply();
        //}
    };

    RowRenderer.prototype.insertRow = function(data, rowIndex, mainRowWidth, pinnedColumnCount) {
        //if no cols, don't draw row
        if (!this.gridOptionsWrapper.isColumDefsPresent()) { return; }

        var rowIsAGroup = data._angularGrid_group; //_angularGrid_group is set to true on groups

        var ePinnedRow = this.createRowContainer(rowIndex, data, rowIsAGroup);
        var eMainRow = this.createRowContainer(rowIndex, data, rowIsAGroup);
        var _this = this;

        this.rowsInBodyContainer[rowIndex] = eMainRow;
        this.rowsInPinnedContainer[rowIndex] = ePinnedRow;

        eMainRow.style.width = mainRowWidth+"px";

        //try compiling as we insert rows
        var newChildScope = null;
        if (this.gridOptionsWrapper.isAngularCompile()) {
            newChildScope = this.$scope.$new();
            this.childScopesForRows[rowIndex] = newChildScope;
            newChildScope.rowData = data;
        }

        //if group item, insert the first row
        var columnDefs = this.gridOptionsWrapper.getColumnDefs();
        if (rowIsAGroup) {
            var firstCol = columnDefs[0];
            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();

            var eGroupRow = _this.createGroupElement(data, firstCol, groupHeaderTakesEntireRow);
            if (pinnedColumnCount>0) {
                ePinnedRow.appendChild(eGroupRow);
            } else {
                eMainRow.appendChild(eGroupRow);
            }

            if (!groupHeaderTakesEntireRow) {

                //draw in blank cells for the rest of the row
                var groupHasData = data.aggData!==undefined && data.aggData!==null;
                columnDefs.forEach(function(colDef, colIndex) {
                    if (colIndex==0) { //skip first col, as this is the group col we already inserted
                        return;
                    }
                    var item = null;
                    if (groupHasData) {
                        item = data.aggData[colDef.field];
                    }
                    _this.createCellFromColDef(colDef, item, data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, newChildScope);
                });
            }

        } else {
            columnDefs.forEach(function(colDef, colIndex) {
                _this.createCellFromColDef(colDef, data[colDef.field], data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, newChildScope);
            });
        }

        //try compiling as we insert rows
        if (this.gridOptionsWrapper.isAngularCompile()) {
            var ePinnedRowCompiled = this.$compile(ePinnedRow)(newChildScope);
            var eMainRowCompiled = this.$compile(eMainRow)(newChildScope);
            this.ePinnedColsContainer.appendChild(ePinnedRowCompiled[0]);
            this.eBodyContainer.appendChild(eMainRowCompiled[0]);
        } else {
            this.ePinnedColsContainer.appendChild(ePinnedRow);
            this.eBodyContainer.appendChild(eMainRow);
        }

    };

    RowRenderer.prototype.createCellFromColDef = function(colDef, value, data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, $childScope) {
        var eGridCell = this.createCell(colDef, value, data, rowIndex, colIndex, $childScope);

        if (colIndex>=pinnedColumnCount) {
            eMainRow.appendChild(eGridCell);
        } else {
            ePinnedRow.appendChild(eGridCell);
        }
    };

    RowRenderer.prototype.createRowContainer = function(rowIndex, row, groupRow) {
        var eRow = document.createElement("div");
        var classesList = ["ag-row"];
        classesList.push(rowIndex%2==0 ? "ag-row-even" : "ag-row-odd");
        if (this.gridOptions.selectedRows.indexOf(row)>=0) {
            classesList.push("ag-row-selected");
        }
        var classes = classesList.join(" ");

        eRow.className = classes;

        eRow.setAttribute("row", rowIndex);

        eRow.style.top = (this.gridOptionsWrapper.getRowHeight() * rowIndex) + "px";
        eRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";

        if (!groupRow) {
            var _this = this;
            eRow.addEventListener("click", function(event) {
                _this.angularGrid.onRowClicked(event, Number(this.getAttribute("row")))
            });
        }

        return eRow;
    };

    RowRenderer.prototype.createGroupElement = function(data, firstColDef, useEntireRow) {
        var eGridGroupRow = document.createElement("div");
        if (useEntireRow) {
            eGridGroupRow.className = "ag-group-row";
        } else {
            eGridGroupRow.className = "ag-cell cell-col-"+0;
        }

        var eSvg = svgFactory.createGroupSvg(data.expanded);
        eGridGroupRow.appendChild(eSvg);

        //if renderer provided, use it
        if (this.gridOptions.groupInnerCellRenderer) {
            var resultFromRenderer = this.gridOptions.groupInnerCellRenderer(data);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eGridGroupRow.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement("span");
                eTextSpan.innerHTML = resultFromRenderer;
                eGridGroupRow.appendChild(eTextSpan);
            }
            //otherwise default is display the key along with the child count
        } else {
            var eText = document.createTextNode(" " + data.key + " (" + data.allChildrenCount + ")");
            eGridGroupRow.appendChild(eText);
        }

        if (!useEntireRow) {
            eGridGroupRow.style.width = utils.formatWidth(firstColDef.actualWidth);
        }
        eGridGroupRow.style.paddingLeft = ((data.level + 1) * 10) + "px";

        var _this = this;
        eGridGroupRow.addEventListener("click", function(event) {
            data.expanded = !data.expanded;
            _this.angularGrid.updateModelAndRefresh(constants.STEP_MAP);
        });

        return eGridGroupRow;
    };

    RowRenderer.prototype.createCell = function(colDef, value, data, rowIndex, colIndex, $childScope) {
        var eGridCell = document.createElement("div");
        eGridCell.className = "ag-cell cell-col-"+colIndex;

        if (colDef.cellRenderer) {
            var resultFromRenderer = colDef.cellRenderer(value, data, colDef, $childScope);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eGridCell.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                eGridCell.innerHTML = resultFromRenderer;
            }
        } else {
            //if we insert undefined, then it displays as the string 'undefined', ugly!
            if (value!==undefined) {
                eGridCell.innerText = value;
            }
        }

        if (colDef.cellCss) {
            Object.keys(colDef.cellCss).forEach(function(key) {
                eGridCell.style[key] = colDef.cellCss[key];
            });
        }

        if (colDef.cellCssFunc) {
            var cssObjFromFunc = colDef.cellCssFunc(value);
            if (cssObjFromFunc) {
                Object.keys(cssObjFromFunc).forEach(function(key) {
                    eGridCell.style[key] = cssObjFromFunc[key];
                });
            }
        }

        eGridCell.style.width = utils.formatWidth(colDef.actualWidth);

        return eGridCell;
    };

    return RowRenderer;

});
define('../src/headerRenderer',["./utils", "./svgFactory", "./constants"], function(utils, SvgFactory, constants) {

    var svgFactory = new SvgFactory();

    function HeaderRenderer(gridOptionsWrapper, eGrid, angularGrid, filterManager) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
        this.findAllElements(eGrid);
    }

    HeaderRenderer.prototype.findAllElements = function (eGrid) {
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
        this.eHeader = eGrid.querySelector(".ag-header");
        this.eRoot = eGrid.querySelector(".ag-root");
    };

    HeaderRenderer.prototype.insertHeader = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        utils.removeAllChildren(ePinnedHeader);
        utils.removeAllChildren(eHeaderContainer);
        this.headerFilterIcons = {};

        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var _this = this;

        this.gridOptionsWrapper.getColumnDefs().forEach(function(colDef, index) {
            //only include the first x cols
            if (index<pinnedColumnCount) {
                var headerCell = _this.createHeaderCell(colDef, index, true);
                ePinnedHeader.appendChild(headerCell);
            } else {
                var headerCell = _this.createHeaderCell(colDef, index, false);
                eHeaderContainer.appendChild(headerCell);
            }
        });
    };

    HeaderRenderer.prototype.createHeaderCell = function(colDef, colIndex, colPinned) {
        var headerCell = document.createElement("div");
        var _this = this;

        headerCell.className = "ag-header-cell";

        if (this.gridOptionsWrapper.isEnableColResize()) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            headerCell.appendChild(headerCellResize);
            this.addColResizeHandling(headerCellResize, headerCell, colDef, colIndex, colPinned);
        }

        //filter button
        if (this.gridOptionsWrapper.isEnableFilter()) {
            var eMenuButton = svgFactory.createMenuSvg();
            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            eMenuButton.onclick = function () {
                _this.filterManager.showFilter(colDef, this);
            };
            headerCell.appendChild(eMenuButton);
            headerCell.onmouseenter = function() {
                eMenuButton.style.opacity = 1;
            };
            headerCell.onmouseleave = function() {
                eMenuButton.style.opacity = 0;
            };
            eMenuButton.style.opacity = 0;
            eMenuButton.style["-webkit-transition"] = "opacity 0.5s";
            eMenuButton.style["transition"] = "opacity 0.5s";
        }

        //label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";
        //add in sort icon
        if (this.gridOptionsWrapper.isEnableSorting()) {
            var headerSortIcon = svgFactory.createSortArrowSvg(colIndex);
            headerCellLabel.appendChild(headerSortIcon);
            this.addSortHandling(headerCellLabel, colDef);
        }

        //add in filter icon
        var filterIcon = svgFactory.createFilterSvg();
        this.headerFilterIcons[colDef.field] = filterIcon;
        headerCellLabel.appendChild(filterIcon);

        //add in text label
        var innerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
        if (this.gridOptionsWrapper.getHeaderCellRenderer()) {
            //renderer provided, use it
            var headerCellRenderer = innerCellRenderer(colDef);
            if (utils.isNode(headerCellRenderer) || utils.isElement(headerCellRenderer)) {
                //a dom node or element was returned, so add child
                headerCellLabel.appendChild(headerCellRenderer);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement("span");
                eTextSpan.innerHTML = headerCellRenderer;
                headerCellLabel.appendChild(eTextSpan);
            }
        } else {
            //no renderer, default text render
            var eInnerText = document.createElement("span");
            eInnerText.innerHTML = colDef.displayName;
            headerCellLabel.appendChild(eInnerText);
        }

        headerCell.appendChild(headerCellLabel);
        headerCell.style.width = utils.formatWidth(colDef.actualWidth);

        return headerCell;
    };

    HeaderRenderer.prototype.addSortHandling = function(headerCellLabel, colDef) {
        var _this = this;
        headerCellLabel.addEventListener("click", function() {

            //update sort on current col
            if (colDef.sort === constants.ASC) {
                colDef.sort = constants.DESC;
            } else if (colDef.sort === constants.DESC) {
                colDef.sort = null
            } else {
                colDef.sort = constants.ASC;
            }

            //clear sort on all columns except this one, and update the icons
            _this.gridOptionsWrapper.getColumnDefs().forEach(function(colToClear, colIndex) {
                if (colToClear!==colDef) {
                    colToClear.sort = null;
                }

                //update visibility of icons
                var sortAscending = colToClear.sort===constants.ASC;
                var sortDescending = colToClear.sort===constants.DESC;
                var sortAny = sortAscending || sortDescending;

                var eSortAscending = _this.eHeader.querySelector(".ag-header-cell-sort-asc-" + colIndex);
                eSortAscending.setAttribute("style", sortAscending ? constants.SORT_STYLE_SHOW : constants.SORT_STYLE_HIDE);

                var eSortDescending = _this.eHeader.querySelector(".ag-header-cell-sort-desc-" + colIndex);
                eSortDescending.setAttribute("style", sortDescending ? constants.SORT_STYLE_SHOW : constants.SORT_STYLE_HIDE);

                var eParentSvg = eSortAscending.parentNode;
                eParentSvg.setAttribute("display", sortAny ? "inline" : "none");
            });

            _this.angularGrid.updateModelAndRefresh(constants.STEP_SORT);
        });
    };

    HeaderRenderer.prototype.addColResizeHandling = function(headerCellResize, headerCell, colDef, colIndex, colPinned) {
        var _this = this;
        headerCellResize.onmousedown = function(downEvent) {
            _this.eRoot.style.cursor = "col-resize";
            _this.dragStartX = downEvent.clientX;
            _this.colWidthStart = colDef.actualWidth;

            _this.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - _this.dragStartX;
                var newWidth = _this.colWidthStart + change;
                if (newWidth < constants.MIN_COL_WIDTH) {
                    newWidth = constants.MIN_COL_WIDTH;
                }
                var newWidthPx = newWidth + "px";
                var selectorForAllColsInCell = ".cell-col-"+colIndex;
                var cellsForThisCol = _this.eRoot.querySelectorAll(selectorForAllColsInCell);
                for (var i = 0; i<cellsForThisCol.length; i++) {
                    cellsForThisCol[i].style.width = newWidthPx;
                }

                headerCell.style.width = newWidthPx;
                colDef.actualWidth = newWidth;

                //show not be calling these here, should do something else
                if (colPinned) {
                    _this.angularGrid.updatePinnedColContainerWidthAfterColResize();
                } else {
                    _this.angularGrid.updateBodyContainerWidthAfterColResize();
                }
            };
            _this.eRoot.onmouseup = function() {
                _this.stopDragging();
            };
            _this.eRoot.onmouseleave = function() {
                _this.stopDragging();
            };
        };
    };

    HeaderRenderer.prototype.stopDragging = function() {
        this.eRoot.style.cursor = "";
        this.eRoot.onmouseup = null;
        this.eRoot.onmouseleave = null;
        this.eRoot.onmousemove = null;
    };

    HeaderRenderer.prototype.updateFilterIcons = function() {
        var _this = this;
        this.gridOptionsWrapper.getColumnDefs().forEach(function(colDef) {
            var filterPresent = _this.filterManager.isFilterPresentForCol(colDef.field);
            var displayStyle = filterPresent ? "inline" : "none";
            _this.headerFilterIcons[colDef.field].style.display = displayStyle;
        });
    };

    return HeaderRenderer;

});
define('../src/gridOptionsWrapper',["./constants"], function(constants) {

    var DEFAULT_ROW_HEIGHT = 30;

    function GridOptionsWrapper(gridOptions) {
        this.gridOptions = gridOptions;
        this.setupDefaults();
    }

    GridOptionsWrapper.prototype.getHeaderCellRenderer = function() {
        return this.gridOptions.headerCellRenderer;
    };

    GridOptionsWrapper.prototype.isEnableSorting = function() {
        return this.gridOptions.enableSorting;
    };

    GridOptionsWrapper.prototype.isEnableColResize = function() {
        return this.gridOptions.enableColResize;
    };

    GridOptionsWrapper.prototype.isEnableFilter = function() {
        return this.gridOptions.enableFilter;
    };

    GridOptionsWrapper.prototype.isGroupDefaultExpanded = function() {
        return this.gridOptions.groupDefaultExpanded === true;
    };

    GridOptionsWrapper.prototype.getGroupKeys = function() {
        return this.gridOptions.groupKeys;
    };

    GridOptionsWrapper.prototype.getAggFunction = function() {
        return this.gridOptions.aggFunction;
    };

    GridOptionsWrapper.prototype.getAllRows = function() {
        return this.gridOptions.rowData;
    };

    GridOptionsWrapper.prototype.isGroupUseEntireRow = function() {
        return this.gridOptions.groupUseEntireRow===true;
    };

    GridOptionsWrapper.prototype.isAngularCompile = function() {
        return this.gridOptions.angularCompile===true;
    };

    GridOptionsWrapper.prototype.getColumnDefs = function() {
        return this.gridOptions.columnDefs;
    };

    GridOptionsWrapper.prototype.isColumDefsPresent = function() {
        return this.gridOptions.columnDefs && this.gridOptions.columnDefs.length!=0;
    };

    GridOptionsWrapper.prototype.setupDefaults = function() {
        if (!this.gridOptions.rowHeight) {
            this.gridOptions.rowHeight = DEFAULT_ROW_HEIGHT;
        }
    };

    GridOptionsWrapper.prototype.clearSelection = function () {
        this.gridOptions.selectedRows.length = 0;
    };

    GridOptionsWrapper.prototype.ensureEachColHasSize = function () {
        if (!this.isColumDefsPresent()) { return; }

        this.gridOptions.columnDefs.forEach(function (colDef) {
            if (!colDef.width || colDef.width < 10) {
                colDef.actualWidth = constants.MIN_COL_WIDTH;
            } else {
                colDef.actualWidth = colDef.width;
            }
        });
    };

    GridOptionsWrapper.prototype.getTotalUnpinnedColWidth = function() {
        var widthSoFar = 0;
        var pinnedColCount = this.getPinnedColCount();

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            if (index>=pinnedColCount) {
                widthSoFar += colDef.actualWidth;
            }
        });

        return widthSoFar;
    };

    GridOptionsWrapper.prototype.getPinnedColCount = function() {
        if (this.gridOptions.pinnedColumnCount) {
            //in case user puts in a string, cast to number
            return Number(this.gridOptions.pinnedColumnCount);
        } else {
            return 0;
        }
    };

    GridOptionsWrapper.prototype.getRowHeight = function() {
        return this.gridOptions.rowHeight;
    };

    return GridOptionsWrapper;

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

define('css!../src/css/core',[],function(){});

define('css!../src/css/theme-dark',[],function(){});

define('css!../src/css/theme-fresh',[],function(){});

//todo: full row group doesn't work when columns are pinned
//todo: moving & hiding columns
//todo: allow sort via api

define('../src/angularGrid',[
    "angular",
    "text!./angularGrid.html",
    "./utils",
    "./filterManager",
    "./rowModel",
    "./rowController",
    "./rowRenderer",
    "./headerRenderer",
    "./gridOptionsWrapper",
    "./constants",
    "css!./css/core.css",
    "css!./css/theme-dark.css",
    "css!./css/theme-fresh.css"
], function(angular, template, utils, FilterManager, RowModel, RowController, RowRenderer, HeaderRenderer, GridOptionsWrapper, constants) {

    var module = angular.module("angularGrid", []);

    module.directive("angularGrid", function () {
        return {
            restrict: "A",
            template: template,
            controller: ["$scope", "$element", "$compile", Grid],
            scope: {
                angularGrid: "="
            }
        };
    });

    function Grid($scope, $element, $compile) {

        var _this = this;
        $scope.grid = this;
        this.$scope = $scope;
        this.$compile = $compile;
        this.gridOptions = $scope.angularGrid;
        this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
            _this.onQuickFilterChanged(newFilter);
        });

        this.gridOptions.selectedRows = [];

        this.addApi();
        this.findAllElements($element);

        this.rowModel = new RowModel();
        this.rowModel.setAllRows(this.gridOptionsWrapper.getAllRows());

        this.filterManager = new FilterManager(this, this.rowModel);
        this.rowController = new RowController(this.gridOptionsWrapper, this.rowModel, this, this.filterManager);
        this.rowRenderer = new RowRenderer(this.gridOptions, this.rowModel, this.gridOptionsWrapper, $element[0], this, $compile, $scope);
        this.headerRenderer = new HeaderRenderer(this.gridOptionsWrapper, $element[0], this, this.filterManager);

        this.addScrollListener();

        this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes

        //done when cols change
        this.setupColumns();

        //done when rows change
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);

        //flag to mark when the directive is destroyed
        this.finished = false;
        var _this = this;
        $scope.$on("$destroy", function () {
            _this.finished = true;
        });
    }

    Grid.prototype.getPopupParent = function () {
        return this.eRoot;
    };

    Grid.prototype.getQuickFilter = function () {
        return this.quickFilter;
    };

    Grid.prototype.onQuickFilterChanged = function (newFilter) {
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (this.quickFilter !== newFilter) {
            //want 'null' to mean to filter, so remove undefined and empty string
            if (newFilter===undefined || newFilter==="") {
                newFilter = null;
            }
            if (newFilter !== null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            this.onFilterChanged();
        }
    };

    Grid.prototype.onFilterChanged = function () {
        this.updateModelAndRefresh(constants.STEP_FILTER);
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.onRowClicked = function (event, rowIndex) {
        var row = this.rowModel.getRowsAfterMap()[rowIndex];

        if (this.gridOptions.rowClicked) {
            this.gridOptions.rowClicked(row, event);
        }

        //if no selection method enabled, do nothing
        if (this.gridOptions.rowSelection !== "single" && this.gridOptions.rowSelection !== "multiple") {
            return;
        }

        //if not in array, then it's a new selection, thus selected = true
        var selected = this.gridOptions.selectedRows.indexOf(row) < 0;

        if (selected) {
            if (this.gridOptions.rowSelected && typeof this.gridOptions.rowSelected === "function") {
                this.gridOptions.rowSelected(row);
            }
            //if single selection, clear any previous
            if (selected && this.gridOptions.rowSelection === "single") {
                this.gridOptions.selectedRows.length = 0;
                var eRowsWithSelectedClass = this.eBody.querySelectorAll(".ag-row-selected");
                for (var i = 0; i < eRowsWithSelectedClass.length; i++) {
                    utils.removeCssClass(eRowsWithSelectedClass[i], "ag-row-selected");
                }
            }
            this.gridOptions.selectedRows.push(row);
        } else {
            utils.removeFromArray(this.gridOptions.selectedRows, row);
        }

        //update css class on selected row
        var eRows = this.eBody.querySelectorAll("[row='" + rowIndex + "']");
        for (var i = 0; i < eRows.length; i++) {
            if (selected) {
                utils.addCssClass(eRows[i], "ag-row-selected")
            } else {
                utils.removeCssClass(eRows[i], "ag-row-selected")
            }
        }

        if (this.gridOptions.selectionChanged && typeof this.gridOptions.selectionChanged === "function") {
            this.gridOptions.selectionChanged();
            this.$scope.$apply();
        }

    };

    Grid.prototype.setupColumns = function () {
        this.gridOptionsWrapper.ensureEachColHasSize();
        this.showPinnedColContainersIfNeeded();
        this.headerRenderer.insertHeader();
        this.setPinnedColContainerWidth();
        this.setBodyContainerWidth();
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.updateModelAndRefresh = function (step) {
        this.rowController.updateModel(step);
        this.rowRenderer.refreshView();
    };

    Grid.prototype.addApi = function () {
        var _this = this;
        var api = {
            onNewRows: function () {
                _this.rowModel.setAllRows(_this.gridOptionsWrapper.getAllRows());
                _this.gridOptions.selectedRows.length = 0;
                _this.filterManager.clearAllFilters();
                _this.updateModelAndRefresh(constants.STEP_EVERYTHING);
                _this.headerRenderer.updateFilterIcons();
            },
            onNewCols: function () {
                _this.onNewCols();
            },
            onNewCols: function () {
                _this.onNewCols();
            },
            refreshView: function () {
                _this.rowRenderer.refreshView();
            },
            getModel: function () {
                _this.rowModel;
            },
            onGroupExpandedOrCollapsed: function() {
                _this.updateModelAndRefresh(constants.STEP_MAP);
            },
            expandAll: function() {
                _this.expandOrCollapseAll(true, null);
                _this.updateModelAndRefresh(constants.STEP_MAP);
            },
            collapseAll: function() {
                _this.expandOrCollapseAll(false, null);
                _this.updateModelAndRefresh(constants.STEP_MAP);
            }
        };
        this.gridOptions.api = api;
    };

    Grid.prototype.expandOrCollapseAll = function(expand, list) {
        //if first call in recursion, we set list to parent list
        if (list==null) { list = this.rowModel.getRowsAfterGroup(); }

        if (!list) { return; }

        var _this = this;
        list.forEach(function(item) {
            var itemIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (itemIsAGroup) {
                item.expanded = expand;
                _this.expandOrCollapseAll(expand, item.children);
            }
        });
    };

    Grid.prototype.onNewCols = function () {
        this.setupColumns();
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);
    };

    Grid.prototype.findAllElements = function ($element) {
        var eGrid = $element[0];
        this.eRoot = eGrid.querySelector(".ag-root");
        this.eBody = eGrid.querySelector(".ag-body");
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
        this.ePinnedColsViewport = eGrid.querySelector(".ag-pinned-cols-viewport");
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
    };

    Grid.prototype.showPinnedColContainersIfNeeded = function () {
        var showingPinnedCols = this.gridOptionsWrapper.getPinnedColCount() > 0;
        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (showingPinnedCols) {
            this.ePinnedHeader.style.display = 'inline-block';
            this.ePinnedColsViewport.style.display = 'inline';
        } else {
            this.ePinnedHeader.style.display = 'none';
            this.ePinnedColsViewport.style.display = 'none';
        }
    };

    Grid.prototype.updateBodyContainerWidthAfterColResize = function() {
        this.rowRenderer.setMainRowWidths();
        this.setBodyContainerWidth();
    };

    Grid.prototype.updatePinnedColContainerWidthAfterColResize = function() {
        this.setPinnedColContainerWidth();
    };

    Grid.prototype.setPinnedColContainerWidth = function () {
        var pinnedColWidth = this.getTotalPinnedColWidth();
        this.ePinnedColsContainer.style.width = pinnedColWidth + "px";
    };

    //see if a grey box is needed at the bottom of the pinned col
    Grid.prototype.setPinnedColHeight = function () {
        //var bodyHeight = utils.pixelStringToNumber(this.eBody.style.height);
        var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        var bodyHeight = this.eBodyViewport.offsetHeight;
        if (scrollShowing) {
            this.ePinnedColsViewport.style.height = (bodyHeight - 20) + "px";
        } else {
            this.ePinnedColsViewport.style.height = bodyHeight + "px";
        }
    };

    Grid.prototype.setBodySize = function() {
        var _this = this;

        var bodyHeight = this.eBodyViewport.offsetHeight;

        if (this.bodyHeightLastTime != bodyHeight) {
            this.bodyHeightLastTime = bodyHeight;
            this.setPinnedColHeight();

            //only draw virtual rows if done sort & filter - this
            //means we don't draw rows if table is not yet initialised
            if (this.rowModel.getRowsAfterMap()) {
                this.rowRenderer.drawVirtualRows();
            }
        }

        if (!this.finished) {
            setTimeout(function() {
                _this.setBodySize();
            }, 200);
        }
    };

    Grid.prototype.getTotalPinnedColWidth = function() {
        var pinnedColCount = this.gridOptionsWrapper.getPinnedColCount();
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

    Grid.prototype.addScrollListener = function() {
        var _this = this;

        this.eBodyViewport.addEventListener("scroll", function() {
            _this.scrollHeaderAndPinned();
            _this.rowRenderer.drawVirtualRows();
        });
    };

    Grid.prototype.scrollHeaderAndPinned = function() {
        this.eHeaderContainer.style.left = -this.eBodyViewport.scrollLeft + "px";
        this.ePinnedColsContainer.style.top = -this.eBodyViewport.scrollTop + "px";
    };



});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('\r\n.ag-root {\r\n    height: 100%;\r\n    font-size: 14px;\r\n    cursor: default;\r\n\r\n    /* Set to relative, so absolute popups appear relative to this */\r\n    position: relative;\r\n\r\n    /*disable user mouse selection */\r\n    -webkit-touch-callout: none;\r\n    -webkit-user-select: none;\r\n    -khtml-user-select: none;\r\n    -moz-user-select: none;\r\n    -ms-user-select: none;\r\n    user-select: none;\r\n    box-sizing: border-box;\r\n}\r\n\r\n.ag-popup-backdrop {\r\n    position: fixed;\r\n    left: 0px;\r\n    top: 0px;\r\n    width: 100%;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header {\r\n    position: absolute;\r\n    top: 0px;\r\n    left: 0px;\r\n    white-space: nowrap;\r\n    box-sizing: border-box;\r\n    overflow: hidden;\r\n    height: 25px;\r\n    box-sizing: border-box;\r\n    width: 100%;\r\n}\r\n\r\n.ag-pinned-header {\r\n    box-sizing: border-box;\r\n    display: inline-block;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-viewport {\r\n    box-sizing: border-box;\r\n    display: inline-block;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-container {\r\n    box-sizing: border-box;\r\n    position: relative;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-cell {\r\n    box-sizing: border-box;\r\n    font-weight: bold;\r\n    vertical-align: bottom;\r\n    text-align: center;\r\n    display: inline-block;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-cell-label {\r\n    padding: 4px;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-header-cell-sort {\r\n    padding-right: 2px;\r\n}\r\n\r\n.ag-header-cell-resize {\r\n    height: 100%;\r\n    width: 4px;\r\n    float: right;\r\n    cursor: col-resize;\r\n}\r\n\r\n.ag-header-cell-menu-button {\r\n    float: right;\r\n    /*margin-top: 5px;*/\r\n}\r\n\r\n.ag-body {\r\n    height: 100%;\r\n    padding-top: 25px;\r\n    box-sizing: border-box;\r\n}\r\n\r\n.ag-pinned-cols-viewport {\r\n    float: left;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-pinned-cols-container {\r\n    display: inline-block;\r\n    position: relative;\r\n}\r\n\r\n.ag-body-viewport-wrapper {\r\n    height: 100%;\r\n}\r\n\r\n.ag-body-viewport {\r\n    overflow: auto;\r\n    height: 100%;\r\n}\r\n\r\n.ag-body-container {\r\n    position: relative;\r\n    display: inline-block;\r\n}\r\n\r\n.ag-row {\r\n    white-space: nowrap;\r\n    position: absolute;\r\n}\r\n\r\n.ag-row-odd {\r\n}\r\n\r\n.ag-row-even {\r\n}\r\n\r\n.ag-row-selected {\r\n}\r\n\r\n.agile-gird-row:hover {\r\n    background-color: aliceblue;\r\n}\r\n\r\n.ag-cell {\r\n    display: inline-block;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n    box-sizing: border-box;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    padding: 4px;\r\n}\r\n\r\n.ag-group-row {\r\n    position: absolute;\r\n    width: 100%;\r\n    display: inline-block;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n    box-sizing: border-box;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    padding: 4px;\r\n}\r\n\r\n.ag-large .ag-root {\r\n    font-size: 20px;\r\n}\r\n.ag-filter {\r\n    position: absolute;\r\n}\r\n\r\n.ag-filter-list-viewport {\r\n    overflow-x: auto;\r\n    height: 300px;\r\n    width: 200px;\r\n}\r\n\r\n.ag-filter-list-container {\r\n    position: relative;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-filter-item {\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    position: absolute;\r\n}\r\n\r\n.ag-filter-filter {\r\n    width: 170px;\r\n    margin: 4px;\r\n}\r\n.ag-dark .ag-root {\r\n    border: 1px solid grey;\r\n    color: #e0e0e0;\r\n}\r\n\r\n.ag-dark .ag-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header {\r\n    background-color: #430000;\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header-cell-menu-button {\r\n    padding: 2px;\r\n    margin-top: 4px;\r\n    border: 1px solid transparent;\r\n}\r\n\r\n.ag-dark .ag-header-cell-menu-button:hover {\r\n    border: 1px solid #e0e0e0;\r\n}\r\n\r\n.ag-dark .ag-header-icon {\r\n    stroke: white;\r\n    fill: white;\r\n}\r\n\r\n.ag-dark .ag-row-odd {\r\n    background-color: #302E2E;\r\n}\r\n\r\n.ag-dark .ag-row-even {\r\n    background-color: #403E3E;\r\n}\r\n\r\n.ag-dark .ag-body {\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-dark .ag-row-selected {\r\n    background-color: #000000;\r\n}\r\n\r\n.ag-dark .ag-filter {\r\n    color: black;\r\n}\r\n\r\n.ag-dark .ag-filter-header-container {\r\n    border-bottom: 1px solid lightgrey;\r\n}\r\n\r\n.ag-dark .ag-filter {\r\n    border: 1px solid black;\r\n    background-color: #f0f0f0;\r\n}\r\n.ag-fresh .ag-root {\r\n    border: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header {\r\n    background: -webkit-linear-gradient(white, lightgrey); /* For Safari 5.1 to 6.0 */\r\n    background: -o-linear-gradient(white, lightgrey); /* For Opera 11.1 to 12.0 */\r\n    background: -moz-linear-gradient(white, lightgrey); /* For Firefox 3.6 to 15 */\r\n    background: linear-gradient(white, lightgrey); /* Standard syntax */\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header-cell-menu-button {\r\n    padding: 2px;\r\n    margin-top: 4px;\r\n    border: 1px solid transparent;\r\n}\r\n\r\n.ag-fresh .ag-header-cell-menu-button:hover {\r\n    border: 1px solid black;\r\n}\r\n\r\n.ag-fresh .ag-row-odd {\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-fresh .ag-row-even {\r\n    background-color: white;\r\n}\r\n\r\n.ag-fresh .ag-body {\r\n    background-color: #ffffff;\r\n}\r\n\r\n.ag-fresh .ag-row-selected {\r\n    background-color: #b0b0b0;\r\n}\r\n\r\n.ag-fresh .ag-group-row {\r\n    background-color: #aaa;\r\n}\r\n\r\n.ag-fresh .ag-filter-header-container {\r\n    border-bottom: 1px solid lightgrey;\r\n}\r\n\r\n.ag-fresh .ag-filter {\r\n    border: 1px solid black;\r\n    background-color: #f0f0f0;\r\n}\r\n');
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