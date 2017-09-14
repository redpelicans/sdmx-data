import initHttp from './http';
import initMongo from './mongo';
import initData from './data';

const run = ctx => initData(ctx).then(initMongo).then(initHttp);
export default run;

