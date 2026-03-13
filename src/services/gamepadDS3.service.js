
export const DS3_BUTTONS = {
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  SELECT: 8,
  START: 9,
  HOME: 16,
  TRIANGLE: 3,
  CIRCLE: 1,
  SQUARE: 2,
  EQUIS: 0,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  L3: 10,
  R3: 11,
}

export const DS3_AXES = {
  LEFT_X: 0,
  LEFT_Y: 1,
  RIGHT_X: 2,
  RIGHT_Y: 3,
}

export class GamepadDS3Service {
  constructor() {
    this.gamepad = null
    this.buttons = []
    this.axes = []
    this.changeCallbacks = []

    window.addEventListener('gamepadconnected', (e) => {
      if (e.gamepad.id.includes('PLAYSTATION(R)3 Controller')) {
        this.gamepad = e.gamepad
        console.log('DS3 connected:', this.gamepad)
      }
    })

    window.addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.id.includes('PLAYSTATION(R)3 Controller')) {
        console.log('DS3 disconnected:', e.gamepad)
        this.gamepad = null
      }
    })

    // Polling loop to detect button changes
    this.polling = requestAnimationFrame(this.pollGamepad.bind(this))
  }

  onChange (callback) {
    this.changeCallbacks.push(callback)
  }

  arraysEqual (a, b) {
    if (a === b) return true
    if (!a || !b) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true
  }

  pollGamepad () {
    const currentGamepad = navigator.getGamepads()
      .find(gp => gp?.id.toLowerCase().startsWith('playstation'))

    if (currentGamepad) {
      const newButtons = currentGamepad.buttons.map(btn => btn.pressed)
      const newAxes = currentGamepad.axes.slice().map(value => Math.abs(value) < 0.1 ? 0 : value)
      
      const hasChanged = !this.arraysEqual(this.buttons, newButtons) ||
        !this.arraysEqual(this.axes, newAxes)

      if (hasChanged) {
         this.buttons = newButtons
         this.axes = newAxes
         this.changeCallbacks.forEach(cb => cb(newButtons, newAxes))
      }

    }

    this.polling = requestAnimationFrame(this.pollGamepad.bind(this))
  }
}

export const gamepadDS3Service = new GamepadDS3Service()

  