import debug from 'debug';

export const debugFactory = (namespace: string) => debug(`ky:${namespace}`);
