'use client'

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extensions'
import TextAlign from '@tiptap/extension-text-align'
import EditorExtentions from './EditorExtentions'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

// Forward ref to allow header to call save
const TextEditor = forwardRef(({ fileId }, ref) => {
  const { user } = useUser()
  const notes = useQuery(api.notes.GetNotes, { fileId })
  const saveNotes = useMutation(api.notes.AddNotes)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: false, colors: ['#fff3bf'] }),
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Placeholder.configure({ placeholder: 'Start taking your notes here' })
    ],
    immediatelyRender: false,
    editorProps: { attributes: { class: 'focus:outline-none p-5 h-screen tiptap' } },
  })

  // Load existing content
  useEffect(() => {
    if (editor && notes) editor.commands.setContent(notes || '')
  }, [editor, notes])

  // Expose save function to parent
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!editor) return
      const currentContent = editor.getHTML()
      if (!currentContent) {
        toast.error("Nothing to save!")
        return
      }

      try {
        await saveNotes({
          notes: currentContent,
          fileId,
          createdBy: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown"
        })
        toast.success("✅ Notes saved successfully!")
      } catch (err) {
        console.error("Save failed:", err)
        toast.error("❌ Failed to save notes. Try again.")
      }
    }
  }))

  return (
    <div>
      {/* TipTap toolbar / AI buttons */}
      <EditorExtentions editor={editor} />

      {/* Editor content */}
      <div className="overflow-scroll h-[50vh] md:h-[74vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

export default TextEditor