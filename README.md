# Sistudo Fitness

Sistudo Fitness é um aplicativo web desenvolvido em Angular para controle de treinamentos fitness. O objetivo do sistema é facilitar o acompanhamento de treinos, perfis de clientes e configurações personalizadas para academias, personal trainers e praticantes de atividades físicas.

## Funcionalidades

- Cadastro e gerenciamento de perfis de clientes
- Visualização e edição de treinos
- Configurações personalizadas para cada Cliente
- Interface responsiva e moderna baseada no Angular Material

## Tecnologias Utilizadas

- [Angular 17+](https://angular.io/)
- [Angular Material](https://material.angular.io/)
- RxJS
- SCSS
- **Backend em Java 21 com Spring**
- **Banco de dados PostgreSQL**

## Como executar

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/sistudo-fitness.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o projeto:
   ```bash
   ng serve
   ```
4. Acesse [http://localhost:4200](http://localhost:4200) no seu navegador.

## Estrutura do Projeto

- `src/app/home`: Componente principal e layout do app
- `src/app/shared/sidenav`: Menu lateral de navegação
- `src/app/shared/toolbar`: Barra superior
- `src/app/profile`: Perfil do Cliente
- `src/app/settings`: Configurações

## Principais Rotas da API

```
GET    /exercises/list
POST   /exercises/create
GET    /exercises/category/{categoryId}
GET    /categoryExercise/list
POST   /categoryExercise/create
GET    /measure/getByUserId?userId={userId}
POST   /measure/save
POST   /measure/updateByUserId
DELETE /measure/deleteByUserId?userId={userId}
GET    /user/listAll
GET    /user/getById/{id}
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Sistudo Fitness** — Controle total dos seus treinos, onde você estiver!
