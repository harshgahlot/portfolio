// Site-wide navigation link. Re-exports next-view-transitions' `Link` so every
// internal navigation triggers the View Transitions API cross-fade defined in
// globals.css, instead of importing next/link directly around the app.
export { Link as TransitionLink } from "next-view-transitions";
