export const isObject = (element: any): boolean => {
  return element && typeof element == "object" && !Array.isArray(element);
};
