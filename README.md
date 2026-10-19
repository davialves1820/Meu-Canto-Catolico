# Meu Canto Católico
 
O **Meu Canto Católico** é uma plataforma integrada para a vida de fé e a centralização de informações católicas. Ela oferece acesso à Bíblia Sagrada, ao Catecismo da Igreja Católica, Liturgia Diária, Calendário Litúrgico, Santos, Orações, Rosário, Exame de Consciência, Catequese e notícias atualizadas do Vaticano e da CNBB — com pesquisa em todo o site e conta de usuário.

## 🛠️ Tecnologias Principais

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/) (Design Premium)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Banco de dados**: PostgreSQL com [Prisma ORM](https://www.prisma.io/)
- **Autenticação**: [Auth.js](https://authjs.dev/) (NextAuth)
- **IA**: [Google Gemini](https://ai.google.dev/) para a exegese da Liturgia Diária

## 🌍 Fontes de Dados

Para garantir a fidelidade e riqueza das informações, utilizei as seguintes fontes:

- **Santos**: Dados obtidos via Web Scraping da Wikipedia.
- **Notícias**: Sincronizadas via RSS do [Vatican News](https://www.vaticannews.va/pt.rss.xml) e da [CNBB](https://www.cnbb.org.br/feed/).
- **Calendário Litúrgico**: Dados provenientes do [Romcal](https://www.romcal.net/).
- **Orações**: Coletadas do site [Padre Paulo Ricardo](https://padrepauloricardo.org/oracoes/) via Web Scraping.
- **Liturgia Diária**: API de [Dancrf/liturgia-diaria](https://github.com/Dancrf/liturgia-diaria).
- **Bíblia Sagrada**: Repositório JSON [fidalgobr/bibliaAveMariaJSON](https://github.com/fidalgobr/bibliaAveMariaJSON).
- **Catecismo da Igreja Católica**: Texto integral em português extraído do site da [Santa Sé](https://www.vatican.va/archive/cathechism_po/index_new/prima-pagina-cic_po.html) via Web Scraping.
- **Catequese**: Coletadas do site [Biblioteca Católica](https://bibliotecacatolica.com.br/).

## 🚀 Como começar

1.  **Clone o repositório**:
    ```bash
    git clone [url-do-repositorio]
    cd Central-Catolica
    ```

2.  **Instale as dependências** (na raiz ou em `src`):
    ```bash
    npm install
    ```
    
3.  **Inicie o servidor**:
    ```bash
    npm run dev
    ```
    Acesse o projeto em https://central-catolica.vercel.app/
    
    ---
    
    Para detalhes técnicos de desenvolvimento, consulte o [README.dev.md](./src/README.dev.md).
