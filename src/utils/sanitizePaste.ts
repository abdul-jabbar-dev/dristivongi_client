export const sanitizePastedHtml = (html: string): { cleanHtml: string, mediaUrlsToImport: { id: string, url: string, type: 'img' | 'video' }[] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allowedTags = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'blockquote',
    'h2', 'h3', 'a', 'img', 'video', 'figure', 'figcaption'
  ]);

  const blockLevelTags = new Set(['div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav']);

  // Remove elements we definitely don't want (and their children)
  const elementsToRemove = doc.querySelectorAll('script, style, iframe, object, embed, form, button, input, select, textarea, meta, link, noscript');
  elementsToRemove.forEach(el => el.remove());

  const mediaUrlsToImport: { id: string, url: string, type: 'img' | 'video' }[] = [];

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // Process children first
      Array.from(el.childNodes).forEach(child => processNode(child));

      if (tagName === 'body' || tagName === 'html') {
        return;
      }

      if (!allowedTags.has(tagName)) {
        // If it's a structural container we don't want (like div, span), unwrap it
        // If it's a block-level tag, maybe append a <br> after it to preserve spacing if we unwrap it
        const isBlock = blockLevelTags.has(tagName);
        const fragment = document.createDocumentFragment();
        
        while (el.firstChild) {
          fragment.appendChild(el.firstChild);
        }
        
        if (isBlock && el.parentNode) {
          fragment.appendChild(document.createElement('br'));
        }
        
        el.parentNode?.replaceChild(fragment, el);
      } else {
        // Clean attributes for allowed tags
        const attributesToRemove = [];
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const attrName = attr.name.toLowerCase();
          
          if (tagName === 'a' && (attrName === 'href' || attrName === 'target' || attrName === 'rel')) {
            if (attrName === 'href') {
              const href = attr.value.trim().toLowerCase();
              if (href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('vbscript:') || href.startsWith('file:') || href.startsWith('blob:')) {
                attributesToRemove.push(attrName);
              }
            }
            continue;
          }
          
          if (tagName === 'img' && (attrName === 'src' || attrName === 'alt')) {
            if (attrName === 'src') {
               const src = attr.value;
               if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
                  const uniqueId = 'importing-img-' + Math.random().toString(36).substr(2, 9);
                  el.setAttribute('id', uniqueId);
                  el.style.opacity = '0.5';
                  mediaUrlsToImport.push({ id: uniqueId, url: src, type: 'img' });
               }
            }
            continue;
          }
          
          if (tagName === 'video' && (attrName === 'src' || attrName === 'controls' || attrName === 'poster')) {
             if (attrName === 'src') {
                 const src = attr.value;
                 if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
                    const uniqueId = 'importing-vid-' + Math.random().toString(36).substr(2, 9);
                    el.setAttribute('id', uniqueId);
                    el.style.opacity = '0.5';
                    mediaUrlsToImport.push({ id: uniqueId, url: src, type: 'video' });
                 }
              }
            continue;
          }
          
          attributesToRemove.push(attrName);
        }

        attributesToRemove.forEach(attr => el.removeAttribute(attr));
      }
    }
  };

  processNode(doc.body);

  // Clean up excessive empty paragraphs or brs
  let cleanHtml = doc.body.innerHTML;
  cleanHtml = cleanHtml.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  
  return { cleanHtml, mediaUrlsToImport };
};
