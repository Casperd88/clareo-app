import type { Store, UnknownAction } from "@reduxjs/toolkit";

let store: Store<unknown, UnknownAction, unknown> | null = null;

export function setStoreForApi(s: Store<unknown, UnknownAction, unknown>) {
  store = s;
}

export function getStoreForApi() {
  return store;
}
