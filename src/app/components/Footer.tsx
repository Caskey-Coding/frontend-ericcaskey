import Image from 'next/image';
import Link from 'next/link';
import { CrossSiteLink } from './CrossSiteLink';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-12">
      <div className="mx-auto w-full max-w-3xl px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-muted">
        <p>© {year} Eric Caskey</p>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <p>
            The engineering side:{' '}
            <CrossSiteLink href="https://caskeycoding.com" rel="me noopener">
              <span className="whitespace-nowrap">
                <Image
                  src="/caskey-coding-mark.svg"
                  width={16}
                  height={16}
                  alt=""
                  aria-hidden="true"
                  className="mr-1 inline-block align-[-2px] [html[data-theme=dark]_&]:hidden"
                />
                <Image
                  src="/caskey-coding-mark-dark.svg"
                  width={16}
                  height={16}
                  alt=""
                  aria-hidden="true"
                  className="mr-1 hidden align-[-2px] [html[data-theme=dark]_&]:inline-block"
                />
                Caskey Coding
              </span>
            </CrossSiteLink>
          </p>
          <ul className="flex items-center gap-6">
            <li>
              <a
                href="https://www.linkedin.com/in/ericrcaskey"
                rel="me noopener"
                target="_blank"
              >
                LinkedIn
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
              <Link href="/privacy">Privacy</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
