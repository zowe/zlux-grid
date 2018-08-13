

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

export interface ColumnMetaData {
    columnIdentifier: string;
    longColumnLabel: string;
    shortColumnLabel: string;
    displayHints: DisplayHints;
    rawDataType?: string;
    styleClass?: string;
}
export interface ValueMappingEntry {
    default: string;
    displayKey?: string;
}
export interface FormatParameters {
    valueMapping?: Object;
}
export interface DisplayHints {
    minWidth?: number;
    maxWidth?: number;
    precision?: number;
    scaleFactor?: number;
    formatFunction?: string;
    formatParameters?: FormatParameters;
}
export interface TableMetaData {
    shortTableLabel: string;
    tableIdentifier: string;
}
export interface StandardTableFormatMetaData {
    columnMetaData: ColumnMetaData[];
    formatMapping?: Object;
    tableMetaData: TableMetaData;
}
export interface StandardTableFormat {
    error?: string;
    metaData?: StandardTableFormatMetaData;
    resultMetaDataSchemaVersion?: string;
    resultType?: string;
    rows?: any[];
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

