import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
  Strikethrough,
  Quote,
  SlidersHorizontal,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  SuperscriptIcon,
  SubscriptIcon,
  HighlighterIcon,
  AlignJustifyIcon,
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { aiModel, generationConfig } from "../../../../configs/AIModel";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

function EditorExtentions({ editor }) {
  if (!editor) return null;

  const { fileId } = useParams();
  const SearchAi = useAction(api.myAction.search);
  const saveNotes = useMutation(api.notes.AddNotes);
  const { user } = useUser();

  // Retry logic for AI generation
  const generateWithRetry = async (prompt, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await aiModel.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            ...generationConfig,
            thinkingConfig: { includeThoughts: false },
          },
        });
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2; // exponential backoff
      }
    }
  };

  const onAiClick = async () => {
    if (!user) {
      toast.error("User not loaded yet!");
      return;
    }
    if (!fileId) {
      toast.error("File ID missing!");
      return;
    }

    const aiProcess = async () => {
      try {
        const selectedText = editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " ",
        );
        if (!selectedText) throw new Error("No text selected");

        // Convex search
     const UnformattedAns = await SearchAi({ query: selectedText, fileId });

     const context = UnformattedAns
  ?.map((item) => item.pageContent)
  .join("\n\n") || "";

        const promptText = `
ROLE: You are an expert Document Data Analyst.
TASK: Extract the exact value for the user's query from the provided Context.

CONTEXT:
${context}

QUERY:
"${selectedText}"

STRICT INSTRUCTIONS:
1. Identify the key term in the query.
2. Scan the Context for labels matching the query.
3. Look at text immediately following the label or same row/column.
4. Provide answer directly and professionally.
5. Do NOT say "information not included" if the value exists.
6. Return ONLY the answer in a clean, professional sentence.
        `;

        // AI generation with retry
        const resultAi = await generateWithRetry(promptText);

        // Clean AI text and preserve line breaks
        let finalAns = (resultAi.candidates?.[0]?.content?.parts?.[0]?.text || "No answer found")
  .replace(/[#*]/g, "")
  .trim()
  .replace(/\n/g, "<br>");

        // Insert answer into editor in proper format
        await editor
          .chain()
          .focus()
          .insertContent(`${selectedText}<br><b>Answer</b>: ${finalAns}<br>`)
          .run();

        // Save full editor content to Convex
        const currentContent = editor.getHTML();
        await saveNotes({
          notes: currentContent,
          fileId,
          createdBy: user.primaryEmailAddress?.emailAddress || user.id,
        });

        return "Answer generated and saved!";
      } catch (err) {
        console.error("AI process failed:", err);
        throw new Error(err.message || "AI failed or could not save notes");
      }
    };

    toast.promise(aiProcess(), {
      loading:"🤖 AI is thinking...",
      success: (msg) => msg,
      error: (err) => err.message || "AI failed to generate answer",
    });
  };
  return (
    <div className="p-3 md:p-5">
      <div className="flex flex-wrap  md:gap-2">
        {/* HEADINGS */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("heading", { level: 1 }) ? "text-blue-500" : ""}`}
        >
          <Heading1 />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("heading", { level: 2 }) ? "text-blue-500" : ""}`}
        >
          <Heading2 />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("heading", { level: 3 }) ? "text-blue-500" : ""}`}
        >
          <Heading3 />
        </button>

        {/* FORMATTING */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("bold") ? "text-blue-500" : ""}`}
        >
          <Bold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("italic") ? "text-blue-500" : ""}`}
        >
          <Italic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("underline") ? "text-blue-500" : ""}`}
        >
          <Underline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("highlight") ? "text-blue-500" : ""}`}
        >
          <HighlighterIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("strike") ? "text-blue-500" : ""}`}
        >
          <Strikethrough />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("subscript") ? "text-blue-500" : ""}`}
        >
          <SubscriptIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("superscript") ? "text-blue-500" : ""}`}
        >
          <SuperscriptIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("code") ? "text-green-500" : ""}`}
        >
          <Code />
        </button>

        {/* LISTS & OTHERS */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("bulletList") ? "text-blue-500" : ""}`}
        >
          <List />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("orderedList") ? "text-blue-500" : ""}`}
        >
          <ListOrdered />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive("blockquote") ? "text-blue-500" : ""}`}
        >
          <Quote />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100"
        >
          <SlidersHorizontal />
        </button>

        {/* ALIGNMENT */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${
            editor.isActive({ textAlign: "left" })
              ? "text-blue-500 bg-gray-200"
              : ""
          }`}
        >
          <AlignLeft />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${
            editor.isActive({ textAlign: "center" })
              ? "text-blue-500 bg-gray-200"
              : ""
          }`}
        >
          <AlignCenter />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${
            editor.isActive({ textAlign: "right" })
              ? "text-blue-500 bg-gray-200"
              : ""
          }`}
        >
          <AlignRight />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 ${
            editor.isActive({ textAlign: "justify" })
              ? "text-blue-500 bg-gray-200"
              : ""
          }`}
        >
          <AlignJustifyIcon />
        </button>

        {/* AI ACTION */}
        <button
          onClick={() => onAiClick()}
          className="cursor-pointer p-1.5 rounded-md transition-all hover:bg-gray-100 hover:text-blue-500 text-purple-600"
        >
          <Sparkles />
        </button>
      </div>
    </div>
  );
}

export default EditorExtentions;