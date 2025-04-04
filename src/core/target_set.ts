import { Scope } from "./scope"

export class TargetSet {
  readonly scope: Scope

  constructor(scope: Scope) {
    this.scope = scope
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

  has(targetName: string) {
    return this.find(targetName) != null
  }

  find(...targetNames: string[]) {
    return targetNames.reduce(
      (target, targetName) => target || this.findTarget(targetName),
      undefined as Element | undefined
    )
  }

  findAll(...targetNames: string[]) {
    return targetNames.reduce(
      (targets, targetName) => [...targets, ...this.findAllTargets(targetName)],
      [] as Element[]
    )
  }

  private findTarget(targetName: string) {
    // First look in the controller's element
    const attributeName = this.scope.schema.targetAttributeForScope(this.scope.identifier)
    const selector = `[${attributeName}~="${targetName}"]`

    // Check if the element itself matches
    if (this.element.matches(selector)) {
      return this.element
    }

    // Look in the controller's element
    const elementTarget = this.scope.queryElements(selector).find(this.scope.containsElement)
    if (elementTarget) {
      return elementTarget
    }

    // Look in portal elements
    return this.findTargetInPortals(targetName)
  }

  private findAllTargets(targetName: string) {
    const attributeName = this.scope.schema.targetAttributeForScope(this.scope.identifier)
    const selector = `[${attributeName}~="${targetName}"]`

    // Get targets from the controller's element
    const elementTargets = [
      ...(this.element.matches(selector) ? [this.element] : []),
      ...this.scope.queryElements(selector).filter(this.scope.containsElement)
    ]

    // Get targets from portal elements
    const portalTargets = this.findAllTargetsInPortals(targetName)

    return [...elementTargets, ...portalTargets]
  }

  private findTargetInPortals(targetName: string) {
    // Get all portal elements
    const portalElements = this.scope.portals.findAll()

    // Look for the target in each portal element
    for (const portalElement of portalElements) {
      const attributeName = this.scope.schema.targetAttributeForScope(this.scope.identifier)
      const selector = `[${attributeName}~="${targetName}"]`
      const target = portalElement.querySelector(selector)
      if (target) {
        return target
      }
    }

    return undefined
  }

  private findAllTargetsInPortals(targetName: string) {
    // Get all portal elements
    const portalElements = this.scope.portals.findAll()

    // Look for all targets in each portal element
    const targets: Element[] = []
    for (const portalElement of portalElements) {
      const attributeName = this.scope.schema.targetAttributeForScope(this.scope.identifier)
      const selector = `[${attributeName}~="${targetName}"]`
      const portalTargets = Array.from(portalElement.querySelectorAll(selector))
      targets.push(...portalTargets)
    }

    return targets
  }
}
