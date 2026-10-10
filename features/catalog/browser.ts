import type { ToolSummary } from "./types";
export class StaleCatalogError extends Error {}
const requests = new Map<string, Promise<unknown>>();
function load<T>(url: string): Promise<T> {
  let pending = requests.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (response.status === 404)
          throw new StaleCatalogError(
            "Directory version is no longer available",
          );
        if (!response.ok)
          throw new Error("The tool directory could not be loaded.");
        return response.json();
      })
      .catch((error) => {
        requests.delete(url);
        throw error;
      });
    requests.set(url, pending);
  }
  return pending as Promise<T>;
}
export function loadCards(base: string) {
  return load<ToolSummary[]>(`${base}/cards.json`);
}
export function loadSearch(base: string) {
  return load<Record<string, string>>(`${base}/search.json`);
}
