
import { createRxDatabase } from 'rxdb/plugins/core'
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage'

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { addRxPlugin } from 'rxdb/plugins/core'


if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin)
}
 
export async function initDatabase({
  name = 'blueretrodb',
  version = 0,
} = {}) {
  const db = await createRxDatabase({
    name,          // name of the database
    storage: getRxStorageLocalstorage(),
    // password: 'myPassword',    // optional encryption password
    // multiInstance: true,       // multi-tab support
    // eventReduce: true          // optimize event handling
  });
 
  await db.addCollections({
    device: {
      schema: {
        title: 'device schema',
        version,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          mac: { type: 'string' },
        }
      }
    },
  });
 
  return db;
}

// rxdb service for storing paired devices and their associated data
export class BlueRetroDBService {
  constructor() {
    this.dbName = 'BlueRetroDB';
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
    return this
  }

  async addDevice({ id, name, mac }) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    // insert if not exists, otherwise update
    let device = await this.db.device.findOne({ selector: { id } }).exec()
    if (device) {
      device = await device.atomicUpdate(() => {
        device.name = name
        device.mac = mac
        return device
      })
    } else {
      device = await this.db.device.insert({ id, name, mac })
    }

    // const device = await this.db.device.insert({ id, name, macAddress })
    return device
  }

  async getDeviceById(id) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const device = await this.db.device.findOne({ selector: { id } }).exec()
    return device
  }

  onUpdateList(callback) {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    this.db.device.find().$.subscribe(devices => {
      callback(devices)
    })
  }

  async getAllDevices() {
    if (!this.db) {
      throw new Error('Database not connected')
    }

    const devices = await this.db.device.find().exec()
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

}

export const blueretroDBService = new BlueRetroDBService()

