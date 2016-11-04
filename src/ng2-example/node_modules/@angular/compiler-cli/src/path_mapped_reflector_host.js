/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var ts = require('typescript');
var reflector_host_1 = require('./reflector_host');
var EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
var DTS = /\.d\.ts$/;
/**
 * This version of the reflector host expects that the program will be compiled
 * and executed with a "path mapped" directory structure, where generated files
 * are in a parallel tree with the sources, and imported using a `./` relative
 * import. This requires using TS `rootDirs` option and also teaching the module
 * loader what to do.
 */
var PathMappedReflectorHost = (function (_super) {
    __extends(PathMappedReflectorHost, _super);
    function PathMappedReflectorHost(program, compilerHost, options, context) {
        _super.call(this, program, compilerHost, options, context);
    }
    PathMappedReflectorHost.prototype.getCanonicalFileName = function (fileName) {
        if (!fileName)
            return fileName;
        // NB: the rootDirs should have been sorted longest-first
        for (var _i = 0, _a = this.options.rootDirs || []; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (fileName.indexOf(dir) === 0) {
                fileName = fileName.substring(dir.length);
            }
        }
        return fileName;
    };
    PathMappedReflectorHost.prototype.resolve = function (m, containingFile) {
        for (var _i = 0, _a = this.options.rootDirs || ['']; _i < _a.length; _i++) {
            var root = _a[_i];
            var rootedContainingFile = path.join(root, containingFile);
            var resolved = ts.resolveModuleName(m, rootedContainingFile, this.options, this.context).resolvedModule;
            if (resolved) {
                if (this.options.traceResolution) {
                    console.log('resolve', m, containingFile, '=>', resolved.resolvedFileName);
                }
                return resolved.resolvedFileName;
            }
        }
    };
    /**
     * We want a moduleId that will appear in import statements in the generated code.
     * These need to be in a form that system.js can load, so absolute file paths don't work.
     * Relativize the paths by checking candidate prefixes of the absolute path, to see if
     * they are resolvable by the moduleResolution strategy from the CompilerHost.
     */
    PathMappedReflectorHost.prototype.getImportPath = function (containingFile, importedFile) {
        var _this = this;
        importedFile = this.resolveAssetUrl(importedFile, containingFile);
        containingFile = this.resolveAssetUrl(containingFile, '');
        if (this.options.traceResolution) {
            console.log('getImportPath from containingFile', containingFile, 'to importedFile', importedFile);
        }
        // If a file does not yet exist (because we compile it later), we still need to
        // assume it exists so that the `resolve` method works!
        if (!this.context.fileExists(importedFile)) {
            if (this.options.rootDirs && this.options.rootDirs.length > 0) {
                this.context.assumeFileExists(path.join(this.options.rootDirs[0], importedFile));
            }
            else {
                this.context.assumeFileExists(importedFile);
            }
        }
        var resolvable = function (candidate) {
            var resolved = _this.getCanonicalFileName(_this.resolve(candidate, importedFile));
            return resolved && resolved.replace(EXT, '') === importedFile.replace(EXT, '');
        };
        var importModuleName = importedFile.replace(EXT, '');
        var parts = importModuleName.split(path.sep).filter(function (p) { return !!p; });
        var foundRelativeImport;
        for (var index = parts.length - 1; index >= 0; index--) {
            var candidate_1 = parts.slice(index, parts.length).join(path.sep);
            if (resolvable(candidate_1)) {
                return candidate_1;
            }
            candidate_1 = '.' + path.sep + candidate_1;
            if (resolvable(candidate_1)) {
                foundRelativeImport = candidate_1;
            }
        }
        if (foundRelativeImport)
            return foundRelativeImport;
        // Try a relative import
        var candidate = path.relative(path.dirname(containingFile), importModuleName);
        if (resolvable(candidate)) {
            return candidate;
        }
        throw new Error("Unable to find any resolvable import for " + importedFile + " relative to " + containingFile);
    };
    PathMappedReflectorHost.prototype.getMetadataFor = function (filePath) {
        for (var _i = 0, _a = this.options.rootDirs || []; _i < _a.length; _i++) {
            var root = _a[_i];
            var rootedPath = path.join(root, filePath);
            if (!this.compilerHost.fileExists(rootedPath)) {
                // If the file doesn't exists then we cannot return metadata for the file.
                // This will occur if the user refernced a declared module for which no file
                // exists for the module (i.e. jQuery or angularjs).
                continue;
            }
            if (DTS.test(rootedPath)) {
                var metadataPath = rootedPath.replace(DTS, '.metadata.json');
                if (this.context.fileExists(metadataPath)) {
                    var metadata = this.readMetadata(metadataPath);
                    return (Array.isArray(metadata) && metadata.length == 0) ? undefined : metadata;
                }
            }
            else {
                var sf = this.program.getSourceFile(rootedPath);
                if (!sf) {
                    throw new Error("Source file " + rootedPath + " not present in program.");
                }
                sf.fileName = this.getCanonicalFileName(sf.fileName);
                return this.metadataCollector.getMetadata(sf);
            }
        }
    };
    return PathMappedReflectorHost;
}(reflector_host_1.ReflectorHost));
exports.PathMappedReflectorHost = PathMappedReflectorHost;
//# sourceMappingURL=path_mapped_reflector_host.js.map