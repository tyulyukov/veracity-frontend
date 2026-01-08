import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function WysiwygEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  className,
}: WysiwygEditorProps) {
  const [, setForceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setForceUpdate((prev) => prev + 1);
    },
    onSelectionUpdate: () => {
      setForceUpdate((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'wysiwyg-content focus:outline-none min-h-[200px] px-4 py-3 text-foreground [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-primary [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-1 [&_li]:text-foreground [&_li]:pl-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  if (!editable) {
    return (
      <div className={cn('wysiwyg-content', className)}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={cn('border border-border rounded-xl overflow-hidden bg-card', className)}>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-2 rounded hover:bg-muted/20 transition-colors',
            editor.isActive('bold') && 'bg-muted/30 text-primary',
          )}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-2 rounded hover:bg-muted/20 transition-colors',
            editor.isActive('italic') && 'bg-muted/30 text-primary',
          )}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'p-2 rounded hover:bg-muted/20 transition-colors',
            editor.isActive('heading', { level: 2 }) && 'bg-muted/30 text-primary',
          )}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            'p-2 rounded hover:bg-muted/20 transition-colors',
            editor.isActive('heading', { level: 3 }) && 'bg-muted/30 text-primary',
          )}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'p-2 rounded hover:bg-muted/20 transition-colors',
            editor.isActive('bulletList') && 'bg-muted/30 text-primary',
          )}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'p-2 rounded hover:bg-muted/20 transition-colors',
            editor.isActive('orderedList') && 'bg-muted/30 text-primary',
          )}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
      {editor.isEmpty && (
        <div className="absolute top-[52px] left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}
