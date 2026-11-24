// sw.js — Service Worker do Meu Canto Católico (PWA)
// Estratégia: Cache First para assets estáticos, Network First para páginas

const VERSAO = "v4";
const PAGINAS_CACHE = `meu-canto-catolico-paginas-${VERSAO}`;
const STATIC_CACHE = `meu-canto-catolico-static-${VERSAO}`;

// Limite de entradas por cache: as mais antigas saem primeiro.
const MAX_PAGINAS = 80;
const MAX_STATIC = 250;

// Páginas com dados da conta nunca vão para o cache: offline, quem usasse o aparelho
// depois veria o perfil de outra pessoa.
const ROTAS_PRIVADAS = ["/conta", "/entrar", "/cadastro", "/esqueci-senha", "/redefinir-senha"];

const PRECACHE_PAGINAS = [
    "/",
    "/liturgia",
    "/biblia",
    "/calendario",
    "/rosario",
    "/novenas",
    "/oracoes",
    "/santos",
    "/confissao",
    "/catequese",
    "/recursos",
    "/offline",
];

const PRECACHE_STATIC = ["/images/icon-192.png", "/images/icon-512.png"];

const ehPrivada = (pathname) =>
    ROTAS_PRIVADAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));

async function guardar(nomeCache, request, response, maximo) {
    const cache = await caches.open(nomeCache);
    // Regravar move a entrada para o fim: as primeiras são sempre as mais antigas.
    await cache.delete(request);
    await cache.put(request, response);

    const chaves = await cache.keys();
    const removiveis = chaves.filter((r) => !PRECACHE_PAGINAS.includes(new URL(r.url).pathname));
    const excesso = Math.max(0, chaves.length - maximo);
    await Promise.all(removiveis.slice(0, excesso).map((r) => cache.delete(r)));
}

// ── Install ────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(PAGINAS_CACHE).then((c) => c.addAll(PRECACHE_PAGINAS)),
            caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE_STATIC)),
        ]).then(() => self.skipWaiting()),
    );
});

// ── Activate ───────────────────────────────────────────────────
// Apaga os caches de versões anteriores (inclusive os que guardavam páginas da conta).
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== PAGINAS_CACHE && k !== STATIC_CACHE)
                        .map((k) => caches.delete(k)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

// ── Fetch ──────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin requests
    if (request.method !== "GET" || url.origin !== location.origin) return;

    // API calls — always network, never cache
    if (url.pathname.startsWith("/api/")) return;

    // Static assets (images, fonts, _next/static) — Cache First
    if (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/images/") ||
        url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)
    ) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((res) => {
                        if (res.ok) {
                            event.waitUntil(guardar(STATIC_CACHE, request, res.clone(), MAX_STATIC));
                        }
                        return res;
                    }),
            ),
        );
        return;
    }

    // Páginas privadas e o resto (dados de navegação do Next, scripts): sempre rede.
    if (request.mode !== "navigate") return;

    const privada = ehPrivada(url.pathname);

    // Pages — Network First, fallback to cache, fallback to /offline
    event.respondWith(
        fetch(request)
            .then((res) => {
                // Erros e redirecionamentos (ex.: para o login) não substituem a página boa.
                if (res.ok && !res.redirected && !privada) {
                    event.waitUntil(guardar(PAGINAS_CACHE, request, res.clone(), MAX_PAGINAS));
                }
                return res;
            })
            .catch(async () => {
                const cached = privada ? undefined : await caches.match(request);
                return cached || caches.match("/offline");
            }),
    );
});
