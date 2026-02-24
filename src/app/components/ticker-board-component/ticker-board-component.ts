import { Component, OnDestroy } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";

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
  private data$: WebSocketSubject<RowData>;

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
  getRowId = (params: { data: RowData }) => params.data.name;

  rowData: Array<RowData>;
  colDefs: ColDef[] = [
    { field: "name" },
    { field: "price" }
  ];

  constructor(private tickerService: TickerService) {
    this.data$ = this.tickerService.connect(["BTC-USD", "LTC-USD", "ETH-USD"])

    this.data$.pipe(auditTime(250)).
      subscribe((data: { product_id?: string, price: string }) => {
        if (data) {
          const index = this.rowData.findIndex((item: RowData) => item.name === data.product_id);
          this.gridApi.applyTransaction({
            update: [
              {
                ...this.rowData[index],
                price: data.price
              }
            ]
          });

          this.rowData[index].price = data?.price
          this.rowData[index] = {
            ...this.rowData[index],
            price: data.price
          };
        }
      });

    this.rowData = [{
      name: "BTC-USD",
      price: ''
    }, {
      name: "LTC-USD",
      price: ''
    }, {
      name: "ETH-USD",
      price: ''
    }];
  }

  ngOnDestroy(): void {
    this.tickerService.disconnect();
  }
}
