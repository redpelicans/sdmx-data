import express from 'express';
import debug from 'debug';
import http from 'http';
import bodyParser from 'body-parser';
import compression from 'compression';
import logger from 'morgan-debug';
import cors from 'cors';
import errors from './middlewares/errors';
import initFiles from './files';
import initMongo from './mongo';

const loginfo = debug('sdmx:http');
const getUrl = server => `http://${server.address().address}:${server.address().port}`;

const init = ctx => {
  const { config, data } = ctx;
  const { server: { host, port }, data: files } = config;
  const app = express();
  const httpServer = http.createServer(app);

  const promise = new Promise((resolve) => {
    app
      .use(compression())
      .use(cors())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({ extended: true }))
      .use('/ping', (req, res) => res.json({ ping: 'pong' }))
      .use(logger('sdmx:http', 'dev'))
      .use('/files', initFiles(ctx))
      .use('/mongo', initMongo(ctx))
      .use(errors);

    httpServer.listen(port, host, () => {
      httpServer.url = getUrl(httpServer);
      loginfo(`server started on ${httpServer.url}`);
      resolve({ ...ctx, http: httpServer });
    });
  });

  return promise;
};

export default init;
