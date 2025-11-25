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
    cd MC656/nutri.me
   ```
2. Instale as Dependências
    ```
    npm install 
    ```
3. Faça o build
   ```
   npm run build  
   ```
4. Agora faça as intalações necessarias para a api
   ```
   cd MC656/api_tudogostoso
   npm install
   ```
6. Agora você pode rodar os dois com o unico comando ao voltar na raiz do projeto
   ```
   cd ..
   npm start
   ```
8. Para rodar os testes, execute
   ```
   cd MC656/nutri.me
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
nutri.me/src
├── components    # Views
├── hooks         # ViewModel (lógica)
├── pages         # Telas principais
├── services      # Model (Requisição de apis)
├── testes        # Testes automaticos
└── types         # Tipos próprios criados
```

**Backend — Firebase**

No projeto para a estruturação do backend foi usado o Firebase (https://firebase.google.com/?hl=pt-br) para de forma pratica e rapida realizar a authenticação do usuario e salvar/resgatar dados necessarios. Além de permitir um facil deploy do nossa aplicação.

- Firebase Auth: usando autenticação pelo google e manual com escrita de email e senha propria
- Firestore Database: estuturação dos nossos dados e criação das regras para quem altera e acessa esses dados

O backend foi isolado ao apenas se conectar com o frontend usando os codigos em model (indicado pela pasta services)

A pasta backend tem os scripts que permitiu extrair os dados de alimentos e criar o csv (tbca_clean), e em seguida com o script import.js foram enviados para o firebase

**API tudo gostoso**

Como o site tudo gostoso aplamente conhecido para pesquisa de receitas, utilizamos a api criado no repositorio: https://github.com/carol-caires/receitas-web-scrapper 
Para a sua utilização clonamos o repositorio na pasta api_tudogostos, realizando algumas alterações para que esteja atualizada e funcionando completamente com o nosso frontend.
Sendo que toda comunicação para a nossa aplicação é feita pelo model.

---

### Diagrama C4 (Contexto, Container, e Componentes)
![A4 - C4 drawio](./Imagens/C4.drawio.svg)

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

Importante que os dados utilizados nesse repositorio foram extraidos de https://github.com/carol-caires/receitas-web-scrapper e da pesquisa (adicionar sobre alimentos), e se forem utilizados estão sujeito ás diretirzes impostas pelos reponsaveis de ambos os dados
 


   


