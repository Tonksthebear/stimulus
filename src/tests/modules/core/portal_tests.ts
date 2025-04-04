import { ControllerTestCase } from "../../cases/controller_test_case"
import { PortalController } from "../../controllers/portal_controller"

export default class PortalTests extends ControllerTestCase(PortalController) {
  fixtureHTML = `
    <div id="container">
      <div data-controller="alpha" class="alpha" id="alpha1">
        <div data-alpha-target="item">Alpha Item 1</div>
        <div data-alpha-target="item">Alpha Item 2</div>
      </div>

      <div data-controller="beta" class="beta" id="beta1">
        <div data-beta-target="item">Beta Item 1</div>
        <div data-beta-target="item">Beta Item 2</div>
      </div>

      <div
        data-controller="${this.identifier}"
        data-${this.identifier}-connected-class="connected"
        data-${this.identifier}-disconnected-class="disconnected"
        data-${this.identifier}-alpha-portal="#alpha1"
        data-${this.identifier}-beta-portal=".beta"
        data-${this.identifier}-gamma-portal=".gamma"
      >
        <div data-controller="gamma" class="gamma" id="gamma2">
          <div data-gamma-target="item">Gamma Item 1</div>
        </div>
      </div>

      <div data-controller="gamma" class="gamma" id="gamma1">
        <div data-gamma-target="item">Gamma Item 2</div>
      </div>
    </div>
  `

  get identifiers() {
    return ["test", "alpha", "beta", "gamma"]
  }

  // "test PortalSet#find"() {
  //   this.assert.equal(this.controller.portals.find("alpha"), this.findElement("#alpha1"))
  //   this.assert.equal(this.controller.portals.find("beta"), this.findElement("#beta1"))
  //   this.assert.equal(this.controller.portals.find("gamma"), this.findElement("#gamma1"))
  // }

  // "test PortalSet#findAll"() {
  //   const alphaElements = this.findElements("#alpha1")
  //   const betaElements = this.findElements("#beta1")
  //   const gammaElements = this.findElements("#gamma1", "#gamma2")

  //   this.assert.deepEqual(this.controller.portals.findAll("alpha"), alphaElements)
  //   this.assert.deepEqual(this.controller.portals.findAll("beta"), betaElements)
  //   this.assert.deepEqual(this.controller.portals.findAll("gamma"), gammaElements)
  // }

  // "test PortalSet#has"() {
  //   this.assert.equal(this.controller.portals.has("alpha"), true)
  //   this.assert.equal(this.controller.portals.has("beta"), true)
  //   this.assert.equal(this.controller.portals.has("gamma"), true)
  // }

  // "test PortalSet#has when attribute gets added later"() {
  //   this.assert.equal(this.controller.portals.has("delta"), false)
  //   this.controller.element.setAttribute(`data-${this.identifier}-delta-portal`, ".delta")
  //   this.assert.equal(this.controller.portals.has("delta"), false) // Should still be false since no matching element exists
  // }

  // "test linked portal properties"() {
  //   // Test that portal targets are accessible through the base controller
  //   const alphaItems = this.findElements("#alpha1 [data-alpha-target='item']")
  //   const betaItems = this.findElements("#beta1 [data-beta-target='item']")
  //   const gammaItems = this.findElements("[data-gamma-target='item']")

  //   this.assert.deepEqual(this.controller.itemTargets, [...alphaItems, ...betaItems, ...gammaItems])
  //   this.assert.equal(this.controller.hasItemTarget, true)
  // }

  // "test portal target callbacks"() {
  //   // Test that portal target connected/disconnected callbacks are called
  //   const betaElement = this.findElement("#beta1")
  //   betaElement.remove()
  //   this.assert.equal(this.controller.betaPortalDisconnectedCallCountValue, 1)

  //   this.fixtureElement.appendChild(betaElement)
  //   this.assert.equal(this.controller.betaPortalConnectedCallCountValue, 1)
  // }
}
