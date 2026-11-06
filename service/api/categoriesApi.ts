import { SERVICE_CATEGORY_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type { ServiceCategoryDto } from "./types";

export const categoriesApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCategories: builder.query<
      ServiceCategoryDto[],
      { search?: string; parentId?: string; rootsOnly?: boolean } | void
    >({
      query: (arg) => {
        const search = arg && "search" in arg ? arg.search?.trim() : undefined;
        const parentId =
          arg && "parentId" in arg ? arg.parentId?.trim() : undefined;
        const rootsOnly =
          arg && "rootsOnly" in arg ? Boolean(arg.rootsOnly) : false;
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (parentId) params.parentId = parentId;
        if (rootsOnly) params.rootsOnly = "true";
        return {
          url: SERVICE_CATEGORY_ENDPOINTS.root,
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: [{ type: "ServiceCategory", id: "LIST" }],
    }),
  }),
});

export const { useGetServiceCategoriesQuery } = categoriesApi;
