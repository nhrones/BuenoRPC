import {
   deleteRow,
   getRow,
   getAll,
   setRow,
} from './remoteProcedures.ts' 
 
import { HandlerContext } from "$fresh/server.ts";

/** SSE stream headers */
const StreamHeaders = {
   "content-type": "text/event-stream",
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Credentials": "true",
   "Access-Control-Allow-Headers":
   "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
   "Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE",
   "Cache-Control": "no-cache"
}

export const kv = await Deno.openKv();

/** 
 * Subscribes a client to a Server Sent Event stream   
 * This stream supports remote DB transaction procedures (SSE-RPC)     
 * @param (Request) req - the original http request object    
 */
export const handler = (req: Request, _ctx: HandlerContext): Response => {

   console.info('Started SSE Stream! - ', req.url)
   
   // All RPC requests are broadcast on this channel
   const thisChannel = new BroadcastChannel("sse-rpc");

   // our SSE stream to the client
   const stream = new ReadableStream({
      start: (controller) => {

         // listening for RPC or mutation-event messages
         thisChannel.onmessage = async (e) => {
            const { txID, procedure, params } = e.data
            let thisError: string | null = null
            let thisResult = null
            const { key, vs } = params
      
            // calling Snapshot procedures
            switch (procedure) {

               // A mutation event - fired by kvdb.ts
               case "MUTATION": {
                  thisError = null
                  thisResult = params
                  break;
               }

               // delete a row
               case "DELETE": {
                  await deleteRow(key)
                     thisError = null
                     thisResult = "ok"
                  break;
               }

               // Fetch a row
               case "GET": {
                  const result = await getRow(key, vs)
                  thisError = null
                  thisResult = result
                  break;
               }

               
               // Set the value for the given key in the database. 
               // If a value already exists for the key, it will be overwritten.
               case "SET": {
                  const result = await setRow(key, params.value);
                  if (result.versionstamp === null) {
                     thisError = 'Oooppps!'
                     thisResult = null
                  } else {
                     thisError = null
                     thisResult = result.versionstamp
                  }
                  break;
               }

               
               // Return all records 
               case 'GETALL': {
                  const resultSet = await getAll()
                  thisResult = JSON.stringify(resultSet)
                  break;
               }

               // default fall through 
               default: {
                  console.log('handling - default')
                  thisError = 'Unknown procedure called!';
                  thisResult = null
                  break;
               }
            }

            // Build & stream SSE reply 
            const reply = JSON.stringify({
               txID: txID,
               error: thisError,
               result: thisResult
            })
            controller.enqueue('data: ' + reply + '\n\n');
         }
      },

      cancel() {
         thisChannel.close();
      }
   })

   return new Response(
      stream.pipeThrough(
         new TextEncoderStream()),
      { headers: StreamHeaders }
   )
}
