
// rxdb service for storing paired devices and their associated data
class BlueRetroDBService {
  constructor() {
    this.dbName = 'BlueRetroDB';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {}

}
