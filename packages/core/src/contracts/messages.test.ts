import { describe, expect, it } from 'vitest';
import { MessagesSchema } from './messages';

const validMessages = {
  home: {
    title: 'Hello EnduroFun',
    subtitle: 'Enduro guiado en Álora, Málaga.',
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

  it('rechaza un string vacío como traducción', () => {
    const result = MessagesSchema.safeParse({ home: { ...validMessages.home, title: '' } });
    expect(result.success).toBe(false);
  });
});
