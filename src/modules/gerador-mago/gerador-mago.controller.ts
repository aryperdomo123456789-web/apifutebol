import { Controller, Get, Header } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Public } from '../api-keys/api-key.guard';
import { GERADOR_MAGO_HTML } from './gerador-mago.html';

type LabRoute = {
  t?: string;
  h?: string;
  active?: boolean;
};

type LegacyLink = {
  text: string;
  href: string;
};

type FeatureCard = {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  legacyLabel: string;
  legacyRoute: string;
  notes: string[];
};

const labDir = join(process.cwd(), 'labs', 'mago-lab');
const labMap = join(labDir, 'map.json');
const stateFile = join(labDir, 'state.json');
const extractionFile = join(labDir, 'mago_extraction.json');
const networkFile = join(labDir, 'mago_network.json');

const FEATURE_DEFS: Array<Omit<FeatureCard, 'legacyRoute'>> = [
  {
    id: 'dashboard',
    section: 'Dashboard',
    title: 'Visão Geral',
    subtitle: 'Entradas, estado do lab e atalhos principais.',
    icon: '⌂',
    accent: 'blue',
    legacyLabel: 'Dashboard',
    notes: ['Menu principal do lab', 'Acesso ao restante do sistema'],
  },
  {
    id: 'whatsapp',
    section: 'Comunicação',
    title: 'Configurar WhatsApp',
    subtitle: 'Base de suporte e atendimento do lab legado.',
    icon: 'WA',
    accent: 'green',
    legacyLabel: 'Configurar WhatsApp',
    notes: ['Canal de contato', 'Integração de suporte'],
  },
  {
    id: 'express',
    section: 'Produção',
    title: 'Gerar Express',
    subtitle: 'Fluxo rápido para criação em lote.',
    icon: '⚡',
    accent: 'amber',
    legacyLabel: 'Gerar Express',
    notes: ['Workflow rápido', 'Lote de produção'],
  },
  {
    id: 'video',
    section: 'Produção',
    title: 'Gerar Vídeo',
    subtitle: 'Ferramenta de vídeo principal do lab.',
    icon: '▶',
    accent: 'red',
    legacyLabel: 'Gerar Vídeo',
    notes: ['Vídeo principal', 'Saída para divulgação'],
  },
  {
    id: 'futebol',
    section: 'Esportes',
    title: 'Gerar Futebol',
    subtitle: 'Arte e banner de futebol.',
    icon: '⚽',
    accent: 'purple',
    legacyLabel: 'Gerar Futebol',
    notes: ['Banner futebol', 'Arte esportiva'],
  },
  {
    id: 'filmes',
    section: 'Banners',
    title: 'Gerar Banner Filme',
    subtitle: 'Criador de banner para filmes.',
    icon: '▣',
    accent: 'violet',
    legacyLabel: 'Gerar Banner Filme',
    notes: ['Banner de filmes', 'Montagem visual'],
  },
  {
    id: 'series',
    section: 'Banners',
    title: 'Séries/Novelas',
    subtitle: 'Divulgação para séries e novelas.',
    icon: 'TV',
    accent: 'orange',
    legacyLabel: 'Gerar Banner\nSéries/Novelas',
    notes: ['Banner de divulgação', 'Material para redes'],
  },
  {
    id: 'logo',
    section: 'Marca',
    title: 'Logo',
    subtitle: 'Configuração da identidade visual.',
    icon: '◎',
    accent: 'blue',
    legacyLabel: 'Logo',
    notes: ['Marca do painel', 'Identidade do cliente'],
  },
  {
    id: 'telegram',
    section: 'Comunicação',
    title: 'Meu Telegram',
    subtitle: 'Ponto de integração do Telegram.',
    icon: 'TG',
    accent: 'cyan',
    legacyLabel: 'Meu Telegram',
    notes: ['Canal Telegram', 'Distribuição e suporte'],
  },
  {
    id: 'app-player',
    section: 'Apps',
    title: 'App G Pro Player',
    subtitle: 'Aplicativo do ecossistema legado.',
    icon: 'AP',
    accent: 'green',
    legacyLabel: 'App G Pro Player',
    notes: ['Aplicativo player', 'Ecossistema de apps'],
  },
  {
    id: 'app-reels',
    section: 'Apps',
    title: 'App G Pro Reels',
    subtitle: 'Gerenciamento de reels e conteúdo curto.',
    icon: 'RE',
    accent: 'amber',
    legacyLabel: 'App G Pro Reels',
    notes: ['Gerador de reels', 'Conteúdo social'],
  },
  {
    id: 'leads',
    section: 'Negócio',
    title: 'Link de Indicação',
    subtitle: 'Origem de leads e referências.',
    icon: '↗',
    accent: 'purple',
    legacyLabel: 'Link de Indicação',
    notes: ['Captação de leads', 'Fluxo comercial'],
  },
  {
    id: 'sports',
    section: 'Esportes',
    title: 'Todos esportes',
    subtitle: 'Área ampla de esportes do legado.',
    icon: '⟲',
    accent: 'cyan',
    legacyLabel: 'Todos esportes',
    notes: ['NBA, UFC, F1', 'Central de esportes'],
  },
  {
    id: 'bolao',
    section: 'Esportes',
    title: 'Bolão Copa',
    subtitle: 'Módulo de bolão para Copa.',
    icon: '🏆',
    accent: 'amber',
    legacyLabel: 'Bolão Copa',
    notes: ['Campanha de copa', 'Interação com público'],
  },
];

