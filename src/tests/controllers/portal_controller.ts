import { Controller } from "../../core/controller"

class BasePortalController extends Controller {
  static portals = ["item"]
  static targets = ["item"]

  itemTarget!: Element
  itemTargets!: Element[]
  hasItemTarget!: boolean
}

export class PortalController extends BasePortalController {
  static classes = ["connected", "disconnected"]
  static portals = ["beta", "gamma"]
  static targets = ["beta", "gamma"]

  static values = {
    betaPortalConnectedCallCount: Number,
    betaPortalDisconnectedCallCount: Number,
    gammaPortalConnectedCallCount: Number,
    gammaPortalDisconnectedCallCount: Number,
  }

  betaTarget!: Element
  betaTargets!: Element[]
  hasBetaTarget!: boolean

  gammaTarget!: Element
  gammaTargets!: Element[]
  hasGammaTarget!: boolean

  hasConnectedClass!: boolean
  hasDisconnectedClass!: boolean
  connectedClass!: string
  disconnectedClass!: string

  betaPortalConnectedCallCountValue = 0
  betaPortalDisconnectedCallCountValue = 0
  gammaPortalConnectedCallCountValue = 0
  gammaPortalDisconnectedCallCountValue = 0

  connect() {
    // Initialize any necessary state
  }
}
