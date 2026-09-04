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
import { existsSync, readFileSync } from "node:fs";

const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");
const FINDLY_PATH = "/Users/lonnie/Desktop/findly-crawl/findly_tools.json";

/* ── Top-level taxonomy (18 tops) + sub-classes ─────────────────────────────── */
const TOP = {
  "Image & Design": [
    "AI Image Generator", "AI Photo Editor", "AI Logo Generator", "AI Image Enhancer",
    "AI Background Remover", "AI Art Generator", "AI 3D Model Generator", "AI Headshot Generator",
    "AI Interior Design", "AI Avatar Generator", "AI OCR",
    "AI Graphic Design", "AI Product Photography", "Image to 3D Model",
  ],
  "Video": ["AI Video Generator", "AI Video Editor", "Image to Video AI", "Text to Video AI", "AI Lip Sync"],
  "Voice & Audio": ["AI Voice Generator", "AI Music Generator", "Text to Speech AI", "AI Voice Cloning", "Speech to Text AI"],
  "AI Productivity": [
    "AI Agent", "AI Chatbot", "AI Presentation Maker", "AI Search Engine", "AI Note Taker",
    "AI Assistant", "AI PDF", "AI Workflow", "AI Document Generator", "AI Spreadsheet",
  ],
  "Writing & Text": ["AI Translator", "AI Summarizer", "AI Writer", "AI Content Creator"],
  "Coding & Development": ["AI Website Builder", "AI App Builder", "AI Code Generator", "Developer Tools"],
  "Life Assistant": ["AI Resume Builder"],
  "Marketing & Advertising": ["AI SEO Tools", "AI Marketing", "AI Ad Creative", "AI Analytics", "Social Media"],
  "Education & Learning": ["AI Tutor", "AI Education", "AI Answer"],
  "Business & Finance": ["AI Research"],
  "Resources & Directories": ["Directories", "Productized Services", "Boilerplates", "Chrome Extensions", "Website Builders", "No Code"],
  "SaaS Productivity": ["Productivity Tools", "Automation", "Monitoring", "Project Management", "Email"],
  "Communication & Support": ["Customer Support", "Chatbots", "Community"],
  "E-commerce & Sales": ["Ecommerce", "Sales"],
  "Freelance & Lifestyle": ["Freelancer Tools", "Blogging", "Remote Work", "Building Products", "Ios", "Education", "Fintech"],
  "API & Proxy": ["AI Image API", "AI Video API", "AI Music API", "AI Text API", "Coding Proxy", "Developer APIs"],
  "AI Detection": ["AI Detector", "AI Humanizer", "AI Grammar Checker"],
  "Other": ["AI Models", "AI Entertainment", "AI Dating", "AI Travel", "AI Food & Nutrition"],
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
  "AI Image Generator": ["text to image","text-to-image","image generator","ai image generat","generate image","create image","image from text","image from prompt","image diffusion","image maker","image generation","dalle","ai image agent","generate images","ai image generation","image model","picture generator","ai image","4k image","4k images","hyperrealistic","이미지","image to image","image-to-image","img2img","img-to-img","inpainting","photo generator","photoreal","photorealistic","photorealism","sdxl","high-quality images","4k visuals","nano banana","nano-banana","nanobanana","photo prompt"],
  "AI Photo Editor": ["photo editor","image editor","edit photo","photo edit","ai photo editor","photoshop alternative","remove object from photo","retouch photo","edit images","photo editing","photo app","selfie","hairstyle","haircut","beard","makeover","couple photo","wedding photo","family photo","face swap","cutout","blur image","photo effect","retouch","photo tools","edit your photos","photo studio","merge photos","combine photos","image combiner","image editing","heic","webp to png","square without cropping","photo transformation","outfit","fashion analysis","grayscale","monochrome","make any image square","bridal","face rating"],
  "AI Logo Generator": ["logo generat","logo maker","create logo","ai logo","logo design","brand logo"],
  "AI Image Enhancer": ["image enhance","image upscal","upscale image","upscaler","photo enhance","image quality","image improver","fix photo","enhance photos","restore photo","sharpen","enlarge image","photo restore","ai enhancer","watermark","repair scratches","photo repair"],
  "AI Background Remover": ["background remover","remove background","bg remover","remove bg","background removal"],
  "AI Art Generator": ["ai art","art generator","ai artwork","generate art","art style","style transfer","digital art","artwork","painting","anime art","drawing","art from","storybook","manga","colorize","tattoo","tattoo generator","sketch generator"],
  "AI 3D Model Generator": ["3d model","3d asset","text to 3d","3d generat","3d from text","blender ai","mesh generat","3d model generator","3d object","normal map","normal maps","world generation","world model","world creation","3d environment","stl model","3d printable"],
  "AI Headshot Generator": ["headshot","ai headshot","portrait headshot","professional headshot","linkedin photo","corporate headshot","business headshot","passport photo"],
  "AI Interior Design": ["interior design","room design","floor plan","home design","room layout","landscape","yard design","outdoor design","garden design","house design","landscaping","ideal workspace","desk setup","virtual staging"],
  "AI Avatar Generator": ["avatar generat","ai avatar","avatar maker","create avatar","ai portrait","face generat","caricature","cartoon","character","anime","pfp","profile picture maker","consistent character","toon","avatar generator","animefy","cartoonify","avatar"],
  "AI OCR": ["ocr","extract text from image","image to text","document ocr","text extraction","scan document","extract text","to excel","extract table","table extraction","handwriting recognition","text from image"],
  "AI Graphic Design": ["graphic design","banner maker","thumbnail maker","poster maker","design template","icon","svg","app icon","emoji","favicon","brand kit","design resource","flyer","cover photo","card maker","invitation","design asset","infographic","design platform","ui kit","color palette","psd","wall art","text behind image","diagram generator","gif speed","interface engine"],
  "AI Product Photography": ["product photo","product shoot","product imagery","ecommerce photo","product photography"],
  "Image to 3D Model": ["image to 3d","photo to 3d","image into 3d","picture to 3d"],
  "AI Video Generator": ["video generat","generate video","video maker","create video","ai video creation","video from text","ai video","video generation","video model","video creator","video content","video clip","kling","seedance","sora","faceless video","talking video","video series","create videos","ai-generated video","video generation model","video production","movie generator","film maker"],
  "AI Video Editor": ["video editor","edit video","video editing","video cut","video trimming","trim video","merge video","video effects","video edit","video cropper"],
  "Image to Video AI": ["image to video","image-to-video","animate","animation","dance","photo to video","image to animation","animate photo","talking photo","still to video","animator","video from image"],
  "Text to Video AI": ["text to video","text-to-video"],
  "AI Lip Sync": ["lip sync","lip-sync","lipsync","sync lips"],
  "AI Voice Generator": ["voice generat","ai voice","voice over","voice maker","ai narrator","text to voice","voice generator","narration","voice over generator","podcast","prank call"],
  "AI Music Generator": ["music generat","ai music","generate music","song generat","create music","music ai","song maker","make song","music maker","beat maker","make music","music track","audio generation","soundtrack","sound effect","music from","music creation","lyrics","custom songs","humming","whistling","find any song","custom song","personalized song","ai songs","royalty-free music","vocals","stems","playlist","guitar tone","tone matching"],
  "Text to Speech AI": ["text to speech","text-to-speech","tts ","tts.","text-to-voice","speech generator"],
  "AI Voice Cloning": ["voice clon","clone voice","voice mimic","voice cloning"],
  "Speech to Text AI": ["speech to text","transcrib","speech recognition","voice to text","audio transcrib","mp3 to text","subtitle","caption","audio to text","video transcript","transcription","auto captions","subtitles","transcript"],
  "AI Agent": [" ai agent","agentic"," ai worker","agent framework","ai agents that","autonomous agent","multi-agent","agent platform","autonomous","agent that","skill registry","agent skills"],
  "AI Chatbot": ["chatbot","chat bot"," ai chat ","talk to ai","chat assistant","conversational ai","chatgpt wrapper"],
  "AI Presentation Maker": ["presentation maker","slide maker","make slides","ai presentation","slideshow","ai slides","powerpoint","google slides","slide deck","presentation"],
  "AI Search Engine": ["search engine","ai search","search powered","search assistant"],
  "AI Note Taker": ["note taker","ai notes","ai note-taking","audio note","voice note to","notes","journal","notepad","meeting summary","meeting notes","memo","note-taking","daily notes"],
  "AI Assistant": ["ai assistant"," ai copilot"," ai helper","personal ai"," ai companion","ai butler"],
  "AI PDF": [" pdf ","pdf chat","talk to pdf","pdf ai","chat with pdf","pdf tool","pdf editor","pdf reader","pdf converter","extract from pdf"],
  "AI Workflow": ["workflow automation","automate workflow"," ai workflow","workflow builder","workflow","zapier","n8n","automation platform","pipeline"],
  "AI Document Generator": ["document generat","generate document"," doc gen","ai document","document automation","contract generator","legal document","invoice generator","form builder","generate documents","signature"],
  "AI Spreadsheet": ["spreadsheet","excel ai","sheet ai"," ai excel","google sheets","csv","data to spreadsheet"],
  "AI Translator": ["translat","language translat"," ai translate","translate manga","translate email","translation"],
  "AI Summarizer": ["summariz","summary "," ai summary","youtube summary","video summary","pdf summary","summarize","digest","tl;dr","summarizer"],
  "AI Writer": [" ai writer","write blog","essay writer","ai writing tool","blog writer"," ai authoring"," ai author","write an article","story generator","story writer","novel writer","write a story","writing assistant","fiction","novel","author","short story","ai story","write your story","write a novel"],
  "AI Content Creator": ["content creator","content creation tool","ai content","content generat","rewrite","rewriter","social media post","caption","newsletter","copywriting","content writer","post generator","content marketing"],
  "AI Website Builder": ["website builder","build website","site builder","ai website"," ai webpage","landing page builder","landing pages"],
  "AI App Builder": ["app builder","build app","no-code app","nocode app","build an app","ai app","mobile app builder","app creator"],
  "AI Code Generator": ["code generat","code assistant","code completion"," ai coding"," ai code ","copilot for code","ai for developers"," ai engineer","code generator","coding assistant","generate code","write code","debug code","code explanation","github copilot","code review ai"],
  "Developer Tools": ["developer tool","dev tool","developer utilities","testing tool","junit","unit test","code coverage","debug","json","regex","uuid","cron","git ","terminal","cli","macos app","calculator","converter","formatter","benchmark","api testing","security audit","gpu benchmark","webgl","validator","code snippet","static site","curl","docker","kubernetes","ci/cd","lint","code quality","run code","snippet","dev utilities"],
  "AI Resume Builder": ["resume builder","resume maker","cv builder","build resume","ai resume","cover letter","resume","cv writer","career","job application","resume writer"],
  "AI SEO Tools": ["seo tool","seo audit","rank tracker","keyword research"," ai seo","seo analyzer","backlink","ai search results","seo","search engine optimization","google business profile","llms.txt","sitemap","domain authority","organic traffic","seo blog","seo content","link building","site audit","search visibility"],
  "AI Marketing": ["marketing tool","marketing platform","marketing ai","marketing automation","growth marketing","marketing campaign","email verifier","email validation","lead generation","lead gen","marketing","testimonial","influencer","ugc ad","newsletter","customer acquisition","outreach","product launch","launch platform","b2b lead","founder distribution"],
  "AI Ad Creative": ["ad creative generator","facebook ad","google ad","ad copy"," ai ad","ad creative","ad generator","create ads","ads","ad campaign"],
  "AI Analytics": ["analytics tool"," ai for analytics","ai analytics","ai-powered analytics","llm analytics","traffic analytics","ai insights","analytics","metrics","funnel analytics","mixpanel","product analytics","api analytics","onchain analytics","funnel","data analysis","metrics tool","analytics platform"],
  "Social Media": ["social media","twitter","instagram","tiktok","youtube","link in bio","followers","hashtag","trending","meme","gif maker","reels","tiktok video","youtube channel","download tiktok","social platform","social post","influencer","social tools","content for social","social media tool","social media marketing","social growth","linkedin"],
  "AI Tutor": ["ai tutor"," ai tutoring","study helper"," ai coach","homework helper","tutor","learn","flashcards","practice"],
  "AI Education": ["education tool","learning platform","for education","for students"," ai for education","k-12","academic tool","school planner","study app","math solver","learning","course","language learning","reading app","study"],
  "AI Answer": ["answer engine","answer question","answer ai"," ai answer","q&a","ask a question"],
  "AI Research": ["research tool","research assistant","deep research"," ai researcher","ai research","ai hedge","trading analysis","backtest","research","market research","niche","revenue data","analysis report"],
  "AI Image API": ["image api","image generation api","api for image","image generative api","dalle api","stable diffusion api","image api","image generation"],
  "AI Video API": ["video api","video generation api","api for video","video generation"],
  "AI Music API": ["music api","audio api","sound api","audio generation api"],
  "AI Text API": ["text api"," llm api","language api","text generation api","openai api","gpt api","api marketplace","ai api","model api","llm api","generation api","api access"],
  "Coding Proxy": ["proxy","reverse proxy","unblock","vpn","anti-censorship","access blocked"],
  "Developer APIs": ["rest api","api gateway","webhook","sdk","developer api","api platform","scraper api","data api","market data","device api","sheets api","username api","video meeting api","api key","endpoint","api for developers","api products","market data api","device specifications api"],
  "AI Detector": ["ai detect","detect ai","ai-generated detection","detect if image was","ai content detector"," ai text detect"," ai plagiarism","ai detection","detector","ai written"],
  "AI Humanizer": ["humaniz","bypass gpt","bypass ai","anti ai detector","humanize ai","undetectable","human-written","hidden metadata"],
  "AI Grammar Checker": ["grammar check","grammarly","spell check","grammar corrector"," ai grammar","grammar"],
  "Directories": [" ai directory"," ai tool directory","tool directory","submit your","submit site","directory of"," backlink","launch directory","ai directory","news aggregator","ai news","tech news","list of","tool list"," ai list"," ai tools list"," ai product","directory","submit","launch platform","showcase","curated","startup directory","find alternatives","best ai tools","top ai","discover","aggregator","alternative","comparison"],
  "Productized Services": ["productized service","service marketplace"," ai service","marketplace","book a ","done-for-you","done for you"],
  "Boilerplates": ["boilerplate","starter kit","saas starter","next.js starter"," ai starter","tailwind starter","starter template","template","saas boilerplate","starter"],
  "Chrome Extensions": ["chrome extension","browser extension"," chrome ","extension for chrome","browser add-on"],
  "Website Builders": ["website builder","site builder"," ai website","website creator"],
  "No Code": ["no-code","no code","nocode","low-code","visual programming"],
  "Productivity Tools": ["productivity tool","todo ","task manager","task management","kanban","project board","todo list","to-do"," ai todo","habit tracker","agile","kanban","productivity","task manager","project","calendar","scheduler","habit","pomodoro","focus","planning","plan"],
  "Automation": ["automation tool","automate "," ai automation","browser automation","workflow tool","automation","rpa","no-code automation","auto-post","scheduler"],
  "Monitoring": ["monitoring tool","monitor ","tracking tool","uptime monitor"," ai monitoring","monitoring","uptime","status page","observability","alert","log"],
  "Project Management": ["project management","sprint planning","agile","task planning","project","sprint","issue tracker","jira","roadmap"],
  "Email": ["email marketing","email tool","email finder","email verification","email warmup"," ai email","temp mail","temporary email","inbox","cold email","email sending","send emails","mail","email automation"],
  "Customer Support": ["customer support tool","support inbox","ticket support","helpdesk","support software"," ai customer support","helpdesk","ticket","live chat","support"],
  "Chatbots": ["chatbot platform","chatbot builder","chatbot framework","chatbot","bot builder","conversational ai"],
  "Community": ["community platform","community builder","online community","membership community","community","forum","membership","group","discord"],
  "Ecommerce": ["ecommerce platform","ecommerce store","online store","ecommerce software"," ai fashion","clothes","jewelry"," ai jewelry","ecommerce","shopify","store","product listing","dropshipping","cart","online shop"],
  "Sales": ["sales tool","crm","lead generation","lead gen"," ai sales","sales outreach","sales","pipeline","prospecting","cold email"],
  "Freelancer Tools": ["freelancer tool","freelance tool","for freelancers","client management","freelance","freelancer","contract","invoice","client"],
  "Blogging": ["blog writing","blog platform","blog ai","publish blog","blog","wordpress","blog post"],
  "Remote Work": ["remote work","remote team","distributed team","work from anywhere","digital nomad","remote","async","distributed"],
  "Building Products": ["product builder","build a product","make a product"," ai for makers"," ai hobby","ai meme","indie","maker","side project","hobby","mvp","product hunt"],
  "Ios": ["ios app"," ai ios","apple ios","ios","iphone","ipad","app store"],
  "Education": ["education platform","learning app","course platform","study app"," ai education","education","learning","course","school","study"],
  "Fintech": ["fintech","finance tool","finance app","budgeting tool","investment app"," ai finance","trading bot","stock tool","tax tool","loan tool","crypto tool","finance","budget","invest","trading","crypto","stock","tax","loan","banking","money"],
  "AI Models": [" llm ","language model","model comparison"," ai model","model benchmark"," gpt "," claude ","all-in-one ai","llm","gemma","multimodal model","open-weight"],
  "AI Entertainment": ["game","quiz","challenge","brain test","fortune","tarot","personality","purity test","dice","play online","guess","trivia","entertainment","coloring","riddle","walkthrough","joke","saju","사주","운세"],
  "AI Dating": ["dating","tinder","flirt","pickup lines","rizz","dating profile","matchmaker","girlfriend","boyfriend","couple photo","couple portraits","romantic","relationship coach"],
  "AI Travel": ["travel","vacation","vacation rental","hotel","flight","itinerary","trip planning","travel planner","trip planner","airfare","tours","tour guide"],
  "AI Food & Nutrition": ["nutrition","nutritional","calorie","calories","recipe","food scan","food scanner","food photo","ingredient","meal plan","meal planning","cooking","food analysis","nutrition tracker","macro tracker","food image"],
};

