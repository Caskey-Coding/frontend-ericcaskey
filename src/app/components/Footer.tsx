export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-12"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <p>© {year} Eric Caskey</p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li>
            <a
              href="https://caskeycoding.com"
              rel="me noopener"
            >
              Engineering brand: caskeycoding.com
            </a>
          </li>
          <li>
            <a
              href="https://github.com/CaskeyCoding"
              rel="me noopener"
              target="_blank"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/ericcaskey"
              rel="me noopener"
              target="_blank"
            >
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
