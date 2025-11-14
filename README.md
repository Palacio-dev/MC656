# Projeto de Engenharia de Software - MC656 2S25

## 👥 Integrantes 

Ana Beatriz Hidalgo - RA: 248238  
Gabriel Cabral Romero Oliveira - RA: 247700  
Lucas Palacio Almeida - RA : 236380  
Lucas Ribeiro Bortoletto - RA: 173422  
Maria Gabriela Lustosa Oliveira - RA: 188504  


## 🎯 Objetivo do Projeto  

Este projeto tem como objetivo desenvolver um aplicativo que forneça informações nutricionais de alimentos e auxilie os usuários na construção de uma alimentação mais equilibrada e saudável.

A proposta é analisar dados alimentares e disponibilizar ferramentas que incentivem escolhas nutricionais conscientes, permitindo que os usuários compreendam melhor como suas dietas impactam diretamente a saúde e o bem-estar.

Nesse contexto, o projeto está alinhado com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU, especialmente:

-  ODS 2 – Fome Zero e Agricultura Sustentável

      2.1: Acabar com a fome e garantir o acesso a alimentos seguros, nutritivos e suficientes durante todo o ano

      2.2: Acabar com todas as formas de má-nutrição

- ODS 3 – Saúde e Bem-Estar

     3.4: Reduzir as doenças não transmissíveis por meio da prevenção e promoção da saúde

     3.5: Fortalecer a prevenção do uso nocivo de substâncias, incluindo o consumo prejudicial de alimentos ultraprocessados

Ao alinhar dados nutricionais com esses objetivos globais, o projeto busca contribuir para a promoção de hábitos alimentares mais saudáveis e para uma melhor compreensão da relação entre nutrição e qualidade de vida.


<h2 id="como-executar-o-projeto">⚙️ Como Executar</h2>

**Scripts:**
1. Clone o repositório
   ```
    git clone https://github.com/Palacio-dev/MC656.git
    cd MC656/saude_e_bem_estar
   ```
2. Instale as Dependências
    ```
    npm install 
    ```
3. Faça o build
   ```
   npm run build  
   ```
4. Execute
   ```
   npm start  
   ```
5. Abra um novo terminal e entre no diretório do backend
   ```
   cd MC656/auth-api
   ```
6. Dê permissão ao usuário para executar CREATE_DATABASE no banco de dados Postgres
   ```
   psql -h localhost -U postgres -p 5432 -c "ALTER ROLE test_user CREATEDB;"
   ```
7. Execute
   ```
   npm run dev
   ```
8. Para verificar se os dados de autenticação foram armazenados no banco, execute
   ```
   cd MC656/auth-api

   PGPASSWORD=teste123 psql -h localhost -p 5432 -U test_user -d logindb
   SELECT id, name, email FROM users ORDER BY id;
   ```
8. Para rodar os testes, execute
   ```
   cd MC656/saude_e_bem_estar
   npm test 
   ```

## 🧱 Descrição da Arquitetura
### Estilos
**Mobile App — MVVM (Model-View-ViewModel)**

O frontend segue o padrão MVVM, que separa a lógica de apresentação da lógica de negócios, facilitando a testabilidade e a reutilização de código.

- **Model**: Representa os dados e a lógica de negócios (integração com a API, estados da aplicação).
- **View**: Interface com o usuário, que foi construída em React, é responsável por exibir as informações e capturar interações.
- **ViewModel**: Atua como intermediário entre a View e o Model, processando os dados e notificando a interface sobre mudanças de estado.

Aqui está uma visão de como faremos a organização dos arquivos:
```
saude_e_bem_estar/src
├── components    # Views
├── hooks         # ViewModel (lógica)
├── pages         # Telas principais
├── services      # Model (Requisição de apis)
├── testes        # Testes automaticos
└── types         # Tipos próprios criados
```

**Backend — Clean Architecture**

O backend foi desenvolvido seguindo os princípios da Clean Architecture, garantindo independência entre as camadas e facilitando a substituição de tecnologias.

- **Entities (Domínio)**: Contém as regras de negócio fundamentais e entidades da aplicação.
- **Use Cases (Aplicação)**: Define os casos de uso e orquestra as regras do domínio.
- **Interface Adapters**: Faz a mediação entre o domínio e o mundo externo (bancos de dados, APIs, frameworks).
- **Frameworks & Drivers (Infraestrutura)**: Contém implementações específicas de persistência, serviços externos e detalhes técnicos.

Aqui está uma exemplificação de como faremos a organização dos arquivos:
```
backend/
├── app/
│   ├── domain/               # Regra de negócio pura (Entidades + Interfaces de Repositório)
│   ├── use_cases/            # Casos de uso (application layer)
│   ├── interfaces/           # Adapters -> comunicação entre casos de uso e mundo externo
│   ├── infrastructure/       # Detalhes de tecnologia (não atinge o domínio)
│   └── core /                # Regras compartilhadas (erros, helpers)
│
├── tests/                    # Testes unitários e de integração
└── README.md

```
---

