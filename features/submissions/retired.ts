import { submissionUrl } from "./config";
export function retiredEndpoint() {
  return Response.json(
    {
      error:
        "This endpoint has been retired. Submit or correct a tool through the review form.",
      submissionUrl,
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
