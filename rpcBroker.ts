
const kvBC = new BroadcastChannel("sse-kv-rpc");
const ioBC = new BroadcastChannel("sse-io-rpc");
const relayBC = new BroadcastChannel("sse-relay-rpc");

/** 
 * Routes RPC requests to an appropriate message-channel.   
 * All SSE-clients registered for this request type will 
 * recieve the message, and then process the request. 
 * @param _req (Request) - the request object from the http request
 */
export async function routeRequest(req: Request) {
   const data = await req.json();
   const path = new URL(req.url).pathname
   switch (path) {
      case '/SSERPC/kvRequest':
         kvBC.postMessage(data);
         break;
      case '/SSERPC/ioRequest':
         ioBC.postMessage(data);
         break;
      case '/SSERPC/relayRequest':
         relayBC.postMessage(data);
         break;
      default:
         console.log('unknown: ', path)
         break;
   }
}