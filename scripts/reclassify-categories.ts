/**
 * Reclassify categories in data/tools.json from the v2 keyword router.
 *
 * Does NOT modify Supabase (run pnpm seed separately to apply).
 *
 * Output: a JSON diff printed to stdout and a backup of the original file
 *   at data/tools.json.bak-<timestamp>.
 *
 * Usage: pnpm tsx scripts/reclassify-categories.ts [--write]
 *   (default mode: dry-run + print diff only; --write mutates data/tools.json)
 */

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");
const FINDLY_PATH = "/Users/lonnie/Desktop/findly_results/findly_tools.json";

/* ── Top-level taxonomy (18 tops) + sub-classes ─────────────────────────────── */
const TOP = {
  "Image & Design": [
    "AI Image Generator", "AI Photo Editor", "AI Logo Generator", "AI Image Enhancer",
    "AI Background Remover", "Text to Image AI", "AI Art Generator", "AI Image Extender",
    "AI 3D Model Generator", "AI Headshot Generator", "AI Interior Design",
    "Image to Image AI", "AI Avatar Generator", "AI OCR", "AI Graphic Design",
    "AI Product Photography", "Image to 3D Model",
  ],
  "Video": ["AI Video Generator", "AI Video Editor", "Image to Video AI", "Text to Video AI", "AI Lip Sync"],
  "Voice & Audio": ["AI Voice Generator", "AI Music Generator", "Text to Speech AI", "AI Voice Cloning", "Speech to Text AI"],
  "AI Productivity": [
    "AI Agent", "AI Chatbot", "AI Presentation Maker", "AI Search Engine", "AI Note Taker",
    "AI Assistant", "AI PDF", "AI Workflow", "AI Document Generator", "AI Meeting Notes", "AI Spreadsheet",
  ],
  "Writing & Text": ["AI Translator", "AI Summarizer", "AI Writer", "AI Content Creator"],
  "Coding & Development": ["AI Website Builder", "AI App Builder", "AI Code Generator"],
  "Life Assistant": ["AI Resume Builder"],
  "Marketing & Advertising": ["AI SEO Tools", "AI Marketing", "AI Ad Generator", "AI Analytics", "AI Ad Creative"],
  "Education & Learning": ["AI Tutor", "AI Education", "AI Answer"],
  "Business & Finance": ["AI Research", "AI E-commerce"],
  "Resources & Directories": ["Directories", "Productized Services", "Boilerplates", "Chrome Extensions", "Website Builders", "No Code"],
  "SaaS Productivity": ["Productivity", "Automation", "Monitoring", "Project Management", "Email"],
  "Communication & Support": ["Customer Support", "Chatbots", "Community"],
  "E-commerce & Sales": ["Ecommerce", "Sales"],
  "Freelance & Lifestyle": ["Freelancer Tools", "Blogging", "Remote Work", "Building Products", "Ios", "Education", "Fintech"],
  "API & Proxy": ["AI Image API", "AI Video API", "AI Music API", "AI Text API", "Coding Proxy"],
  "AI Detection": ["AI Detector", "AI Humanizer", "AI Grammar Checker"],
  "Other": ["AI Models"],
};

const TOP_OF = new Map<string, string>();
for (const [top, subs] of Object.entries(TOP)) for (const s of subs) TOP_OF.set(s, top);

/* ── Top-level → legacy 8-slug mapping (data contract unchanged) ─────────── */
const TOP_TO_LEGACY: Record<string, string> = {
  "Image & Design": "image-video",
  "Video": "image-video",
  "Voice & Audio": "image-video",
  "Writing & Text": "writing-content",
  "AI Productivity": "productivity",
  "Coding & Development": "code-development",
  "Marketing & Advertising": "seo-marketing",
  "Education & Learning": "research-data",
  "Business & Finance": "business-analytics",
  "Resources & Directories": "research-data",
  "SaaS Productivity": "productivity",
  "Communication & Support": "productivity",
  "E-commerce & Sales": "ecommerce-sales",
  "Life Assistant": "productivity",
  "Freelance & Lifestyle": "productivity",
  "AI Detection": "productivity",
  "API & Proxy": "code-development",
  "Other": "productivity",
};

