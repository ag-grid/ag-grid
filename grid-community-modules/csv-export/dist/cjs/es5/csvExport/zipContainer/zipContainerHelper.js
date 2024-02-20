"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecodedContent = exports.convertStringToByteArray = exports.buildCentralDirectoryEnd = exports.getHeaderAndContent = exports.getDeflatedHeaderAndContent = void 0;
var core_1 = require("@ag-grid-community/core");
var convert_1 = require("./convert");
var crcTable_1 = require("./crcTable");
var compress_1 = require("./compress");
var utf8_encode = core_1._.utf8_encode;
var getDeflatedHeaderAndContent = function (currentFile, offset) { return __awaiter(void 0, void 0, void 0, function () {
    var content, _a, size, rawContent, deflatedContent, deflatedSize, deflationPerformed, shouldDeflate, result, headers;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                content = currentFile.content;
                _a = !content
                    ? ({ size: 0, content: Uint8Array.from([]) })
                    : (0, exports.getDecodedContent)(content), size = _a.size, rawContent = _a.content;
                deflatedContent = undefined;
                deflatedSize = undefined;
                deflationPerformed = false;
                shouldDeflate = currentFile.type === 'file' && rawContent && size > 0;
                if (!shouldDeflate) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, compress_1.deflateLocalFile)(rawContent)];
            case 1:
                result = _b.sent();
                deflatedContent = result.content;
                deflatedSize = result.size;
                deflationPerformed = true;
                _b.label = 2;
            case 2:
                headers = getHeaders(currentFile, deflationPerformed, offset, size, rawContent, deflatedSize);
                return [2 /*return*/, __assign(__assign({}, headers), { content: deflatedContent || rawContent, isCompressed: deflationPerformed })];
        }
    });
}); };
exports.getDeflatedHeaderAndContent = getDeflatedHeaderAndContent;
var getHeaderAndContent = function (currentFile, offset) {
    var content = currentFile.content;
    var rawContent = (!content
        ? ({ content: Uint8Array.from([]) })
        : (0, exports.getDecodedContent)(content)).content;
    var headers = getHeaders(currentFile, false, offset, rawContent.length, rawContent, undefined);
    return __assign(__assign({}, headers), { content: rawContent, isCompressed: false });
};
exports.getHeaderAndContent = getHeaderAndContent;
var getHeaders = function (currentFile, isCompressed, offset, rawSize, rawContent, deflatedSize) {
    var content = currentFile.content, path = currentFile.path, creationDate = currentFile.created;
    var time = (0, convert_1.convertTime)(creationDate);
    var dt = (0, convert_1.convertDate)(creationDate);
    var crcFlag = (0, crcTable_1.getCrcFromCrc32Table)(rawContent);
    var zipSize = deflatedSize !== undefined ? deflatedSize : rawSize;
    var utfPath = utf8_encode(path);
    var isUTF8 = utfPath !== path;
    var extraFields = '';
    if (isUTF8) {
        var uExtraFieldPath = (0, convert_1.convertDecToHex)(1, 1) + (0, convert_1.convertDecToHex)((0, crcTable_1.getCrcFromCrc32Table)(utfPath), 4) + utfPath;
        extraFields = "\x75\x70" + (0, convert_1.convertDecToHex)(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }
    var commonHeader = '\x14\x00' + // version needed to extract
        (isUTF8 ? '\x00\x08' : '\x00\x00') + // Language encoding flag (EFS) (12th bit turned on)
        (0, convert_1.convertDecToHex)(isCompressed ? 8 : 0, 2) + // As per ECMA-376 Part 2 specs
        (0, convert_1.convertDecToHex)(time, 2) + // last modified time
        (0, convert_1.convertDecToHex)(dt, 2) + // last modified date
        (0, convert_1.convertDecToHex)(zipSize ? crcFlag : 0, 4) +
        (0, convert_1.convertDecToHex)(deflatedSize !== null && deflatedSize !== void 0 ? deflatedSize : rawSize, 4) + // compressed size
        (0, convert_1.convertDecToHex)(rawSize, 4) + // uncompressed size
        (0, convert_1.convertDecToHex)(utfPath.length, 2) + // file name length
        (0, convert_1.convertDecToHex)(extraFields.length, 2); // extra field length
    var localFileHeader = 'PK\x03\x04' + commonHeader + utfPath + extraFields;
    var centralDirectoryHeader = 'PK\x01\x02' + // central header
        '\x14\x00' +
        commonHeader + // file header
        '\x00\x00' +
        '\x00\x00' +
        '\x00\x00' +
        (content ? '\x00\x00\x00\x00' : '\x10\x00\x00\x00') + // external file attributes
        (0, convert_1.convertDecToHex)(offset, 4) + // relative offset of local header
        utfPath + // file name
        extraFields; // extra field
    return {
        localFileHeader: Uint8Array.from(localFileHeader, function (c) { return c.charCodeAt(0); }),
        centralDirectoryHeader: Uint8Array.from(centralDirectoryHeader, function (c) { return c.charCodeAt(0); }),
    };
};
var buildCentralDirectoryEnd = function (tLen, cLen, lLen) {
    var str = 'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        (0, convert_1.convertDecToHex)(tLen, 2) + // total number of entries in the central folder
        (0, convert_1.convertDecToHex)(tLen, 2) + // total number of entries in the central folder
        (0, convert_1.convertDecToHex)(cLen, 4) + // size of the central folder
        (0, convert_1.convertDecToHex)(lLen, 4) + // central folder start offset
        '\x00\x00';
    return Uint8Array.from(str, function (c) { return c.charCodeAt(0); });
};
exports.buildCentralDirectoryEnd = buildCentralDirectoryEnd;
var convertStringToByteArray = function (str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
};
exports.convertStringToByteArray = convertStringToByteArray;
var getDecodedContent = function (content) {
    var contentToUse;
    // base64 content is passed as string
    if (typeof content === 'string') {
        var base64String = atob(content.split(';base64,')[1]);
        contentToUse = (0, exports.convertStringToByteArray)(base64String);
    }
    else {
        contentToUse = content;
    }
    return {
        size: contentToUse.length,
        content: contentToUse,
    };
};
exports.getDecodedContent = getDecodedContent;
