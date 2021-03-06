import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";

import { useDispatch } from "react-redux";
import farmsReducer from "./farms";
import poolsReducer from "./pools";
import blockReducer from "./block";

import achievements from "./achievements";
import application from "./application/reducer";
import { updateVersion } from "./global/actions";
import user from "./user/reducer";
import transactions from "./transactions/reducer";
import swap from "./swap/reducer";
import mint from "./mint/reducer";
import lists from "./lists/reducer";
import burn from "./burn/reducer";
import multicall from "./multicall/reducer";
import nftMarket from "./nftMarket/reducer";

const PERSISTED_KEYS: string[] = ["user", "transactions", "lists"];

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer: {
    achievements,
    block: blockReducer,
    farms: farmsReducer,
    pools: poolsReducer,

    // Exchange
    application,
    user,
    transactions,
    swap,
    mint,
    burn,
    multicall,
    lists,
    nftMarket,
  },
  middleware: [
    ...getDefaultMiddleware({ thunk: true }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
});

store.dispatch(updateVersion());

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch();

export default store;
