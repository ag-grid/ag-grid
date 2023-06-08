import colorScheme from './colorScheme';
import fontScheme from './fontScheme';
import formatScheme from './formatScheme';
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
