import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("category editorial content and FAQ answers exist in server HTML", () => {
  const program = `
    import React from 'react';
    import {renderToStaticMarkup} from 'react-dom/server';
    import * as exported from './features/catalog/components/category-guide.tsx';
    const component=exported.CategoryGuideSection ? exported : exported.default;
    const guide={title:'AI Summarizers for Documents and Notes',description:'Compare document summaries.',introduction:'Summarizers condense source material while keeping its meaning available for review.',capabilities:['Extract key decisions from a long transcript.'],audiences:[{label:'Researchers',text:'Compare a summary with the original report.'}],criteria:[{label:'Source traceability',text:'Find the passage behind a conclusion.'}],workflow:['Upload a representative document.','Choose the scope and output format.','Review the draft against its source.'],faqs:[{question:'Can a summary preserve every detail?',answer:'No. Check omitted exceptions and figures in the source before using a summary as a substitute.'}],related:[{slug:'ai-pdf',label:'AI PDF tools'},{slug:'ai-ocr',label:'OCR tools'}]};
    process.stdout.write(renderToStaticMarkup(React.createElement(component.CategoryGuideSection,{slug:'ai-summarizer',name:'AI Summarizer',guide,availableSlugs:new Set(['ai-pdf'])})));
  `;
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "--input-type", "module", "-e", program],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Summarizers condense source material/);
  assert.match(result.stdout, /<ol/);
  assert.match(result.stdout, /Extract key decisions/);
  assert.match(result.stdout, /<details/);
  assert.match(result.stdout, /Check omitted exceptions/);
  assert.match(result.stdout, /href="\/categories\/ai-pdf"/);
  assert.doesNotMatch(result.stdout, /href="\/categories\/ai-ocr"/);
});
