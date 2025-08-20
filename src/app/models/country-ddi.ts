export enum Country {
  Brazil = 'BR',
  UnitedStates = 'US',
  Portugal = 'PT',
  Spain = 'ES',
  Argentina = 'AR',
  Germany = 'DE',
  France = 'FR',
  Italy = 'IT',
  UnitedKingdom = 'GB',
  Japan = 'JP',
  China = 'CN',
  India = 'IN',
  Mexico = 'MX',
  Canada = 'CA',
  Australia = 'AU',
  Chile = 'CL',
  Paraguay = 'PY',
  Uruguay = 'UY',
  Colombia = 'CO',
  Peru = 'PE'
}

export interface CountryDDI {
  code: string; // DDI, e.g. +55
  name: string; // Nome do país
  flagUrl: string; // Caminho da imagem da bandeira
  country: Country;
}

export const COUNTRY_DDIS: CountryDDI[] = [
  { code: '+55', name: 'Brasil', flagUrl: 'assets/images/flags/br.svg', country: Country.Brazil },
  { code: '+1', name: 'Estados Unidos', flagUrl: 'assets/images/flags/us.svg', country: Country.UnitedStates },
  { code: '+351', name: 'Portugal', flagUrl: 'assets/images/flags/pt.svg', country: Country.Portugal },
  { code: '+34', name: 'Espanha', flagUrl: 'assets/images/flags/es.svg', country: Country.Spain },
  { code: '+54', name: 'Argentina', flagUrl: 'assets/images/flags/ar.svg', country: Country.Argentina },
  { code: '+49', name: 'Alemanha', flagUrl: 'assets/images/flags/de.svg', country: Country.Germany },
  { code: '+33', name: 'França', flagUrl: 'assets/images/flags/fr.svg', country: Country.France },
  { code: '+39', name: 'Itália', flagUrl: 'assets/images/flags/it.svg', country: Country.Italy },
  { code: '+44', name: 'Reino Unido', flagUrl: 'assets/images/flags/gb.svg', country: Country.UnitedKingdom },
  { code: '+81', name: 'Japão', flagUrl: 'assets/images/flags/jp.svg', country: Country.Japan },
  { code: '+86', name: 'China', flagUrl: 'assets/images/flags/cn.svg', country: Country.China },
  { code: '+91', name: 'Índia', flagUrl: 'assets/images/flags/in.svg', country: Country.India },
  { code: '+52', name: 'México', flagUrl: 'assets/images/flags/mx.svg', country: Country.Mexico },
  { code: '+1', name: 'Canadá', flagUrl: 'assets/images/flags/ca.svg', country: Country.Canada },
  { code: '+61', name: 'Austrália', flagUrl: 'assets/images/flags/au.svg', country: Country.Australia },
  { code: '+56', name: 'Chile', flagUrl: 'assets/images/flags/cl.svg', country: Country.Chile },
  { code: '+595', name: 'Paraguai', flagUrl: 'assets/images/flags/py.svg', country: Country.Paraguay },
  { code: '+598', name: 'Uruguai', flagUrl: 'assets/images/flags/uy.svg', country: Country.Uruguay },
  { code: '+57', name: 'Colômbia', flagUrl: 'assets/images/flags/co.svg', country: Country.Colombia },
  { code: '+51', name: 'Peru', flagUrl: 'assets/images/flags/pe.svg', country: Country.Peru }
];
