export interface LinkItem {
  id: string;
  label: string;
  route?: string;
  visible: boolean;
  isDynamic?: boolean;
  expanded?: boolean; // Para controle Gestalt de expansão
  sublinks?: SubLinkItem[];
}

export interface SubLinkItem {
  id: string;
  label: string;
  route: string;
  visible: boolean;
  isDynamic?: boolean;
}
