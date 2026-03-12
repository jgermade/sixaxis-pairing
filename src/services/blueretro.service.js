
import { BluetoothService } from './bluetooth.service.js'

export const brUuid = [
  "56830f56-5180-fab0-314b-2fa176799a00",
  "56830f56-5180-fab0-314b-2fa176799a01",
  "56830f56-5180-fab0-314b-2fa176799a02",
  "56830f56-5180-fab0-314b-2fa176799a03",
  "56830f56-5180-fab0-314b-2fa176799a04",
  "56830f56-5180-fab0-314b-2fa176799a05",
  "56830f56-5180-fab0-314b-2fa176799a06",
  "56830f56-5180-fab0-314b-2fa176799a07",
  "56830f56-5180-fab0-314b-2fa176799a08",
  "56830f56-5180-fab0-314b-2fa176799a09",
  "56830f56-5180-fab0-314b-2fa176799a0a",
  "56830f56-5180-fab0-314b-2fa176799a0b",
  '56830f56-5180-fab0-314b-2fa176799a0c',
]

const getBdAddr = async (service) => {
  return await service.getCharacteristic(brUuid[12])
    .then(chrc => chrc.readValue())
    .then(value => [
      value.getUint8(5).toString(16).padStart(2, '0'),
      value.getUint8(4).toString(16).padStart(2, '0'),
      value.getUint8(3).toString(16).padStart(2, '0'),
      value.getUint8(2).toString(16).padStart(2, '0'),
      value.getUint8(1).toString(16).padStart(2, '0'),
      value.getUint8(0).toString(16).padStart(2, '0'),
    ].join(':'))
}

export class BlueretroService extends BluetoothService {
  static async requestBlueretroDevice () {
    return await BluetoothService.requestDevice({
      filters: [
        { namePrefix: 'BlueRetro' },
      ],
      optionalServices: [
        brUuid[0],
      ],
    })
  }

  static async getMAC (device) {
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(brUuid[0])
    const mac = await getBdAddr(service)
    
    return mac
  }
}
