const queue = []
let isFlushing = false;

const resolvePromise = Promise.resolve();


export function queueJob(job) {
  if(!queue.includes(job)) {
    queue.push(job)
  }
  //exec queue
  
  if(!isFlushing) {
    isFlushing = true;
    resolvePromise.then(() => {
      isFlushing = false;
      let copy = queue.slice(0);
      queue.length = 0;
      for(let i = 0; i < copy.length; i ++) {
        const job = copy[i]
        job();
      }
    })
  
  }

  //等待所有数据修改后

}
