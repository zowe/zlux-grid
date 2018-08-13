

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { ColumnMetaData } from './standard-table-format';

export class ZluxGridUtils {
   
  public static getScaleFactor(columnIdentifier: string, formatMapping: Object): number {
    const columnMetaData: ColumnMetaData = formatMapping[columnIdentifier] as ColumnMetaData;
    return columnMetaData && columnMetaData.displayHints && columnMetaData.displayHints.scaleFactor ?
    columnMetaData.displayHints.scaleFactor : 0;
  }
 
  // begin potentially tep-specific code that *may* be adaptable to other contexts.
  // OMEGAMON's "scale factor" is by powers of 10. I had originally thought
  // we might want to be able to have a simple multiplication. Maybe we would
  // add another field, "simpleScale" or something, in which case this code
  // could be adapted to a generic context.
    
  // copies the content of rows
  public static normalizeDataRows(rows: Object[], formatMapping: Object): Object[] {
    const newRows: Object[] = [];
    for (const row of rows) {
      const newRow: Object = {}
      for (const columnIdentifier in row){
        const scaleFactor: number = this.getScaleFactor(columnIdentifier, formatMapping);
        const value = row[columnIdentifier];
  
        if (scaleFactor != 0 && value != -1) { // not strictly necessary, but probably faster...
          newRow[columnIdentifier] = (value/Math.pow(10, scaleFactor)).toFixed(scaleFactor);
        } else {
          newRow[columnIdentifier] = value;
        }
      }
      newRows.push(newRow);
    }
    return newRows;
  }

  // end potentially tep-specific code
  
  // This should be in some common class for transforming results
  // copy/pasted from MVDCORE\widgets\mvdGrid2\web\app\mvdGrid2.component.ts
  public static makeformatMapping(metaDataList: ColumnMetaData[]): Object {
    let formatter = {};
    for (let columnMetadataEntry of metaDataList) {
      formatter[columnMetadataEntry.columnIdentifier] = columnMetadataEntry;
    }
    return formatter;
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

