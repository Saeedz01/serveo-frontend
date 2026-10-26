import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { splitApi } from "./splitApiSetting";

// Ensure injected endpoints are registered on the split API.
import "./api/authApi";
import "./api/biddingApi";
import "./api/bookingsApi";
import "./api/categoriesApi";
import "./api/jobsApi";
import "./api/messagesApi";
import "./api/notificationsApi";
import "./api/servicesApi";
import "./api/tokensApi";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [splitApi.reducerPath]: splitApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(splitApi.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
