/**
 * Wrapper function to log methods of a class.
 * @param target any
 * @param propertyKey Class properties key
 * @param descriptor Property descriptior
 * @returns PropertyDescriptor
 */
export function logAtExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Class ${target.constructor.name}: ${propertyKey} method called`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}
