export function logAtExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Class ${target.constructor.name}: ${propertyKey} method called`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}
