import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { dictionary, normalizeLocale } from '@/lib/i18n';

export default async function NewReport({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = dictionary[locale];
  return (
    <main className="shell">
      <nav className="nav"><strong>{t.title}</strong><LanguageSwitcher locale={locale} /></nav>
      <section className="panel">
        <h1>{t.formTitle}</h1>
        <form className="form" action="/api/reports" method="post">
          <input name="location" required placeholder={t.location} />
          <input name="incidentDate" required type="date" aria-label={t.date} />
          <select name="violenceType" required aria-label={t.violenceType}>
            <option value="physical">Agresión física / Physical assault</option>
            <option value="threats">Amenazas / Threats</option>
            <option value="institutional">Discriminación institucional</option>
            <option value="online">Hostigamiento digital</option>
          </select>
          <textarea name="description" required minLength={20} rows={6} placeholder={t.description} />
          <input name="contact" placeholder={t.contact} />
          <button className="btn" type="submit">{t.submit}</button>
        </form>
      </section>
    </main>
  );
}
