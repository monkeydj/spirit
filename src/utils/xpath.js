import { isSVG } from './is';
import debug from './debug';

/**
 * Get DOM representation for an element.
 *
 * @param   {Element}              element
 * @param   {null|undefined|Node}  nodeContext
 * @returns {string|null}
 */
export function getExpression(element, nodeContext = null) {
  let paths = [];

  const isNodeContext = () => {
    if (!nodeContext) {
      return true;
    }
    return nodeContext !== element;
  };

  while (element.nodeType === window.Node.ELEMENT_NODE && isNodeContext()) {
    let index = 0;

    for (
      let sibling = element.previousSibling;
      sibling;
      sibling = sibling.previousSibling
    ) {
      if (sibling.nodeType === window.Node.DOCUMENT_TYPE_NODE) {
        continue;
      }
      if (sibling.nodeName === element.nodeName) {
        ++index;
      }
    }

    let tagName = element.nodeName.toLowerCase();
    let pathIndex = `[${index + 1}]`;

    if (isSVG(element)) {
      tagName = `*[local-name()='${tagName}']`;
    }

    paths.unshift(tagName + pathIndex);
    element = element.parentNode;
  }

  if (paths.length === 0) {
    return null;
  }
  return nodeContext ? paths.join('/') : `/${paths.join('/')}`;
}

/**
 * Get an element from expression
 *
 * @param   {string} expression
 * @param   {Node}   nodeContext
 * @returns {Node|null}
 */
export function getElement(expression, nodeContext = null) {
  if (!nodeContext) {
    nodeContext = document.body || document.documentElement;
  }

  try {
    const evaluated = document.evaluate(
      expression,
      nodeContext,
      null,
      window.XPathResult.ANY_TYPE,
      null
    );
    return evaluated.iterateNext();
  } catch (err) {
    if (debug()) {
      console.error('Cannot get element from expression: ', expression);
      console.error(err.stack);
    }
  }

  return null;
}
