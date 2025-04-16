
const VENDOR_ID_SONY = 0x054C; // Sony
const PRODUCT_ID_SIXAXIS = 0x0268; // Sixaxis

const CONTROLLER_MAC_REPORT_ID = 0xf2
const PAIRED_MAC_REPORT_ID = 0xf5


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

  async #getMacAddress (reportId, sliceFrom, sliceTo) {
    const report = await this.device.receiveFeatureReport(reportId);

    const mac = [...new Uint8Array(report.buffer.slice(sliceFrom, sliceTo))]
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':');
    return mac;
  }

  async getSelfMacAddress () {
    return await this.#getMacAddress(CONTROLLER_MAC_REPORT_ID, 4, 10)
  }

  async getPairedMacAddress () {
    return await this.#getMacAddress(PAIRED_MAC_REPORT_ID, 2, 8)
  }

  async setPairedMac(macAddress) {
    const macBytes = macAddress.split(':').map(b => parseInt(b, 16))
    if (macBytes.length !== 6) {
      throw new Error("Invalid MAC address format.")
    }

    const reportData = new Uint8Array([PAIRED_MAC_REPORT_ID, ...macBytes])
  
    await this.device.sendFeatureReport(PAIRED_MAC_REPORT_ID, reportData)
  }

  close () {
    this.device?.forget()
    this.device = null
  }
}
