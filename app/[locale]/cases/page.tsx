import { CaseCard } from '@/components/CaseCard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cases } from '@/lib/cases';
import { dictionary, normalizeLocale } from '@/lib/i18n';

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = dictionary[locale];
  return (
    <main className="shell">
      <nav className="nav"><strong>{t.title}</strong><LanguageSwitcher locale={locale} /></nav>
      <h1>{t.recent}</h1>
      <section className="grid cards">{cases.map((item) => <CaseCard item={item} key={item.id} />)}</section>
    </main>
  );
}
