import { generateId } from "./generate-id";

export interface WorkerJob {
   id: string;
   name: string;
   data: any;
}

function createJob(name: string, data: any): WorkerJob {
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
   callback: (data: WorkerJob | null, error?: any) => void
) {
   let queue = workers.get(worker);
   if (!queue) {
      queue = new Map();
      workers.set(worker, queue);
      worker.onmessage = (e) => {
         const receivedJob: WorkerJob = e.data;

         const cb = queue!.get(receivedJob.id);
         if (cb) {
            cb(receivedJob, null);
            queue!.delete(receivedJob.id);
         }
      };
      worker.onerror = (e) => {
         callback(null, e.error);
      };
   }

   if (typeof data === "object" && data !== null) {
      data = JSON.parse(JSON.stringify(data));
   }

   const job = createJob(name, data);
   queue!.set(job.id, callback);
   worker.postMessage(job);
}

export function postAsync(worker: Worker, name: string, data: any) {
   return new Promise<WorkerJob | null>((resolve, reject) => {
      post(worker, name, data, (data, err) => {
         if (err) reject(err);
         else resolve(data);
      });
   });
}
