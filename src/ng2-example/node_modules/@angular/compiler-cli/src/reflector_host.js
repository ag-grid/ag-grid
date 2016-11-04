/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var tsc_wrapped_1 = require('@angular/tsc-wrapped');
var fs = require('fs');
var path = require('path');
var ts = require('typescript');
var private_import_compiler_1 = require('./private_import_compiler');
var static_reflector_1 = require('./static_reflector');
var EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
var DTS = /\.d\.ts$/;
var NODE_MODULES = '/node_modules/';
var IS_GENERATED = /\.(ngfactory|css(\.shim)?)$/;
var ReflectorHost = (function () {
    function ReflectorHost(program, compilerHost, options, context) {
        this.program = program;
        this.compilerHost = compilerHost;
        this.options = options;
        this.metadataCollector = new tsc_wrapped_1.MetadataCollector();
        this.typeCache = new Map();
        this.resolverCache = new Map();
        // normalize the path so that it never ends with '/'.
        this.basePath = path.normalize(path.join(this.options.basePath, '.')).replace(/\\/g, '/');
        this.genDir = path.normalize(path.join(this.options.genDir, '.')).replace(/\\/g, '/');
        this.context = context || new NodeReflectorHostContext(compilerHost);
        var genPath = path.relative(this.basePath, this.genDir);
        this.isGenDirChildOfRootDir = genPath === '' || !genPath.startsWith('..');
    }
    ReflectorHost.prototype.angularImportLocations = function () {
        return {
            coreDecorators: '@angular/core/src/metadata',
            diDecorators: '@angular/core/src/di/metadata',
            diMetadata: '@angular/core/src/di/metadata',
            diOpaqueToken: '@angular/core/src/di/opaque_token',
            animationMetadata: '@angular/core/src/animation/metadata',
            provider: '@angular/core/src/di/provider'
        };
    };
    // We use absolute paths on disk as canonical.
    ReflectorHost.prototype.getCanonicalFileName = function (fileName) { return fileName; };
    ReflectorHost.prototype.resolve = function (m, containingFile) {
        m = m.replace(EXT, '');
        var resolved = ts.resolveModuleName(m, containingFile.replace(/\\/g, '/'), this.options, this.context)
            .resolvedModule;
        return resolved ? resolved.resolvedFileName : null;
    };
    ;
    ReflectorHost.prototype.normalizeAssetUrl = function (url) {
        var assetUrl = private_import_compiler_1.AssetUrl.parse(url);
        var path = assetUrl ? assetUrl.packageName + "/" + assetUrl.modulePath : null;
        return this.getCanonicalFileName(path);
    };
    ReflectorHost.prototype.resolveAssetUrl = function (url, containingFile) {
        var assetUrl = this.normalizeAssetUrl(url);
        if (assetUrl) {
            return this.getCanonicalFileName(this.resolve(assetUrl, containingFile));
        }
        return url;
    };
    /**
     * We want a moduleId that will appear in import statements in the generated code.
     * These need to be in a form that system.js can load, so absolute file paths don't work.
     *
     * The `containingFile` is always in the `genDir`, where as the `importedFile` can be in
     * `genDir`, `node_module` or `basePath`.  The `importedFile` is either a generated file or
     * existing file.
     *
     *               | genDir   | node_module |  rootDir
     * --------------+----------+-------------+----------
     * generated     | relative |   relative  |   n/a
     * existing file |   n/a    |   absolute  |  relative(*)
     *
     * NOTE: (*) the relative path is computed depending on `isGenDirChildOfRootDir`.
     */
    ReflectorHost.prototype.getImportPath = function (containingFile, importedFile) {
        importedFile = this.resolveAssetUrl(importedFile, containingFile);
        containingFile = this.resolveAssetUrl(containingFile, '');
        // If a file does not yet exist (because we compile it later), we still need to
        // assume it exists it so that the `resolve` method works!
        if (!this.compilerHost.fileExists(importedFile)) {
            this.context.assumeFileExists(importedFile);
        }
        containingFile = this.rewriteGenDirPath(containingFile);
        var containingDir = path.dirname(containingFile);
        // drop extension
        importedFile = importedFile.replace(EXT, '');
        var nodeModulesIndex = importedFile.indexOf(NODE_MODULES);
        var importModule = nodeModulesIndex === -1 ?
            null :
            importedFile.substring(nodeModulesIndex + NODE_MODULES.length);
        var isGeneratedFile = IS_GENERATED.test(importedFile);
        if (isGeneratedFile) {
            // rewrite to genDir path
            if (importModule) {
                // it is generated, therefore we do a relative path to the factory
                return this.dotRelative(containingDir, this.genDir + NODE_MODULES + importModule);
            }
            else {
                // assume that import is also in `genDir`
                importedFile = this.rewriteGenDirPath(importedFile);
                return this.dotRelative(containingDir, importedFile);
            }
        }
        else {
            // user code import
            if (importModule) {
                return importModule;
            }
            else {
                if (!this.isGenDirChildOfRootDir) {
                    // assume that they are on top of each other.
                    importedFile = importedFile.replace(this.basePath, this.genDir);
                }
                return this.dotRelative(containingDir, importedFile);
            }
        }
    };
    ReflectorHost.prototype.dotRelative = function (from, to) {
        var rPath = path.relative(from, to).replace(/\\/g, '/');
        return rPath.startsWith('.') ? rPath : './' + rPath;
    };
    /**
     * Moves the path into `genDir` folder while preserving the `node_modules` directory.
     */
    ReflectorHost.prototype.rewriteGenDirPath = function (filepath) {
        var nodeModulesIndex = filepath.indexOf(NODE_MODULES);
        if (nodeModulesIndex !== -1) {
            // If we are in node_modulse, transplant them into `genDir`.
            return path.join(this.genDir, filepath.substring(nodeModulesIndex));
        }
        else {
            // pretend that containing file is on top of the `genDir` to normalize the paths.
            // we apply the `genDir` => `rootDir` delta through `rootDirPrefix` later.
            return filepath.replace(this.basePath, this.genDir);
        }
    };
    ReflectorHost.prototype.findDeclaration = function (module, symbolName, containingFile, containingModule) {
        if (!containingFile || !containingFile.length) {
            if (module.indexOf('.') === 0) {
                throw new Error('Resolution of relative paths requires a containing file.');
            }
            // Any containing file gives the same result for absolute imports
            containingFile = path.join(this.basePath, 'index.ts');
        }
        try {
            var assetUrl = this.normalizeAssetUrl(module);
            if (assetUrl) {
                module = assetUrl;
            }
            var filePath = this.resolve(module, containingFile);
            if (!filePath) {
                // If the file cannot be found the module is probably referencing a declared module
                // for which there is no disambiguating file and we also don't need to track
                // re-exports. Just use the module name.
                return this.getStaticSymbol(module, symbolName);
            }
            var tc = this.program.getTypeChecker();
            var sf = this.program.getSourceFile(filePath);
            if (!sf || !sf.symbol) {
                // The source file was not needed in the compile but we do need the values from
                // the corresponding .ts files stored in the .metadata.json file. Check the file
                // for exports to see if the file is exported.
                return this.resolveExportedSymbol(filePath, symbolName) ||
                    this.getStaticSymbol(filePath, symbolName);
            }
            var symbol = tc.getExportsOfModule(sf.symbol).find(function (m) { return m.name === symbolName; });
            if (!symbol) {
                throw new Error("can't find symbol " + symbolName + " exported from module " + filePath);
            }
            if (symbol &&
                symbol.flags & ts.SymbolFlags.Alias) {
                symbol = tc.getAliasedSymbol(symbol);
            }
            var declaration = symbol.getDeclarations()[0];
            var declarationFile = this.getCanonicalFileName(declaration.getSourceFile().fileName);
            return this.getStaticSymbol(declarationFile, symbol.getName());
        }
        catch (e) {
            console.error("can't resolve module " + module + " from " + containingFile);
            throw e;
        }
    };
    /**
     * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param declarationFile the absolute path of the file where the symbol is declared
     * @param name the name of the type.
     */
    ReflectorHost.prototype.getStaticSymbol = function (declarationFile, name, members) {
        var memberSuffix = members ? "." + members.join('.') : '';
        var key = "\"" + declarationFile + "\"." + name + memberSuffix;
        var result = this.typeCache.get(key);
        if (!result) {
            result = new static_reflector_1.StaticSymbol(declarationFile, name, members);
            this.typeCache.set(key, result);
        }
        return result;
    };
    ReflectorHost.prototype.getMetadataFor = function (filePath) {
        if (!this.context.fileExists(filePath)) {
            // If the file doesn't exists then we cannot return metadata for the file.
            // This will occur if the user refernced a declared module for which no file
            // exists for the module (i.e. jQuery or angularjs).
            return;
        }
        if (DTS.test(filePath)) {
            var metadataPath = filePath.replace(DTS, '.metadata.json');
            if (this.context.fileExists(metadataPath)) {
                var metadata = this.readMetadata(metadataPath);
                return (Array.isArray(metadata) && metadata.length == 0) ? undefined : metadata;
            }
        }
        else {
            var sf = this.program.getSourceFile(filePath);
            if (!sf) {
                throw new Error("Source file " + filePath + " not present in program.");
            }
            return this.metadataCollector.getMetadata(sf);
        }
    };
    ReflectorHost.prototype.readMetadata = function (filePath) {
        try {
            return this.resolverCache.get(filePath) || JSON.parse(this.context.readFile(filePath));
        }
        catch (e) {
            console.error("Failed to read JSON file " + filePath);
            throw e;
        }
    };
    ReflectorHost.prototype.getResolverMetadata = function (filePath) {
        var metadata = this.resolverCache.get(filePath);
        if (!metadata) {
            metadata = this.getMetadataFor(filePath);
            this.resolverCache.set(filePath, metadata);
        }
        return metadata;
    };
    ReflectorHost.prototype.resolveExportedSymbol = function (filePath, symbolName) {
        var _this = this;
        var resolveModule = function (moduleName) {
            var resolvedModulePath = _this.getCanonicalFileName(_this.resolve(moduleName, filePath));
            if (!resolvedModulePath) {
                throw new Error("Could not resolve module '" + moduleName + "' relative to file " + filePath);
            }
            return resolvedModulePath;
        };
        var metadata = this.getResolverMetadata(filePath);
        if (metadata) {
            // If we have metadata for the symbol, this is the original exporting location.
            if (metadata.metadata[symbolName]) {
                return this.getStaticSymbol(filePath, symbolName);
            }
            // If no, try to find the symbol in one of the re-export location
            if (metadata.exports) {
                // Try and find the symbol in the list of explicitly re-exported symbols.
                for (var _i = 0, _a = metadata.exports; _i < _a.length; _i++) {
                    var moduleExport = _a[_i];
                    if (moduleExport.export) {
                        var exportSymbol = moduleExport.export.find(function (symbol) {
                            if (typeof symbol === 'string') {
                                return symbol == symbolName;
                            }
                            else {
                                return symbol.as == symbolName;
                            }
                        });
                        if (exportSymbol) {
                            var symName = symbolName;
                            if (typeof exportSymbol !== 'string') {
                                symName = exportSymbol.name;
                            }
                            return this.resolveExportedSymbol(resolveModule(moduleExport.from), symName);
                        }
                    }
                }
                // Try to find the symbol via export * directives.
                for (var _b = 0, _c = metadata.exports; _b < _c.length; _b++) {
                    var moduleExport = _c[_b];
                    if (!moduleExport.export) {
                        var resolvedModule = resolveModule(moduleExport.from);
                        var candidateSymbol = this.resolveExportedSymbol(resolvedModule, symbolName);
                        if (candidateSymbol)
                            return candidateSymbol;
                    }
                }
            }
        }
        return null;
    };
    return ReflectorHost;
}());
exports.ReflectorHost = ReflectorHost;
var NodeReflectorHostContext = (function () {
    function NodeReflectorHostContext(host) {
        this.host = host;
        this.assumedExists = {};
    }
    NodeReflectorHostContext.prototype.fileExists = function (fileName) {
        return this.assumedExists[fileName] || this.host.fileExists(fileName);
    };
    NodeReflectorHostContext.prototype.directoryExists = function (directoryName) {
        try {
            return fs.statSync(directoryName).isDirectory();
        }
        catch (e) {
            return false;
        }
    };
    NodeReflectorHostContext.prototype.readFile = function (fileName) { return fs.readFileSync(fileName, 'utf8'); };
    NodeReflectorHostContext.prototype.assumeFileExists = function (fileName) { this.assumedExists[fileName] = true; };
    return NodeReflectorHostContext;
}());
exports.NodeReflectorHostContext = NodeReflectorHostContext;
//# sourceMappingURL=reflector_host.js.map