import faker from 'faker';
import R from 'ramda';
import fs from 'fs';

const uniq = (faker, cache={}) => {
  return () => { 
    const getValue = () => {
      const value = faker().toUpperCase() ;
      return cache[value] ? getValue() : value;
    };
    const value = getValue();
    cache[value] = 1;
    return value;
  };
};


const COUNT = 1000;

const schema = {
  type: uniq(() => faker.finance.account()),
  avatar: () => faker.internet.avatar(),
};

const genDataflow = R.compose(R.reduce((obj, [prop, method]) => ({ ... obj, [prop]: method(obj, prop) }), {}), R.toPairs);
const getPrivateProps = R.compose(R.filter(x => x[0] === '_'), R.keys);
const privateProps = getPrivateProps(schema);
const filterPrivateProps = R.omit(privateProps);
const genDataflows = R.compose(filterPrivateProps, genDataflow);

const res = R.times(() => genDataflows(schema), COUNT);

fs.writeFile('./types.json', JSON.stringify(res), err => {
  if (err) return console.log(err);
  console.log('file saved!');
});
