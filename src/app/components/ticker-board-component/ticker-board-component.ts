import { Component, OnDestroy } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import tickers from "./model.json" with { type: "json" };

import {
  AllCommunityModule, ModuleRegistry,
  RowApiModule,
  RowSelectionModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
} from "ag-grid-community";
import { auditTime } from "rxjs";
import { WebSocketSubject } from 'rxjs/webSocket';
import { TickerService } from "../../services/TickerService/ticker-service";

ModuleRegistry.registerModules([AllCommunityModule,
  ClientSideRowModelApiModule,
  RowSelectionModule,
  RowApiModule,
  ClientSideRowModelModule,
]);

type RowData = {
  name: string;
  price: string;
}

@Component({
  selector: 'app-ticker-board',
  imports: [AgGridAngular],
  templateUrl: './ticker-board-component.html',
  styleUrl: './ticker-board-component.css',
})
export class TickerBoard implements OnDestroy {
  private gridApi!: GridApi;
  private data$?: WebSocketSubject<RowData>;

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
  getRowId = (params: { data: RowData }) => params.data.name;

  rowData: Array<RowData>;
  colDefs: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: tickers,
        valueListMaxHeight: 120,
        valueListMaxWidth: 120
      },
      editable: true,
      onCellValueChanged: (params) => {
        const index = Number(params!.node!.rowIndex);
        // Rerun the subscription with updated tickers
        if (params.newValue !== params.oldValue) {
          this.rowData[index].name = params.newValue!;
          this.rowData[index].price = '';
          this.rowData = [...this.rowData];

          this.gridApi.applyTransaction({
            update: [
              this.rowData[index]
            ]
          });
          this.updateRow();
        }
      }
    },
    { field: "price" }
  ];

  constructor(private tickerService: TickerService) {
    this.rowData = tickers.map((item: string) => {
      return {
        name: item,
        price: '',
      }
    });
    this.updateRow();
  }

  updateRow() {
    if (this.data$) {
      this.tickerService.disconnect();
    }
    this.data$ = this.tickerService.connect(this.rowData.map((item: RowData) => item.name));
    this.data$.pipe(auditTime(250)).
      subscribe((data: { product_id?: string, price: string }) => {
        if (data) {
          const indexes = this.rowData.reduce((acc: number[], item: RowData, index: number) => {
            if (item.name === data.product_id) {
              acc.push(index);
            }
            return acc;
          }, []);


          for (let index of indexes) {
            this.rowData[index].price = data.price || this.rowData[index].price;
            this.rowData[index].name = data.product_id!;
            this.gridApi.applyTransaction({
              update: [
                this.rowData[index]
              ]
            });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.tickerService.disconnect();
  }
}
