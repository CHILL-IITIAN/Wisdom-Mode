"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "./Toast";

export default function FavoriteButton({
  itemType,
  itemId,
  initial,
  loggedIn,
  variant = "star",
}: {
  itemType: "wisdom" | "reflection";
  itemId: string;
  initial: boolean;
  loggedIn: boolean;
  variant?: "star" | "button";
}) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      toast("Sign in to save favorites");
      router.push("/login");
      return;
    }
    const next = !on;
    setOn(next);
    start(async () => {
      const res = await fetch("/api/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId }),
      });
      if (!res.ok) {
        setOn(!next);
        toast("Something went wrong");
        return;
      }
      toast(next ? "✦ Saved to your favorites" : "Removed from favorites");
      router.refresh();
    });
  }

  if (variant === "button") {
    return (
      <button
        className={`btn ${on ? "btn-ghost" : "btn-gold"}`}
        onClick={toggle}
        disabled={pending}
        aria-pressed={on}
      >
        {on ? "★ Saved to Favorites" : "☆ Save to Favorites"}
      </button>
    );
  }

  return (
    <button
      className={`fav${on ? " on" : ""}`}
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Save to favorites"}
      title={on ? "Remove from favorites" : "Save to favorites"}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
