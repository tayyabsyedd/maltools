'use client';
/**
 * app/(DashboardLayout)/blog/components/PostEditor.tsx
 *
 * Blog Post Editor — Uses TipTap (already installed in your project!)
 *
 * This is the rich text editor where you write blog posts.
 * It supports: Bold, Italic, Headings, Lists, Links, Images
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Box, IconButton, Divider, Paper, Tooltip } from '@mui/material';
import {
  IconBold,
  IconItalic,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconPhoto,
} from '@tabler/icons-react';

interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const ToolbarBtn = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <Tooltip title={title}>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        borderRadius: 1,
        bgcolor: active ? 'primary.light' : 'transparent',
        color: active ? 'primary.main' : 'text.secondary',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {children}
    </IconButton>
  </Tooltip>
);

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function PostEditor({ content, onChange }: PostEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // Insert image from URL
  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden' }}
    >
      {/* ── Toolbar ── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          p: 1,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ToolbarBtn
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold size={18} />
        </ToolbarBtn>

        <ToolbarBtn
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic size={18} />
        </ToolbarBtn>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarBtn
          title="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <IconH1 size={18} />
        </ToolbarBtn>

        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <IconH2 size={18} />
        </ToolbarBtn>

        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <IconH3 size={18} />
        </ToolbarBtn>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarBtn
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconList size={18} />
        </ToolbarBtn>

        <ToolbarBtn
          title="Numbered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconListNumbers size={18} />
        </ToolbarBtn>

        <ToolbarBtn
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconBlockquote size={18} />
        </ToolbarBtn>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarBtn title="Insert Image" onClick={addImage}>
          <IconPhoto size={18} />
        </ToolbarBtn>
      </Box>

      {/* ── Editor Content Area ── */}
      <Box
        sx={{
          p: 2,
          minHeight: 400,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 350,
            fontSize: '1rem',
            lineHeight: 1.8,
            '& h1': { fontSize: '2rem', fontWeight: 700, mb: 1 },
            '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 1 },
            '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1 },
            '& p': { mb: 1 },
            '& ul, & ol': { pl: 3 },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2,
              fontStyle: 'italic',
              color: 'text.secondary',
            },
            '& img': { maxWidth: '100%', borderRadius: 1 },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
