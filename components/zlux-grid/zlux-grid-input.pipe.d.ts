

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { PipeTransform } from '@angular/core';
import { Column } from './zlux-grid.interfaces';
export declare class ZluxTableMetadataToColumnsPipe implements PipeTransform {
    defaultColWidth: string;
    transform(value: any): Array<Column>;
    extractColumnList(metaData: any): Array<any>;
    buildColumnStyleClass(col: any): string;
    extractColumns(columnMetaData: Array<any>): Array<Column>;
}
export declare class ZluxTableColumnsCustomSortPipe implements PipeTransform {
    transform(value: Array<Column>): Array<Column>;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