/* ── Findly raw-category anchors ──────────────────────────────────────────── */
const FINDLY_RAW: Record<string, string | null> = {
  "Ai": null,
  "Ai Agents": "AI Productivity",
  "Productivity": "SaaS Productivity",
  "Design": "Image & Design",
  "Directories": "Resources & Directories",
  "Video": "Video",
  "Marketing": "Marketing & Advertising",
  "Developer Tools": "Coding & Development",
  "Developer Apis": "API & Proxy",
  "Education": "Education & Learning",
  "Social Media": "Marketing & Advertising",
  "Seo": "Marketing & Advertising",
  "SEO": "Marketing & Advertising",
  "Community": "Communication & Support",
  "Content Creation": "Writing & Text",
  "Fintech": "Freelance & Lifestyle",
  "Productized Services": "Resources & Directories",
  "Writing": "Writing & Text",
  "Analytics": "Marketing & Advertising",
  "Boilerplates": "Resources & Directories",
  "Freelancer Tools": "Freelance & Lifestyle",
  "Chrome Extensions": "Resources & Directories",
  "Ecommerce": "E-commerce & Sales",
  "Sales": "E-commerce & Sales",
  "No Code": "Coding & Development",
  "Building Products": "Freelance & Lifestyle",
  "Automation": "SaaS Productivity",
  "Website Builders": "Coding & Development",
  "Ios": "Freelance & Lifestyle",
  "Monitoring": "SaaS Productivity",
  "Customer Support": "Communication & Support",
  "Blogging": "Freelance & Lifestyle",
  "Chatbots": "AI Productivity",
  "Email Marketing": "Marketing & Advertising",
  "Remote Work": "Freelance & Lifestyle",
};

