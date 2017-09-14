import init from '../src/mongo';
import config from '../config';
import types from '../data/types.json';
import dataflows from '../data/dataflows.json';

const loadData = (data, factory) => col => {
  const batch = col.initializeUnorderedBulkOp();
  for (const d of data) batch.insert(factory(d));
  return batch.execute().then(({ nInserted }) => { console.log(`${nInserted} '${col.collectionName}' documents inserted`); return col });
};

const drop = col => col.drop()
  .then(() => { console.log(`collection '${col.collectionName}' dropped`); return col })
  .catch( err => { console.log(`cannot drop '${col.collectionName}', continue anyway ...`); return col });

init({ config }).then(({ db }) => {
  const typesCol = db.collection('types');
  const dataflowsCol = db.collection('dataflows');
  const typesFactory = t => ({ _id: t.type, avatar: t.avatar });
  const dataflowsFactory = d => d;
  return drop(typesCol)
    .then(loadData(types, typesFactory))
    .then(() => drop(dataflowsCol))
    .then(loadData(dataflows, dataflowsFactory))
    .then(() => db.close());
}).catch(console.error);


