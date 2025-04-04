import { Multimap } from "../multimap"
import { AttributeObserver, AttributeObserverDelegate } from "../mutation-observers"
import { SelectorObserver, SelectorObserverDelegate } from "../mutation-observers"
import { Context } from "./context"

import { readInheritableStaticArrayValues } from "./inheritable_statics"

type PortalObserverDetails = { portalName: string }

export interface PortalObserverDelegate {
  portalConnected(element: Element, portalName: string): void
  portalDisconnected(element: Element, portalName: string): void
}

export class PortalObserver implements AttributeObserverDelegate, SelectorObserverDelegate {
  started: boolean
  readonly context: Context
  readonly delegate: PortalObserverDelegate
  readonly portalsByName: Multimap<string, Element>
  private selectorObserverMap: Map<string, SelectorObserver>
  private attributeObserverMap: Map<string, AttributeObserver>

  constructor(context: Context, delegate: PortalObserverDelegate) {
    this.started = false
    this.context = context
    this.delegate = delegate
    this.portalsByName = new Multimap()
    this.selectorObserverMap = new Map()
    this.attributeObserverMap = new Map()
  }

  start() {
    if (!this.started) {
      this.portalDefinitions.forEach((portalName) => {
        this.setupSelectorObserverForPortal(portalName)
        this.setupAttributeObserverForPortal(portalName)
      })
      this.started = true
      this.dependentContexts.forEach((context) => context.refresh())
    }
  }

  refresh() {
    this.selectorObserverMap.forEach((observer) => observer.refresh())
    this.attributeObserverMap.forEach((observer) => observer.refresh())
  }

  stop() {
    if (this.started) {
      this.started = false
      this.disconnectAllPortals()
      this.stopSelectorObservers()
      this.stopAttributeObservers()
    }
  }

  stopSelectorObservers() {
    if (this.selectorObserverMap.size > 0) {
      this.selectorObserverMap.forEach((observer) => observer.stop())
      this.selectorObserverMap.clear()
    }
  }

  stopAttributeObservers() {
    if (this.attributeObserverMap.size > 0) {
      this.attributeObserverMap.forEach((observer) => observer.stop())
      this.attributeObserverMap.clear()
    }
  }

  // Selector observer delegate

  selectorMatched(element: Element, _selector: string, { portalName }: PortalObserverDetails) {
    const portalSelector = element.getAttribute(this.schema.portalAttributeForScope(this.identifier, portalName))
    if (!portalSelector) return

    // Find all matching portal elements
    const portalElements = Array.from(document.querySelectorAll(portalSelector))
    portalElements.forEach(portalElement => {
      this.connectPortal(portalElement, portalName)
    })
  }

  selectorUnmatched(element: Element, _selector: string, { portalName }: PortalObserverDetails) {
    const portalElements = this.portalsByName.getValuesForKey(portalName)
    portalElements.forEach(portalElement => {
      this.disconnectPortal(portalElement, portalName)
    })
  }

  selectorMatchElement(element: Element, { portalName }: PortalObserverDetails) {
    const selector = this.selector(portalName)
    if (selector) {
      return element.matches(selector)
    } else {
      return false
    }
  }

  // Attribute observer delegate

  elementMatchedAttribute(_element: Element, attributeName: string) {
    const portalName = this.getPortalNameFromPortalAttributeName(attributeName)
    if (portalName) {
      this.updateSelectorObserverForPortal(portalName)
    }
  }

  elementAttributeValueChanged(_element: Element, attributeName: string) {
    const portalName = this.getPortalNameFromPortalAttributeName(attributeName)
    if (portalName) {
      this.updateSelectorObserverForPortal(portalName)
    }
  }

  elementUnmatchedAttribute(_element: Element, attributeName: string) {
    const portalName = this.getPortalNameFromPortalAttributeName(attributeName)
    if (portalName) {
      this.updateSelectorObserverForPortal(portalName)
    }
  }

  // Portal management

  connectPortal(element: Element, portalName: string) {
    if (!this.portalsByName.has(portalName, element)) {
      this.portalsByName.add(portalName, element)
      this.selectorObserverMap.get(portalName)?.pause(() => this.delegate.portalConnected(element, portalName))
    }
  }

  disconnectPortal(element: Element, portalName: string) {
    if (this.portalsByName.has(portalName, element)) {
      this.portalsByName.delete(portalName, element)
      this.selectorObserverMap
        .get(portalName)
        ?.pause(() => this.delegate.portalDisconnected(element, portalName))
    }
  }

  disconnectAllPortals() {
    for (const portalName of this.portalsByName.keys) {
      for (const element of this.portalsByName.getValuesForKey(portalName)) {
        this.disconnectPortal(element, portalName)
      }
    }
  }

  // Observer management

  private updateSelectorObserverForPortal(portalName: string) {
    const observer = this.selectorObserverMap.get(portalName)
    if (observer) {
      observer.selector = this.selector(portalName)
    }
  }

  private setupSelectorObserverForPortal(portalName: string) {
    const selector = this.selector(portalName)
    if (selector) {
      const selectorObserver = new SelectorObserver(document.body, selector, this, { portalName })
      this.selectorObserverMap.set(portalName, selectorObserver)
      selectorObserver.start()
    }
  }

  private setupAttributeObserverForPortal(portalName: string) {
    const attributeName = this.attributeNameForPortalName(portalName)
    const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this)
    this.attributeObserverMap.set(portalName, attributeObserver)
    attributeObserver.start()
  }

  // Private

  private selector(portalName: string) {
    return this.scope.portals.getSelectorForPortalName(portalName)
  }

  private attributeNameForPortalName(portalName: string) {
    return this.scope.schema.portalAttributeForScope(this.identifier, portalName)
  }

  private getPortalNameFromPortalAttributeName(attributeName: string) {
    return this.portalDefinitions.find((portalName) => this.attributeNameForPortalName(portalName) === attributeName)
  }

  private get portalDependencies() {
    const dependencies = new Multimap<string, string>()
    this.router.modules.forEach((module) => {
      const constructor = module.definition.controllerConstructor
      const portals = readInheritableStaticArrayValues(constructor, "portals")
      portals.forEach((portal) => dependencies.add(portal, module.identifier))
    })
    return dependencies
  }

  private get portalDefinitions() {
    return this.portalDependencies.getKeysForValue(this.identifier)
  }

  private get dependentControllerIdentifiers() {
    return this.portalDependencies.getValuesForKey(this.identifier)
  }

  private get dependentContexts() {
    const identifiers = this.dependentControllerIdentifiers
    return this.router.contexts.filter((context) => identifiers.includes(context.identifier))
  }

  private get schema() {
    return this.scope.schema
  }

  private get identifier() {
    return this.scope.identifier
  }

  private get router() {
    return this.application.router
  }

  private get application() {
    return this.context.application
  }

  private get scope() {
    return this.context.scope
  }
}