/* ── Keyword signals ──────────────────────────────────────────────────────── */
const SIGNALS: Record<string, string[]> = {
  "AI Image Generator": ["text to image","text-to-image","image generator","ai image generat","generate image","create image","image from text","image from prompt","image diffusion","image maker"],
  "AI Photo Editor": ["photo editor","image editor","edit photo","photo edit","ai photo editor","photoshop alternative","remove object from photo","retouch photo"],
  "AI Logo Generator": ["logo generat","logo maker","create logo","ai logo","logo design"],
  "AI Image Enhancer": ["image enhance","image upscal","upscale image","upscaler","photo enhance","image quality","image improver","fix photo"],
  "AI Background Remover": ["background remover","remove background","bg remover","remove bg","background removal"],
  "Text to Image AI": ["text to image","text-to-image","txt2img"],
  "AI Art Generator": ["ai art","art generator","ai artwork","generate art","art style","style transfer"],
  "AI Image Extender": ["image extend","outpaint","expand image","image outpainting"],
  "AI 3D Model Generator": ["3d model","3d asset","text to 3d","3d generat","3d from text","blender ai","mesh generat"],
  "AI Headshot Generator": ["headshot","ai headshot","portrait headshot","professional headshot","linkedin photo"],
  "AI Interior Design": ["interior design","room design","floor plan","home design","room layout"],
  "Image to Image AI": ["image to image","image-to-image","img2img"],
  "AI Avatar Generator": ["avatar generat","ai avatar","avatar maker","create avatar","ai portrait","face generat"],
  "AI OCR": ["ocr","extract text from image","image to text","document ocr","text extraction"],
  "AI Graphic Design": ["graphic design","banner maker","thumbnail maker","poster maker","design template"],
  "AI Product Photography": ["product photo","product shoot","product imagery","ecommerce photo"],
  "Image to 3D Model": ["image to 3d","photo to 3d","image into 3d","picture to 3d"],
  "AI Video Generator": ["video generat","generate video","video maker","create video","ai video creation","video from text","ai video"],
  "AI Video Editor": ["video editor","edit video","video editing","video cut","video trimming"],
  "Image to Video AI": ["image to video","image-to-video"],
  "Text to Video AI": ["text to video","text-to-video"],
  "AI Lip Sync": ["lip sync","lip-sync","lipsync","sync lips"],
  "AI Voice Generator": ["voice generat","ai voice","voice over","voice maker","ai narrator","text to voice"],
  "AI Music Generator": ["music generat","ai music","generate music","song generat","create music","music ai","song maker","make song"],
  "Text to Speech AI": ["text to speech","text-to-speech","tts ","tts.","text-to-voice"],
  "AI Voice Cloning": ["voice clon","clone voice","voice mimic"],
  "Speech to Text AI": ["speech to text","transcrib","speech recognition","voice to text","audio transcrib","mp3 to text"],
  "AI Agent": [" ai agent","agentic"," ai worker","agent framework","ai agents that","autonomous agent"],
  "AI Chatbot": ["chatbot","chat bot"," ai chat ","talk to ai"],
  "AI Presentation Maker": ["presentation maker","slide maker","make slides","ai presentation","slideshow","ai slides"],
  "AI Search Engine": ["search engine","ai search","search powered"],
  "AI Note Taker": ["note taker","ai notes","ai note-taking","audio note","voice note to"],
  "AI Assistant": ["ai assistant"," ai copilot"," ai helper","personal ai"," ai companion"],
  "AI PDF": [" pdf ","pdf chat","talk to pdf","pdf ai","chat with pdf"],
  "AI Workflow": ["workflow automation","automate workflow"," ai workflow","workflow builder"],
  "AI Document Generator": ["document generat","generate document"," doc gen","ai document","document automation"],
  "AI Meeting Notes": ["meeting notes","meeting summary","zoom notes","meeting summary tool","transcribe meeting","recording to notes"],
  "AI Spreadsheet": ["spreadsheet","excel ai","sheet ai"," ai excel"],
  "AI Translator": ["translat","language translat"," ai translate","translate manga","translate email"],
  "AI Summarizer": ["summariz","summary "," ai summary","youtube summary","video summary","pdf summary"],
  "AI Writer": [" ai writer","write blog","essay writer","ai writing tool","blog writer"," ai authoring"," ai author","write an article"],
  "AI Content Creator": ["content creator","content creation tool","ai content","content generat","rewrite","rewriter"],
  "AI Website Builder": ["website builder","build website","site builder","ai website"," ai webpage"],
  "AI App Builder": ["app builder","build app","no-code app","nocode app","build an app","ai app"],
  "AI Code Generator": ["code generat","code assistant","code completion"," ai coding"," ai code ","copilot for code","ai for developers"," ai engineer"],
  "AI Resume Builder": ["resume builder","resume maker","cv builder","build resume","ai resume","cover letter"],
  "AI SEO Tools": ["seo tool","seo audit","rank tracker","keyword research"," ai seo","seo analyzer","backlink","ai search results"],
  "AI Marketing": ["marketing tool","marketing platform","marketing ai","marketing automation","growth marketing","marketing campaign","email verifier","email validation","lead generation","lead gen"],
  "AI Ad Generator": ["ad generator","ad creative generat","create ads","ai ads"],
  "AI Ad Creative": ["ad creative generator","facebook ad","google ad","ad copy"," ai ad"],
  "AI Analytics": ["analytics tool"," ai for analytics","ai analytics","ai-powered analytics","llm analytics","traffic analytics","ai insights"],
  "AI Tutor": ["ai tutor"," ai tutoring","study helper"," ai coach","homework helper"],
  "AI Education": ["education tool","learning platform","for education","for students"," ai for education","k-12","academic tool","school planner","study app","math solver"],
  "AI Answer": ["answer engine","answer question","answer ai"," ai answer"],
  "AI Research": ["research tool","research assistant","deep research"," ai researcher","ai research","ai hedge","trading analysis","backtest"],
  "AI E-commerce": ["ecommerce tool","shopify ai","ecommerce ai","ai for ecommerce","storefront"],
  "AI Image API": ["image api","image generation api","api for image","image generative api"],
  "AI Video API": ["video api","video generation api","api for video"],
  "AI Music API": ["music api","audio api","sound api"],
  "AI Text API": ["text api"," llm api","language api","text generation api","openai api","gpt api","api marketplace"],
  "Coding Proxy": ["proxy","reverse proxy","unblock","vpn","anti-censorship"],
  "AI Detector": ["ai detect","detect ai","ai-generated detection","detect if image was","ai content detector"," ai text detect"," ai plagiarism"],
  "AI Humanizer": ["humaniz","bypass gpt","bypass ai","anti ai detector","humanize ai"],
  "AI Grammar Checker": ["grammar check","grammarly","spell check","grammar corrector"," ai grammar"],
  "Directories": [" ai directory"," ai tool directory","tool directory","submit your","submit site","directory of"," backlink","launch directory","ai directory","news aggregator","ai news","tech news","list of","tool list"," ai list"," ai tools list"," ai product"],
  "Productized Services": ["productized service","service marketplace"," ai service","marketplace","book a "],
  "Boilerplates": ["boilerplate","starter kit","saas starter","next.js starter"," ai starter","tailwind starter"],
  "Chrome Extensions": ["chrome extension","browser extension"," chrome "],
  "Website Builders": ["website builder","site builder"," ai website"],
  "No Code": ["no-code","no code","nocode","low-code"],
  "Productivity": ["productivity tool","todo ","task manager","task management","kanban","project board","todo list","to-do"," ai todo","habit tracker","agile","kanban"],
  "Automation": ["automation tool","automate "," ai automation","browser automation","workflow tool"],
  "Monitoring": ["monitoring tool","monitor ","tracking tool","uptime monitor"," ai monitoring"],
  "Project Management": ["project management","sprint planning","agile","task planning"],
  "Email": ["email marketing","email tool","email finder","email verification","email warmup"," ai email","temp mail","temporary email","inbox"],
  "Customer Support": ["customer support tool","support inbox","ticket support","helpdesk","support software"," ai customer support"],
  "Chatbots": ["chatbot platform","chatbot builder","chatbot framework"],
  "Community": ["community platform","community builder","online community","membership community"],
  "Ecommerce": ["ecommerce platform","ecommerce store","online store","ecommerce software"," ai fashion","clothes","jewelry"," ai jewelry"],
  "Sales": ["sales tool","crm","lead generation","lead gen"," ai sales","sales outreach"],
  "Freelancer Tools": ["freelancer tool","freelance tool","for freelancers","client management"],
  "Blogging": ["blog writing","blog platform","blog ai","publish blog"],
  "Remote Work": ["remote work","remote team","distributed team","work from anywhere","digital nomad"],
  "Building Products": ["product builder","build a product","make a product"," ai for makers"," ai hobby","ai meme"],
  "Ios": ["ios app"," ai ios","apple ios"],
  "Education": ["education platform","learning app","course platform","study app"," ai education"],
  "Fintech": ["fintech","finance tool","finance app","budgeting tool","investment app"," ai finance","trading bot","stock tool","tax tool","loan tool","crypto tool"],
  "AI Models": [" llm ","language model","model comparison"," ai model","model benchmark"," gpt "," claude ","all-in-one ai"],
};

