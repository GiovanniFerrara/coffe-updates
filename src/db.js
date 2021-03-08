import dotenv from 'dotenv';
import * as firebase from 'firebase';
import logger from './logger';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

firebase.initializeApp(firebaseConfig);

class Database {
  constructor() {
    this.database = firebase.database();
    this.logger = logger;
  }

  get(dbKey) {
    return this.database.ref(dbKey)
      .once('value')
      .then((snapshot) => {
        const val = snapshot.val();
        return val ? Object.values(val) : [];
      })
      .catch((e) => {
        logger.error(e);
      });
  }

  async add(dbKey, values) {
    await this.database.ref(dbKey).remove();
    const v = values.map((item) => this.database.ref(`${dbKey}/${item.id}`).set(item).key);
    return v || [];
  }
}

export { Database as default };
