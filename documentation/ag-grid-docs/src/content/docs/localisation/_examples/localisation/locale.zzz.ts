import { AG_GRID_LOCALE_EN } from './locale.en';

export const AG_GRID_LOCALE_ZZZ: Record<string, string> = {};

// Create a dummy locale based on english but prefix everything with zzz
Object.keys(AG_GRID_LOCALE_EN).forEach(function(key) {
    if (key === 'thousandSeparator' || key === 'decimalSeparator') { return; }
    AG_GRID_LOCALE_ZZZ[key] = 'zzz-' + AG_GRID_LOCALE_EN[key];
});
