"use client";

import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extensions";
import TextAlign from "@tiptap/extension-text-align";
import EditorExtentions from "./EditorExtentions";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const TextEditor = forwardRef(({ fileId }, ref) => {
  const { user } = useUser();
  const notes = useQuery(api.notes.GetNotes, { fileId });
  const saveNotes = useMutation(api.notes.AddNotes);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["paragraph", "heading"] }),
      Placeholder.configure({ placeholder: "Start taking your notes here..." }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none p-5 min-h-full tiptap",
      },
    },
  });

  useEffect(() => {
    if (editor && notes) {
      editor.commands.setContent(notes || "");
    }
  }, [editor, notes]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!editor) return;

      const currentContent = editor.getHTML();

      if (!currentContent) {
        toast.error("Nothing to save!");
        return;
      }

      try {
        await saveNotes({
          notes: currentContent,
          fileId,
          createdBy:
            user?.primaryEmailAddress?.emailAddress || user?.id || "unknown",
        });

        toast.success("Notes saved successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Save failed");
      }
    },
  }));

  return (
<div className="flex flex-col h-full">
  {/* Toolbar */}
  <EditorExtentions editor={editor} />

  {/* Editor content scroll */}
  <div className="flex-1 min-h-0 overflow-auto">
    <EditorContent editor={editor} />
  </div>
</div>
  );
});

export default TextEditor;