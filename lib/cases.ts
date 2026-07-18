export type HateCrimeCase = {
  id: string;
  location: string;
  country: string;
  date: string;
  violenceType: string;
  status: 'verified' | 'review';
  summary: string;
};

export const cases: HateCrimeCase[] = [
  { id: 'ada-001', location: 'Bogotá', country: 'Colombia', date: '2026-03-12', violenceType: 'Agresión física', status: 'verified', summary: 'Ataque reportado contra una pareja diversa al salir de transporte público.' },
  { id: 'ada-002', location: 'Ciudad de México', country: 'México', date: '2026-04-28', violenceType: 'Amenazas', status: 'review', summary: 'Hostigamiento digital coordinado contra una defensora trans.' },
  { id: 'ada-003', location: 'São Paulo', country: 'Brasil', date: '2026-05-09', violenceType: 'Discriminación institucional', status: 'verified', summary: 'Negación de atención con expresiones homofóbicas documentadas.' },
];
