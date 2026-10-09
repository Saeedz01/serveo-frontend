import { redirect } from "next/navigation";

/** Seekers do not start chats — they track requests and open negotiation threads from there. */
export default function MessagesPage() {
  redirect("/requests");
}
