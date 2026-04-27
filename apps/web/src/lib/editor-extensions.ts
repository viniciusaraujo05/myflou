import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import { ResizableImage } from './resizable-image'

// Used by both useEditor and generateHTML (no Placeholder — it adds no output HTML)
export const coreExtensions = [
  StarterKit,
  Underline,
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Link.configure({ openOnClick: false }),
  ResizableImage,
]
