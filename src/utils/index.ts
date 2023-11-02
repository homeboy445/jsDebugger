
export const mapListenerEventPerMode = (mode: string) => {
  return {
    ["CHANGE"]: `${mode}-change`,
    ["ERROR"]: `${mode}-error`
  };
}

export const isObject = (element: any): boolean => {
  return element && typeof element == "object" && !Array.isArray(element);
};
