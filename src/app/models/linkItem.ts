export interface LinkItem {
  id: string;
  label: string;
  route?: string;
  visible: boolean;
  isDynamic?: boolean;
  sublinks?: SubLinkItem[];
}

export interface SubLinkItem {
  id: string;
  label: string;
  route: string;
  visible: boolean;
  isDynamic?: boolean;
}
