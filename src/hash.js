import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import keys from 'lodash/keys';
import sortBy from 'lodash/sortBy';
import md5 from 'blueimp-md5';

const convert = obj => {
  if (isArray(obj)) {
    return obj.map(x => convert(x));
  } else if (isObject(obj)) {
    return sortBy(keys(obj)).map(key => [key, convert(obj[key])]);
  }

  return obj;
};

export default function(obj) {
  const converted = convert(obj);
  return md5(JSON.stringify(converted));
}
