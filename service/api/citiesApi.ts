import { SERVICE_CITY_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  CreateServiceCityRequest,
  ServiceCityDto,
  UpdateServiceCityRequest,
} from "./types";

export const citiesApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCities: builder.query<
      ServiceCityDto[],
      { includeInactive?: boolean } | void
    >({
      query: (arg) => ({
        url: SERVICE_CITY_ENDPOINTS.root,
        params:
          arg && "includeInactive" in arg && arg.includeInactive
            ? { includeInactive: "true" }
            : undefined,
      }),
      providesTags: [{ type: "ServiceCity", id: "LIST" }],
    }),
    createServiceCity: builder.mutation<ServiceCityDto, CreateServiceCityRequest>(
      {
        query: (body) => ({
          url: SERVICE_CITY_ENDPOINTS.root,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "ServiceCity", id: "LIST" }],
      },
    ),
    updateServiceCity: builder.mutation<
      ServiceCityDto,
      { id: string; body: UpdateServiceCityRequest }
    >({
      query: ({ id, body }) => ({
        url: SERVICE_CITY_ENDPOINTS.byId(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "ServiceCity", id: "LIST" }],
    }),
    deleteServiceCity: builder.mutation<{ ok: true }, string>({
      query: (id) => ({
        url: SERVICE_CITY_ENDPOINTS.byId(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ServiceCity", id: "LIST" }],
    }),
  }),
});

export const {
  useGetServiceCitiesQuery,
  useCreateServiceCityMutation,
  useUpdateServiceCityMutation,
  useDeleteServiceCityMutation,
} = citiesApi;
