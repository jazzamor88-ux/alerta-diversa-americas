import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cases } from '@/lib/cases';
import { dictionary, normalizeLocale } from '@/lib/i18n';

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = dictionary[locale];
  return (
    <main className="shell">
      <nav className="nav"><strong>{t.title}</strong><LanguageSwitcher locale={locale} /></nav>
      <section className="hero">
        <h1>{t.title}</h1><p>{t.subtitle}</p><p>{t.intro}</p>
        <Link className="btn" href={`/${locale}/reports/new`}>{t.report}</Link>
      </section>
      <section className="grid cards">
        <div className="panel"><h2>{t.dashboard}</h2><div className="map">Mapa de alertas por país y tipo de violencia</div></div>
        <div className="panel"><h2>{t.recent}</h2><p>{cases.length} casos de demostración listos para visualización pública anonimizada.</p><Link href={`/${locale}/cases`}>{t.cases}</Link></div>
      </section>
    </main>
  );
}
