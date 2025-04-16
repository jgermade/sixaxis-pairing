
const VENDOR_ID_SONY = 0x054C; // Sony
const PRODUCT_ID_SIXAXIS = 0x0268; // Sixaxis

const CONTROLLER_MAC_REPORT_ID = 0xF2
const PAIRED_MAC_REPORT_ID = 0xF5


export class SixaxisController {
  async connect () {
    if (this.device?.opened) return

    const devices = await navigator.hid.requestDevice({
      filters: [{
        vendorId: VENDOR_ID_SONY,
        productId: PRODUCT_ID_SIXAXIS,
      }],
    })

    if (devices.length === 0) {
      throw new Error("No Sixaxis controller found.")
    }

    this.device = devices[0]

    if (this.device?.opened) return
    
    await this.device.open()
  }

  async #getMacAddress (reportId) {
    const report = await this.device.receiveFeatureReport(reportId);
    // MAC is from byte 4 to 9 (6 bytes)
    const mac = [...new Uint8Array(report.buffer.slice(4, 10))]
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':');
    return mac;
  }

  async getSelfMacAddress () {
    return await this.#getMacAddress(CONTROLLER_MAC_REPORT_ID)
  }

  async getPairedMacAddress () {
    return await this.#getMacAddress(PAIRED_MAC_REPORT_ID)
  }

  async setPairedMac(macAddress) {
    const macBytes = macAddress.split(':').map(b => parseInt(b, 16))
    if (macBytes.length !== 6) {
      throw new Error("Invalid MAC address format.")
    }
  
    // 16-byte buffer, with MAC placed at bytes 2-7
    const buffer = new Uint8Array(16);
    buffer[0] = PAIRED_MAC_REPORT_ID;
    buffer[1] = 0x00;
    for (let i = 0; i < 6; i++) {
      buffer[i + 2] = macBytes[i]
    }
  
    await this.device.sendFeatureReport(PAIRED_MAC_REPORT_ID, buffer)
    // console.log("Paired MAC address set.")
  }

  close () {
    this.device?.forget()
    this.device = null
  }
}

/// ---


let device = null;

async function connectController() {
  const devices = await navigator.hid.requestDevice({
    filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }]
  });

  if (devices.length === 0) {
    throw new Error("No Sixaxis controller found.");
  }

  device = devices[0];
  await device.open();
  console.log("Connected to Sixaxis controller.");
}

async function getMacAddress(reportId) {
  const report = await device.receiveFeatureReport(reportId);
  // MAC is from byte 4 to 9 (6 bytes)
  const mac = [...new Uint8Array(report.buffer.slice(4, 10))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':');
  return mac;
}

async function setPairedMac(macAddress) {
  const macBytes = macAddress.split(':').map(b => parseInt(b, 16));
  if (macBytes.length !== 6) {
    throw new Error("Invalid MAC address format.");
  }

  // 16-byte buffer, with MAC placed at bytes 2-7
  const buffer = new Uint8Array(16);
  buffer[0] = SET_PAIRED_MAC_REPORT_ID;
  buffer[1] = 0x00;
  for (let i = 0; i < 6; i++) {
    buffer[i + 2] = macBytes[i];
  }

  await device.sendFeatureReport(SET_PAIRED_MAC_REPORT_ID, buffer);
  console.log("Paired MAC address set.");
}

async function runExample() {
  await connectController();

  const controllerMac = await getMacAddress(CONTROLLER_MAC_REPORT_ID);
  console.log("Controller MAC:", controllerMac);

  const pairedMac = await getMacAddress(CONNECTED_MAC_REPORT_ID);
  console.log("Paired MAC:", pairedMac);

  // ⚠️ Solo descomenta si quieres cambiar la MAC
  // await setPairedMac("00:11:22:33:44:55");

  device.forget()
}