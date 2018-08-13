

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Pipe, PipeTransform } from '@angular/core';
import { Column } from './zlux-grid.interfaces';

@Pipe({ name: 'zluxTableMetadataToColumns' })
export class ZluxTableMetadataToColumnsPipe implements PipeTransform {
 defaultColWidth:string = "";

  transform(value: any): Array<Column> {
    if (value && value.columnMetaData) {
      if (value.groupMetaData && value.groupMetaData.length) {
        return this.extractColumns(this.extractColumnList(value));
      } else {
        return this.extractColumns(value.columnMetaData);
      }
    } else {
      return [];
    }
  }

  extractColumnList(metaData: any): Array<any> {
    const out = [];
    const group_cols = metaData.groupMetaData[0].defaultColumnList || metaData.groupMetaData[0].columnList;
    const cols = metaData.columnMetaData;

    group_cols.forEach(group_col => {
      cols.forEach(col => {
        if (col.columnIdentifier === group_col) {
          out.push(col);
          return true;
        }
      });
    });
    return out;
  }

  buildColumnStyleClass(col: any) : string {
    let builtInStyleClass: string = 'column';
    let alignmentStyle: string = null;
    let warnedBadTableAlignment: boolean = false;
    if (col.displayHints && col.displayHints.tableAlignment) {
        switch (col.displayHints.tableAlignment) {
          case 'R':
          alignmentStyle = ' right-align';
          break;
          case 'L':
          alignmentStyle = ' left-align';
          break;
          default:
          if (!warnedBadTableAlignment) {
            warnedBadTableAlignment = true;
            // Yes, this would only warn about the first, so, if there are different bad values
            // we wouldn't be warned, but I think that's OK.
            console.log("zlux-grid-input-pipe: bad table alignment value: " + col.displayHints.tableAlignment);
            //need to maintain the default in spite of this being an errant value
            alignmentStyle = ' left-align';
          }
          break;
        }
      } else if (col.rawDataType === 'number') {
        alignmentStyle = ' right-align';
      }

      if (alignmentStyle !== null) {
        builtInStyleClass +=  alignmentStyle;
      }
      return builtInStyleClass;
  }

  extractColumns(columnMetaData: Array<any>): Array<Column> {
    const out: Array<Column> = [];
    columnMetaData.forEach(col => {
      let builtInStyleClass = this.buildColumnStyleClass(col);
      const resultCol: Column = {
        'field': col.columnIdentifier,
        'header': col.longColumnLabel || col.shortColumnLabel,
        'styleClass': builtInStyleClass,
        'sortable': col.sortableColumn,
        'columnDescription': col.columnDescription
      };
      if (col.displayHints &&
        col.displayHints.formatParameters &&
        col.displayHints.formatParameters.valueMapping) {
        resultCol.displayHints = col.displayHints;
      }

       if(this.defaultColWidth != undefined && this.defaultColWidth != ""){
          resultCol.colMinWidth = this.defaultColWidth;
        }else if(col.displayHints != undefined && col.displayHints.defaultcolumnWidth != undefined){
          resultCol.colMinWidth = col.displayHints.defaultcolumnWidth;
        } else {
          if(col.rawDataType != undefined){
            if(col.rawDataType == "string"){
              let tempColWidth = 0;
              if(col.rawDataTypeLength != undefined &&  col.longColumnLabel == undefined){
                tempColWidth = parseInt(col.rawDataTypeLength)*0.6;
              }else if(col.rawDataTypeLength != undefined &&  col.longColumnLabel == undefined){
                tempColWidth = parseInt(col.longColumnLabel.length)*0.6;
              }else if(col.rawDataTypeLength != undefined &&  col.longColumnLabel != undefined){
                if(col.rawDataTypeLength > col.longColumnLabel.length){
                  tempColWidth = parseInt(col.rawDataTypeLength)*0.6;
                }else if(col.rawDataTypeLength <= col.longColumnLabel.length){
                  tempColWidth = parseInt(col.longColumnLabel.length)*0.6;
                }
              }
              if(tempColWidth <= 10){
                tempColWidth = 10;
              }
              resultCol.colMinWidth = tempColWidth + "em";
            }else if(col.rawDataType == "number"){
              resultCol.colMinWidth = "10em";
            }
          }
          else {
            resultCol.colMinWidth = "10em";
          }
        }

      out.push(resultCol);
    }
    );
    return out;
  }
}
@Pipe({ name: 'zluxTableColumnsCustomSort' })
export class ZluxTableColumnsCustomSortPipe implements PipeTransform {

  transform(value: Array<Column>): Array<Column> {
    if (value && value.length) {
      return value.map(
        (val: Column) => {
          return { ...val, sortable: typeof val['sortable'] !== "undefined" ?
                                     val['sortable']: 'custom' };
        }
      );
    }
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

