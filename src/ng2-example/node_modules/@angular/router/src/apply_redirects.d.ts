/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Routes } from './config';
import { RouterConfigLoader } from './router_config_loader';
import { UrlTree } from './url_tree';
export declare function applyRedirects(injector: Injector, configLoader: RouterConfigLoader, urlTree: UrlTree, config: Routes): Observable<UrlTree>;
