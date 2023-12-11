import { HandlerContext } from "$fresh/server.ts";

const DEBUG = true
const BC = new BroadcastChannel("sse-rpc");

export const  handler = async (_req: Request, _ctx: HandlerContext): Promise<Response> => {
    const dataObject = await _req.json();
        if (DEBUG) console.info('Client Posted:', dataObject)
        BC.postMessage(dataObject);
        return new Response("",
        {
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
        }
    );
  };