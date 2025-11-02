export function findCommentNode(comment) {
  const head = document.head;
  for (let i = 0; i < head.childNodes.length; i++) {
    const node = head.childNodes[i];
    if (node.nodeType === 8 && node?.nodeValue?.trim() === comment) {
      return node;
    }
  }
  return null;
}

export function isElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement //DOM2
    : o &&
        typeof o === "object" &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === "string";
}

export function arrayToObject(array) {
  const obj = {};
  array.forEach((el) => (obj[el] = el));
  return obj;
}

export function createLinkElement(attributes) {
  const linkElement = document.createElement("link");

  // eslint-disable-next-line no-unused-vars
  for (const [attribute, value] of Object.entries(attributes)) {
    if (attribute === "onload") {
      linkElement.onload = attributes.onload;
      continue;
    }

    // @ts-ignore
    linkElement[attribute] = value;
  }

  return linkElement;
}

/**
 * 修复切换主题闪烁
 */
export function fixedFlashing(id) {
  const themeLink = document.querySelector(`#${id}`);
  if (themeLink) {
    const newThemeLink = themeLink.cloneNode(true);
    newThemeLink.id = `copy-${id}`;
    const headDom = themeLink.parentNode;
    headDom.insertBefore(newThemeLink, themeLink);
  }
}
