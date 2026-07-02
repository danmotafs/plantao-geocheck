# Plantão GeoCheck

MVP mobile-first para gestão de plantões com reconhecimento por geolocalização.

## O que este MVP faz

- Usa o GPS do celular/navegador para identificar se o médico está no raio do Hospital Ana Nery.
- Pergunta: **"Você chegou ao Hospital Ana Nery para dar plantão?"**
- Registra setor, carga horária prevista, horário de chegada e horário de saída previsto.
- Permite finalizar o plantão com saída real.
- Salva os dados no `localStorage` do navegador.
- Gera histórico e relatório mensal.
- Exporta CSV para conferência e cálculo de recebimento.

## Limitações da versão sem banco

- Os dados ficam apenas no navegador/aparelho usado.
- Não há login real.
- Não há painel administrativo centralizado.
- Se o navegador for limpo, os registros podem ser perdidos.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:3000
```

## Deploy na Vercel

1. Suba este projeto para o GitHub.
2. Importe o repositório na Vercel.
3. Framework: Next.js.
4. Deploy.

## Hospital de teste

Hospital Ana Nery — Salvador/BA

Coordenadas aproximadas usadas no MVP:

```txt
Latitude: -12.95736
Longitude: -38.49582
Raio: 250m
```

Recomenda-se validar as coordenadas presencialmente ou ajustar o raio após o primeiro teste real.
