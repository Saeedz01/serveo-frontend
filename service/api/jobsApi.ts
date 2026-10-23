import { JOB_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type { CreateJobRequest, JobDto } from "./types";

export const jobsApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    createJob: builder.mutation<JobDto, CreateJobRequest>({
      query: (body) => ({
        url: JOB_ENDPOINTS.root,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Job", id: "MINE" },
        { type: "Job", id: "PROVIDER_FEED" },
      ],
    }),
    getMyJobs: builder.query<JobDto[], void>({
      query: () => JOB_ENDPOINTS.mine,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Job" as const, id })),
              { type: "Job", id: "MINE" },
            ]
          : [{ type: "Job", id: "MINE" }],
    }),
    getProviderJobFeed: builder.query<JobDto[], void>({
      query: () => JOB_ENDPOINTS.providerFeed,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Job" as const, id })),
              { type: "Job", id: "PROVIDER_FEED" },
            ]
          : [{ type: "Job", id: "PROVIDER_FEED" }],
    }),
    getJob: builder.query<JobDto, string>({
      query: (id) => JOB_ENDPOINTS.byId(id),
      providesTags: (_result, _error, id) => [{ type: "Job", id }],
    }),
    closeJob: builder.mutation<JobDto, string>({
      query: (id) => ({
        url: JOB_ENDPOINTS.close(id),
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        { type: "Job", id: "MINE" },
        { type: "Job", id: "PROVIDER_FEED" },
      ],
    }),
  }),
});

export const {
  useCreateJobMutation,
  useGetMyJobsQuery,
  useGetProviderJobFeedQuery,
  useGetJobQuery,
  useCloseJobMutation,
} = jobsApi;
