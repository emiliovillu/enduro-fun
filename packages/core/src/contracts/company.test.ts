import { describe, expect, it } from 'vitest';
import { CompanySchema } from './company';

const validCompany = {
  name: 'EnduroFun',
  email: 'hola@endurofun.eu',
  location: { address: 'Álora, Málaga', lat: 36.8299, lng: -4.7106 },
  social: { instagram: 'https://instagram.com/endurofun' },
};

describe('CompanySchema', () => {
  it('acepta datos de empresa válidos', () => {
    const result = CompanySchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it('rechaza un email con formato inválido', () => {
    const result = CompanySchema.safeParse({ ...validCompany, email: 'no-es-un-email' });
    expect(result.success).toBe(false);
  });

  it('rechaza si falta el campo requerido location', () => {
    const { location: _location, ...withoutLocation } = validCompany;
    const result = CompanySchema.safeParse(withoutLocation);
    expect(result.success).toBe(false);
  });
});
