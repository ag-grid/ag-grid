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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { buildCentralDirectoryEnd, getDeflatedHeaderAndContent, getHeaderAndContent, } from './zipContainerHelper';
var ZipContainer = /** @class */ (function () {
    function ZipContainer() {
    }
    ZipContainer.addFolders = function (paths) {
        paths.forEach(this.addFolder.bind(this));
    };
    ZipContainer.addFolder = function (path) {
        this.folders.push({
            path: path,
            created: new Date(),
            isBase64: false,
            type: 'folder'
        });
    };
    ZipContainer.addFile = function (path, content, isBase64) {
        if (isBase64 === void 0) { isBase64 = false; }
        this.files.push({
            path: path,
            created: new Date(),
            content: isBase64 ? content : new TextEncoder().encode(content),
            isBase64: isBase64,
            type: 'file'
        });
    };
    ZipContainer.getZipFile = function (mimeType) {
        if (mimeType === void 0) { mimeType = 'application/zip'; }
        return __awaiter(this, void 0, void 0, function () {
            var textOutput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildCompressedFileStream()];
                    case 1:
                        textOutput = _a.sent();
                        this.clearStream();
                        return [2 /*return*/, new Blob([textOutput], { type: mimeType })];
                }
            });
        });
    };
    ZipContainer.getUncompressedZipFile = function (mimeType) {
        if (mimeType === void 0) { mimeType = 'application/zip'; }
        var textOutput = this.buildFileStream();
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    };
    ZipContainer.clearStream = function () {
        this.folders = [];
        this.files = [];
    };
    ZipContainer.packageFiles = function (files) {
        var e_1, _a;
        var fileData = new Uint8Array(0);
        var folderData = new Uint8Array(0);
        var filesContentAndHeaderLength = 0;
        var folderHeadersLength = 0;
        try {
            for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                var currentFile = files_1_1.value;
                var localFileHeader = currentFile.localFileHeader, centralDirectoryHeader = currentFile.centralDirectoryHeader, content = currentFile.content;
                // Append fileHeader to fData
                var dataWithHeader = new Uint8Array(fileData.length + localFileHeader.length);
                dataWithHeader.set(fileData);
                dataWithHeader.set(localFileHeader, fileData.length);
                fileData = dataWithHeader;
                // Append content to fData
                var dataWithContent = new Uint8Array(fileData.length + content.length);
                dataWithContent.set(fileData);
                dataWithContent.set(content, fileData.length);
                fileData = dataWithContent;
                // Append folder header to foData
                var folderDataWithFolderHeader = new Uint8Array(folderData.length + centralDirectoryHeader.length);
                folderDataWithFolderHeader.set(folderData);
                folderDataWithFolderHeader.set(centralDirectoryHeader, folderData.length);
                folderData = folderDataWithFolderHeader;
                filesContentAndHeaderLength += localFileHeader.length + content.length;
                folderHeadersLength += centralDirectoryHeader.length;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var folderEnd = buildCentralDirectoryEnd(files.length, folderHeadersLength, filesContentAndHeaderLength);
        // Append folder data and file data
        var result = new Uint8Array(fileData.length + folderData.length + folderEnd.length);
        result.set(fileData);
        result.set(folderData, fileData.length);
        result.set(folderEnd, fileData.length + folderData.length);
        return result;
    };
    ZipContainer.buildCompressedFileStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalFiles, readyFiles, lL, totalFiles_1, totalFiles_1_1, currentFile, output, localFileHeader, content, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        totalFiles = __spreadArray(__spreadArray([], __read(this.folders), false), __read(this.files), false);
                        readyFiles = [];
                        lL = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        totalFiles_1 = __values(totalFiles), totalFiles_1_1 = totalFiles_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!totalFiles_1_1.done) return [3 /*break*/, 5];
                        currentFile = totalFiles_1_1.value;
                        return [4 /*yield*/, getDeflatedHeaderAndContent(currentFile, lL)];
                    case 3:
                        output = _b.sent();
                        localFileHeader = output.localFileHeader, content = output.content;
                        readyFiles.push(output);
                        lL += localFileHeader.length + content.length;
                        _b.label = 4;
                    case 4:
                        totalFiles_1_1 = totalFiles_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (totalFiles_1_1 && !totalFiles_1_1.done && (_a = totalFiles_1.return)) _a.call(totalFiles_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, this.packageFiles(readyFiles)];
                }
            });
        });
    };
    ZipContainer.buildFileStream = function () {
        var e_3, _a;
        var totalFiles = __spreadArray(__spreadArray([], __read(this.folders), false), __read(this.files), false);
        var readyFiles = [];
        var lL = 0;
        try {
            for (var totalFiles_2 = __values(totalFiles), totalFiles_2_1 = totalFiles_2.next(); !totalFiles_2_1.done; totalFiles_2_1 = totalFiles_2.next()) {
                var currentFile = totalFiles_2_1.value;
                var readyFile = getHeaderAndContent(currentFile, lL);
                var localFileHeader = readyFile.localFileHeader, content = readyFile.content;
                readyFiles.push(readyFile);
                lL += localFileHeader.length + content.length;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (totalFiles_2_1 && !totalFiles_2_1.done && (_a = totalFiles_2.return)) _a.call(totalFiles_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return this.packageFiles(readyFiles);
    };
    ZipContainer.folders = [];
    ZipContainer.files = [];
    return ZipContainer;
}());
export { ZipContainer };
