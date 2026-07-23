import { describe, expect, it } from 'vitest';
import { MessagesSchema } from './messages';

const validMessages = {
  nav: {
    home: 'Home',
    gallery: 'Gallery',
    packages: 'Packages',
    about: 'About',
    contact: 'Contact',
    reviews: 'Reviews',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
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
    gallery: {
      eyebrow: 'Gallery',
      title: 'A taste of the terrain',
      pauseLabel: 'Pause gallery autoplay',
      playLabel: 'Resume gallery autoplay',
    },
    findUs: {
      eyebrow: 'Find us',
      title: 'Based in Álora, Málaga',
      text: '20 minutes from Málaga airport.',
    },
  },
  about: {
    eyebrow: 'About',
    title: 'Local knowledge, real trails',
    intro: 'EnduroFun is a small team of riders and guides based in Álora.',
    story: {
      eyebrow: 'Our story',
      title: 'Riders first, guides by trade',
      text: 'What started as weekend trail rides became a small guided-tour operation.',
      photoAlt: 'A guide giving a thumbs up on the trail',
    },
    fleet: {
      eyebrow: 'Our fleet',
      title: 'The bikes we ride',
      categories: { enduro: 'Enduro', trailAdventure: 'Trail & Adventure' },
    },
    different: {
      eyebrow: 'What makes us different',
      title: 'Three things riders notice',
      localKnowledge: { title: 'Local knowledge', text: 'Routes built from years riding.' },
      variedTerrain: { title: 'Varied terrain', text: 'Singletrack, climbs and fire roads.' },
      culturalOffering: { title: 'Cultural offering', text: 'Rest-day options nearby.' },
    },
    levels: {
      eyebrow: 'Experience levels',
      title: 'Who this is for',
      beginner: { label: 'Beginner', text: 'Comfortable on a bike, new to off-road.' },
      intermediate: { label: 'Intermediate', text: 'Some enduro/off-road experience.' },
      advanced: { label: 'Advanced', text: 'Confident on technical terrain.' },
    },
  },
  packages: {
    eyebrow: 'Packages',
    title: 'Two ways to ride',
    intro: "Multi-day guided enduro routes through Málaga's most varied terrain.",
    note: 'Adventure bike options available on route days.',
  },
  reviews: {
    eyebrow: 'Reviews',
    title: "From riders who've been",
    intro: 'Real trips, real terrain.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Ask for a custom quote',
    intro: "Tell us about your group and we'll get back to you.",
    form: {
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Group size, dates, experience level...',
      submitLabel: 'Send message',
      successMessage: 'Thanks — your message is on its way.',
      errorMessage: 'Something went wrong sending your message.',
    },
    findUs: {
      eyebrow: 'Find us',
      text: 'Based in Álora, in the heart of the province of Málaga.',
    },
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'A taste of the terrain',
    intro: 'A closer look at the trails and terrain around Álora.',
    photoAltTemplate: 'Enduro trail photo {n}',
    loadingLabel: 'Loading more photos',
    lightboxCloseLabel: 'Close image viewer',
    lightboxPrevLabel: 'Previous photo',
    lightboxNextLabel: 'Next photo',
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

  it('rechaza si falta la clave about.different.culturalOffering (control negativo, T1.2)', () => {
    const { culturalOffering: _culturalOffering, ...differentWithoutCultural } =
      validMessages.about.different;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      about: { ...validMessages.about, different: differentWithoutCultural },
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave about.fleet.categories.trailAdventure (control negativo, TD.12)', () => {
    const { trailAdventure: _trailAdventure, ...categoriesWithoutTrailAdventure } =
      validMessages.about.fleet.categories;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      about: {
        ...validMessages.about,
        fleet: { ...validMessages.about.fleet, categories: categoriesWithoutTrailAdventure },
      },
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave packages.note (control negativo, T2.1)', () => {
    const { note: _note, ...packagesWithoutNote } = validMessages.packages;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      packages: packagesWithoutNote,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave contact.form.errorMessage (control negativo, T1.3)', () => {
    const { errorMessage: _errorMessage, ...formWithoutError } = validMessages.contact.form;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      contact: { ...validMessages.contact, form: formWithoutError },
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave gallery.loadingLabel (control negativo, página Gallery)', () => {
    const { loadingLabel: _loadingLabel, ...galleryWithoutLoading } = validMessages.gallery;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      gallery: galleryWithoutLoading,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave gallery.lightboxCloseLabel (control negativo, TD.11)', () => {
    const { lightboxCloseLabel: _lightboxCloseLabel, ...galleryWithoutCloseLabel } =
      validMessages.gallery;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      gallery: galleryWithoutCloseLabel,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave gallery.lightboxPrevLabel (control negativo, TD.13)', () => {
    const { lightboxPrevLabel: _lightboxPrevLabel, ...galleryWithoutPrevLabel } =
      validMessages.gallery;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      gallery: galleryWithoutPrevLabel,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta la clave gallery.lightboxNextLabel (control negativo, TD.13)', () => {
    const { lightboxNextLabel: _lightboxNextLabel, ...galleryWithoutNextLabel } =
      validMessages.gallery;
    const result = MessagesSchema.safeParse({
      ...validMessages,
      gallery: galleryWithoutNextLabel,
    });
    expect(result.success).toBe(false);
  });
});