/* ── Findly category[0] → sub fallback (when keywords miss) ────── */
// Only unambiguous sub-named findly labels. Coarse labels ("Ai", "Design",
// "Marketing") are left to the keyword router.
const CAT_TO_SUB: Record<string, string> = {
  "Ai Agents": "AI Agent",
  "Productivity": "Productivity Tools",
  "Directories": "Directories",
  "Ecommerce": "Ecommerce",
  "Sales": "Sales",
  "Monitoring": "Monitoring",
  "Automation": "Automation",
  "Blogging": "Blogging",
  "Remote Work": "Remote Work",
  "Building Products": "Building Products",
  "Ios": "Ios",
  "Education": "Education",
  "Fintech": "Fintech",
  "Community": "Community",
  "Customer Support": "Customer Support",
  "Freelancer Tools": "Freelancer Tools",
  "Boilerplates": "Boilerplates",
  "Chrome Extensions": "Chrome Extensions",
  "Productized Services": "Productized Services",
  "Website Builders": "Website Builders",
  "Chatbots": "Chatbots",
  "No Code": "No Code",
  "Email Marketing": "Email",
  "Social Media": "Social Media",
  "Developer Tools": "Developer Tools",
  "Developer Apis": "Developer APIs",
  "Seo": "AI SEO Tools",
  "SEO": "AI SEO Tools",
  "Analytics": "AI Analytics",
  "Content Creation": "AI Content Creator",
  "Writing": "AI Writer",
  "Video": "AI Video Generator",
  "Marketing": "AI Marketing",
};

