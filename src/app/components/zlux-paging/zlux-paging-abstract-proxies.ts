

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import { Observer, PartialObserver } from 'rxjs/Observer';

import { PagingProxy, PageRequest, PageResponse } from './zlux-paging.interfaces';

// Simple implementation operating under assumption that each data request will be handled through
// a single Observable
export abstract class AbstractPagingProxy implements PagingProxy {
  protected index: number;
  protected total: number;
  private busy: boolean = false;
  public busyStatusChanged: Subject<any>;

  constructor() {
    this.busyStatusChanged = new Subject<any>();
  }

  validateRequest(dataRequest: PageRequest): boolean {
    return true;
  }

  // returned Observable's notifications will be handled in either handleResponse() or handleError()
  abstract makeObservable(dataRequest: PageRequest): Observable<PageResponse>;

  // Handling a response amounts to calling proxyObserver.next(pageResponseObj) when you're ready to serve
  // the data to the caller. Or calling proxyObserver.error(error) if something went wrong.
  abstract handleResponse(proxyObserver: Observer<PageResponse>, data: any, dataRequest: PageRequest): void;

  // You can "bubble" an error to the caller by calling proxyObserver.error(error), or handle it completely
  // in this method.
  abstract handleError(proxyObserver: Observer<PageResponse>, error: any, dataRequest: PageRequest): void;

  public fetch(dataRequest: PageRequest): Observable<PageResponse> {
    if (!this.busy) {
      this.changeBusyStatus({ status: true, data: dataRequest});
      if (this.validateRequest(dataRequest)) {
        const obs: Observable<PageResponse> = Observable.create((o: Observer<PageResponse>) => {
          const innerObserver: PartialObserver<PageResponse> = {
            next: (result: any) => {
              this.handleResponse(o, result, dataRequest);
              if (dataSub) {
                dataSub.unsubscribe();
              }
            },
            error: (error: any) => {
              this.handleError(o, error, dataRequest);
              if (dataSub) {
                dataSub.unsubscribe();
              }
            }
          };
          const dataSub = this.makeObservable(dataRequest).subscribe(innerObserver);
        });
        return obs;
      }
    }
    return null;
  }

  public isBusy(): boolean {
    return this.busy;
  }

  protected changeBusyStatus(data: any, error?: any) {
    this.busy = data.status;
    if (error) {
      this.busyStatusChanged.error(error);
    }
    else {
      this.busyStatusChanged.next(data);
    }
  }
}

// Implementation that handles data requests through either request to parent proxy or through itself
// Not abstract, but doesn't do any work by itself, subclass and override important methods to use.
export class LinkedPagingProxy implements PagingProxy {
  protected parentProxy: PagingProxy;
  //private busy: boolean = false;
  public busyStatusChanged: Subject<any>;

  constructor() {
    this.busyStatusChanged = new Subject<any>();
  }

  link<T extends PagingProxy>(parent: T): T {
    this.parentProxy = parent;
    this.parentProxy.busyStatusChanged.subscribe({
      next: (v) => this.busyStatusChanged.next(v),
      error: (err) => this.busyStatusChanged.error(err)
    });
    return parent;
  }

  public fetch(dataRequest: PageRequest): Observable<PageResponse> {
    if (this.validateRequest(dataRequest)) {
      if (this.canFetch(dataRequest)) {
        return this.fetchOwnData(dataRequest);
      } else {
        return this.fetchFromParent(dataRequest);
      }
    }
  }

  validateRequest(dataRequest: PageRequest): boolean {
    return true;
  }

  canFetch(dataRequest: PageRequest): boolean {
    return false;
  }

  fetchOwnData(dataRequest: PageRequest): Observable<PageResponse> {
    throw new Error('Not implemented.');
  }

  makeDataRequestForParent(dataRequest: PageRequest): PageRequest {
    return dataRequest;
  }

  // See handle* methods in AbstractPagingProxy for more info
  handleParentResponse(proxyObserver: Observer<PageResponse>,
                       parentResponse: PageResponse, dataRequest: PageRequest, parentRequest: PageRequest): void {
    proxyObserver.next(parentResponse);
  }

  handleParentError(proxyObserver: Observer<PageResponse>,
                    error: any, dataRequest: PageRequest, parentRequest: PageRequest): void {
    proxyObserver.error(error);
  }

  fetchFromParent(dataRequest: PageRequest): Observable<PageResponse> {
    if (this.parentProxy) {
      const ownObs: Observable<PageResponse> = Observable.create((o: Observer<PageResponse>) => {
        const parentObserver: PartialObserver<PageResponse> = {
            next: (pr: PageResponse) => {
              this.handleParentResponse(o, pr, dataRequest, parentRequest);
              if (parentSub) {
                parentSub.unsubscribe();
              }
            },
            error: (error: any) => {
              this.handleParentError(o, error, dataRequest, parentRequest);
              if (parentSub) {
                parentSub.unsubscribe();
              }
            }
          };
          const parentRequest: PageRequest = this.makeDataRequestForParent(dataRequest);
          const parentSub = this.parentProxy.fetch(parentRequest).subscribe(parentObserver);
        });
      return ownObs;
    } else {
      throw new Error('LinkedPagingProxy has no parent, but asks for its data.');
    }
  }

  public isBusy(): boolean {
    if (this.parentProxy)
      return this.parentProxy.isBusy();
    return false;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

