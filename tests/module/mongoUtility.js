
const MongoClient = require('mongodb').MongoClient;
const mongoConf = require('./setupPreTest').mongoConf;
module.exports.collection = Object.freeze({

});

let mongoObj = null;

module.exports.connected = async function() {
  let auth='';
  if (mongoConf && mongoConf.auth ) {
    auth=mongoConf.auth.user+':'+mongoConf.auth.pwd+'@';
  }
  const connectionString = `mongodb://${auth}${mongoConf.ip}:${mongoConf.port}/${mongoConf.db}`;
  const opt = mongoConf.connection_string || {};
  Object.assign( opt, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
  });

  try {
    const client = await MongoClient.connect(connectionString, opt);
    mongoObj = client.db();
    console.info(' Success connected to mongo TEST');
    return mongoObj;
  } catch (err) {
    console.info(' Failed connected to mongo TEST');
    return null;
  }
};

module.exports.insert = async function(collection, data) {
  const result = await mongoObj.collection(collection).insertOne(data);
  return result;
};

module.exports.findOne = async function(collection, data) {
  const result = await mongoObj.collection(collection).findOne(data);
  return result;
};

module.exports.find = async function(collection, data) {
  const result = await mongoObj.collection(collection).find(data);
  return result;
};

module.exports.disconnected = async function() {
  await mongoObj.close((err)=>{
    if (err) {
      console.info('Mongo Close Error' + err.message);
      return;
    } else {
      console.info('Mongo is successfully closed');
      return;
    }
  });
};

module.exports.drop = async function(collection) {
  const result = await mongoObj.collection(collection).drop();
  return result;
};
