import { BIDDING_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  AcceptBiddingResponse,
  BiddingDto,
  CreateBiddingRequest,
} from "./types";

export const biddingApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    createBidding: builder.mutation<BiddingDto, CreateBiddingRequest>({
      query: (body) => ({
        url: BIDDING_ENDPOINTS.root,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "Bidding", id: body.jobId },
        { type: "Bidding", id: `MINE-${body.jobId}` },
      ],
    }),
    acceptBidding: builder.mutation<
      AcceptBiddingResponse,
      { bidId: string; jobId: string }
    >({
      query: ({ bidId }) => ({
        url: BIDDING_ENDPOINTS.accept(bidId),
        method: "POST",
        body: {},
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Bidding", id: arg.jobId },
        { type: "Bidding", id: `MINE-${arg.jobId}` },
        { type: "Job", id: arg.jobId },
        { type: "Job", id: "LIST" },
        { type: "Booking", id: "MINE" },
        { type: "Booking", id: "PROVIDER" },
        { type: "Notification", id: "LIST" },
      ],
    }),
    getJobBiddings: builder.query<BiddingDto[], string>({
      query: (jobId) => BIDDING_ENDPOINTS.forJob(jobId),
      providesTags: (_result, _error, jobId) => [
        { type: "Bidding", id: jobId },
      ],
    }),
    getMyBiddingOnJob: builder.query<BiddingDto | null, string>({
      async queryFn(jobId, _api, _extraOptions, baseQuery) {
        const result = await baseQuery(BIDDING_ENDPOINTS.myBid(jobId));
        if (result.error) {
          if (result.error.status === 404) {
            return { data: null };
          }
          return { error: result.error };
        }
        return { data: (result.data as BiddingDto) ?? null };
      },
      providesTags: (_result, _error, jobId) => [
        { type: "Bidding", id: `MINE-${jobId}` },
      ],
    }),
  }),
});

export const {
  useAcceptBiddingMutation,
  useCreateBiddingMutation,
  useGetJobBiddingsQuery,
  useGetMyBiddingOnJobQuery,
} = biddingApi;
