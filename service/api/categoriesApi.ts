import { SERVICE_CATEGORY_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type { ServiceCategoryDto } from "./types";

export const categoriesApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCategories: builder.query<
      ServiceCategoryDto[],
      { search?: string } | void
    >({
      query: (arg) => {
        const search = arg && "search" in arg ? arg.search?.trim() : undefined;
        return {
          url: SERVICE_CATEGORY_ENDPOINTS.root,
          params: search ? { search } : undefined,
        };
      },
      providesTags: [{ type: "ServiceCategory", id: "LIST" }],
    }),
  }),
});

export const { useGetServiceCategoriesQuery } = categoriesApi;
