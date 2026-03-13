
import { createRxDatabase } from 'rxdb/plugins/core'
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage'

import { addRxPlugin } from 'rxdb/plugins/core'

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

import { replicateGoogleDrive } from 'rxdb/plugins/replication-google-drive'

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin)
}

addRxPlugin(RxDBUpdatePlugin)
 
export async function initDatabase({
  name = 'blueretrodb',
  version = 0,
} = {}) {
  const storage = wrappedValidateAjvStorage({
    storage: getRxStorageLocalstorage()
  })

  const db = await createRxDatabase({
    name,          // name of the database
    storage,
    // password: 'myPassword',    // optional encryption password
    // multiInstance: true,       // multi-tab support
    // eventReduce: true          // optimize event handling
  });
 
  await db.addCollections({
    devices: {
      schema: {
        title: 'device schema',
        version,
        primaryKey: 'mac',
        type: 'object',
        properties: {
          mac: {
            type: 'string',
            maxLength: 255,
          },
          id: { type: 'string' },
          name: { type: 'string' },
          alias: { type: 'string' },
        }
      }
    },
  });
 
  return db;
}

// rxdb service for storing paired devices and their associated data
export class BlueRetroDBService {
  constructor() {
    this.dbName = 'blueretrodb';
    this.dbVersion = 0;
    this.db = null;
  }

  async connect () {
    if (this.db) {
      throw new Error('Database already connected')
    }

    this.db = await initDatabase({
      name: this.dbName, 
      version: this.dbVersion,
    })

    // this.#initReplication()

    return this
  }

  async addDevice({ name, mac, id = '', alias = '' }) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    // insert if not exists, otherwise update
    let device = await this.db.devices.findOne({ selector: { mac } }).exec()
    if (device) {
      await device.update({
        $set: { name, id, alias },
      })
    } else {
      device = await this.db.devices.insert({ mac, name, id, alias })
    }

    // const device = await this.db.devices.insert({ id, name, macAddress })
    return device
  }

  async getDeviceById(id) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const device = await this.db.devices.findOne({ selector: { id } }).exec()
    return device
  }

  onUpdateList(callback) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    this.db.devices.find().$.subscribe(devices => {
      callback(devices)
    })
  }

  async getAllDevices() {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const devices = await this.db.devices.find().exec()
    return devices
  }

  async updateDevice(id, updateData) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const device = await this.getDeviceById(id)
    if (!device) {
      throw new Error('Device not found')
    }

    const updatedDevice = await device.atomicUpdate(() => {
      Object.assign(device, updateData)
      return device
    })

    return updatedDevice
  }

  async removeDeviceByMAC(mac) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const device = await this.db.devices.findOne({ selector: { mac } }).exec()
    if (!device) {
      throw new Error('Device not found')
    }

    await device.remove()
  }

  async deleteDevice(id) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const device = await this.getDeviceById(id)
    if (!device) {
      throw new Error('Device not found')
    }

    await device.remove()
  }

  async initReplication ({ oauthClientId = null, authToken = null } = {}) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    if (!oauthClientId) {
      throw new Error('Google Drive OAuth client ID is required for replication')
    }

    if (!authToken) {
      throw new Error('Google Drive auth token is required for replication')
    }

    console.log({
      oauthClientId,
      authToken,
    })

    const replicationState = await replicateGoogleDrive({
      replicationIdentifier: 'sixaxis-devices-replication',
      collection: this.db.devices, // RxCollection
      googleDrive: {
        oauthClientId,
        authToken,
        folderPath: 'sixaxis-pairing'
      },
      live: true,
      pull: {
        batchSize: 60,
        modifier: doc => doc // (optional) modify invalid data
      },
      push: {
        batchSize: 60,
        modifier: doc => doc // (optional) modify before sending
      }
    })

    // Observe replication states
    replicationState.error$.subscribe(err => {
      console.error('Replication error:', err)
    })

    replicationState.awaitInitialReplication().then(() => {
      console.log('Initial replication done')
    })
  }

}

export const blueretroDBService = new BlueRetroDBService()

// DB replication

// const replicationState = await replicateGoogleDrive({
//   replicationIdentifier: 'sixaxis-devices-replication',
//   collection: myRxCollection, // RxCollection
//   googleDrive: {
//       oauthClientId: 'YOUR_GOOGLE_CLIENT_ID',
//       authToken: 'USER_ACCESS_TOKEN',
//       folderPath: 'my-app-data/user-1'
//   },
//   live: true,
//   pull: {
//       batchSize: 60,
//       modifier: doc => doc // (optional) modify invalid data
//   },
//   push: {
//       batchSize: 60,
//       modifier: doc => doc // (optional) modify before sending
//   }
// });

// // Observe replication states
// replicationState.error$.subscribe(err => {
//   console.error('Replication error:', err);
// });

// replicationState.awaitInitialReplication().then(() => {
//   console.log('Initial replication done');
// });
