/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../../context/context");
var utils_1 = require("../../../utils");
// table for crc calculation
// from: https://referencesource.microsoft.com/#System/sys/System/IO/compression/Crc32Helper.cs,3b31978c7d7f7246,references
var crcTable = [
    0, 1996959894, -301047508, -1727442502, 124634137, 1886057615, -379345611, -1637575261, 249268274,
    2044508324, -522852066, -1747789432, 162941995, 2125561021, -407360249, -1866523247, 498536548,
    1789927666, -205950648, -2067906082, 450548861, 1843258603, -187386543, -2083289657, 325883990,
    1684777152, -43845254, -1973040660, 335633487, 1661365465, -99664541, -1928851979, 997073096,
    1281953886, -715111964, -1570279054, 1006888145, 1258607687, -770865667, -1526024853, 901097722,
    1119000684, -608450090, -1396901568, 853044451, 1172266101, -589951537, -1412350631, 651767980,
    1373503546, -925412992, -1076862698, 565507253, 1454621731, -809855591, -1195530993, 671266974,
    1594198024, -972236366, -1324619484, 795835527, 1483230225, -1050600021, -1234817731, 1994146192,
    31158534, -1731059524, -271249366, 1907459465, 112637215, -1614814043, -390540237, 2013776290,
    251722036, -1777751922, -519137256, 2137656763, 141376813, -1855689577, -429695999, 1802195444,
    476864866, -2056965928, -228458418, 1812370925, 453092731, -2113342271, -183516073, 1706088902,
    314042704, -1950435094, -54949764, 1658658271, 366619977, -1932296973, -69972891, 1303535960,
    984961486, -1547960204, -725929758, 1256170817, 1037604311, -1529756563, -740887301, 1131014506,
    879679996, -1385723834, -631195440, 1141124467, 855842277, -1442165665, -586318647, 1342533948,
    654459306, -1106571248, -921952122, 1466479909, 544179635, -1184443383, -832445281, 1591671054,
    702138776, -1328506846, -942167884, 1504918807, 783551873, -1212326853, -1061524307, -306674912,
    -1698712650, 62317068, 1957810842, -355121351, -1647151185, 81470997, 1943803523, -480048366,
    -1805370492, 225274430, 2053790376, -468791541, -1828061283, 167816743, 2097651377, -267414716,
    -2029476910, 503444072, 1762050814, -144550051, -2140837941, 426522225, 1852507879, -19653770,
    -1982649376, 282753626, 1742555852, -105259153, -1900089351, 397917763, 1622183637, -690576408,
    -1580100738, 953729732, 1340076626, -776247311, -1497606297, 1068828381, 1219638859, -670225446,
    -1358292148, 906185462, 1090812512, -547295293, -1469587627, 829329135, 1181335161, -882789492,
    -1134132454, 628085408, 1382605366, -871598187, -1156888829, 570562233, 1426400815, -977650754,
    -1296233688, 733239954, 1555261956, -1026031705, -1244606671, 752459403, 1541320221, -1687895376,
    -328994266, 1969922972, 40735498, -1677130071, -351390145, 1913087877, 83908371, -1782625662,
    -491226604, 2075208622, 213261112, -1831694693, -438977011, 2094854071, 198958881, -2032938284,
    -237706686, 1759359992, 534414190, -2118248755, -155638181, 1873836001, 414664567, -2012718362,
    -15766928, 1711684554, 285281116, -1889165569, -127750551, 1634467795, 376229701, -1609899400,
    -686959890, 1308918612, 956543938, -1486412191, -799009033, 1231636301, 1047427035, -1362007478,
    -640263460, 1088359270, 936918000, -1447252397, -558129467, 1202900863, 817233897, -1111625188,
    -893730166, 1404277552, 615818150, -1160759803, -841546093, 1423857449, 601450431, -1285129682,
    -1000256840, 1567103746, 711928724, -1274298825, -1022587231, 1510334235, 755167117
];
var ZipContainer = /** @class */ (function () {
    function ZipContainer() {
        var _this = this;
        this.folders = [];
        this.files = [];
        this.addFolder = function (path) {
            _this.folders.push({
                path: path,
                created: new Date()
            });
        };
    }
    ZipContainer.prototype.addFolders = function (paths) {
        paths.forEach(this.addFolder);
    };
    ZipContainer.prototype.addFile = function (path, content) {
        this.files.push({
            path: path,
            created: new Date(),
            content: content
        });
    };
    ZipContainer.prototype.clearStream = function () {
        this.folders = [];
        this.files = [];
    };
    ZipContainer.prototype.getContent = function (mimeType) {
        if (mimeType === void 0) { mimeType = 'application/zip'; }
        var textOutput = this.buildFileStream();
        var uInt8Output = this.buildUint8Array(textOutput);
        this.clearStream();
        return new Blob([uInt8Output], { type: mimeType });
    };
    ZipContainer.prototype.buildFileStream = function (fData) {
        if (fData === void 0) { fData = ''; }
        var totalFiles = this.folders.concat(this.files);
        var len = totalFiles.length;
        var foData = '';
        var lL = 0;
        var cL = 0;
        for (var _i = 0, totalFiles_1 = totalFiles; _i < totalFiles_1.length; _i++) {
            var currentFile = totalFiles_1[_i];
            var _a = this.getHeader(currentFile, lL), fileHeader = _a.fileHeader, folderHeader = _a.folderHeader, content = _a.content;
            lL += fileHeader.length + content.length;
            cL += folderHeader.length;
            fData += fileHeader + content;
            foData += folderHeader;
        }
        var foEnd = this.buildFolderEnd(len, cL, lL);
        return fData + foData + foEnd;
    };
    ZipContainer.prototype.getHeader = function (currentFile, offset) {
        var content = currentFile.content, path = currentFile.path, created = currentFile.created;
        var utf8_encode = utils_1._.utf8_encode, decToHex = utils_1._.decToHex;
        var utfPath = utf8_encode(path);
        var isUTF8 = utfPath !== path;
        var time = this.convertTime(created);
        var dt = this.convertDate(created);
        var extraFields = '';
        if (isUTF8) {
            var uExtraFieldPath = decToHex(1, 1) + decToHex(this.getFromCrc32Table(utfPath), 4) + utfPath;
            extraFields = "\x75\x70" + decToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
        }
        var header = '\x0A\x00' +
            (isUTF8 ? '\x00\x08' : '\x00\x00') +
            '\x00\x00' +
            decToHex(time, 2) + // last modified time
            decToHex(dt, 2) + // last modified date
            decToHex(content ? this.getFromCrc32Table(content) : 0, 4) +
            decToHex(content ? content.length : 0, 4) + // compressed size
            decToHex(content ? content.length : 0, 4) + // uncompressed size
            decToHex(utfPath.length, 2) + // file name length
            decToHex(extraFields.length, 2); // extra field length
        var fileHeader = 'PK\x03\x04' + header + utfPath + extraFields;
        var folderHeader = 'PK\x01\x02' + // central header
            '\x14\x00' +
            header + // file header
            '\x00\x00' +
            '\x00\x00' +
            '\x00\x00' +
            (content ? '\x00\x00\x00\x00' : '\x10\x00\x00\x00') + // external file attributes
            decToHex(offset, 4) + // relative offset of local header
            utfPath + // file name
            extraFields; // extra field
        return { fileHeader: fileHeader, folderHeader: folderHeader, content: content || '' };
    };
    ZipContainer.prototype.buildFolderEnd = function (tLen, cLen, lLen) {
        var decToHex = utils_1._.decToHex;
        return 'PK\x05\x06' + // central folder end
            '\x00\x00' +
            '\x00\x00' +
            decToHex(tLen, 2) + // total number of entries in the central folder
            decToHex(tLen, 2) + // total number of entries in the central folder
            decToHex(cLen, 4) + // size of the central folder
            decToHex(lLen, 4) + // central folder start offset
            '\x00\x00';
    };
    ZipContainer.prototype.buildUint8Array = function (content) {
        var uint8 = new Uint8Array(content.length);
        for (var i = 0; i < uint8.length; i++) {
            uint8[i] = content.charCodeAt(i);
        }
        return uint8;
    };
    ZipContainer.prototype.getFromCrc32Table = function (content, crc) {
        if (crc === void 0) { crc = 0; }
        if (!content.length) {
            return 0;
        }
        crc ^= (-1);
        var j = 0;
        var k = 0;
        var l = 0;
        for (var i = 0; i < content.length; i++) {
            j = content.charCodeAt(i);
            k = (crc ^ j) & 0xFF;
            l = crcTable[k];
            crc = (crc >>> 8) ^ l;
        }
        return crc ^ (-1);
    };
    ZipContainer.prototype.convertTime = function (date) {
        var time = date.getHours();
        time <<= 6;
        time = time | date.getMinutes();
        time <<= 5;
        time = time | date.getSeconds() / 2;
        return time;
    };
    ZipContainer.prototype.convertDate = function (date) {
        var dt = date.getFullYear() - 1980;
        dt <<= 4;
        dt = dt | (date.getMonth() + 1);
        dt <<= 5;
        dt = dt | date.getDate();
        return dt;
    };
    ZipContainer = __decorate([
        context_1.Bean('zipContainer')
    ], ZipContainer);
    return ZipContainer;
}());
exports.ZipContainer = ZipContainer;
