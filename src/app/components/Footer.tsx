import { CrossSiteLink } from './CrossSiteLink';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-12"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div
        className="mx-auto w-full max-w-3xl px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <p>© {year} Eric Caskey</p>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <p>
            The engineering side:{' '}
            <CrossSiteLink href="https://caskeycoding.com" rel="me noopener">
              Caskey Engineering
            </CrossSiteLink>
          </p>
          <ul className="flex items-center gap-6">
            <li>
              <a
                href="https://www.linkedin.com/in/ericcaskey"
                rel="me noopener"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/ecaskey"
                rel="me noopener"
                target="_blank"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
