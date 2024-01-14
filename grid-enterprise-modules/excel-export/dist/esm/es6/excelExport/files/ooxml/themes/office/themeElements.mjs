import colorScheme from './colorScheme.mjs';
import fontScheme from './fontScheme.mjs';
import formatScheme from './formatScheme.mjs';
const themeElements = {
    getTemplate() {
        return {
            name: "a:themeElements",
            children: [
                colorScheme.getTemplate(),
                fontScheme.getTemplate(),
                formatScheme.getTemplate()
            ]
        };
    }
};
export default themeElements;