function readRoutes(): LabRoute[] {
  if (!existsSync(labMap)) return [];
  try {
    const data = JSON.parse(readFileSync(labMap, 'utf8'));
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item && typeof item === 'object');
  } catch {
    return [];
  }
}

function readExtraction(): Record<string, { links?: LegacyLink[]; title?: string; route?: string }> {
  if (!existsSync(extractionFile)) return {};
  try {
    const data = JSON.parse(readFileSync(extractionFile, 'utf8'));
    if (data && typeof data === 'object') return data;
  } catch {
    return {};
  }
  return {};
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function firstLink(extraction: ReturnType<typeof readExtraction>, label: string): string {
  const target = normalize(label);
  for (const page of Object.values(extraction)) {
    for (const link of page.links || []) {
      if (normalize(link.text || '') === target) return link.href;
    }
  }
  return '';
}

function buildFeatures(): FeatureCard[] {
  const extraction = readExtraction();
  return FEATURE_DEFS.map((feature) => ({
    ...feature,
    legacyRoute: firstLink(extraction, feature.legacyLabel) || '—',
  }));
}

function buildNavigation(features: FeatureCard[]) {
  const sectionOrder = ['Dashboard', 'Comunicação', 'Produção', 'Esportes', 'Banners', 'Marca', 'Apps', 'Negócio'];
  const groups = sectionOrder.map((section) => ({
    section,
    items: features.filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0);

  return groups;
}

@Controller({ path: 'gerador-mago', version: '1' })
export class GeradorMagoController {
  @Get()
  @Public()
  @Header('Content-Type', 'text/html; charset=utf-8')
  ui(): string {
    return GERADOR_MAGO_HTML;
  }

  @Get('ui')
  @Public()
  @Header('Content-Type', 'text/html; charset=utf-8')
  uiAlias(): string {
    return GERADOR_MAGO_HTML;
  }

  @Get('dashboard')
  @Public()
  dashboard() {
    const routes = readRoutes();
    const features = buildFeatures();
    const extraction = readExtraction();
    const sourcePage = extraction['index.php'] || {};
    return {
      data: {
        owner: process.env.MAGO_DASH_USER || 'FUSION-TV',
        baseUrl: process.env.MAGO_BASE_URL || 'https://gerador.pro',
        expiresAt: process.env.GERADOR_MAGO_EXPIRES_AT || null,
        labDir,
        mapFile: labMap,
        stateFile,
        extractionFile,
        networkFile,
        routeCount: routes.length,
        stateExists: existsSync(stateFile),
        extractionExists: existsSync(extractionFile),
        networkExists: existsSync(networkFile),
        summaryTitle: sourcePage.title || 'Dashboard - Painel',
        features,
        navigation: buildNavigation(features),
        routes,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        source: 'gerador-mago',
        version: 'v2',
      },
    };
  }

  @Get('summary')
  @Public()
  summary() {
    const dashboard = this.dashboard();
    return {
      data: {
        ...dashboard.data,
        status: 'ok',
      },
      meta: dashboard.meta,
    };
  }

  @Get('routes')
  @Public()
  routes() {
    return {
      data: readRoutes(),
      meta: {
        generatedAt: new Date().toISOString(),
        source: 'gerador-mago',
        version: 'v1',
      },
    };
  }

  @Get('menu')
  @Public()
  menu() {
    const features = buildFeatures();
    return {
      data: buildNavigation(features),
      meta: {
        generatedAt: new Date().toISOString(),
        source: 'gerador-mago',
        version: 'v1',
      },
    };
  }
}