/* ── Classifier: findly tool → (top, sub, legacy) ──────────────── */
type Cls = { top: string; sub: string; legacy: string };

function classify(tool: any): Cls {
  const primary = (tool.category ?? [])[0] ?? null;
  const haystack = [tool.name ?? "", tool.description ?? ""].join(" \n ").toLowerCase();
  const anchoredTop = FINDLY_RAW[primary] ?? null;

  const scored: [string, number][] = [];
  for (const [sub, sigs] of Object.entries(SIGNALS)) {
    let s = 0;
    for (const sig of sigs) if (haystack.includes(sig)) s += sig.split(" ").length;
    if (s > 0) scored.push([sub, s]);
  }
  let bestSub: string | null = null;
  let bestScore = 0;
  if (scored.length > 0) {
    scored.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    [bestSub, bestScore] = scored[0];
  }
  if (bestSub && bestScore >= 1) {
    const top = TOP_OF.get(bestSub) ?? "Other";
    return { top, sub: bestSub, legacy: TOP_TO_LEGACY[top] ?? "productivity" };
  }
  const top = anchoredTop ?? "Other";
  return { top, sub: "(none)", legacy: TOP_TO_LEGACY[top] ?? "productivity" };
}

/* ── Pipeline ────────────────────────────────────────────────────── */

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldWrite = args.has("--write");

  const findly = JSON.parse(await readFile(FINDLY_PATH, "utf8")) as any[];
  const tools = JSON.parse(await readFile(TOOLS_PATH, "utf8")) as any[];

  const findlyByUrl = new Map<string, any>();
  for (const t of findly) {
    const u = (t.official_url ?? "").replace(/\/$/, "");
    if (u) findlyByUrl.set(u, t);
  }

  let reclassed = 0;
  let unchanged = 0;
  let missing = 0;
  const examples: string[] = [];
  const changes: Array<{ slug: string; from: string; to: string; sub: string }> = [];

  for (const t of tools) {
    const u = (t.url ?? "").replace(/\/$/, "");
    const f = findlyByUrl.get(u);
    if (!f) { missing++; continue; }
    const c = classify(f);
    if (t.primary_category !== c.legacy) {
      reclassed++;
      changes.push({
        slug: t.slug,
        from: t.primary_category,
        to: c.legacy,
        sub: c.sub,
      });
      if (examples.length < 12) examples.push(`${t.slug}: ${t.primary_category} → ${c.legacy} (${c.top} / ${c.sub})`);
      if (shouldWrite) t.primary_category = c.legacy;
    } else {
      unchanged++;
    }
  }

  console.log(`Total: ${tools.length}`);
  console.log(`Re-classified: ${reclassed}`);
  console.log(`Stays same: ${unchanged}`);
  console.log(`Missing in findly: ${missing}`);
  console.log(`\nFirst 12 changes:`);
  for (const ex of examples) console.log(`  ${ex}`);

  if (!shouldWrite) {
    console.log(`\nDRY-RUN (no file changes). To write, run: pnpm tsx scripts/reclassify-categories.ts --write`);
    return;
  }

  // Backup
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupPath = TOOLS_PATH.replace(".json", `.bak-${ts}.json`);
  if (!existsSync(backupPath)) {
    await copyFile(TOOLS_PATH, backupPath);
    console.log(`\nBackup written: ${backupPath}`);
  }
  await writeFile(TOOLS_PATH, JSON.stringify(tools, null, 2), "utf8");
  console.log(`Wrote ${tools.length} tools to ${TOOLS_PATH}`);
  console.log(`Supabase is NOT touched. Run pnpm seed separately to propagate.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
