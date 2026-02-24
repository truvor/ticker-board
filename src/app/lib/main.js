const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");
ws.binaryType = "arraybuffer";

const tickers = ["ETH-GBP", "BTC-USD", "LTC-USD"];

ws.onopen = () => {
    console.log("Connection opened. Subscribing to BTC-USD ticker.");
    ws.send(JSON.stringify({
        "type": "subscribe",
        "channels": [{ "name": "ticker", "product_ids": tickers }]
    }));
};

ws.onmessage = (event) => {
    const price = JSON.parse(event.data);
    console.log(price)
    if (price.type === "ticker") {
        console.log(price)
    }
};

ws.onclose = (event) => {
    console.log("Connection closed", event.code, event.reason, event.wasClean);
};

ws.onerror = () => {
    console.log("Connection closed due to error");
};

setTimeout(() => {
    ws.close();
}, 10000);