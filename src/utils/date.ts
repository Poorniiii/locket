export const todayLocalDate = (): string =>
  new Date().toLocaleString("en-GB").substring(0, 10);

export const formatTimeOfDay = (iso?: string): string | null => {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};
