import { z } from 'zod';

/**
 * Contrato de los datos de empresa (PRD §7): "datos de la empresa (email,
 * ubicación, coordenadas del mapa, redes)".
 */
export const CompanySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  location: z.object({
    address: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  social: z.object({
    instagram: z.url(),
  }),
});
export type Company = z.infer<typeof CompanySchema>;
