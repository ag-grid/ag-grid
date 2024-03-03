import favIcon32 from './favicon-32.png';
import favIcon128 from './favicon-128.png';
import favIcon152Touch from './favicon-152-touch.png';
import favIcon152 from './favicon-152.png';
import favIcon167Touch from './favicon-167-touch.png';
import favIcon167 from './favicon-167.png';
import favIcon180Touch from './favicon-180-touch.png';
import favIcon180 from './favicon-180.png';
import favIcon192 from './favicon-192.png';
import favIcon196 from './favicon-196.png';

const favIcons = {
    favIcon32,
    favIcon128,
    favIcon152,
    favIcon152Touch,
    favIcon167,
    favIcon167Touch,
    favIcon180,
    favIcon180Touch,
    favIcon192,
    favIcon196,
};

export const FAVICON_SIZES = [196, 192, 180, 167, 152, 128, 32];
export const APPLE_TOUCH_SIZES = [180, 167, 152];

export const getFavIconsData = (): { size: number; icon: string }[] => {
    return FAVICON_SIZES.map((size) => ({
        size,
        icon: favIcons[`favIcon${size}` as keyof typeof favIcons].src,
    }));
};

export const getAppleTouchIconsData = (): { size: number; icon: string }[] => {
    return APPLE_TOUCH_SIZES.map((size) => ({
        size,
        icon: favIcons[`favIcon${size}Touch` as keyof typeof favIcons].src,
    }));
};
