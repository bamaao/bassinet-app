// "use client";

// import React from 'react';
// import {
//   MDXEditor,
//   UndoRedo,
//   BoldItalicUnderlineToggles,
//   toolbarPlugin,
//   CodeToggle,
//   InsertCodeBlock,
//   codeBlockPlugin,
//   headingsPlugin,
//   listsPlugin,
//   linkPlugin,
//   quotePlugin,
//   markdownShortcutPlugin,
//   ListsToggle,
//   linkDialogPlugin,
//   CreateLink,
//   InsertImage,
//   InsertTable,
//   tablePlugin,
//   imagePlugin,
//   codeMirrorPlugin,
//   ConditionalContents,
//   ChangeCodeMirrorLanguage,
//   Separator,
//   InsertThematicBreak,
//   diffSourcePlugin,
//   MDXEditorMethods,
//   thematicBreakPlugin,
//   frontmatterPlugin,
// } from "@mdxeditor/editor";
// import { basicDark } from "cm6-theme-basic-dark";
// import { useTheme } from "next-themes";
// import { Ref } from "react";
// import "@mdxeditor/editor/style.css";
// import "./dark-editor.css";
// interface Props {
//   value: string;
//   editorRef?: Ref<MDXEditorMethods> | null;
//   fieldChange: (value: string) => void;
// }
// const Editor = ({ value, editorRef, fieldChange }: Props) => {
//   const { resolvedTheme } = useTheme();
//   const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];
//   return (
//     <MDXEditor
//       key={resolvedTheme}
//       markdown={value}
//       ref={editorRef}
//       onChange={fieldChange}
//       className="background-light800_dark200 light-border-2 markdown-editor dark-editor grid w-full min-h-96"
//       plugins={[
//         headingsPlugin({allowedHeadingLevels: [1, 2, 3]}),
//         listsPlugin(),
//         linkPlugin(),
//         linkDialogPlugin(),
//         quotePlugin(),
//         markdownShortcutPlugin(),
//         tablePlugin(),
//         imagePlugin(),
//         thematicBreakPlugin(),
//         frontmatterPlugin(),
//         codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
//         codeMirrorPlugin({
//           codeBlockLanguages: {
//             css: "css",
//             txt: "txt",
//             sql: "sql",
//             html: "html",
//             sass: "sass",
//             scss: "scss",
//             bash: "bash",
//             json: "json",
//             js: "javascript",
//             ts: "typescript",
//             "": "unspecified",
//             tsx: "TypeScript (React)",
//             jsx: "JavaScript (React)",
//           },
//           autoLoadLanguageSupport: true,
//           codeMirrorExtensions: themeExtension,
//         }),
//         diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
//         toolbarPlugin({
//           toolbarContents: () => (
//             <ConditionalContents
//               options={[
//                 {
//                   when: (editor) => editor?.editorType === "codeblock",
//                   contents: () => <ChangeCodeMirrorLanguage />,
//                 },
//                 {
//                   fallback: () => (
//                     <>
//                       <UndoRedo />
//                       <Separator />
//                       <BoldItalicUnderlineToggles />
//                       <CodeToggle />
//                       <Separator />
//                       <ListsToggle />
//                       <Separator />
//                       <CreateLink />
//                       <InsertImage />
//                       <Separator />
//                       <InsertTable />
//                       <InsertThematicBreak />
//                       <Separator />
//                       <InsertCodeBlock />
//                     </>
//                   ),
//                 },
//               ]}
//             />
//           ),
//         }),
//       ]}
//     />
//   );
// };
// export default Editor;