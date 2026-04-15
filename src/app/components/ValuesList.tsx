interface Value {
  title: string;
  body: string;
}

interface ValuesListProps {
  values: Value[];
}

export function ValuesList({ values }: ValuesListProps) {
  return (
    <ol className="flex flex-col gap-6 list-none p-0">
      {values.map((v, i) => (
        <li key={i} className="flex flex-col gap-1">
          <p className="font-semibold">{v.title}</p>
          <p
            className="leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {v.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
