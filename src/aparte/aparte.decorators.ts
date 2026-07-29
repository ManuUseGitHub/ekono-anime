import * as eventRegistry from './aparte.registry.json'; // <-- runtime version

export function validateCombination<T extends { new (...args: any[]): {} }>(
  constructor: T
): T {
  return class extends constructor {
    constructor(...args: any[]) {
      const [branch, focus] = args;

      if (!(eventRegistry as any)[focus]?.includes(branch)) {
        const error = new Error();
        const stackLines = (error.stack || '').split('\n').slice(1);
        const callerLine = stackLines[2]?.trim() || 'Unknown caller';

        const message = [
          `\n   [EventBuilder] Invalid branch/focus combination: "${branch}.${focus}"`,
          `\n❌ Called from: ${callerLine}`,
          '\n***',
          'STACKTRACE:',
          ...stackLines.slice(2),
        ].join('\n');

        throw new Error(message);
      }

      super(...args);
    }
  };
}
export const debugOnly = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const error = new Error();
    const stackLines = (error.stack || '').split('\n');
    const callerInfo = stackLines[2]?.trim() || 'Unknown caller';

    console.warn(
      `[debugOnly] Method "${propertyKey}" should not be used in production.\n  Called from: ${callerInfo}`
    );

    return originalMethod.apply(this, args);
  };

  return descriptor;
};
