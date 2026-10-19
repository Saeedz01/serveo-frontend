import { io, type Socket } from "socket.io-client";
import type {
  AcceptBiddingResponse,
  BiddingDto,
} from "@/service/api";
import { API_BASE_URL } from "@/service/endpoint";

export type JoinJobAuth =
  | { token: string }
  | { phone: string; name?: string };

export type BidAcceptedEvent = AcceptBiddingResponse;

function biddingSocketUrl() {
  // API_BASE_URL is typically http://localhost:3001/api — Socket.io namespace is on the host.
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(`${biddingSocketUrl()}/bidding`, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return sharedSocket;
}

export function joinJobBiddingRoom(
  jobId: string,
  auth: JoinJobAuth,
): Promise<{ ok: boolean; error?: string }> {
  const socket = getSocket();
  return new Promise((resolve) => {
    const payload =
      "token" in auth
        ? { jobId, token: auth.token }
        : { jobId, phone: auth.phone, name: auth.name };

    const connectAndJoin = () => {
      socket
        .timeout(8000)
        .emit(
          "joinJob",
          payload,
          (err: Error | null, response?: { ok?: boolean; error?: string }) => {
            if (err) {
              resolve({ ok: false, error: err.message });
              return;
            }
            resolve({
              ok: Boolean(response?.ok),
              error: response?.error,
            });
          },
        );
    };

    if (socket.connected) {
      connectAndJoin();
      return;
    }

    socket.once("connect", connectAndJoin);
    socket.connect();
  });
}

export function leaveJobBiddingRoom(jobId: string) {
  const socket = sharedSocket;
  if (!socket?.connected) return;
  socket.emit("leaveJob", { jobId });
}

export function onBidCreated(
  handler: (bid: BiddingDto) => void,
): () => void {
  const socket = getSocket();
  const listener = (bid: BiddingDto) => {
    handler(bid);
  };
  socket.on("bid:created", listener);
  return () => {
    socket.off("bid:created", listener);
  };
}

export function onBidsUpdated(
  handler: (bids: BiddingDto[]) => void,
): () => void {
  const socket = getSocket();
  const listener = (bids: BiddingDto[]) => {
    handler(bids);
  };
  socket.on("bids:updated", listener);
  return () => {
    socket.off("bids:updated", listener);
  };
}

/** Provider joins a private room for instant bid-accepted alerts. */
export function joinProviderRoom(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const socket = getSocket();
  return new Promise((resolve) => {
    const connectAndJoin = () => {
      socket
        .timeout(8000)
        .emit(
          "joinProvider",
          { token },
          (err: Error | null, response?: { ok?: boolean; error?: string }) => {
            if (err) {
              resolve({ ok: false, error: err.message });
              return;
            }
            resolve({
              ok: Boolean(response?.ok),
              error: response?.error,
            });
          },
        );
    };

    if (socket.connected) {
      connectAndJoin();
      return;
    }

    socket.once("connect", connectAndJoin);
    socket.connect();
  });
}

export function leaveProviderRoom(token: string) {
  const socket = sharedSocket;
  if (!socket?.connected) return;
  socket.emit("leaveProvider", { token });
}

export function onBidAccepted(
  handler: (payload: BidAcceptedEvent) => void,
): () => void {
  const socket = getSocket();
  const listener = (payload: BidAcceptedEvent) => {
    handler(payload);
  };
  socket.on("bid:accepted", listener);
  return () => {
    socket.off("bid:accepted", listener);
  };
}

export function upsertBidSorted(
  bids: BiddingDto[],
  next: BiddingDto,
): BiddingDto[] {
  const without = bids.filter((bid) => bid.id !== next.id);
  return [...without, next].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
