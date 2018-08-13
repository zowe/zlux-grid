

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

export interface Column {
    field: string;
    header?: string;
    styleClass?: string;
    sortable?: string;
    displayHints?: DisplayHints;
    colMinWidth?: string;
    columnDescription?: string;
}
export interface DisplayHints {
    formatParameters?: FormatParameters;
}
export interface FormatParameters {
    valueMapping?: Record<any, ValueMappingRecord>;
}
export interface ValueMappingRecord {
    displayKey: string;
    default: string;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

