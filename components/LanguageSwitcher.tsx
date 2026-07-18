import Link from 'next/link';
import { locales, type Locale } from '@/lib/i18n';

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="langs" aria-label="Language selector">
      {locales.map((item) => (
        <Link className="tag" aria-current={item === locale ? 'page' : undefined} href={`/${item}`} key={item}>
          {item.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