/* ── Classifier: findly tool → (top, sub, legacy) ──────────────── */
// v3: keyword router first, then findly category→sub fallback, then top-only.
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
  const catSub = CAT_TO_SUB[primary];
  if (catSub && TOP_OF.has(catSub)) {
    const top = TOP_OF.get(catSub)!;
    return { top, sub: catSub, legacy: TOP_TO_LEGACY[top] ?? "productivity" };
  }
  const top = anchoredTop ?? "Other";
  return { top, sub: "(none)", legacy: TOP_TO_LEGACY[top] ?? "productivity" };
}

/* ── Taxonomy integrity (dry-run only) ───────────────────────────── */

function validateTaxonomy() {
  const problems: string[] = [];
  const all = new Map<string, string>();
  const names = new Set<string>();
  for (const [top, subs] of Object.entries(TOP)) {
    for (const s of subs) {
      names.add(s);
      const slug = slugify(s);
      if (all.has(slug)) problems.push(`dup slug "${slug}" (${all.get(slug)} vs ${top})`);
      else all.set(slug, top);
      if (!(s in SIGNALS)) problems.push(`sub "${s}" has no SIGNALS entry`);
    }
  }
  for (const s of Object.keys(SIGNALS)) {
    if (!TOP_OF.has(s)) problems.push(`SIGNALS key "${s}" not in TOP`);
  }
  for (const [cat, sub] of Object.entries(CAT_TO_SUB)) {
    if (!TOP_OF.has(sub)) problems.push(`CAT_TO_SUB "${cat}" → "${sub}" not in TOP`);
  }
  // Keep the public taxonomy (lib/subcategories.ts) in sync with the editor here.
  const libPath = resolve(process.cwd(), "lib/subcategories.ts");
  if (existsSync(libPath)) {
    const libSource = readFileSync(libPath, "utf8");
    const libNames = new Set(
      [...libSource.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]),
    );
    for (const n of names) {
      if (!libNames.has(n)) problems.push(`sub "${n}" missing from lib/subcategories.ts`);
    }
    for (const n of libNames) {
      if (!names.has(n)) problems.push(`lib/subcategories.ts has "${n}" not in TOP`);
    }
  }
  console.log(`\n── Taxonomy integrity ──`);
  console.log(`Tops: ${Object.keys(TOP).length} | Subs: ${all.size}`);
  if (problems.length === 0) console.log(`No problems.`);
  else for (const p of problems) console.log(`  ✗ ${p}`);
}

