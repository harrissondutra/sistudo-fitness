import { Trainning } from './trainning'; // Importe o modelo Trainning, pois TrainningCategory tem uma referência a ele.
// Certifique-se de que o caminho está correto.

export interface TrainningCategory {
  id?: number;         // 'Long' no Java geralmente vira 'number' em TypeScript. Usamos '?' para indicar que pode ser opcional (ex: ao criar um novo, o ID ainda não existe).
  name?: string;       // 'String' no Java vira 'string' em TypeScript.
  description?: string; // 'String' no Java vira 'string' em TypeScript.
  trainning?: Trainning; // Mapeia para a entidade Trainning no backend. Aqui, '?' indica que pode ser opcional/carregado lazy.
}

export interface TrainningCategoryDto {
  id: number;
  name?: string; // Exemplo de propriedade, ajuste conforme seu TrainningCategoryDto real
  // Adicione outras propriedades de TrainningCategoryDto que seu backend envia
}
