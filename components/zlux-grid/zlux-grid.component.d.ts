

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { ElementRef, ChangeDetectorRef, OnChanges, SimpleChanges, AfterViewChecked, EventEmitter } from '@angular/core';
import '../../../../node_modules/primeng/resources/components/table/table.css';
import '../../../../node_modules/primeng/resources/themes/omega/theme.css';
import '../../../../node_modules/primeng/resources/primeng.min.css';
import * as zluxgrid from './zlux-grid.interfaces';
export declare class ZluxGridComponent implements OnChanges, AfterViewChecked {
    private elemRef;
    private cd;
    customTemplates: {};
    header: string | undefined;
    emptyMessage: string;
    rows: Array<any>;
    columns: Array<zluxgrid.Column>;
    selectionMode: 'single' | 'multiple';
    selectionWay: 'rowclick' | 'checkbox';
    paginator: boolean;
    customPaginator: boolean;
    resizableColumns: boolean;
    scrollableHorizontal: boolean;
    scrollableVertical: boolean;
    editable: boolean;
    sortField: string;
    sortOrder: number;
    autoLayout: boolean;
    selectionChange: EventEmitter<any>;
    rowsPerPageChange: EventEmitter<number>;
    sortChange: EventEmitter<any>;
    onEditCompleted: EventEmitter<any>;
    wrapperHeight: number;
    rowsPerPage: number;
    private fallbackRowHeigth;
    formattedRows: Array<any>;
    private needsRowCountUpdate;
    private outsideChanging;
    onHoverActiveColumn: any;
    constructor(elemRef: ElementRef, cd: ChangeDetectorRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewChecked(): void;
    onHeaderHover($event: any, col: any): void;
    updateRowsPerPage(bodyHeight?: number): void;
    private getScrollableBodyHeight(tableHeight);
    private getScrollBarHeight();
    formatDataRows(rows: any, columns: any): Array<any>;
    onSelectionChanged(rows: any[]): void;
    onSort(event: any): void;
    onEditComplete(event: any): void;
}
export declare class ZluxGridModule {
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

