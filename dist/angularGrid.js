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
            var resultOfRenderer = this.colDef.filterCellRenderer(value);
            valueElement.innerHTML = resultOfRenderer;
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

define('css!../src/filter',[],function(){});
define('../src/filterManager',[
    "./utils",
    "./filterComponent",
    "./filterModel",
    "css!./filter.css"
], function(utils, filterComponentFactory, filterModelFactory) {

    function FilterManager(grid) {
        this.grid = grid;
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

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDef, eventSource) {

        var model = this.colModels[colDef.field];
        if (!model) {
            var rowData = this.grid.getRowData();
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

    return function(eBody) {
        return new FilterManager(eBody);
    };

});

define('../src/group',[

], function() {

    function Group(col, key) {
        this.col = col;
        this.key = key;
        this.expanded = false;
        this.children = [];
    }

    Group.prototype.setExpanded = function(expanded) {
        this.expanded = expanded;
    };

    Group.prototype.isExpanded = function() {
        return this.expanded;
    };

    Group.prototype.addChild = function(child) {
        this.children.push(child);
    };

    return Group;
});
define('../src/groupCreator',[
    "./group"
],function(Group) {

    function GroupCreator() {
    }

    GroupCreator.prototype.createGroup = function(rowData, groupBy) {
        //iterate through items
        var groupByCol = groupBy[0];

        var groups = {};

        rowData.forEach(function (item) {
            var groupKey = item[groupByCol.field];
            //if group doesn't exist yet, create it
            var group = groups[groupKey];
            if (!group) {
                group = new Group(groupByCol, groupKey);
                groups[groupKey] = group;
            }
            group.addChild(item);
        });

        var result = [];
        Object.keys(groups).forEach(function(item){
            result.push(item);
        });

        return result;
    };

    return function() {
        return new GroupCreator();
    };

});

define('css!../src/angularGrid',[],function(){});

//todo: compile into angular
//todo: moving & hiding columns
//todo: grouping

define('../src/angularGrid',[
    "angular",
    "text!./angularGrid.html",
    "./utils",
    "./filterManager",
    "./groupCreator",
    "css!./angularGrid"
], function(angular, template, utils, filterManagerFactory, groupCreator) {

    var module = angular.module("angularGrid", []);

    var MIN_COL_WIDTH = 10;
    var DEFAULT_ROW_HEIGHT = 30;

    var SVG_NS = "http://www.w3.org/2000/svg";

    var ASC = "asc";
    var DESC = "desc";

    var SORT_STYLE_SHOW = "display:inline;";
    var SORT_STYLE_HIDE = "display:none;";

    module.directive("angularGrid", function () {
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
        this.$scope = $scope;
        this.gridOptions = $scope.angularGrid;
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
            _this.onQuickFilterChanged(newFilter);
        });
        $scope.$watch("angularGrid.pinnedColumnCount", function () {
            _this.onNewCols();
        });

        this.gridOptions.selectedRows = [];

        //done once
        //for virtualisation, maps keep track of which elements are attached to the dom
        this.rowsInBodyContainer = {};
        this.rowsInPinnedContainer = {};
        this.addApi();
        this.findAllElements($element);
        this.gridOptions.rowHeight = (this.gridOptions.rowHeight ? this.gridOptions.rowHeight : DEFAULT_ROW_HEIGHT); //default row height to 30
        this.advancedFilter = filterManagerFactory(this);

        this.addScrollListener();

        this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes

        //done when cols change
        this.setupColumns();

        //done when rows change
        this.setupRows();

        //flag to mark when the directive is destroyed
        this.finished = false;
        var _this = this;
        $scope.$on("$destroy", function () {
            _this.finished = true;
        });
    }

    Grid.prototype.getRowData = function () {
        return this.gridOptions.rowData;
    };

    Grid.prototype.getPopupParent = function () {
        return this.eRoot;
    };

    Grid.prototype.onQuickFilterChanged = function (newFilter) {
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (this.quickFilter !== newFilter) {
            if (newFilter !== null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            this.onFilterChanged();
        }
    };

    Grid.prototype.onFilterChanged = function () {
        this.setupRows();
        this.updateFilterIcons();
    };

    Grid.prototype.onRowClicked = function (rowIndex) {
        //if no selection method enabled, do nothing
        if (this.gridOptions.rowSelection !== "single" && this.gridOptions.rowSelection !== "multiple") {
            return;
        }
        var row = this.gridOptions.rowDataAfterSortAndFilter[rowIndex];

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

    Grid.prototype.doFilter = function () {
        var _this = this;
        var quickFilterPresent = this.quickFilter !== null && this.quickFilter !== undefined && this.quickFilter !== "";
        var advancedFilterPresent = this.advancedFilter.isFilterPresent();
        var filterPresent = quickFilterPresent || advancedFilterPresent;

        if (filterPresent) {
            this.gridOptions.rowDataAfterFilter = [];
            for (var i = 0, l = this.gridOptions.rowData.length; i < l; i++) {
                var item = this.gridOptions.rowData[i];
                //first up, check quick filter
                if (quickFilterPresent) {
                    if (!item._quickFilterAggregateText) {
                        _this.aggregateRowForQuickFilter(item);
                    }
                    if (item._quickFilterAggregateText.indexOf(_this.quickFilter) < 0) {
                        //quick filter fails, so skip item
                        continue;
                    }
                }

                //second, check advanced filter
                if (advancedFilterPresent) {
                    if (!this.advancedFilter.doesFilterPass(item)) {
                        continue;
                    }
                }

                //got this far, all filters pass
                this.gridOptions.rowDataAfterFilter.push(item);
            }
        } else {
            this.gridOptions.rowDataAfterFilter = this.gridOptions.rowData.slice(0);
        }
    };

    Grid.prototype.aggregateRowForQuickFilter = function (rowItem) {
        var aggregatedText = "";
        this.gridOptions.columnDefs.forEach(function (colDef) {
            var value = rowItem[colDef.field];
            if (value && value !== "") {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        rowItem._quickFilterAggregateText = aggregatedText;
    };

    Grid.prototype.setupColumns = function () {
        this.ensureEachColHasSize();
        this.insertHeader();
        this.setPinnedColContainerWidth();
        this.setBodyContainerWidth();
        this.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.getTotalUnpinnedColWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.setupRows = function () {

        this.doFilter();
        this.doSort();

        //in time, replace this with filter
        //this.gridOptions.rowDataAfterFilter = this.gridOptions.rowData.slice(0);
        //this.gridOptions.rowDataAfterSortAndFilter = this.gridOptions.rowData.slice(0);

        var rowCount = this.gridOptions.rowDataAfterFilter.length;
        var containerHeight = this.gridOptions.rowHeight * rowCount;
        this.eBodyContainer.style.height = containerHeight + "px";
        this.ePinnedColsContainer.style.height = containerHeight + "px";

        this.refreshAllVirtualRows();
    };

    Grid.prototype.refreshAllVirtualRows = function () {
        //remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);

        //add in new rows
        this.drawVirtualRows();
    };

    Grid.prototype.doSort = function () {
        //see if there is a col we are sorting by
        var colDefForSorting = null;
        this.gridOptions.columnDefs.forEach(function (colDef) {
            if (colDef.sort) {
                colDefForSorting = colDef;
            }
        });

        this.gridOptions.rowDataAfterSortAndFilter = this.gridOptions.rowDataAfterFilter.slice(0);

        if (colDefForSorting) {
            var keyForSort = colDefForSorting.field;
            var ascending = colDefForSorting.sort === ASC;
            var inverter = ascending ? 1 : -1;

            this.gridOptions.rowDataAfterSortAndFilter.sort(function (objA, objB) {
                //hack to stop crashing, in case user isn't supplying objects
                if (objA === null || objA === undefined || objB === null || objB === undefined) {
                    return 0;
                }
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
        }

        this.refreshAllVirtualRows();
    };

    Grid.prototype.addApi = function () {
        var _this = this;
        var api = {
            onNewRows: function () {
                _this.gridOptions.selectedRows.length = 0;
                _this.advancedFilter.clearAllFilters();
                _this.setupRows();
                _this.updateFilterIcons();
            },
            onNewCols: function () {
                _this.onNewCols();
            }
        };
        this.gridOptions.api = api;
    };

    Grid.prototype.onNewCols = function () {
        this.setupColumns();
        this.setupRows();
    }

    Grid.prototype.findAllElements = function ($element) {
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

    Grid.prototype.setPinnedColContainerWidth = function () {
        var pinnedColWidth = this.getTotalPinnedColWidth();
        this.ePinnedColsContainer.style.width = pinnedColWidth + "px";
    };

    Grid.prototype.ensureRowsRendered = function (start, finish) {
        var pinnedColumnCount = this.getPinnedColCount();
        var mainRowWidth = this.getTotalUnpinnedColWidth();
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
            var data = this.gridOptions.rowDataAfterSortAndFilter[rowIndex];
            if (data) {
                _this.insertRow(data, rowIndex, mainRowWidth, pinnedColumnCount);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    };

    //takes array of row id's
    Grid.prototype.removeVirtualRows = function (rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var pinnedRowToRemove = _this.rowsInPinnedContainer[indexToRemove];
            _this.ePinnedColsContainer.removeChild(pinnedRowToRemove);
            delete _this.rowsInPinnedContainer[indexToRemove];

            var bodyRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eBodyContainer.removeChild(bodyRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };

    Grid.prototype.ensureEachColHasSize = function () {
        this.gridOptions.columnDefs.forEach(function (colDef) {
            if (!colDef.width || colDef.width < 10) {
                colDef.actualWidth = MIN_COL_WIDTH;
            } else {
                colDef.actualWidth = colDef.width;
            }
        });
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

    //todo: make this only happen if size changes, and only when visible
    Grid.prototype.setBodySize = function() {
        var _this = this;

        var bodyHeight = this.eBodyViewport.offsetHeight;

        if (this.bodyHeightLastTime != bodyHeight) {
            this.setPinnedColHeight();

            //only draw virtual rows if done sort & filter - this
            //means we don't draw rows if table is not yet initialised
            if (this.gridOptions.rowDataAfterSortAndFilter) {
                this.drawVirtualRows();
            }
        }

        if (!this.finished) {
            setTimeout(function() {
                _this.setBodySize();
            }, 200);
        }
    };

    Grid.prototype.setBodySize2 = function() {
        //if (this.eGrid.is(":visible")) {
        if (true) {
            var availableHeight = this.eRoot.offsetHeight;
            var headerHeight = this.eHeader.offsetHeight;
            var bodyHeight = availableHeight - headerHeight;
            if (bodyHeight<0) {
                bodyHeight = 0;
            }
            console.log("availableHeight = " + availableHeight + ", headerHeight = " + headerHeight + ", bodyHeight = " + bodyHeight);

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

    Grid.prototype.createHeaderCell = function(colDef, colIndex, colPinned) {
        var headerCell = document.createElement("div");
        var _this = this;

        headerCell.className = "ag-header-cell";

        if (this.gridOptions.enableColResize) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            headerCell.appendChild(headerCellResize);
            this.addColResizeHandling(headerCellResize, headerCell, colDef, colIndex, colPinned);
        }

        //filter button
        if (this.gridOptions.enableFilter) {
            var eMenuButton = createMenuSvg();
            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            eMenuButton.onclick = function () {
                _this.advancedFilter.showFilter(colDef, this);
            };
            headerCell.appendChild(eMenuButton);
        }

        //label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";
        //add in sort icon
        if (this.gridOptions.enableSorting) {
            var headerSortIcon = createSortArrowSvg(colIndex);
            headerCellLabel.appendChild(headerSortIcon);
            this.addSortHandling(headerCellLabel, colDef);
        }

        //add in filter icon
        var filterIcon = createFilterSvg();
        this.headerFilterIcons[colDef.field] = filterIcon;
        headerCellLabel.appendChild(filterIcon);

        //add in text label
        var eInnerText = document.createElement("span");
        eInnerText.innerHTML = colDef.displayName;
        headerCellLabel.appendChild(eInnerText);

        headerCell.appendChild(headerCellLabel);
        headerCell.style.width = this.formatWidth(colDef.actualWidth);

        return headerCell;
    };

    Grid.prototype.updateFilterIcons = function() {
        var _this = this;
        this.gridOptions.columnDefs.forEach(function(colDef) {
            var filterPresent = _this.advancedFilter.isFilterPresentForCol(colDef.field);
            var displayStyle = filterPresent ? "inline" : "none";
            _this.headerFilterIcons[colDef.field].style.display = displayStyle;
        });
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
                var sortAny = sortAscending || sortDescending;

                var eSortAscending = _this.eHeader.querySelector(".ag-header-cell-sort-asc-" + colIndex);
                eSortAscending.setAttribute("style", sortAscending ? SORT_STYLE_SHOW : SORT_STYLE_HIDE);

                var eSortDescending = _this.eHeader.querySelector(".ag-header-cell-sort-desc-" + colIndex);
                eSortDescending.setAttribute("style", sortDescending ? SORT_STYLE_SHOW : SORT_STYLE_HIDE);

                var eParentSvg = eSortAscending.parentNode;
                eParentSvg.setAttribute("display", sortAny ? "inline" : "none");
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
    };

    Grid.prototype.createCell = function(colDef, value, rowIndex, colIndex) {
        var eGridCell = document.createElement("div");
        eGridCell.className = "ag-cell cell-col-"+colIndex;

        if (colDef.cellRenderer) {
            var resultFromRenderer = colDef.cellRenderer(value);
            eGridCell.innerHTML = resultFromRenderer;
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

    Grid.prototype.insertHeader = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        utils.removeAllChildren(ePinnedHeader);
        utils.removeAllChildren(eHeaderContainer);
        this.headerFilterIcons = {};

        var pinnedColumnCount = this.getPinnedColCount();
        var _this = this;

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
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

    function createFilterSvg() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");

        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    }

    function createMenuSvg() {
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
    }

    function createSortArrowSvg(colIndex) {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        eSvg.setAttribute("class", "ag-header-cell-sort");

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,10 5,0 10,10");
        eDescIcon.setAttribute("style", SORT_STYLE_HIDE);
        eDescIcon.setAttribute("class", "ag-header-icon ag-header-cell-sort-desc-"+colIndex);
        eSvg.appendChild(eDescIcon);

        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", "0,0 10,0 5,10");
        eAscIcon.setAttribute("style", SORT_STYLE_HIDE);
        eAscIcon.setAttribute("class", "ag-header-icon ag-header-cell-sort-asc-"+colIndex);
        eSvg.appendChild(eAscIcon);

        return eSvg;
    }
});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('.ag-filter {\r\n    position: absolute;\r\n}\r\n\r\n.ag-filter-list-viewport {\r\n    overflow-x: auto;\r\n    height: 300px;\r\n    width: 200px;\r\n}\r\n\r\n.ag-filter-list-container {\r\n    position: relative;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-filter-item {\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    position: absolute;\r\n}\r\n\r\n.ag-filter-filter {\r\n    width: 170px;\r\n    margin: 4px;\r\n}\r\n\r\n.ag-fresh .ag-filter-header-container {\r\n    border-bottom: 1px solid lightgrey;\r\n}\r\n\r\n.ag-fresh .ag-filter {\r\n    border: 1px solid black;\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-standard .ag-filter-header-container {\r\n    border-bottom: 1px solid lightgrey;\r\n}\r\n\r\n.ag-standard .ag-filter {\r\n    border: 1px solid black;\r\n    background-color: white;\r\n}\r\n\r\n.ag-dark .ag-filter-header-container {\r\n    border-bottom: 1px solid lightgrey;\r\n}\r\n\r\n.ag-dark .ag-filter {\r\n    border: 1px solid black;\r\n    background-color: #f0f0f0;\r\n}\r\n.ag-root {\r\n    height: 100%;\r\n    font-size: 14px;\r\n    cursor: default;\r\n\r\n    /* Set to relative, so absolute popups appear relative to this */\r\n    position: relative;\r\n\r\n    /*disable user mouse selection */\r\n    -webkit-touch-callout: none;\r\n    -webkit-user-select: none;\r\n    -khtml-user-select: none;\r\n    -moz-user-select: none;\r\n    -ms-user-select: none;\r\n    user-select: none;\r\n    box-sizing: border-box;\r\n}\r\n\r\n.ag-popup-backdrop {\r\n    position: fixed;\r\n    left: 0px;\r\n    top: 0px;\r\n    width: 100%;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header {\r\n    position: absolute;\r\n    top: 0px;\r\n    left: 0px;\r\n    white-space: nowrap;\r\n    box-sizing: border-box;\r\n    overflow: hidden;\r\n    height: 25px;\r\n    box-sizing: border-box;\r\n    width: 100%;\r\n}\r\n\r\n.ag-pinned-header {\r\n    box-sizing: border-box;\r\n    display: inline-block;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-viewport {\r\n    box-sizing: border-box;\r\n    display: inline-block;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-container {\r\n    box-sizing: border-box;\r\n    position: relative;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-cell {\r\n    box-sizing: border-box;\r\n    font-weight: bold;\r\n    vertical-align: bottom;\r\n    text-align: center;\r\n    display: inline-block;\r\n    height: 100%;\r\n}\r\n\r\n.ag-header-cell-label {\r\n    padding: 4px;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-header-cell-sort {\r\n    padding-right: 2px;\r\n}\r\n\r\n.ag-header-cell-resize {\r\n    height: 100%;\r\n    width: 4px;\r\n    float: right;\r\n    cursor: col-resize;\r\n}\r\n\r\n.ag-header-cell-menu-button {\r\n    float: right;\r\n    /*margin-top: 5px;*/\r\n}\r\n\r\n.ag-body {\r\n    height: 100%;\r\n    padding-top: 25px;\r\n    box-sizing: border-box;\r\n}\r\n\r\n.ag-pinned-cols-viewport {\r\n    float: left;\r\n    overflow: hidden;\r\n}\r\n\r\n.ag-pinned-cols-container {\r\n    display: inline-block;\r\n    position: relative;\r\n}\r\n\r\n.ag-body-viewport-wrapper {\r\n    height: 100%;\r\n}\r\n\r\n.ag-body-viewport {\r\n    overflow: auto;\r\n    height: 100%;\r\n}\r\n\r\n.ag-body-container {\r\n    position: relative;\r\n    display: inline-block;\r\n}\r\n\r\n.ag-row {\r\n    white-space: nowrap;\r\n    position: absolute;\r\n}\r\n\r\n.ag-row-odd {\r\n}\r\n\r\n.ag-row-even {\r\n}\r\n\r\n.ag-row-selected {\r\n}\r\n\r\n.agile-gird-row:hover {\r\n    background-color: aliceblue;\r\n}\r\n\r\n.ag-cell {\r\n    display: inline-block;\r\n    white-space: nowrap;\r\n    height: 100%;\r\n    box-sizing: border-box;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    padding: 4px;\r\n}\r\n\r\n\r\n.ag-standard .ag-root {\r\n    border: 1px solid black;\r\n}\r\n\r\n.ag-standard .ag-cell {\r\n    border-right: 1px solid grey;\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-standard .ag-header {\r\n    background: #C0C0C0;\r\n    border-bottom: 1px solid black;\r\n}\r\n\r\n.ag-standard .ag-header-cell {\r\n    border-right: 1px solid black;\r\n}\r\n\r\n.ag-standard .ag-row-selected {\r\n    background-color: #b0b0b0;\r\n}\r\n\r\n.ag-standard .ag-header-cell-menu-button {\r\n    padding: 2px;\r\n    margin-top: 4px;\r\n    border: 1px solid transparent;\r\n}\r\n\r\n.ag-standard .ag-header-cell-menu-button:hover {\r\n    border: 1px solid black;\r\n}\r\n\r\n\r\n.ag-fresh .ag-root {\r\n    border: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header {\r\n    background: -webkit-linear-gradient(white, lightgrey); /* For Safari 5.1 to 6.0 */\r\n    background: -o-linear-gradient(white, lightgrey); /* For Opera 11.1 to 12.0 */\r\n    background: -moz-linear-gradient(white, lightgrey); /* For Firefox 3.6 to 15 */\r\n    background: linear-gradient(white, lightgrey); /* Standard syntax */\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-fresh .ag-header-cell-menu-button {\r\n    padding: 2px;\r\n    margin-top: 4px;\r\n    border: 1px solid transparent;\r\n}\r\n\r\n.ag-fresh .ag-header-cell-menu-button:hover {\r\n    border: 1px solid black;\r\n}\r\n\r\n.ag-fresh .ag-row-odd {\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-fresh .ag-row-even {\r\n    background-color: white;\r\n}\r\n\r\n.ag-fresh .ag-body {\r\n    background-color: #ffffff;\r\n}\r\n\r\n.ag-fresh .ag-row-selected {\r\n    background-color: #b0b0b0;\r\n}\r\n\r\n.ag-dark .ag-root {\r\n    border: 1px solid grey;\r\n    color: #e0e0e0;\r\n}\r\n\r\n.ag-dark .ag-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header {\r\n    background-color: #430000;\r\n    border-bottom: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header-cell {\r\n    border-right: 1px solid grey;\r\n}\r\n\r\n.ag-dark .ag-header-cell-menu-button {\r\n    padding: 2px;\r\n    margin-top: 4px;\r\n    border: 1px solid transparent;\r\n}\r\n\r\n.ag-dark .ag-header-cell-menu-button:hover {\r\n    border: 1px solid #e0e0e0;\r\n}\r\n\r\n.ag-dark .ag-header-icon {\r\n    stroke: white;\r\n    fill: white;\r\n}\r\n\r\n.ag-dark .ag-row-odd {\r\n    background-color: #302E2E;\r\n}\r\n\r\n.ag-dark .ag-row-even {\r\n    background-color: #403E3E;\r\n}\r\n\r\n.ag-dark .ag-body {\r\n    background-color: #f0f0f0;\r\n}\r\n\r\n.ag-dark .ag-row-selected {\r\n    background-color: #000000;\r\n}\r\n\r\n.ag-dark .ag-filter {\r\n    color: black;\r\n}\r\n\r\n.ag-large .ag-root {\r\n    font-size: 20px;\r\n}\r\n');
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