import { TargetConfiguration } from '@nx/devkit';
import type { CreateDependencies } from 'nx/src/utils/nx-plugin';
export declare function createTask(parentProject: string, srcRelativeInputPath: string): Record<string, TargetConfiguration>;
export declare const createDependencies: CreateDependencies;
