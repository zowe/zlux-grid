

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { ColumnMetaData } from './standard-table-format';
export declare class ZluxGridUtils {
    static getScaleFactor(columnIdentifier: string, formatMapping: Object): number;
    static normalizeDataRows(rows: Object[], formatMapping: Object): Object[];
    static makeformatMapping(metaDataList: ColumnMetaData[]): Object;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

