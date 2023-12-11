import { DEBUG } from './constants.ts'
const kvBC = new BroadcastChannel("sse-kv-rpc");
const ioBC = new BroadcastChannel("sse-io-rpc");

/** 
 * A request to subscribe to a Server Sent Event stream 
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
      default:
         console.log('unknown: ', path)
         break;
   }
}