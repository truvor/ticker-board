import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  private socket$!: WebSocketSubject<any>;

  connect(productIds: string[]) {
    this.socket$ = webSocket({
      url: 'wss://ws-feed.exchange.coinbase.com',
      openObserver: {
        next: () => {
          this.socket$.next({
            type: 'subscribe',
            channels: [{ name: 'ticker', product_ids: productIds }]

          });
        }
      }
    });
    return this.socket$;
  }

  disconnect() {
    this.socket$.complete();
  }
}
