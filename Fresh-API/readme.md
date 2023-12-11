## Fresh SSE-RPC api
The above folder **SSERPC**, and all contents should be copied to a Fresh apps /routes/ folder.

The result will be:
  - ./routes/SSERPC/remoteProcedures.ts -- _KvDb remote procedures_
  - ./routes/SSERPC/sseRegistration.ts -- _SSE stream registration_
  - ./routes/SSERPC/rpcRequests.ts -- _client procedure request transactions_

  After a _deno task start_, these routes will be registered in the _fresh.gen.ts_ file.    

## SSE-RPC Overview    


![Alt text](../overview.bmp)

## Note the BroadcastChannel above!
This BroadcastChannel ensures that all registered clients recieve all unsolicited **mutation events** from any client transaction (red lines).  A client would use this event to update its UI-recordset.

After installation, any remote application that implements the dbClient API will be able to view this apps data. 
   
Please see the **_dbClient.js_**  file in the TreeClient example app at:
  https://github.com/nhrones/KvRPC_TreeClient 