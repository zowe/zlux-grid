

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { PagingProxy, PageRequest, PageResponse } from './zlux-paging.interfaces';
import { LinkedPagingProxy } from './zlux-paging-abstract-proxies';

// Later it might be worth it to make a non-caching PrefetchPagingProxy -
// one that operates under assumption that there's a caching proxy somewhere higher in the paging chain.
export class PrefetchPagingProxy extends LinkedPagingProxy {
  protected prefetchedPageResponse: PageResponse;
  protected prefetchObs: Observable<PageResponse>;

  constructor(protected prefetchBlockSize: number, protected prefetchMargin: number, protected cacheIdentityKey?: string) {
    super();
  }

  validateRequest(dataRequest: PageRequest): boolean {
    // XXX: quite a "meh" way out of this situation, should be upgraded when time permits
    if (this.prefetchObs && !this.canFetch(dataRequest)) {
      throw new Error('PrefetchPagingProxy can\'t serve more pages while waiting for prefetch to complete.');
    }
    return true;
  }

  canFetch(dataRequest: PageRequest): boolean {
    if (!this.prefetchedPageResponse) {
      return false;
    } else {
      if (this.cacheIdentityKey && dataRequest.customData && this.prefetchedPageResponse.customData) {
        if (this.prefetchedPageResponse.customData[this.cacheIdentityKey] !== dataRequest.customData[this.cacheIdentityKey]) {
          this.prefetchedPageResponse = null;
          return false;
        }
      }
      return dataRequest.index >= this.prefetchedPageResponse.index &&
             (this.prefetchedPageResponse.hasMore ?
               dataRequest.index + dataRequest.count <= this.prefetchedPageResponse.index + this.prefetchedPageResponse.data.length :
               true
             );
    }
  }

  shouldPrefetch(dataRequest: PageRequest): boolean {
    return !this.prefetchObs &&
           this.prefetchedPageResponse.hasMore &&
             dataRequest.index + dataRequest.count >
             this.prefetchedPageResponse.index + this.prefetchedPageResponse.data.length - this.prefetchMargin;
  }

  prefetch(dataRequest: PageRequest): void {
    this.prefetchObs = this.fetchFromParent(dataRequest);
    this.prefetchObs.subscribe({
      next: (pr: PageResponse) => {
        // must subscribe to execute observable code, but
        // nothing to do here, all importation actions will be done in .processParentData
      },
      error: (err: any) => {
        // again, nothing we should do here
      }
    });
  }

  fetchOwnData(dataRequest: PageRequest): Observable<PageResponse> {
    if (this.shouldPrefetch(dataRequest)) {
      if (!this.isBusy())
        this.prefetch(dataRequest);
    }
    // console.log('PrefetchPagingProxy: getting from own data:');
    // console.log(dataRequest);
    return Observable.create(
      (o: Observer<PageResponse>) => {
        const localIndex = dataRequest.index - this.prefetchedPageResponse.index;
        const hasMore = this.prefetchedPageResponse.hasMore ? true :
                            localIndex + dataRequest.count < this.prefetchedPageResponse.data.length;
        const response: PageResponse = {
          index: dataRequest.index,
          countRequested: dataRequest.count,
          total: this.prefetchedPageResponse.total,
          totalIsKnown: this.prefetchedPageResponse.totalIsKnown,
          totalSoFar: this.prefetchedPageResponse.totalSoFar,
          hasMore: hasMore,
          customData: this.prefetchedPageResponse.customData,
          data: this.prefetchedPageResponse.data.slice(localIndex, localIndex + dataRequest.count)
        };
        o.next(response);
      }
    );
  }

  makeDataRequestForParent(dataRequest: PageRequest): PageRequest {
    if (this.prefetchedPageResponse && (dataRequest.index < this.prefetchedPageResponse.index
        || dataRequest.index > this.prefetchedPageResponse.index + this.prefetchedPageResponse.countRequested)) {
      this.prefetchedPageResponse = null;
    }
    let additionalPrefetchBlockSize: number = 0;
    let index = this.prefetchedPageResponse ?
                    this.prefetchedPageResponse.index + this.prefetchedPageResponse.data.length :
                    dataRequest.index;
    if (!this.prefetchedPageResponse) {
      if (index >= this.prefetchBlockSize) {
        additionalPrefetchBlockSize = this.prefetchBlockSize;
      }
      else {
        additionalPrefetchBlockSize = index;
      }
    }
    index -= additionalPrefetchBlockSize;
    const request: PageRequest = {
      index: index,
      count: this.prefetchBlockSize + additionalPrefetchBlockSize,
      customData: dataRequest.customData
    };
    // console.log('PrefetchPagingProxy: getting from parent data:');
    // console.log(request);
    return request;
  }

