import { Constructor } from "./constructor"
import { Controller } from "./controller"
import { readInheritableStaticArrayValues } from "./inheritable_statics"
import { capitalize, namespaceCamelize } from "./string_helpers"

export function PortalPropertiesBlessing<T>(constructor: Constructor<T>) {
  const portals = readInheritableStaticArrayValues(constructor, "portals")
  return portals.reduce((properties: any, portalDefinition: any) => {
    return Object.assign(properties, propertiesForPortalDefinition(portalDefinition))
  }, {} as PropertyDescriptorMap)
}

function getPortalController(controller: Controller, element: Element, identifier: string) {
  return controller.application.getControllerForElementAndIdentifier(element, identifier)
}

function getControllerAndEnsureConnectedScope(controller: Controller, element: Element, portalName: string) {
  let portalController = getPortalController(controller, element, portalName)
  if (portalController) return portalController

  controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, portalName)

  portalController = getPortalController(controller, element, portalName)
  if (portalController) return portalController
}

function propertiesForPortalDefinition(name: string) {
  const camelizedName = namespaceCamelize(name)

  return {
    [`${camelizedName}Portal`]: {
      get(this: Controller) {
        const portalElement = this.portals.find(name)
        const selector = this.portals.getSelectorForPortalName(name)

        if (portalElement) {
          const portalController = getControllerAndEnsureConnectedScope(this, portalElement, name)

          if (portalController) return portalController

          throw new Error(
            `The provided portal element is missing a portal controller "${name}" instance for host controller "${this.identifier}"`
          )
        }

        throw new Error(
          `Missing portal element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching portal element using selector "${selector}".`
        )
      },
    },

    [`${camelizedName}Portals`]: {
      get(this: Controller) {
        const portals = this.portals.findAll(name)

        if (portals.length > 0) {
          return portals
            .map((portalElement: Element) => {
              const portalController = getControllerAndEnsureConnectedScope(this, portalElement, name)

              if (portalController) return portalController

              console.warn(
                `The provided portal element is missing a portal controller "${name}" instance for host controller "${this.identifier}"`,
                portalElement
              )
            })
            .filter((controller) => controller) as Controller[]
        }

        return []
      },
    },

    [`${camelizedName}PortalElement`]: {
      get(this: Controller) {
        const portalElement = this.portals.find(name)
        const selector = this.portals.getSelectorForPortalName(name)

        if (portalElement) {
          return portalElement
        } else {
          throw new Error(
            `Missing portal element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching portal element using selector "${selector}".`
          )
        }
      },
    },

    [`${camelizedName}PortalElements`]: {
      get(this: Controller) {
        return this.portals.findAll(name)
      },
    },

    [`has${capitalize(camelizedName)}Portal`]: {
      get(this: Controller) {
        return this.portals.has(name)
      },
    },
  }
}
