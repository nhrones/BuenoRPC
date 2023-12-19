/**
 * DEBUG flag 
 */
export const DEBUG = true

/** 
 * SSE stream headers 
 */
export const StreamHeaders = {
   "content-type": "text/event-stream",
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Credentials": "true",
   "Access-Control-Allow-Headers":
   "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
   "Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE",
   "Cache-Control": "no-cache"
}