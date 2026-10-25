import { tr } from '@/i18n/tr';

import { legalDocs } from '../documents';

const text = (id: keyof typeof legalDocs) => [legalDocs[id].intro ?? '', ...legalDocs[id].sections.flatMap((s) => [s.h, ...s.p])].join('\n');

describe('legal texts', () => {
  it('positions the platform as an intermediary, not a party', () => {
    const terms = text('terms');
    expect(terms).toMatch(/aracı hizmet sağlayıcı/);
    expect(terms).toMatch(/yer sağlayıcı/);
    expect(terms).toMatch(/doğrudan Müşteri ile Görevli arasında kurulur/);
    expect(terms).toMatch(/fiili gerçekleştiren kişi bizzat ve münhasıran sorumludur/);
  });

  it('keeps the mandatory-law savings clause (otherwise the limitation can fall entirely)', () => {
    expect(text('terms')).toMatch(/115\. maddesi/);
    expect(text('terms')).toMatch(/6502 sayılı/);
  });

  it('makes the Tasker an independent provider', () => {
    expect(text('tasker')).toMatch(/bağımsız bir hizmet sağlayıcıdır/);
    expect(text('tasker')).toMatch(/4857 sayılı İş Kanunu/);
  });

  it('covers KVKK basics: legal bases, transfers abroad, rights', () => {
    const p = text('privacy');
    expect(p).toMatch(/m\.5\/2-c/);
    expect(p).toMatch(/KVKK m\.9/);
    expect(p).toMatch(/m\.11/);
  });

  it('has copy for every server error code', () => {
    for (const code of ['not_signed_in', 'not_onboarded', 'banned', 'not_allowed', 'invalid_state', 'invalid_input', 'offer_expired', 'already_taken', 'pin_locked', 'too_early', 'network', 'unconfigured', 'unknown']) {
      expect(tr.errors).toHaveProperty(code);
    }
  });
});
