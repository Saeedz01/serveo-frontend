import { SERVICE_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  CreateServiceRequest,
  ServiceDto,
  UpdateServiceRequest,
} from "./types";

export const servicesApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedServices: builder.query<ServiceDto[], void>({
      query: () => SERVICE_ENDPOINTS.published,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Service" as const, id })),
              { type: "Service", id: "PUBLISHED" },
            ]
          : [{ type: "Service", id: "PUBLISHED" }],
    }),
    getMyServices: builder.query<ServiceDto[], void>({
      query: () => SERVICE_ENDPOINTS.mine,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Service" as const, id })),
              { type: "Service", id: "MINE" },
            ]
          : [{ type: "Service", id: "MINE" }],
    }),
    getService: builder.query<ServiceDto, string>({
      query: (id) => SERVICE_ENDPOINTS.byId(id),
      providesTags: (_result, _error, id) => [{ type: "Service", id }],
    }),
    createService: builder.mutation<ServiceDto, CreateServiceRequest>({
      query: (body) => ({
        url: SERVICE_ENDPOINTS.root,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Service", id: "MINE" },
        { type: "Service", id: "PUBLISHED" },
      ],
    }),
    updateService: builder.mutation<
      ServiceDto,
      { id: string; body: UpdateServiceRequest }
    >({
      query: ({ id, body }) => ({
        url: SERVICE_ENDPOINTS.byId(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Service", id },
        { type: "Service", id: "MINE" },
        { type: "Service", id: "PUBLISHED" },
      ],
    }),
    deleteService: builder.mutation<{ ok: true }, string>({
      query: (id) => ({
        url: SERVICE_ENDPOINTS.byId(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Service", id },
        { type: "Service", id: "MINE" },
        { type: "Service", id: "PUBLISHED" },
      ],
    }),
  }),
});

export const {
  useGetPublishedServicesQuery,
  useGetMyServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
