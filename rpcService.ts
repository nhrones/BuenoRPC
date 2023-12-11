
/**
 * SSE-RPC Broker Service
 * This service watches for SSERPC registration requests
 * When a request id recieved, it is routed to a broker that
 * will register an appropriate SSE stream for the client.
 * 
 * The service also routes all POST requests to an appropriate
 * BroadcastChannel (BC), where all registered clients will recieve the
 * procedure request by monitoring the BC message events.
 */

import * as Broker from "./rpcBroker.ts"
import { registerKVclient } from "./kvRegistration.ts";
import { registerIOclient } from "./ioRegistration.ts";


// Service all HTTP requests
Deno.serve({ port: 9099 }, (request: Request): Response | Promise<Response> => {
   console.log(`Serve request: ${request.url}`)
   // Is this a KV-rpc registration request?
   if (request.url.includes("SSERPC/kvRegistration")) {
      // register our new RPC-client
      return registerKVclient()

   } // Is this an IO-rpc registration request?  
   else if (request.url.includes("SSERPC/ioRegistration")) {
      // register our new RPC-client
      return registerIOclient()

   } // POST request = KvRPC (Remote Procedure Calls)    
   else if (request.method === 'POST') {
      // extract the request payload
      //const data = await request.json();
      // inform all interested parties about this new RPC request
      //bc.postMessage(data);
      console.log(`POST: ${request.url}`)
      Broker.routeRequest(request)
      // acknowledge the request 
      return new Response('', {
         status: 200, headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Methods": "GET OPTIONS POST DELETE",
         }
      })
   } // an unknown request was recieved
   else {
      // report this unknown request
      return new Response(`<h1>Unknown request!</h1> 
<h3>Was neither an SSE registration request, nor a recognized RPC request!</h3>
<h3>Please see <a href="https://github.com/nhrones/KvRPC_TreeClient">KvRPC_TreeClient for usage.</a></h3>`,
         { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
   }
}
)
