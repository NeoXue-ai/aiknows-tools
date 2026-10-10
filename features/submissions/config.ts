/** Public contribution channels; external forms can override the GitHub defaults. */
export const contactEmail = "hello@aiknows.tools";
const repositoryUrl = "https://github.com/NeoXue-ai/aiknows-tools";
function configuredUrl(name: string, fallback: string) {
  const value = process.env[name]?.trim() || fallback;
  const url = new URL(value);
  if (
    !["https:", "mailto:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error(`${name} must be an HTTPS or mailto URL`);
  return url.toString();
}
export const submissionUrl = configuredUrl(
  "SUBMISSION_URL",
  `${repositoryUrl}/issues/new?template=tool.yml`,
);
export const correctionsUrl = configuredUrl(
  "CORRECTIONS_URL",
  `${repositoryUrl}/issues/new?template=correction.yml`,
);
export const submissionAction = submissionUrl.startsWith("mailto:")
  ? "Submit tool details by email"
  : submissionUrl.startsWith(`${repositoryUrl}/issues/`)
    ? "Submit tool details on GitHub"
    : "Open submission form";
