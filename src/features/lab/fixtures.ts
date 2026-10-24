import type { IncomingOffer, ProofItem } from '@/ui';

/** Realistic Eskişehir fixtures. No real people or addresses. */
export const offer: IncomingOffer = {
  title: 'İki kişilik koltuğu 3. kattan zemine indirme',
  price: 650,
  district: 'Tepebaşı',
  neighbourhood: 'Hoşnudiye',
  distanceKm: 2.1,
  etaMin: 8,
  duration: '1–2 saat',
  needs: [
    { icon: 'people', label: '1 kişi' },
    { icon: 'handTruck', label: 'El arabası' },
    { icon: 'stairs', label: 'Asansörsüz' },
  ],
  customerTasks: 3,
};

export const exactAddress = {
  district: 'Tepebaşı',
  neighbourhood: 'Hoşnudiye Mah.',
  street: 'Ahmet Kanatlı Cad. No: 24',
  details: 'Kat 3 · Daire 7 · Asansör yok',
  note: 'Zile basınca bekleyin, kapı geç açılıyor.',
};

export const proofItems: ProofItem[] = [
  { id: 'a', kind: 'before', state: 'done', subject: 'couch' },
  { id: 'b', kind: 'after', state: 'uploading', progress: 0.62, subject: 'couch' },
  { id: 'c', kind: 'after', state: 'failed', subject: 'door' },
];

export const tasker = { name: 'Mehmet K.', initials: 'MK', rating: '4,9', tasks: 31 };
export const customer = { name: 'Ayşe', initials: 'AK' };
