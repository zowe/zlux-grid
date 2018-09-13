

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {
  NgModule, Component,
  Input, Output, ViewChild,
  ElementRef, ChangeDetectorRef,
  OnChanges, SimpleChanges, AfterViewChecked, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import '../../../../node_modules/primeng/resources/components/table/table.css';
import '../../../../node_modules/primeng/resources/themes/omega/theme.css';
import '../../../../node_modules/primeng/resources/primeng.min.css';

import * as zluxgrid from './zlux-grid.interfaces';
import { ZluxTableMetadataToColumnsPipe, ZluxTableColumnsCustomSortPipe } from './zlux-grid-input.pipe';
import { ZluxFlyoverModule } from '@zlux/widgets';
@Component({
  selector: 'zlux-grid',
  templateUrl: 'zlux-grid.component.html',
  styleUrls: ['zlux-grid.component.css'],
  host: {'[class.without-vertical-scroll]':'customPaginator || paginator',
         '[class.auto-layout]':'autoLayout'}
})
export class ZluxGridComponent implements OnChanges, AfterViewChecked {
  @Input() customTemplates: {};
  @Input() header: string | undefined = undefined;
  @Input() emptyMessage: string = "No records found";
  @Input() rows: Array<any> = [];
  @Input() columns: Array<zluxgrid.Column> = [];
  @Input() selectionMode: 'single' | 'multiple';
  @Input() selectionWay: 'rowclick' | 'checkbox' = 'rowclick';
  @Input() paginator: boolean;
  @Input() customPaginator: boolean;
  @Input() dynamicPageSize: boolean;
  @Input() rowsPerPage = 15;
  @Input() resizableColumns: boolean;
  @Input() scrollableHorizontal: boolean;
  @Input() scrollableVertical: boolean;
  @Input() editable: boolean;
  @Input() sortField: string = null;
  @Input() sortOrder: number = 1;
  @Input() autoLayout: boolean = false;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowsPerPageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onEditCompleted: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set wrapperHeight(value: number) {
    if (this.dynamicPageSize && value) {
      this.updateRowsPerPage(value);
    }
  }

  //TODO: SPEC-647 this variable is used in calculations of rowPerPage
  //in case if there are no rows in the table
  private fallbackRowHeigth = 27;
  formattedRows: Array<any> = [];
  private needsRowCountUpdate = false;
  private outsideChanging: boolean = false;
  public onHoverActiveColumn: any= {};

  constructor(private elemRef: ElementRef, private cd: ChangeDetectorRef) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.rows || changes.columns) {
      if (this.columns && this.columns.length > 0) {
        // Update the row data
        if (this.rows) {
          if (this.rows.length > this.rowsPerPage) {
            if (this.dynamicPageSize) {
              this.rows = this.rows.slice(0, this.rowsPerPage);
            }
          }
          this.formattedRows = this.formatDataRows(this.rows, this.columns);
          if (this.dynamicPageSize)
            this.needsRowCountUpdate = true;
        }
      }
    }
    if ((changes.sortField && !changes.sortField.firstChange) ||
        (changes.sortOrder && !changes.sortOrder.firstChange)) {
          this.outsideChanging = true;
        }
  }

  ngAfterViewChecked(): void {
    if (this.needsRowCountUpdate) {
      this.needsRowCountUpdate = false;
      this.cd.detectChanges();
    }
  }

  public onHeaderHover($event,col){
    this.onHoverActiveColumn.description = col.columnDescription;
  }
  // XXX: this is a very brittle hackery. If there exists any better way of doing something with a similar
  //      result - then this code should be refactored.
  public updateRowsPerPage(bodyHeight?: number): void {
    if (!this.scrollableVertical && (this.dynamicPageSize)) {
      const someRow = this.elemRef.nativeElement.querySelector('table tbody.ui-table-tbody tr');

      //TODO: SPEC-647
      const height = someRow.getBoundingClientRect().height + 1;
      const rowHeight = height <= 1 ? this.fallbackRowHeigth : height;
      this.fallbackRowHeigth = rowHeight;
      
      const rowsPerPage = Math.max(1, Math.floor(this.getScrollableBodyHeight(bodyHeight) / rowHeight));
      if (rowsPerPage !== this.rowsPerPage) {
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageChange.emit(this.rowsPerPage);
        if (this.rows != null && (this.dynamicPageSize)) {
          this.rows = this.rows.slice(0); // to update the table
        }
      }
    }
  }

  private getScrollableBodyHeight(tableHeight: number): number {
    if (!this.scrollableVertical && !this.scrollableHorizontal) {
      return 0;
    }
    const tableWrapper = this.elemRef.nativeElement.querySelector('p-table');
    const tableHeaderElement = this.elemRef.nativeElement.querySelector('p-table div.ui-table-scrollable-header');
    const tableWrapperHeight = tableHeight ? tableHeight : tableWrapper.getBoundingClientRect().height;
    return tableWrapperHeight - tableHeaderElement.getBoundingClientRect().height -
      this.getScrollBarHeight() + 1;
  }

  private getScrollBarHeight(): number {
    if (!this.scrollableHorizontal) {
      return 0;
    }
    const tableBodyElement = this.elemRef.nativeElement.querySelector('p-table div.ui-table-scrollable-body');
    return tableBodyElement.offsetHeight - tableBodyElement.clientHeight;
  }

  // XXX: this is outright wrong: any sort of "formatting" shouldn't touch the data itself
  //      this method rewrites model data instead, leading to a number of undesired consequences,
  //      like breaking table sorting.
  formatDataRows(rows, columns): Array<any> {
    // Extract the format mappings for each column
    const formatValueMappings: Record<string, Record<string, zluxgrid.ValueMappingRecord>> = {};
    columns.forEach((col) => {
      if (col.displayHints) {
        formatValueMappings[col.field] = col.displayHints.formatParameters.valueMapping;
      }
    });

    const out = rows.slice(0);
    // Format each cell of data
    rows.forEach((row, i) => {
      for (const key of Object.keys(row)) {
        const cell = row[key];
        if (formatValueMappings[key] && formatValueMappings[key][cell]) {
          out[i][key] = formatValueMappings[key][cell].default;
        }
      }
    });
    return out;
  }

  onSelectionChanged(rows: any[]): void {
    this.selectionChange.emit(rows);
  }

  onSort(event: any): void {
    if (this.outsideChanging &&
      (this.sortField != event.field ||
      this.sortOrder != event.order)) {
      if (this.sortField == undefined && this.sortOrder == undefined) {
        this.outsideChanging = false;
      }
      return;
    }
    this.outsideChanging = false;
    this.sortChange.emit(event);
  }

  onEditComplete(event: any) {
    this.onEditCompleted.emit(event);
  }
}

@NgModule({
  imports: [CommonModule, TableModule, FormsModule, ZluxFlyoverModule],
  exports: [ZluxGridComponent,
    ZluxTableMetadataToColumnsPipe, ZluxTableColumnsCustomSortPipe],
  declarations: [ZluxGridComponent, ZluxTableMetadataToColumnsPipe, ZluxTableColumnsCustomSortPipe]
})
export class ZluxGridModule { }


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

