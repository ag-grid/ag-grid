// Metadata Schema
"use strict";
// If you make a backwards incompatible change to the schema, increment the VERSION number.
// If you make a backwards compatible change to the metadata (such as adding an option field) then
// leave VERSION the same. If possible, as many versions of the metadata that can represent the
// semantics of the file in an array. For example, when generating a version 2 file, if version 1
// can accurately represent the metadata, generate both version 1 and version 2 in an array.
exports.VERSION = 1;
function isModuleMetadata(value) {
    return value && value.__symbolic === 'module';
}
exports.isModuleMetadata = isModuleMetadata;
function isClassMetadata(value) {
    return value && value.__symbolic === 'class';
}
exports.isClassMetadata = isClassMetadata;
function isMemberMetadata(value) {
    if (value) {
        switch (value.__symbolic) {
            case 'constructor':
            case 'method':
            case 'property':
                return true;
        }
    }
    return false;
}
exports.isMemberMetadata = isMemberMetadata;
function isMethodMetadata(value) {
    return value && (value.__symbolic === 'constructor' || value.__symbolic === 'method');
}
exports.isMethodMetadata = isMethodMetadata;
function isConstructorMetadata(value) {
    return value && value.__symbolic === 'constructor';
}
exports.isConstructorMetadata = isConstructorMetadata;
function isFunctionMetadata(value) {
    return value && value.__symbolic === 'function';
}
exports.isFunctionMetadata = isFunctionMetadata;
function isMetadataSymbolicExpression(value) {
    if (value) {
        switch (value.__symbolic) {
            case 'binary':
            case 'call':
            case 'index':
            case 'new':
            case 'pre':
            case 'reference':
            case 'select':
            case 'spread':
            case 'if':
                return true;
        }
    }
    return false;
}
exports.isMetadataSymbolicExpression = isMetadataSymbolicExpression;
function isMetadataSymbolicBinaryExpression(value) {
    return value && value.__symbolic === 'binary';
}
exports.isMetadataSymbolicBinaryExpression = isMetadataSymbolicBinaryExpression;
function isMetadataSymbolicIndexExpression(value) {
    return value && value.__symbolic === 'index';
}
exports.isMetadataSymbolicIndexExpression = isMetadataSymbolicIndexExpression;
function isMetadataSymbolicCallExpression(value) {
    return value && (value.__symbolic === 'call' || value.__symbolic === 'new');
}
exports.isMetadataSymbolicCallExpression = isMetadataSymbolicCallExpression;
function isMetadataSymbolicPrefixExpression(value) {
    return value && value.__symbolic === 'pre';
}
exports.isMetadataSymbolicPrefixExpression = isMetadataSymbolicPrefixExpression;
function isMetadataSymbolicIfExpression(value) {
    return value && value.__symbolic === 'if';
}
exports.isMetadataSymbolicIfExpression = isMetadataSymbolicIfExpression;
function isMetadataGlobalReferenceExpression(value) {
    return value && value.name && !value.module && isMetadataSymbolicReferenceExpression(value);
}
exports.isMetadataGlobalReferenceExpression = isMetadataGlobalReferenceExpression;
function isMetadataModuleReferenceExpression(value) {
    return value && value.module && !value.name && !value.default &&
        isMetadataSymbolicReferenceExpression(value);
}
exports.isMetadataModuleReferenceExpression = isMetadataModuleReferenceExpression;
function isMetadataImportedSymbolReferenceExpression(value) {
    return value && value.module && !!value.name && isMetadataSymbolicReferenceExpression(value);
}
exports.isMetadataImportedSymbolReferenceExpression = isMetadataImportedSymbolReferenceExpression;
function isMetadataImportDefaultReference(value) {
    return value.module && value.default && isMetadataSymbolicReferenceExpression(value);
}
exports.isMetadataImportDefaultReference = isMetadataImportDefaultReference;
function isMetadataSymbolicReferenceExpression(value) {
    return value && value.__symbolic === 'reference';
}
exports.isMetadataSymbolicReferenceExpression = isMetadataSymbolicReferenceExpression;
function isMetadataSymbolicSelectExpression(value) {
    return value && value.__symbolic === 'select';
}
exports.isMetadataSymbolicSelectExpression = isMetadataSymbolicSelectExpression;
function isMetadataSymbolicSpreadExpression(value) {
    return value && value.__symbolic === 'spread';
}
exports.isMetadataSymbolicSpreadExpression = isMetadataSymbolicSpreadExpression;
function isMetadataError(value) {
    return value && value.__symbolic === 'error';
}
exports.isMetadataError = isMetadataError;
//# sourceMappingURL=schema.js.map