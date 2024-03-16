self.onmessage = (e) => {
   const data = e.data;
   const payload = data.data;
   const resultToBeSent = Object.assign({}, data);
   resultToBeSent.data = {};

   
};

self.onerror = (e) => {
   console.error(e);
};
