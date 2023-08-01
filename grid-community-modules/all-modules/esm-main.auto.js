export * from './dist/esm/es5/main';

import {AllCommunityModules, ModuleRegistry} from "./dist/esm/es5/main";
ModuleRegistry.registerModules(AllCommunityModules);
