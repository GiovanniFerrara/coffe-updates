const info = (obj) => {
  console.log('info: ', obj ? JSON.stringify(obj, null, 2) : '');
};

const error = (err) => {
  console.log('error: ', err);
};

const logger = { info, error };

export default logger;
