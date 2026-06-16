interface Value {
  title: string;
  body: string;
}

interface ValuesListProps {
  values: Value[];
}

// FDS-8: render the values as a numbered, hairline-divided index — a
// leading ordinal rail (muted tabular-nums, decorative since <ol> already
// carries list semantics) makes the four read as a scannable set rather
// than a loose stack. Stays inside the contract: no accent on the static
// numbers (accent marks interactivity only, v2.1 §2.1), dividers not cards.
export function ValuesList({ values }: ValuesListProps) {
  return (
    <ol className="flex flex-col list-none p-0 m-0 border-t border-border">
      {values.map((v, i) => (
        <li
          key={i}
          className="grid grid-cols-[2rem_1fr] gap-x-3 gap-y-1 py-5 border-b border-border"
        >
          <span
            aria-hidden="true"
            className="text-sm font-semibold tabular-nums text-muted pt-0.5"
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <p className="font-semibold">{v.title}</p>
          <p className="col-start-2 leading-relaxed text-muted">{v.body}</p>
        </li>
      ))}
    </ol>
  );
}
