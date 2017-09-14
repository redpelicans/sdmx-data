import R from 'ramda';

const error = (err, req, res, next) => {
  if (!err) return next();
  const { code, message } = R.is(Error, err) ? { code: 500, message: err.toString() } : { code: err.code, message: err.error };
  if (process.env.NODE_ENV !== 'testing') console.error(err); // eslint-disable-line no-console
  res.status(code).json({ message });
};

export default error;
