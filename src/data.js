import R from 'ramda';
import fs from 'fs';
import debug from 'debug';

const logger = debug('sdmx:data');

const loadFile = (name, path) => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) return reject(err);
      logger(`'${name}' file loaded`);
      resolve([name, JSON.parse(data)]);
    });
  });
  return promise;
};

const loadData = files => Promise.all(R.map(([name, path]) => loadFile(name, path), R.toPairs(files)));

const init = ctx => {
  const { config: { data } } = ctx;
  return loadData(data)
    .then(res => {
      return { ...ctx, data: R.fromPairs(res) };
    });
};

export default init;
