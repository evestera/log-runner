import type { Line } from "./types";

export let filter = $state({
  value: "",
  enabled: false,
});

export function lineMatches(line: Line, filter: string): boolean {
  const terms = filter.split(" ");
  return terms.every((rawTerm) => {
    let term = rawTerm;
    let negated = false;
    if (rawTerm.startsWith("-")) {
      negated = true;
      term = rawTerm.slice(1);
    }
    if (term.includes(":")) {
      const [key, value] = term.split(":");
      const matches = line.record && line.record[key] === value;
      return negated ? !matches : matches;
    }
    const matches = line.message.includes(term);
    return negated ? !matches : matches;
  });
}