  handleParentResponse(proxyObserver: Observer<PageResponse>,
                       parentResponse: PageResponse, dataRequest: PageRequest, parentRequest: PageRequest): void {
    let newIndex = parentResponse.index;
    let data = parentResponse.data;
    if (this.prefetchedPageResponse) {
      const remainingRows = this.prefetchedPageResponse.data.slice(-this.prefetchMargin);
      newIndex = newIndex - remainingRows.length;
      data = remainingRows.concat(data);
    }
    this.prefetchedPageResponse = { ...parentResponse, index: newIndex, data: data };
    // console.log('PrefetchPagingProxy: new prefetched response:');
    // console.log(this.prefetchedPageResponse);
    if (this.prefetchObs) {
      this.prefetchObs = null;
    } else {
      this.fetchOwnData(dataRequest).subscribe(
        (pr: PageResponse) => {
          proxyObserver.next(pr);
        }
      );
    }
  }

  handleParentError(proxyObserver: Observer<PageResponse>,
                    error: any, dataRequest: PageRequest, parentRequest: PageRequest): void {
    if (this.prefetchObs) {
      this.prefetchObs = null;
    }
    // console.log('PrefetchPagingProxy: handleParentError');
    // console.log(error);
    super.handleParentError(proxyObserver, error, dataRequest, parentRequest);
  }
}

export class CachingPagingProxy extends LinkedPagingProxy {
  protected cacheId: string;
  protected cachedData: Array<any> = [];
  protected cachedPageResponse: PageResponse;

  constructor(protected cacheIdentityKey: string) {
    super();
  }

  clearCache(): void {
    this.cachedPageResponse = null;
    this.cachedData = [];
  }

  canFetch(dataRequest: PageRequest): boolean {
    if (!this.cachedPageResponse) {
      return false;
    } else {
      if (dataRequest.customData) {
        if (this.cacheId !== dataRequest.customData[this.cacheIdentityKey]) {
          this.clearCache();
          return false;
        }
      }
      return this.checkCache(dataRequest) < 0;
    }
  }

  checkCache(dataRequest: PageRequest): number {
    for (let i = dataRequest.index; i < dataRequest.index + dataRequest.count; i++) {
      if (!this.cachedData[i]) {
        return i;
      }
    }
    return -1;
  }

  fetchOwnData(dataRequest: PageRequest): Observable<PageResponse> {
    // console.log('CachingPagingProxy: getting from own data:');
    // console.log(dataRequest);
    return Observable.create(
      (o: Observer<PageResponse>) => {
        const hasMore = this.cachedPageResponse.hasMore ? true : dataRequest.index + dataRequest.count < this.cachedData.length;
        const response: PageResponse = {
          ...this.cachedPageResponse,
          index: dataRequest.index,
          countRequested: dataRequest.count,
          hasMore: hasMore,
          data: this.cachedData.slice(dataRequest.index, dataRequest.index + dataRequest.count),
          totalSoFar: this.cachedData.length
        };
        o.next(response);
      }
    );
  }

  makeDataRequestForParent(dataRequest: PageRequest): PageRequest {
    const index = this.checkCache(dataRequest);
    const request: PageRequest = {
      index: index,
      count: dataRequest.count - (index - dataRequest.index),
      customData: dataRequest.customData
    };
    // console.log('CachingPagingProxy: getting from parent data:');
    // console.log(request);
    return request;
  }

  handleParentResponse(proxyObserver: Observer<PageResponse>,
                       parentResponse: PageResponse, dataRequest: PageRequest, parentRequest: PageRequest): void {
    // console.log('CachingPagingProxy: caching parent data:');
    // console.log(parentRequest);
    this.cachedPageResponse = { ...parentResponse };
    if (this.cachedPageResponse.customData) {
      this.cacheId = this.cachedPageResponse.customData[this.cacheIdentityKey];
    }
    for (let i = parentResponse.index; i < parentResponse.index + parentResponse.data.length; i++) {
      this.cachedData[i] = parentResponse.data[i - parentResponse.index];
    }
    this.fetchOwnData(dataRequest).subscribe(
      (pr: PageResponse) => {
        proxyObserver.next(pr);
      }
    );
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

