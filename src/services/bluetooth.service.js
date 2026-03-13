
export class BluetoothService {
  static async requestDevice (options = {
    acceptAllDevices: true,
    optionalServices: ['battery_service', 'device_information']
  }) {
    return await navigator.bluetooth.requestDevice(options)
  }

  static getDeviceInfo (device) {
    return {
      name: device.name,
      id: device.id,
      isConnected: device.gatt.connected,
    }
  }

  static async connectDevice (device) {
    if (!device.gatt.connected) {
      await device.gatt.connect()
    }
  }

  static async disconnectDevice (device) {
    if (device.gatt.connected) {
      await device.gatt.disconnect()
    }
  }
}