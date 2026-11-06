import { TOKEN_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  TokenBalanceDto,
  UnlockContactRequest,
  UnlockContactResponse,
} from "./types";

export const tokensApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyTokenBalance: builder.query<TokenBalanceDto, void>({
      query: () => TOKEN_ENDPOINTS.me,
      providesTags: [{ type: "Token", id: "ME" }],
    }),
    unlockContact: builder.mutation<
      UnlockContactResponse,
      UnlockContactRequest
    >({
      query: (body) => ({
        url: TOKEN_ENDPOINTS.unlock,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Token", id: "ME" },
        ...(arg.targetType === "BOOKING"
          ? [
              { type: "Booking" as const, id: arg.targetId },
              { type: "Booking" as const, id: "PROVIDER" },
              { type: "Booking" as const, id: "MINE" },
            ]
          : [
              { type: "Job" as const, id: arg.targetId },
              { type: "Job" as const, id: "PROVIDER_FEED" },
            ]),
      ],
    }),
  }),
});

export const { useGetMyTokenBalanceQuery, useUnlockContactMutation } =
  tokensApi;
