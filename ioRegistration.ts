import { StreamHeaders } from './constants.ts'
import {
   getFolderContent,
   getFile,
   saveFile
} from './ioProcedures.ts'

/** 
 * Subscribes a client to a Server Sent Event stream    
 * This stream supports remote DB transaction procedures (SSE-RPC)      
 */
export function registerIOclient(): Response {
   // All RPC requests are broadcast on this channel
   const thisChannel = new BroadcastChannel("sse-io-rpc");

   // our SSE stream to the client
   const stream = new ReadableStream({
      start: (controller) => {

         // listening for RPC or mutation-event messages
         thisChannel.onmessage = async (e: MessageEvent) => {
            const { txID, procedure, params } = e.data
            let thisError: string | null = null
            let thisResult = null
            const {folder, fileName, content } = params
            // calling Snapshot procedures
            switch (procedure) {

               /** delete a row */
               case "GET_FOLDER": {
                  const result = getFolderContent(folder)
                     thisError = null
                     thisResult = JSON.stringify(result) // HACK result
                  break;
               }

               /** Fetch a row */
               case "GET_FILE": {
                  const result = await getFile(folder, fileName)
                  thisError = null
                  thisResult = result
                  break;
               }

               /**
                * Set the value for the given key in the database. 
                * If a value already exists for the key, it will be overwritten.
                */
               case "SAVE_FILE": {
                  const result = await saveFile(folder, fileName, content);
                  if (result === null) {
                     thisError = `Oooppps! ${fileName}`
                     thisResult = null
                  } else {
                     thisError = null
                     thisResult = result
                  }
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
