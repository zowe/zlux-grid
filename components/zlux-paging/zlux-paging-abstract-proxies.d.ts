

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import { Observer } from 'rxjs/Observer';
import { PagingProxy, PageRequest, PageResponse } from './zlux-paging.interfaces';
export declare abstract class AbstractPagingProxy implements PagingProxy {
    protected index: number;
    protected total: number;
    private busy;
    busyStatusChanged: Subject<any>;
    constructor();
    validateRequest(dataRequest: PageRequest): boolean;
    abstract makeObservable(dataRequest: PageRequest): Observable<PageResponse>;
    abstract handleResponse(proxyObserver: Observer<PageResponse>, data: any, dataRequest: PageRequest): void;
    abstract handleError(proxyObserver: Observer<PageResponse>, error: any, dataRequest: PageRequest): void;
    fetch(dataRequest: PageRequest): Observable<PageResponse>;
    isBusy(): boolean;
    protected changeBusyStatus(data: any, error?: any): void;
}
export declare class LinkedPagingProxy implements PagingProxy {
    protected parentProxy: PagingProxy;
    busyStatusChanged: Subject<any>;
    constructor();
    link<T extends PagingProxy>(parent: T): T;
    fetch(dataRequest: PageRequest): Observable<PageResponse>;
    validateRequest(dataRequest: PageRequest): boolean;
    canFetch(dataRequest: PageRequest): boolean;
    fetchOwnData(dataRequest: PageRequest): Observable<PageResponse>;
    makeDataRequestForParent(dataRequest: PageRequest): PageRequest;
    handleParentResponse(proxyObserver: Observer<PageResponse>, parentResponse: PageResponse, dataRequest: PageRequest, parentRequest: PageRequest): void;
    handleParentError(proxyObserver: Observer<PageResponse>, error: any, dataRequest: PageRequest, parentRequest: PageRequest): void;
    fetchFromParent(dataRequest: PageRequest): Observable<PageResponse>;
    isBusy(): boolean;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

