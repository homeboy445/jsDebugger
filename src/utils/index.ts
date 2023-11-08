
export const getEventModeGetter = (modeName: string) => {
  const events = {
    ["CHANGE"]: `${modeName}-change`,
    ["ERROR"]: `${modeName}-error`
  };
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
