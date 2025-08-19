declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export function jsxDEV(
  type: any,
  props: any,
  key?: any,
  isStaticChildren?: any,
  source?: any,
  self?: any
) {
  return {
    type,
    props,
    key,
    isStaticChildren,
    source,
    self,
  };
}
