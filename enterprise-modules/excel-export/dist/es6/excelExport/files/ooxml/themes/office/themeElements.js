import colorScheme from './colorScheme';
import fontScheme from './fontScheme';
import formatScheme from './formatScheme';
var themeElements = {
    getTemplate: function () {
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
