"use server";

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

export async function codeHighlighter({
  code,
  lang,
}: {
  code: string;
  lang?: string;
}) {
  const out = await codeToHast(code, {
    lang: lang ?? "tsx",
    theme: "everforest-dark",
  });

  return toJsxRuntime(out as any, {
    Fragment,
    jsx: jsx as any,
    jsxs: jsxs as any,
  });
}
