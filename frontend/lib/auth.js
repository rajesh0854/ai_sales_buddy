"use client";
// Lightweight client-side session (prototype only — no real security).
const KEY = "exl_sales_buddy_user";

export function saveUser(user) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(user));
}
export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}
export function clearUser() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
