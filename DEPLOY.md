# Deploy — EnduroFun

Sitio estático (`output: 'export'` en `apps/web/next.config.ts`, sin servidor Next que operar). Build:

```bash
pnpm --filter ./apps/web build   # genera apps/web/out/
```

**Importante**: el filtro de pnpm necesita el prefijo `./` (`--filter ./apps/web`, no `--filter apps/web`) — sin él, pnpm interpreta `apps/web` como un nombre de paquete literal (no lo encuentra, ya que el paquete se llama `@app/web`), no ejecuta el build, y sale con código 0 igualmente ("No projects matched the filters"). Cloudflare Pages no lo detecta como error y despliega lo que haya en el output directory configurado — que si además apunta mal, acaba subiendo el repo entero en vez del sitio. Incidente real de la primera conexión (ver journal 2026-07-23).

`apps/web/out/` es el directorio a servir en cualquiera de las opciones de abajo. Este proyecto **no usa** la skill `deploy` del arnés ni `deploy.env` (no hay VPS — ver PRD §10, planning.md T0.3): el despliegue es 100% vía CI del proveedor elegido, disparado por `git push` a `main`.

## Aclaración previa: el dominio `.eu` NO bloquea Cloudflare Pages

Al intentar conectar `endurofun.eu` puede parecer que "Cloudflare no admite `.eu`". Es una confusión real y común (ver hilos de la comunidad de Cloudflare), pero afecta a una sola cosa:

- **Cloudflare Registrar** (comprar/transferir el REGISTRO del dominio a Cloudflare) — efectivamente **no soporta `.eu`** hoy.
- **Añadir el dominio como zona DNS de Cloudflare** (lo que hace falta para Cloudflare Pages) — **sí soporta `.eu`**, sin restricción. El registro del dominio se queda en Hostinger; solo cambian los *nameservers* que Hostinger apunta.

Es decir: **no hace falta mover el dominio de Hostinger**, solo apuntar sus nameservers a los que da Cloudflare. Esto no afecta a la elegibilidad de registrante `.eu` de EURid (que depende de quién es el titular, no de qué nameservers usa).

