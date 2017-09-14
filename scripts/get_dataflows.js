import R from 'ramda';
import fs from 'fs';
import data from './search.json';
import typesData from './types.json';

const types = R.map(R.prop('type'), typesData);
const OUT = './data.json';

const random = (min, max) => Math.floor(Math.random() * (max - min +1)) + min;
const schema = {
  id: x => x.id,
  agency: x => x.agency_s,
  reference_area: x => x.reference_area_ss,
  name: x => ({ 'fr' : x.name_fr_txt, 'en': x.name_en_txt }),
  description: x => ({ 'fr' : x.description_fr_txt, 'en': x.description_en_txt }),
  frequency: x => ({ 'fr': x.frequency_fr_ss, 'en': x.frequency_en_ss }),
  version: x => x.version_s,
  interest_rate_type: x => x.interest_rate_type_ss,
  type: () => types[random(0, types.length)],
  category: x => R.last(x.category_ss),
};

const getDocument = schema => dataflow => R.compose(R.reduce((obj, [prop, method]) => ({ ... obj, [prop]: method(dataflow) }), {}), R.toPairs)(schema);
const convertData = (data, schema) => R.map(getDocument(schema), data);
const res = convertData(data, schema);
fs.writeFile(OUT, JSON.stringify(res), err => {
  if (err) return console.log(err);
  console.log(`file '${OUT}' saved!`);
});
