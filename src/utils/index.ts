
export const mapListenerEventPerMode = (mode: string) => {
  return {
    ["CHANGE"]: `${mode}-change`,
    ["ERROR"]: `${mode}-error`
  };
}

export const getEventModeGetter = (modeName: string) => {
  const events = mapListenerEventPerMode(modeName);
  return (id: number) => {
    return {
      CHANGE: events.CHANGE + ":" + id,
      ERROR: events.ERROR + ":" + id,
    };
  };
};

export const isObject = (element: any): boolean => {
  return element && typeof element == "object" && !Array.isArray(element);
};
