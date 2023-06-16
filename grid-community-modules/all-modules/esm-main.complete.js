export * from './dist/esm/es6/main';

import {AllCommunityModules, ModuleRegistry} from "./dist/esm/es6/main";
ModuleRegistry.registerModules(AllCommunityModules);
