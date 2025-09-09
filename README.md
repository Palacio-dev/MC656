# Projeto de Engenharia de Software - MC656 2S25
    Neste projeto, estamos criando um aplicativo que procura auxiliar as pessoas a montar uma melhor alimentação, ao auxiliar a montar uma boa alimentação e adquirir um melhor conhecimento sobre os valores nutricionais da comida
    Esta ideia veio a partir de um incentivo do professor de relacionar o projeto a uma ods, em que nosso interesse se despertou nas seguintes ods:
    - Fome Zero e Agricultura Sustentável
    - Saúde e Bem-Estar


## Estruturação do projeto
    No intuito de conseguir facilmente construir um aplicativo que rodaria em android e ios, escolhemos estruturar usando react com typescript junto do capacitor. Pois assim facilmente utilizamos a estrutura do react para criar nossas features, e assim exportar o site para um aplicativo utilizando o capacitor


    Sendo assim utilizamos uma separação de arquivos em src para conseguir um fácil escalonamento e organização
    -saude_e_bem_estar/src
        - Components: componentes criados para fácil reutilização nas páginas
        - Pages: páginas estruturadas para interação com usuário
        - Styles: estilização das páginas com App.css possuindo a estilização mais genérica e reutilizável, e para cada componente possui um .css para a estilização específica
        - Testes: testes organizados para cada página criada e inteligível


## Para rodar o site
    Em aude_e_bem_estar/package-lock.json você encontra as dependencias necessarias para conseguir rodar a aplicação
    Comandos importantes para a execução do site
    - Verifique se você se encontra na pasta aude_e_bem_estar e em seguida faça npm build e npm start
   
    Para rodar os testes:
    - Verifique de estar na pasta aude_e_bem_estar e em seguida rode o comando npm test


    Para mais informações leia o readme de cada pasta
