import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/privacy",
  "/terms",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/v1(.*)",
  "/api/webhooks(.*)",
  "/robots.txt",
  "/sitemap.xml",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jit|jpg|jpeg|gif|png|webp|svg|woff2?|ttf|eot|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
