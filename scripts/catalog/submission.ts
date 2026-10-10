import { execFileSync } from "node:child_process";
import { publishSubmission, type PreparedSubmission } from "./github";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { toolFromIssue } from "../../features/submissions/issue";
import { readContent } from "./source";
interface Event {
  action: string;
  label: { name: string };
  issue: { number: number; title: string; body: string; html_url: string };
  repository: { full_name: string; default_branch: string };
}
const mode = process.argv[2];
const event = JSON.parse(
  readFileSync(process.env.GITHUB_EVENT_PATH!, "utf8"),
) as Event;
if (event.action !== "labeled" || event.label.name !== "catalog:accepted")
  throw new Error("A maintainer must accept the issue first");
const repository = process.env.GITHUB_REPOSITORY;
if (
  !repository ||
  event.repository.full_name !== repository ||
  !/^[\w.-]+\/[\w.-]+$/.test(repository)
)
  throw new Error("Invalid repository");
if (!Number.isSafeInteger(event.issue.number) || event.issue.number < 1)
  throw new Error("Invalid issue number");
if (mode === "prepare") {
  const tool = toolFromIssue(event.issue.body, readContent());
  const content = JSON.stringify(tool, null, 2) + "\n";
  writeFileSync(`content/tools/${tool.slug}.json`, content);
  mkdirSync(".catalog", { recursive: true });
  writeFileSync(
    ".catalog/submission.json",
    JSON.stringify({
      slug: tool.slug,
      content,
      baseSha: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
    }),
  );
  console.log(
    `Prepared tool ${tool.slug} from accepted issue #${event.issue.number}`,
  );
} else if (mode === "publish") {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error("Missing GitHub token");
  const prepared = JSON.parse(
    readFileSync(".catalog/submission.json", "utf8"),
  ) as PreparedSubmission;
  const endpoint = `https://api.github.com/repos/${repository}`;
  async function api(
    path: string,
    method = "GET",
    body?: unknown,
    allowMissing = false,
  ): Promise<any> {
    const response = await fetch(endpoint + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (allowMissing && response.status === 404) return null;
    if (!response.ok)
      throw new Error(`GitHub ${method} ${path} failed (${response.status})`);
    return response.json();
  }
  const number = await publishSubmission(
    api,
    repository,
    event.repository.default_branch,
    event.issue.number,
    prepared,
  );
  console.log(`Review PR #${number} is ready`);
} else throw new Error("Usage: submission.ts prepare | publish");
