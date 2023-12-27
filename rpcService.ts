
/**
 * SSE-RPC Service server
 * This server watches for SSERPC registration requests.   
 * When an RPC-registration request is recieved, it will    
 * register an appropriate SSE stream for the client.   
 * 
 * The service also routes all POST requests to a broker service.  
 * This service will select a specific BroadcastChannel (BC), 
 * that will transmit the RPC-request to an appropriate RPC registrar, 
 * where the procedure request will be sent to be executed by the    
 * requested method.
 */

import * as Broker from "./rpcBroker.ts"
import { registerKVclient } from "./kvRegistration.ts";
import { registerIOclient } from "./ioRegistration.ts";


const RunningOnDeploy = !!Deno.env.get("DENO_REGION")
const DEBUG = !!Deno.env.get("DEBUG")
console.log(`DEBUG = ${DEBUG}, RunningOnDeploy = ${RunningOnDeploy}`)



// Service all HTTP requests
Deno.serve({ port: 9099 }, (request: Request): Response | Promise<Response> => {

   if (DEBUG) console.log('Servicing request for: ', request.url)
   // Is this a KV-rpc registration request?
   if (request.url.includes("SSERPC/kvRegistration")) {
      // register our new RPC-client
      return registerKVclient(request, DEBUG)

   } // Is this an IO-rpc registration request?  
   else if (request.url.includes("SSERPC/ioRegistration")) {
      // register our new RPC-client
      return registerIOclient(request, DEBUG)

   } // POST request = RPC (Remote Procedure Calls)    
   else if (request.method === 'POST') {
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

})

