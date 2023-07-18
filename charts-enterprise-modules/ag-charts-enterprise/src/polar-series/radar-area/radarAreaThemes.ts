import { RADAR_SERIES_THEME } from '../radar/radarThemes';

export const RADAR_AREA_SERIES_THEME = {
    ...RADAR_SERIES_THEME,
    fillOpacity: 0.8,
    strokeWidth: 2,
    marker: {
        ...RADAR_SERIES_THEME.marker,
        enabled: false,
    },
};
