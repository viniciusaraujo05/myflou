import { Image } from '@tiptap/extension-image'

// Extends the base Image extension with a `width` attribute so users can resize images.
// The width is stored as a CSS value string (e.g. "25%", "50%", "100%").
export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('data-width') ?? '100%',
        renderHTML: attributes => ({
          'data-width': attributes.width,
          style: `width: ${attributes.width}; height: auto; display: block;`,
        }),
      },
    }
  },
})
