

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { PageRequest, PageResponse } from './zlux-paging.interfaces';
import { LinkedPagingProxy } from './zlux-paging-abstract-proxies';
export declare class PrefetchPagingProxy extends LinkedPagingProxy {
    protected prefetchBlockSize: number;
    protected prefetchMargin: number;
    protected cacheIdentityKey: string;
    protected prefetchedPageResponse: PageResponse;
    protected prefetchObs: Observable<PageResponse>;
    constructor(prefetchBlockSize: number, prefetchMargin: number, cacheIdentityKey?: string);
    validateRequest(dataRequest: PageRequest): boolean;
    canFetch(dataRequest: PageRequest): boolean;
    shouldPrefetch(dataRequest: PageRequest): boolean;
    prefetch(dataRequest: PageRequest): void;
    fetchOwnData(dataRequest: PageRequest): Observable<PageResponse>;
    makeDataRequestForParent(dataRequest: PageRequest): PageRequest;
    handleParentResponse(proxyObserver: Observer<PageResponse>, parentResponse: PageResponse, dataRequest: PageRequest, parentRequest: PageRequest): void;
    handleParentError(proxyObserver: Observer<PageResponse>, error: any, dataRequest: PageRequest, parentRequest: PageRequest): void;
}
export declare class CachingPagingProxy extends LinkedPagingProxy {
    protected cacheIdentityKey: string;
    protected cacheId: string;
    protected cachedData: Array<any>;
    protected cachedPageResponse: PageResponse;
    constructor(cacheIdentityKey: string);
    clearCache(): void;
    canFetch(dataRequest: PageRequest): boolean;
    checkCache(dataRequest: PageRequest): number;
    fetchOwnData(dataRequest: PageRequest): Observable<PageResponse>;
    makeDataRequestForParent(dataRequest: PageRequest): PageRequest;
    handleParentResponse(proxyObserver: Observer<PageResponse>, parentResponse: PageResponse, dataRequest: PageRequest, parentRequest: PageRequest): void;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