Fuentes: [Cloudflare Community — .eu TLD not supported at Cloudflare](https://community.cloudflare.com/t/eu-tld-not-supported-at-cloudflare/843210) (se refiere al Registrar), [Cloudflare DNS docs — Cannot add domain](https://developers.cloudflare.com/dns/zone-setups/troubleshooting/cannot-add-domain/).

## Opción A (recomendada — es la ya planeada en `planning.md` T0.3): Cloudflare Pages

No cambia nada de lo ya documentado en el proyecto; solo aclara el paso de DNS.

1. **Cloudflare Pages ↔ GitHub**: Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → autorizar y elegir `emiliovillu/enduro-fun`.
2. **Build config** del proyecto Pages (valores ya verificados funcionando, 2026-07-23):
   - Framework preset: `Ninguno`.
   - Build command: `pnpm --filter ./apps/web build` (con `./`, ver nota de arriba).
   - Build output directory: `apps/web/out`.
   - Root directory: vacío / `/` (raíz del repo, para que `pnpm` vea el workspace `pnpm-workspace.yaml` + `packages/*`).
3. Cloudflare hace un primer deploy a una URL `*.pages.dev` — confirmar que carga antes de tocar DNS. **Verificar de verdad la URL** (`curl -I` a `/`, `/en/`, `/favicon.ico` — deben dar `200`, no solo mirar el "¡Operación correcta!" del dashboard): un build que falla en silencio (p. ej. el filtro de pnpm sin `./` de la nota de arriba) o un output directory mal puesto puede desplegar con "éxito" mientras sirve el repo entero o nada, y el dashboard no lo distingue de un deploy correcto.
4. **Añadir `endurofun.eu` como zona de Cloudflare** (esto es lo que la confusión del `.eu` bloqueaba mentalmente, pero no técnicamente):
   - Cloudflare dashboard → *Add a site* → `endurofun.eu` → plan **Free**.
   - Cloudflare escanea los registros DNS actuales de Hostinger (los importa) — revisar que estén todos antes de continuar (o recrearlos a mano si el escaneo se deja alguno).
   - Cloudflare da 2 nameservers (tipo `xxx.ns.cloudflare.com`).
5. **En Hostinger**: panel del dominio `endurofun.eu` → Nameservers → cambiar de los de Hostinger a los 2 que dio Cloudflare. El registro del dominio (WHOIS/titular) NO se toca, solo los nameservers.
6. Esperar propagación (Cloudflare avisa por email cuando la zona pasa a "Active" — minutos a 24h típico).
7. **En el proyecto Cloudflare Pages** → *Custom domains* → añadir `endurofun.eu` (y opcionalmente `www.endurofun.eu` con redirect a apex) — al estar ya la zona en Cloudflare, esto crea los registros necesarios automáticamente y emite el certificado TLS (Universal SSL) solo.
8. Verificar: push de prueba a `main` dispara build en el dashboard de Pages: éxito; `https://endurofun.eu` sirve el sitio con TLS válido.

## Opción B: Vercel (sin tocar nameservers de Hostinger)

Evita el paso 4-6 de arriba por completo — el dominio se queda gestionado 100% en Hostinger.

1. Vercel dashboard → *Add New* → *Project* → importar `emiliovillu/enduro-fun` desde GitHub.
2. Framework preset: Next.js (Vercel detecta `output: 'export'` y sirve `apps/web/out` como estático — no hace falta cambiar nada del código). Root Directory: `apps/web`.
3. Deploy inicial a `*.vercel.app` — confirmar que carga.
4. Proyecto → *Settings* → *Domains* → añadir `endurofun.eu`. Vercel indica los registros DNS a crear:
   - Apex (`endurofun.eu`): registro `A` → `76.76.21.21` (IP puede variar; usar la que Vercel muestre en pantalla).
   - `www.endurofun.eu`: `CNAME` → `cname.vercel-dns.com`.
5. **En Hostinger** (nameservers SIN cambiar, siguen siendo los de Hostinger): panel de DNS del dominio → crear/editar esos registros `A`/`CNAME` con los valores exactos que Vercel mostró.
6. Vercel verifica y emite TLS automáticamente tras la propagación (minutos-horas).

## Opción C: Netlify (mismo criterio que Vercel)

1. Netlify → *Add new site* → *Import an existing project* → GitHub → `emiliovillu/enduro-fun`.
2. Base directory: `apps/web`. Build command: `pnpm build`. Publish directory: `apps/web/out`.
3. Deploy inicial a `*.netlify.app` — confirmar carga.
4. *Domain settings* → *Add custom domain* → `endurofun.eu`. Netlify ofrece dos rutas:
   - **Sin mover nameservers** (igual que Vercel): añadir en Hostinger un registro `A` apex → `75.2.60.5` y `CNAME` de `www` → `<nombre-del-site>.netlify.app`.
   - O delegar DNS completo a Netlify (cambiar nameservers a los de Netlify) si se prefiere gestionar el DNS ahí — no es necesario para este caso.
5. Netlify emite TLS (Let's Encrypt) tras verificar el DNS.

## Cuál elegir

- Si el objetivo es seguir el plan ya escrito en `planning.md` (T0.3 cita Cloudflare Pages explícitamente) y no reabrir esa decisión: **Opción A** — el único paso "nuevo" respecto a lo ya documentado es el cambio de nameservers en Hostinger, que no lo bloquea el TLD `.eu`.
- Si se prefiere no tocar los nameservers de Hostinger en absoluto (p. ej. por comodidad de gestión del DNS ya existente): **Opción B (Vercel)** es la más simple de las dos alternativas.
- Cambiar de Cloudflare Pages a Vercel/Netlify sería un cambio de alcance sobre planning.md T0.3 (que nombra Cloudflare Pages explícitamente) — si se opta por B o C, hay que anotarlo ahí y en el PRD §10 en la misma sesión.

## Estado

Pendiente de que el usuario ejecute los pasos con credenciales propias (cuenta de Cloudflare/Vercel/Netlify, panel de Hostinger) — ninguno de los pasos de arriba es automatizable desde este entorno. Cuando el paso 4-8 (o equivalente) esté hecho, T0.3 se puede cerrar con su Verificación (`planning.md`).
