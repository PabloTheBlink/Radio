import { RADIO_META_URL } from "../config/constants.js";

export function getMeta() {
  return fetch(RADIO_META_URL).then((r) => r.json());
}
