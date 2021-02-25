var AG_GRID_LOCALE_ZZZ = {};

// Create a dummy locale based on english but prefix everything with zzz
Object.keys(AG_GRID_LOCALE_EN).forEach(function(key) {
    AG_GRID_LOCALE_ZZZ[key] = 'zzz-' + AG_GRID_LOCALE_EN[key];
});
