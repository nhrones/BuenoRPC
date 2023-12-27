import { StreamHeaders } from './constants.ts'
import {
   clearAll,
   deleteRow,
   getRow,
   getAll,
   setRow,
} from './kvProcedures.ts'

/** 
 * Subscribes a client to a Server Sent Event stream    
 * This stream supports remote DB transaction procedures (SSE-RPC)      
 */
export function registerKVclient(req: Request, DEBUG: boolean): Response {

   const { searchParams } = new URL(req.url);

   const client = searchParams.get('client') || 'unknown'
   if (DEBUG) console.log('Client registering for KV-SSE: ', client)

   // All RPC requests are broadcast on this channel
   const thisChannel = new BroadcastChannel("sse-kv-rpc");

   // our SSE stream to the client
   const stream = new ReadableStream({
      start: (controller) => {

         // listening for RPC or mutation-event messages
         thisChannel.onmessage = async (e: MessageEvent) => {
            const { txID, procedure, params } = e.data
            let thisError: string | null = null
            let thisResult = null
            const { key, vs } = params
            
            // calling Snapshot procedures
            switch (procedure) {

               /** A mutation event - fired by kvdb.ts */
               case "MUTATION": {
                  console.log(`MUTATION event - id: ${txID}, row: ${params.rowID}, type: ${params.type}`)
                  thisError = null
                  thisResult = params
                  break;
               }

               /** delete a row */
               case "DELETE": {
                  await deleteRow(key)
                     thisError = null
                     thisResult = "ok"
                  break;
               }

               /** Fetch a row */
               case "GET": {
                  const result = await getRow(key, vs)
                  thisError = null
                  thisResult = result
                  break;
               }

               /**
                * Set the value for the given key in the database. 
                * If a value already exists for the key, it will be overwritten.
                */
               case "SET": {
                  const result = await setRow(key, params.value);
                  if (result.versionstamp === null) {
                     thisError = `Oooppps! ${key}`
                     thisResult = null
                  } else {
                     thisError = null
                     thisResult = result.versionstamp
                  }
                  break;
               }

               /** 
                * Return all records 
                */
               case 'GETALL': {
                  const resultSet = await getAll()
                  thisResult = JSON.stringify(resultSet)
                  break;
               }

               /** 
                * Return all records 
                */
               case 'CLEARALL': {
                  await clearAll()
                  thisResult = 'ok'
                  break;
               }

               /** default fall through */
               default: {
                  console.log('handling - default')
                  thisError = 'Unknown procedure called!';
                  thisResult = null
                  break;
               }
            }

            /** Build & stream SSE reply */
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
