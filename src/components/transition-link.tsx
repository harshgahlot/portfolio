"use client";

// Site-wide navigation link. In production builds this is next-view-transitions'
// `Link`, so internal navigations trigger the View Transitions API cross-fade
// defined in globals.css. In development it falls back to plain next/link:
// dev-mode on-demand compilation makes route updates slow enough to trip the
// browser's ~4s view-transition timeout ("Transition was aborted because of
// timeout in DOM update"), and a pending transition freezes the page and
// swallows all pointer events while it hangs.
import NextLink from "next/link";
import { Link as VTLink } from "next-view-transitions";

export const TransitionLink =
  process.env.NODE_ENV === "development" ? NextLink : VTLink;
