import type { StorePayload } from "../types";
import { monlevadeStorePayload } from "../mock";

export const getStoreByDomain = async (
  _hostname?: string | null
): Promise<StorePayload> => {
  return monlevadeStorePayload;
};