/* ── Coverage report (dry-run only) ──────────────────────────────── */

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function coverageReport(findly: any[]) {
  const total = findly.length;
  const bySub = new Map<string, number>();
  const byTop = new Map<string, number>();
  const noneByFindly = new Map<string, number>();
  let none = 0;

  for (const t of findly) {
    const c = classify(t);
    bySub.set(c.sub, (bySub.get(c.sub) ?? 0) + 1);
    byTop.set(c.top, (byTop.get(c.top) ?? 0) + 1);
    if (c.sub === "(none)") {
      none++;
      const primary = (t.category ?? [])[0] ?? "(empty)";
      noneByFindly.set(primary, (noneByFindly.get(primary) ?? 0) + 1);
    }
  }

  const pct = ((total - none) / total * 100).toFixed(1);
  console.log(`\n── Coverage report (over ${total} findly tools) ──`);
  console.log(`With sub: ${total - none} / ${total} (${pct}%)`);
  console.log(`Top-only "(none)": ${none}`);

  if (none > 0) {
    console.log(`\nTop-only residual by findly category:`);
    const sorted = [...noneByFindly.entries()].sort((a, b) => b[1] - a[1]);
    for (const [cat, n] of sorted) console.log(`  ${String(n).padStart(4)}  ${cat}`);
  }

  console.log(`\nEmpty subs (0 tools):`);
  const emptySubs = [...TOP_OF.keys()].filter((s) => !bySub.has(s)).sort();
  if (emptySubs.length === 0) console.log(`  (none)`);
  else for (const s of emptySubs) console.log(`  ${slugify(s)}`);

  console.log(`\nTop distribution:`);
  const topsSorted = [...byTop.entries()].sort((a, b) => b[1] - a[1]);
  for (const [top, n] of topsSorted) console.log(`  ${String(n).padStart(4)}  ${top}`);

  console.log(`\nSub distribution (top 30):`);
  const subsSorted = [...bySub.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  for (const [sub, n] of subsSorted) console.log(`  ${String(n).padStart(4)}  ${sub}`);
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
    if (shouldWrite) t.sub = c.sub;
  }
  if (shouldWrite) for (const t of tools) if (t.sub === undefined) t.sub = "(none)";

  console.log(`Total: ${tools.length}`);
  console.log(`Re-classified: ${reclassed}`);
  console.log(`Stays same: ${unchanged}`);
  console.log(`Missing in findly: ${missing}`);
  console.log(`\nFirst 12 changes:`);
  for (const ex of examples) console.log(`  ${ex}`);

  if (args.has("--audit")) {
    const filter = process.argv[process.argv.indexOf("--audit") + 1];
    const subs = [...TOP_OF.keys()].filter((s) => !filter || s.toLowerCase().includes(filter.toLowerCase()));
    for (const sub of subs) {
      const rows = findly.filter((t) => classify(t).sub === sub);
      console.log(`\n── ${sub} (${rows.length}) ──`);
      for (const t of rows.slice(0, 5)) {
        console.log(`  • ${t.name}: ${(t.description ?? "").slice(0, 100)}`);
      }
      if (rows.length === 0) console.log(`  (empty)`);
    }
    return;
  }

  if (args.has("--residual")) {
    const residual = findly.filter((t) => classify(t).sub === "(none)");
    console.log(`\n── Residual top-only tools (${residual.length}) ──`);
    for (const t of residual) {
      console.log(`\n• ${t.name}  [cat: ${(t.category ?? [])[0]}]`);
      console.log(`  ${(t.description ?? "").slice(0, 160)}`);
    }
    return;
  }

  if (!shouldWrite) {
    validateTaxonomy();
    coverageReport(findly);
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
