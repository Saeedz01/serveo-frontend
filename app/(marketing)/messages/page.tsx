import { redirect } from "next/navigation";

/** Seekers open the dashboard messages tab (chat backend later). */
export default function MessagesPage() {
  redirect("/seeker/dashboard?tab=messages");
}
