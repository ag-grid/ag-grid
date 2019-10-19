import { configure, addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";

// import theme from "./theme";

// addParameters({
//   options: {
//     theme: theme
//   }
// });

addDecorator(withKnobs);

// automatically import all files ending in *.stories.js
configure(require.context("../stories", true, /\.stories\.js$/), module);
