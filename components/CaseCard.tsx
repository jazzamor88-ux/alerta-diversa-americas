import type { HateCrimeCase } from '@/lib/cases';

export function CaseCard({ item }: { item: HateCrimeCase }) {
  return (
    <article className="card case">
      <strong>{item.location}, {item.country}</strong>
      <p className="muted">{item.date} · {item.violenceType}</p>
      <p>{item.summary}</p>
      <span className="tag">{item.status === 'verified' ? 'Verificado' : 'En revisión'}</span>
    </article>
  );
}
