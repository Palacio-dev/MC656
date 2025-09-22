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


### 📄 Licença
Este projeto é de uso acadêmico e está sujeito às diretrizes da disciplina MC656 da Unicamp oferecida no segundo semestre de 2025.

 


   


