export namespace Writer {
   const writeQueue = new WeakMap<FileSystemWritableFileStream, string[]>();
   const toBeClosed = new WeakSet<FileSystemWritableFileStream>();
   const inProgress = new WeakSet<FileSystemWritableFileStream>();

   export async function isWriterBusy(writable: FileSystemWritableFileStream) {
      return (
         inProgress.has(writable) || (writeQueue.get(writable)?.length ?? 0) > 0
      );
   }

   export function enqueue(
      writable: FileSystemWritableFileStream,
      data: string
   ) {
      let queue = writeQueue.get(writable);
      if (!queue) {
         queue = [];
         writeQueue.set(writable, queue);
      }

      queue.push(data);

      if (!inProgress.has(writable)) {
         beginQueueProcess(writable);
      }
   }

   async function beginQueueProcess(writable: FileSystemWritableFileStream) {
      const queue = writeQueue.get(writable);
      if (!queue || queue.length === 0) {
         inProgress.delete(writable);
         return;
      }

      inProgress.add(writable);

      const data = queue.shift();

      if (!data) {
         inProgress.delete(writable);
         return;
      }

      try {
         await writable.truncate(0);
         await writable.write(data);

         if (queue.length > 0) {
            await beginQueueProcess(writable);
         } else if (toBeClosed.has(writable)) {
            await writable.close();
            toBeClosed.delete(writable);
            writeQueue.delete(writable);
         }
      } catch (error) {
         console.error(error);
      } finally {
         inProgress.delete(writable);
      }
   }

   export async function closeWriter(
      writable: FileSystemWritableFileStream,
      immediate = false
   ) {
      let queue = writeQueue.get(writable);
      if (
         ((!queue || queue.length === 0) && !inProgress.has(writable)) ||
         immediate
      ) {
         await writable.close();
         toBeClosed.delete(writable);
         writeQueue.delete(writable);
      } else {
         toBeClosed.add(writable);
      }
   }
}
