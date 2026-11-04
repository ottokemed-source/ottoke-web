// Left and right arrow keys turn a gallery's pictures from anywhere on the page.
// Not in a form field: the question tabs are radio buttons and already use the arrows.
export function onArrowKeys(turn) {
  addEventListener('keydown', (event) => {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest('input, select, textarea, [contenteditable]')) return;
    event.preventDefault();
    turn(direction);
  });
}