### Diagrama C4 (Contexto, Container, e Componentes)
![A4 - C4 drawio](https://github.com/user-attachments/assets/101353df-7748-4857-ade4-d145cf97195f)

Para implementar a arquitetura proposta para Mobile App (frontend) cada um dos componentes abaixo deve ser implementado para cada uma das cinco features planejadas:

* **View**: Componente em React/TypeScript responsável pela interface e interação com o usuário. Ele exibe formulários de inserção de texto, listas, botões, dentre outros elementos. Ex.:
  - Login View tem campos de e-mail/senha e botões de entrar/cadastrar.
  - Shopping List View exibe lista de compras, permite adicionar/remover itens ou marcar como “comprado”.
  - Receitas View: mostra receitas, filtros e botão de “adicionar ingredientes à lista de compras”.
  - Nutrição de Alimentos View: campo de busca de alimento pelo nome e visualização das informações nutricionais.
  - Planejador de Refeições View: calendário semanal/mensal em que o usuário monta o cardápio.

* **Hook**: Contém validações, regras de uso e transformação de dados, além de coordenar chamadas ao Model e atualiza o estado vindo da View. Ex.:
  - Login Hook: recebe credenciais da View, valida dados, chama o Model para autenticar e devolve para a View se o login foi bem-sucedido ou não.
  - Shopping List Hook: recebe ações da View (adicionar item, riscar, remover), decide como atualizar a lista e chama o Model para executar essas mudanças.
  - Receitas Hook: dispara a buscas de receitas e pede ao Model para enviar ingredientes para a lista de compras.
  - Nutrição de Alimentos Hook: pega o nome do alimento digitado, chama o Model, manda o retorno de nutrientes e calorias para a View.
  - Planejador de Refeições Hook: recebe as ações de criar/editar cardápios e coordena salvamento por meio do Model.

* **Model**: faz acesso a dados, integração com backend, mapeia requsições e respostas, além de manter o estado atual do usuário logado, da lista e do cardápio, por exemplo. Ex.: 
  - Login Model: envia credenciais para o backend, recebe dados de usuário e atualiza o estado de autenticação.
  - Shopping List Model: faz requisições para criar, atualizar ou buscar a lista de compras no banco.
  - Receitas Model: consulta o backend para receitas (API) e gerencia as receitas associadas ao usuário.
  - Nutrição de Alimentos Model: solicita dados nutricionais de um alimento no banco, devolvendo-o ao Hook.
  - Planejador de Refeições Model: envia e atualiza os planos de refeições do backend e recupera o cardápio salvo quando o usuário abre o app.

Para implementar a arquitetura proposta para o backend é necessário haver os componentes descritos abaixo:

* **Interface Adapters**: responsáveis por ser as portas de entrada do sistema, receber as requisições externas (do Mobile App e de outras APIs), validar os dados, traduzir os formatos e encaminar para use cases. Além disso, transformam a resposta dos use cases em formatos adequados ao envio para o cliente. Ex.:
  - Controller recebe o nome de um alimento e aciona o caso de uso de consulta nutricional.
  - Endpoint recebe uma receita marcada como favorita e aciona o caso de uso de salvamento.

* **Use cases**: Implementam ações específicas que o sistema executa como salvar receitas, buscar alimentos, gerar cardápios etc. Também contêm a lógica de aplicação e coordenam as interações entre Domain e Infrastructure. Ex.:
  - Caso de uso para buscar cardápio recebe um objeto de cardápio, valida regras e chama o domínio e repositórios.
  - Caso de uso para buscar valor nutricional recebe o nome do alimento e coordena a consulta ao repositório de nutrição.

* **Domain**: responsável por conter as regras de negócio puras além de definir entidades, regras de validação, cálculos e invariantes do domínio. Ex.:
  - Entidade Cardapio validando se uma semana possui todas as refeições cadastradas.

* **Infrastructure**: Implementa acesso ao banco de dados, faz integração com serviços externos, faz o contato direto com PostgresSQL, DuckDB e API do TudoGostoso. Ex.:
  - Adapter para chamar a API do TudoGostoso e transformar JSON em objetos internos.
  - Implementação das receitas salvas no perfil de um usuário usando PostgreSQL.

---

### Padrão de Projeto — Strategy no Planejador de Refeições
O Planejador de Refeições utiliza o padrão Strategy para permitir a seleção dinâmica de diferentes interfaces de planejamento.
Esse padrão facilita a extensibilidade e a personalização das estratégias sem alterar o código principal, o que permite uma fácil alteração entre a visualização diária, semanal e mensal do planejador.

**Estrutura**:
1. Interface Base (`MealPlannerStrategy`): define o contrato que todas as estratégias devem seguir.
2. Estratégias Concretas: cada forma de visualizar o planejador é encapsulada em sua própria classe
3. ViewModel como Contexto do Strategy: O `MealPlannerViewModel` mantém a estratégia ativa, e oferece métodos para alternar entre elas
4. View Genérica e Desacoplada: o componente React (`MealPlannerView`) não conhece detalhes de cada visão. Assim, o componente continua idêntico, independentemente da estratégia selecionada.

**Vantagens**:
- Permite adicionar novas estratégias sem alterar o código existente.
- Facilita a adaptação a diferentes perfis de usuário.
- Cada visão fica isolada em sua própria classe.




### 📄 Licença
Este projeto é de uso acadêmico e está sujeito às diretrizes da disciplina MC656 da Unicamp oferecida no segundo semestre de 2025.

 


   


