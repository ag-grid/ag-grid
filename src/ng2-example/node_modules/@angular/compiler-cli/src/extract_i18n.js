#!/usr/bin/env node
"use strict";
require('reflect-metadata');
var compiler = require('@angular/compiler');
var core_1 = require('@angular/core');
var path = require('path');
var tsc = require('@angular/tsc-wrapped');
var private_import_compiler_1 = require('./private_import_compiler');
var private_import_core_1 = require('./private_import_core');
var reflector_host_1 = require('./reflector_host');
var static_reflection_capabilities_1 = require('./static_reflection_capabilities');
var static_reflector_1 = require('./static_reflector');
function extract(ngOptions, cliOptions, program, host) {
    var htmlParser = new compiler.I18NHtmlParser(new private_import_compiler_1.HtmlParser());
    var extractor = Extractor.create(ngOptions, cliOptions.i18nFormat, program, host, htmlParser);
    var bundlePromise = extractor.extract();
    return (bundlePromise).then(function (messageBundle) {
        var ext;
        var serializer;
        var format = (cliOptions.i18nFormat || 'xlf').toLowerCase();
        switch (format) {
            case 'xmb':
                ext = 'xmb';
                serializer = new compiler.Xmb();
                break;
            case 'xliff':
            case 'xlf':
            default:
                ext = 'xlf';
                serializer = new compiler.Xliff(htmlParser, compiler.DEFAULT_INTERPOLATION_CONFIG);
                break;
        }
        var dstPath = path.join(ngOptions.genDir, "messages." + ext);
        host.writeFile(dstPath, messageBundle.write(serializer), false);
    });
}
var GENERATED_FILES = /\.ngfactory\.ts$|\.css\.ts$|\.css\.shim\.ts$/;
var Extractor = (function () {
    function Extractor(program, host, staticReflector, messageBundle, reflectorHost, metadataResolver, directiveNormalizer, compiler) {
        this.program = program;
        this.host = host;
        this.staticReflector = staticReflector;
        this.messageBundle = messageBundle;
        this.reflectorHost = reflectorHost;
        this.metadataResolver = metadataResolver;
        this.directiveNormalizer = directiveNormalizer;
        this.compiler = compiler;
    }
    Extractor.prototype.readFileMetadata = function (absSourcePath) {
        var moduleMetadata = this.staticReflector.getModuleMetadata(absSourcePath);
        var result = { components: [], ngModules: [], fileUrl: absSourcePath };
        if (!moduleMetadata) {
            console.log("WARNING: no metadata found for " + absSourcePath);
            return result;
        }
        var metadata = moduleMetadata['metadata'];
        var symbols = metadata && Object.keys(metadata);
        if (!symbols || !symbols.length) {
            return result;
        }
        var _loop_1 = function(symbol) {
            if (metadata[symbol] && metadata[symbol].__symbolic == 'error') {
                // Ignore symbols that are only included to record error information.
                return "continue";
            }
            var staticType = this_1.reflectorHost.findDeclaration(absSourcePath, symbol, absSourcePath);
            var annotations = this_1.staticReflector.annotations(staticType);
            annotations.forEach(function (annotation) {
                if (annotation instanceof core_1.NgModule) {
                    result.ngModules.push(staticType);
                }
                else if (annotation instanceof core_1.Component) {
                    result.components.push(staticType);
                }
            });
        };
        var this_1 = this;
        for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
            var symbol = symbols_1[_i];
            _loop_1(symbol);
        }
        return result;
    };
    Extractor.prototype.extract = function () {
        var _this = this;
        var filePaths = this.program.getSourceFiles().map(function (sf) { return sf.fileName; }).filter(function (f) { return !GENERATED_FILES.test(f); });
        var fileMetas = filePaths.map(function (filePath) { return _this.readFileMetadata(filePath); });
        var ngModules = fileMetas.reduce(function (ngModules, fileMeta) {
            ngModules.push.apply(ngModules, fileMeta.ngModules);
            return ngModules;
        }, []);
        var analyzedNgModules = this.compiler.analyzeModules(ngModules);
        var errors = [];
        var bundlePromise = Promise
            .all(fileMetas.map(function (fileMeta) {
            var url = fileMeta.fileUrl;
            return Promise.all(fileMeta.components.map(function (compType) {
                var compMeta = _this.metadataResolver.getDirectiveMetadata(compType);
                var ngModule = analyzedNgModules.ngModuleByComponent.get(compType);
                if (!ngModule) {
                    throw new Error("Cannot determine the module for component " + compMeta.type.name + "!");
                }
                return Promise
                    .all([compMeta].concat(ngModule.transitiveModule.directives).map(function (dirMeta) {
                    return _this.directiveNormalizer.normalizeDirective(dirMeta).asyncResult;
                }))
                    .then(function (normalizedCompWithDirectives) {
                    var compMeta = normalizedCompWithDirectives[0];
                    var html = compMeta.template.template;
                    var interpolationConfig = compiler.InterpolationConfig.fromArray(compMeta.template.interpolation);
                    errors.push.apply(errors, _this.messageBundle.updateFromTemplate(html, url, interpolationConfig));
                });
            }));
        }))
            .then(function (_) { return _this.messageBundle; });
        if (errors.length) {
            throw new Error(errors.map(function (e) { return e.toString(); }).join('\n'));
        }
        return bundlePromise;
    };
    Extractor.create = function (options, translationsFormat, program, compilerHost, htmlParser, reflectorHostContext) {
        var resourceLoader = {
            get: function (s) {
                if (!compilerHost.fileExists(s)) {
                    // TODO: We should really have a test for error cases like this!
                    throw new Error("Compilation failed. Resource file not found: " + s);
                }
                return Promise.resolve(compilerHost.readFile(s));
            }
        };
        var urlResolver = compiler.createOfflineCompileUrlResolver();
        var reflectorHost = new reflector_host_1.ReflectorHost(program, compilerHost, options, reflectorHostContext);
        var staticReflector = new static_reflector_1.StaticReflector(reflectorHost);
        static_reflection_capabilities_1.StaticAndDynamicReflectionCapabilities.install(staticReflector);
        var config = new compiler.CompilerConfig({
            genDebugInfo: options.debug === true,
            defaultEncapsulation: core_1.ViewEncapsulation.Emulated,
            logBindingUpdate: false,
            useJit: false
        });
        var normalizer = new private_import_compiler_1.DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
        var expressionParser = new private_import_compiler_1.Parser(new private_import_compiler_1.Lexer());
        var elementSchemaRegistry = new private_import_compiler_1.DomElementSchemaRegistry();
        var console = new private_import_core_1.Console();
        var tmplParser = new private_import_compiler_1.TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, console, []);
        var resolver = new private_import_compiler_1.CompileMetadataResolver(new compiler.NgModuleResolver(staticReflector), new compiler.DirectiveResolver(staticReflector), new compiler.PipeResolver(staticReflector), elementSchemaRegistry, staticReflector);
        var offlineCompiler = new compiler.OfflineCompiler(resolver, normalizer, tmplParser, new private_import_compiler_1.StyleCompiler(urlResolver), new private_import_compiler_1.ViewCompiler(config), new private_import_compiler_1.NgModuleCompiler(), new private_import_compiler_1.TypeScriptEmitter(reflectorHost), null, null);
        // TODO(vicb): implicit tags & attributes
        var messageBundle = new compiler.MessageBundle(htmlParser, [], {});
        return new Extractor(program, compilerHost, staticReflector, messageBundle, reflectorHost, resolver, normalizer, offlineCompiler);
    };
    return Extractor;
}());
exports.Extractor = Extractor;
// Entry point
if (require.main === module) {
    var args = require('minimist')(process.argv.slice(2));
    var project = args.p || args.project || '.';
    var cliOptions = new tsc.I18nExtractionCliOptions(args);
    tsc.main(project, cliOptions, extract)
        .then(function (exitCode) { return process.exit(exitCode); })
        .catch(function (e) {
        console.error(e.stack);
        console.error('Extraction failed');
        process.exit(1);
    });
}
//# sourceMappingURL=extract_i18n.js.map