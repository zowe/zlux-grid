

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

export interface PagingProxy {
  fetch(dataRequest: PageRequest): Observable<PageResponse>;
  isBusy(): boolean;
  busyStatusChanged: Subject<any>;
}

export interface PageRequest {
  index: number;
  count?: number;
  customData?: any;
}

export interface PageResponse {
  index: number;
  countRequested: number;
  hasMore: boolean;
  total?: number;
  totalSoFar?: number;
  totalIsKnown: boolean;
  data: Array<any>;
  customData?: any;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

