import { AUTH_ENDPOINTS } from "../endpoint";
import { setAccessToken, splitApi } from "../splitApiSetting";
import type {
  AdminLoginRequest,
  AdminSignupRequest,
  AuthResponse,
  ProviderLoginRequest,
  ProviderSignupRequest,
  SeekerLoginRequest,
  SeekerSignupRequest,
} from "./types";

export const authApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    adminSignup: builder.mutation<AuthResponse, AdminSignupRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.adminSignup,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.accessToken);
      },
    }),
    adminLogin: builder.mutation<AuthResponse, AdminLoginRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.adminLogin,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.accessToken);
      },
    }),
    seekerSignup: builder.mutation<AuthResponse, SeekerSignupRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.seekerSignup,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.accessToken);
      },
    }),
    seekerLogin: builder.mutation<AuthResponse, SeekerLoginRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.seekerLogin,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.accessToken);
      },
    }),
    providerSignup: builder.mutation<AuthResponse, ProviderSignupRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.providerSignup,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.accessToken);
      },
    }),
    providerLogin: builder.mutation<AuthResponse, ProviderLoginRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.providerLogin,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.accessToken);
      },
    }),
  }),
});

export const {
  useAdminSignupMutation,
  useAdminLoginMutation,
  useSeekerSignupMutation,
  useSeekerLoginMutation,
  useProviderSignupMutation,
  useProviderLoginMutation,
} = authApi;
