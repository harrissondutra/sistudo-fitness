/**
 * Modelo de endereço baseado na entidade Address do backend
 * Corresponde à tabela 'address' no schema 'fitness'
 */
export interface Address {
  /**
   * Identificador único do endereço
   */
  id?: number;

  /**
   * Nome da rua/logradouro
   */
  street?: string;

  /**
   * Número do endereço
   */
  number?: string;

  /**
   * Bairro
   */
  neighborhood?: string;

  /**
   * Cidade
   */
  city?: string;

  /**
   * Estado/UF
   */
  state?: string;

  /**
   * CEP (Código de Endereçamento Postal)
   */
  zipCode?: string;

  /**
   * País
   */
  country?: string;

  /**
   * Complemento do endereço (apartamento, sala, etc.)
   */
  complement?: string;

  /**
   * Ponto de referência
   */
  referencePoint?: string;

  // Campos herdados de EntityBase (auditoria)
  /**
   * Data de criação do registro
   */
  createdAt?: Date | string | number[];

  /**
   * Data da última atualização
   */
  updatedAt?: Date | string | number[];

  /**
   * Usuário que criou o registro
   */
  createdBy?: string;

  /**
   * Usuário que fez a última atualização
   */
  updatedBy?: string;

  /**
   * Versão do registro (para controle de concorrência)
   */
  version?: number;
}

/**
 * Classe utilitária para operações com endereços
 */
export class AddressUtils {
  /**
   * Formata o endereço completo em uma string
   */
  static formatFullAddress(address: Address): string {
    if (!address) return '';

    const parts: string[] = [];

    // Rua e número
    if (address.street) {
      const streetPart = address.number
        ? `${address.street}, ${address.number}`
        : address.street;
      parts.push(streetPart);
    }

    // Complemento
    if (address.complement) {
      parts.push(address.complement);
    }

    // Bairro
    if (address.neighborhood) {
      parts.push(address.neighborhood);
    }

    // Cidade e estado
    if (address.city || address.state) {
      const cityState = [address.city, address.state]
        .filter(Boolean)
        .join(' - ');
      if (cityState) parts.push(cityState);
    }

    // CEP
    if (address.zipCode) {
      parts.push(`CEP: ${AddressUtils.formatZipCode(address.zipCode)}`);
    }

    return parts.join(', ');
  }

  /**
   * Formata CEP com máscara (12345-678)
   */
  static formatZipCode(zipCode: string): string {
    if (!zipCode) return '';

    // Remove caracteres não numéricos
    const cleaned = zipCode.replace(/\D/g, '');

    // Aplica máscara se tiver 8 dígitos
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }

    return zipCode;
  }

  /**
   * Remove máscara do CEP
   */
  static cleanZipCode(zipCode: string): string {
    if (!zipCode) return '';
    return zipCode.replace(/\D/g, '');
  }

  /**
   * Valida se o CEP está no formato correto
   */
  static isValidZipCode(zipCode: string): boolean {
    if (!zipCode) return false;
    const cleaned = AddressUtils.cleanZipCode(zipCode);
    return cleaned.length === 8 && /^\d{8}$/.test(cleaned);
  }

  /**
   * Cria um endereço vazio com valores padrão
   */
  static createEmpty(): Address {
    return {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
      complement: '',
      referencePoint: ''
    };
  }

  /**
   * Verifica se o endereço está completo (campos obrigatórios preenchidos)
   */
  static isComplete(address: Address): boolean {
    if (!address) return false;

    const requiredFields = ['street', 'neighborhood', 'city', 'state', 'zipCode'];
    return requiredFields.every(field =>
      address[field as keyof Address] &&
      String(address[field as keyof Address]).trim().length > 0
    );
  }

  /**
   * Obtém a representação resumida do endereço (rua, bairro, cidade)
   */
  static getShortAddress(address: Address): string {
    if (!address) return '';

    const parts: string[] = [];

    if (address.street) {
      parts.push(address.street);
    }

    if (address.neighborhood) {
      parts.push(address.neighborhood);
    }

    if (address.city) {
      parts.push(address.city);
    }

    return parts.join(', ');
  }
}

/**
 * Constantes relacionadas a endereços
 */
export const ADDRESS_CONSTANTS = {
  /**
   * Estados brasileiros
   */
  BRAZILIAN_STATES: [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapá' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceará' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espírito Santo' },
    { code: 'GO', name: 'Goiás' },
    { code: 'MA', name: 'Maranhão' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Pará' },
    { code: 'PB', name: 'Paraíba' },
    { code: 'PR', name: 'Paraná' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piauí' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondônia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' }
  ],

  /**
   * Máscara para CEP
   */
  ZIP_CODE_MASK: '00000-000',

  /**
   * Regex para validação de CEP
   */
  ZIP_CODE_REGEX: /^\d{5}-?\d{3}$/
} as const;
