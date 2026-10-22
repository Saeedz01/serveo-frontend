import { MESSAGE_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  MessageDto,
  MessagePageDto,
  MessageThreadDto,
  OpenMessageThreadRequest,
  SendMessageRequest,
} from "./types";

export const messagesApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessageThreads: builder.query<MessageThreadDto[], string | void>({
      query: (q) =>
        q && String(q).trim()
          ? MESSAGE_ENDPOINTS.threadsSearch(String(q).trim())
          : MESSAGE_ENDPOINTS.threads,
      providesTags: [{ type: "Message", id: "THREADS" }],
    }),
    getMessageThread: builder.query<MessageThreadDto, string>({
      query: (threadId) => MESSAGE_ENDPOINTS.thread(threadId),
      providesTags: (_r, _e, threadId) => [{ type: "Message", id: threadId }],
    }),
    getThreadMessages: builder.query<
      MessagePageDto,
      { threadId: string; cursor?: string; q?: string }
    >({
      query: ({ threadId, cursor, q }) =>
        MESSAGE_ENDPOINTS.messages(threadId, { cursor, q, limit: 40 }),
      providesTags: (_r, _e, { threadId }) => [
        { type: "Message", id: `MSGS-${threadId}` },
      ],
    }),
    openMessageThread: builder.mutation<
      MessageThreadDto,
      OpenMessageThreadRequest
    >({
      query: (body) => ({
        url: MESSAGE_ENDPOINTS.threads,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Message", id: "THREADS" }],
    }),
    sendThreadMessage: builder.mutation<
      MessageDto,
      { threadId: string; body: SendMessageRequest }
    >({
      query: ({ threadId, body }) => ({
        url: MESSAGE_ENDPOINTS.messages(threadId),
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { threadId }) => [
        { type: "Message", id: "THREADS" },
        { type: "Message", id: `MSGS-${threadId}` },
      ],
    }),
    markThreadRead: builder.mutation<{ ok: true }, string>({
      query: (threadId) => ({
        url: MESSAGE_ENDPOINTS.read(threadId),
        method: "POST",
      }),
      invalidatesTags: (_r, _e, threadId) => [
        { type: "Message", id: "THREADS" },
        { type: "Message", id: threadId },
      ],
    }),
  }),
});

export const {
  useGetMessageThreadsQuery,
  useGetMessageThreadQuery,
  useGetThreadMessagesQuery,
  useOpenMessageThreadMutation,
  useSendThreadMessageMutation,
  useMarkThreadReadMutation,
} = messagesApi;
