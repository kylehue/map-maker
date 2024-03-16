import { generateId } from "./generate-id";

function createJob(name: string, data: any) {
   return {
      id: generateId(),
      name,
      data,
   };
}

const workers = new WeakMap<Worker, Map<string, Function>>();

export function post(
   worker: Worker,
   name: string,
   data: any,
   callback: (data: any, error?: any) => void
) {
   let queue = workers.get(worker);
   if (!queue) {
      queue = new Map();
      workers.set(worker, queue);
      worker.onmessage = (e) => {
         const cb = queue!.get(e.data.id);
         if (cb) {
            cb(e.data, null);
            queue!.delete(e.data.id);
         }
      };
      worker.onerror = (e) => {
         callback(null, e.error);
      };
   }
   const job = createJob(name, data);
   queue!.set(job.id, callback);
   worker.postMessage(job);
}

export function postAsync(worker: Worker, name: string, data: any) {
   return new Promise<any>((resolve, reject) => {
      post(worker, name, data, (data, err) => {
         if (err) reject(err);
         else resolve(data);
      });
   });
}
