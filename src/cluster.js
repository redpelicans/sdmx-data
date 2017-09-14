import cluster from 'cluster';
import debug from 'debug';
import os from 'os';

const loginfo = debug('sdmx');

if (cluster.isMaster) {
  const workers = [];
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) { // eslint-disable-line
    (function spawn(i) { // eslint-disable-line
      workers[i] = cluster.fork();
      workers[i].on('exit', () => {
        loginfo(`${workers[i].id} > node's worker died!`);
        spawn(i);
      });
    })(i);
  }
} else {
  loginfo(`worker ${cluster.worker.id} lauched...`);
  require('./index'); // eslint-disable-line
}

