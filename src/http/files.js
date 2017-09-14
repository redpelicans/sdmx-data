import express from 'express';
import fs from 'fs';
import R from 'ramda';

// const streamDataflows = data => (req, res) => {
//   const s = fs.createReadStream(data[req.params.type]);
//   s.pipe(transform).pipe(res);
// };

const groupTypes = data => (req, res) => {
  const { types, dataflows } = data;
  const htypes = R.reduce((acc, { type, avatar }) => ({ ...acc, [type]: avatar }), {}, types);
  const hdata = R.reduce((acc, d) => {
    const avatar = htypes[d.type];
    acc[avatar] = {
      avatar,
      count: R.pathOr(0, [avatar, 'count'], acc) + 1,
    };
    return acc;
  }, {}, dataflows);
  res.json(R.values(hdata));
};


const init = ctx => {
  const { config, data } = ctx;
  const { data: files } = config;
  const app = express();
  app
    .use('/groupedTypes', groupTypes(data))
  //.use('/stream/:type', streamDataflows(files))
  return app;
};
export default init;
