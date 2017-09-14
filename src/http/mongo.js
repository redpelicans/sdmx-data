import express from 'express';
import R from 'ramda';
import { Transform } from 'stream';
import { inspect } from 'util';


const loadTypes = db => {
  const col = db.collection('types');
  return col.find().toArray();
};

const loadDataflowsGroupByType = db => {
  const col = db.collection('dataflows');
  return col.aggregate([
    { $group: { _id: '$type', count: { $sum : 1 } } }
  ]).toArray();
};

const dataflows = db => (req, res, next) => {
  const col = db.collection('dataflows');
  col.find({}, { limit: 10000 }).toArray().then(data => res.json(data)).catch(next);
};

const sdataflows = db => (req, res, next) => {
  const col = db.collection('dataflows');
  const stream = col.find({}, { limit: 10000 }).stream();

  stream.on('data', data => {
    res.write(JSON.stringify(data));
  });

  stream.on('error', data => {
    next(err);
  });

  stream.on('end', data => {
    res.end();
  });
};


const ssdataflows = db => (req, res, next) => {
  const col = db.collection('dataflows');
  const cursor = col.find({}, { limit: 10000 }, (err, cursor) => {
    if (err) return next(err);
    cursor.each((err, data) => {
      if (data != null) res.write(JSON.stringify(data));
      else res.end();
    });
  });
};

const groupTypes = db => (req, res) => {
  const promises = [loadTypes(db), loadDataflowsGroupByType(db)];
  Promise.all(promises).then(([types, gdataflows]) => {
    const htypes = R.reduce((acc, { _id, avatar }) => ({ ...acc, [_id]: avatar }), {}, types);
    const data = R.map(d => ({ avatar: htypes[d._id], count: d.count }), gdataflows);
    res.json(data);
  });
};

const makeSearchFilter = lang => k => ({ $or: [ { [`name.${lang}`]: new RegExp(k, 'i') }, { [`description.${lang}`]: new RegExp(k, 'i') }]});
const makeOtherFilter = lang => ([prop, value]) => ({ $or: [ { [`${prop}.${lang}`]: new RegExp(value, 'i') }, { [`${prop}`]: new RegExp(value, 'i') }]});
const search = db => (req, res, next) => {
  // GET /search/fr?q=open-source,Totam&frequency=jour&category=Music&f=_id,category
  const col = db.collection('dataflows');
  const { lang } = req.params;
  const { q, f, ...others } = req.query;
  let searchFilters = [];
  let fields;
  if (q) {
    const keys = q.indexOf(',') !== -1 ? q.split(',') : [q];
    searchFilters = R.map(makeSearchFilter(lang), keys);
  }
  if (f) {
    fields = f.indexOf(',') !== -1 ? f.split(',') : [f];
  }
  const otherFilters = R.compose(R.flatten, R.map(makeOtherFilter(lang)), R.toPairs)(others);
  const query = { $and: [...searchFilters, ...otherFilters]};
  // console.log(inspect(query, { depth: null }))
  col.find(query, { fields }).toArray()
    .then(data => res.json(data))
    .catch(next);
};

const init = ctx => {
  const { db } = ctx;
  const app = express();
  return app
    .use('/groupedTypes', groupTypes(db))
    .use('/dataflows', dataflows(db))
    .use('/sdataflows', sdataflows(db))
    .use('/ssdataflows', ssdataflows(db))
    .use('/search/:lang', search(db));
};
export default init;
