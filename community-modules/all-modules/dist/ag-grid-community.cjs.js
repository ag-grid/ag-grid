/**
          * @ag-grid-community/all-modules - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.2.1
          * @link https://www.ag-grid.com/
          * @license MIT
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var clientSideRowModel = require('@ag-grid-community/client-side-row-model');
var infiniteRowModel = require('@ag-grid-community/infinite-row-model');
var csvExport = require('@ag-grid-community/csv-export');
var core = require('@ag-grid-community/core');

var AllCommunityModules = [clientSideRowModel.ClientSideRowModelModule, infiniteRowModel.InfiniteRowModelModule, csvExport.CsvExportModule];

exports.AllCommunityModules = AllCommunityModules;
Object.keys(clientSideRowModel).forEach(function (k) {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return clientSideRowModel[k]; }
	});
});
Object.keys(infiniteRowModel).forEach(function (k) {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return infiniteRowModel[k]; }
	});
});
Object.keys(csvExport).forEach(function (k) {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return csvExport[k]; }
	});
});
Object.keys(core).forEach(function (k) {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return core[k]; }
	});
});
