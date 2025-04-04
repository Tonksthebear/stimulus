import { Scope } from "./scope"

export class PortalSet {
  readonly scope: Scope
  readonly controllerElement: Element

  constructor(scope: Scope, controllerElement: Element) {
    this.scope = scope
    this.controllerElement = controllerElement
  }

  get element() {
    return this.scope.element
  }

  get identifier() {
    return this.scope.identifier
  }

  get schema() {
    return this.scope.schema
  }

  has(portalName: string) {
    return this.find(portalName) != null
  }

  find(...portalNames: string[]) {
    return portalNames.reduce(
      (portal, portalName) => portal || this.findPortal(portalName),
      undefined as Element | undefined
    )
  }

  findAll(...portalNames: string[]) {
    return portalNames.reduce(
      (portals, portalName) => [...portals, ...this.findAllPortals(portalName)],
      [] as Element[]
    )
  }

  getSelectorForPortalName(portalName: string) {
    const attributeName = this.schema.portalAttributeForScope(this.identifier, portalName)
    return this.controllerElement.getAttribute(attributeName)
  }

  private findPortal(portalName: string) {
    const selector = this.getSelectorForPortalName(portalName)
    if (selector) return this.findElement(selector)
  }

  private findAllPortals(portalName: string) {
    const selector = this.getSelectorForPortalName(portalName)
    return selector ? this.findAllElements(selector) : []
  }

  private findElement(selector: string): Element | undefined {
    // Use document scope to find elements anywhere in the DOM
    return document.querySelector(selector) || undefined
  }

  private findAllElements(selector: string): Element[] {
    // Use document scope to find elements anywhere in the DOM
    return Array.from(document.querySelectorAll(selector))
  }
}
