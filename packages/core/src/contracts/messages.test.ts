import { describe, expect, it } from 'vitest';
import { MessagesSchema } from './messages';

const validMessages = {
  nav: {
    home: 'Home',
    packages: 'Packages',
    about: 'About',
    contact: 'Contact',
    reviews: 'Reviews',
    footer: {
      explore: 'Explore',
      company: 'Company',
      follow: 'Follow',
      brandBlurb: 'Guided enduro routes from Álora, Málaga.',
    },
  },
  home: {
    title: 'Hello EnduroFun',
    subtitle: 'Enduro guiado en Álora, Málaga.',
    badge: 'Álora · Málaga · EN / ES / DE',
    ctaPrimary: 'View packages',
    ctaSecondary: 'Get in touch',
    packages: {
      eyebrow: 'Packages',
      title: 'Two ways to ride',
      note: 'Adventure bike options available on route days.',
      fromPrefix: 'From',
      mostPopular: 'Most popular',
      durationTemplate: '{nights} nights · {days} route days',
      ctaLabel: 'Enquire',
    },
    reviews: {
      eyebrow: 'Reviews',
      title: "From riders who've been",
    },
    findUs: {
      eyebrow: 'Find us',
      title: 'Based in Álora, Málaga',
      text: '20 minutes from Málaga airport.',
    },
  },
};

describe('MessagesSchema', () => {
  it('acepta un fichero de mensajes válido', () => {
    const result = MessagesSchema.safeParse(validMessages);
    expect(result.success).toBe(true);
  });

  it('rechaza si falta la clave home.subtitle (control negativo del esquema)', () => {
    const { home } = validMessages;
    const { subtitle: _subtitle, ...homeWithoutSubtitle } = home;
    const result = MessagesSchema.safeParse({ home: homeWithoutSubtitle });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave nav.footer.brandBlurb (control negativo, T1.1 2º fix)', () => {
    const { nav } = validMessages;
    const { brandBlurb: _brandBlurb, ...footerWithoutBlurb } = nav.footer;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      nav: { ...nav, footer: footerWithoutBlurb },
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un string vacío como traducción', () => {
    const result = MessagesSchema.safeParse({ home: { ...validMessages.home, title: '' } });
    expect(result.success).toBe(false);
  });
});
