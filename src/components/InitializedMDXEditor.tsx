'use client'
// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react'
import {
//   headingsPlugin,
//   listsPlugin,
//   quotePlugin,
//   thematicBreakPlugin,
//   markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps
} from '@mdxeditor/editor'
// import { ALL_PLUGINS } from './plugins'

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
    //   plugins={[
    //     // Example Plugin Usage
    //     headingsPlugin(),
    //     listsPlugin(),
    //     quotePlugin(),
    //     thematicBreakPlugin(),
    //     markdownShortcutPlugin()
    //   ]}
        // plugins={ALL_PLUGINS}
        plugins={[]}
      {...props}
      ref={editorRef}
    />
  )
}