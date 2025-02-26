const expandListeners: (() => void)[] = [];
const collapseListeners: (() => void)[] = [];

export const addListener = (onExpand: () => void, onCollapse: () => void) => {
  expandListeners.push(onExpand);
  collapseListeners.push(onCollapse);
};

export const removeListener = (
  onExpand: () => void,
  onCollapse: () => void,
) => {
  const expandIndex = expandListeners.indexOf(onExpand);
  if (expandIndex !== -1) {
    expandListeners.splice(expandIndex, 1);
  }

  const collapseIndex = collapseListeners.indexOf(onCollapse);
  if (collapseIndex !== -1) {
    collapseListeners.splice(collapseIndex, 1);
  }
};

export let expandCollapse = $state({
  startAsExpanded: false,
});

export const expandAll = () => {
  expandCollapse.startAsExpanded = true;
  expandListeners.forEach((listener) => listener());
};

export const collapseAll = () => {
  expandCollapse.startAsExpanded = false;
  collapseListeners.forEach((listener) => listener());
};
