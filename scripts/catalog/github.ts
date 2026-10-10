export interface PreparedSubmission {
  slug: string;
  content: string;
  baseSha: string;
}
export type GitHubApi = (
  path: string,
  method?: string,
  body?: unknown,
  allowMissing?: boolean,
) => Promise<any>;
/** Only the accepted content file may be published; retries never overwrite editor changes. */
export async function publishSubmission(
  api: GitHubApi,
  repository: string,
  base: string,
  issue: number,
  prepared: PreparedSubmission,
): Promise<number> {
  const branch = `catalog/issue-${issue}`;
  const existing = await api(
    `/pulls?state=all&head=${repository.split("/")[0]}:${branch}`,
  );
  if (existing.length) return existing[0].number;
  const ref = await api(`/git/ref/heads/${encodeURIComponent(base)}`);
  if (ref.object.sha !== prepared.baseSha)
    throw new Error(
      "The validated base has changed. Rerun the workflow against current content.",
    );
  const branchRef = await api(
    `/git/ref/heads/${encodeURIComponent(branch)}`,
    "GET",
    undefined,
    true,
  );
  const path = `content/tools/${prepared.slug}.json`;
  if (branchRef) {
    const comparison = await api(
      `/compare/${prepared.baseSha}...${encodeURIComponent(branch)}`,
    );
    const files = comparison.files ?? [];
    if (
      files.some(
        (file: any) => file.filename !== path || file.status !== "added",
      )
    )
      throw new Error(
        "Existing submission branch contains unrelated changes; review it manually.",
      );
  } else
    await api("/git/refs", "POST", {
      ref: `refs/heads/${branch}`,
      sha: prepared.baseSha,
    });
  const file = await api(
    `/contents/${path}?ref=${encodeURIComponent(branch)}`,
    "GET",
    undefined,
    true,
  );
  if (file) {
    if (
      Buffer.from(file.content, "base64").toString("utf8") !== prepared.content
    )
      throw new Error(
        "Existing submission content has changed; review it manually.",
      );
  } else
    await api(`/contents/${path}`, "PUT", {
      message: `Add ${prepared.slug} from issue #${issue}`,
      content: Buffer.from(prepared.content).toString("base64"),
      branch,
    });
  const latest = await api(`/git/ref/heads/${encodeURIComponent(base)}`);
  if (latest.object.sha !== prepared.baseSha)
    throw new Error(
      "The validated base has changed. Rerun the workflow against current content.",
    );
  const pr = await api("/pulls", "POST", {
    title: `Add tool: ${prepared.slug}`,
    head: branch,
    base,
    body: `Adds the validated public record from #${issue}.\n\nCatalog validation, tests, type checking and production build passed before this PR was created. An editor must review the content and merge the PR to publish.\n\nCloses #${issue}`,
  });
  return pr.number;
}
