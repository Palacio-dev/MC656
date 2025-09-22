# Funcionamento de cada componente e como reutilizá-los
- **ProductSearch:**

    Esse componente é responsável por fazer a busca dos produtos em um CSV guardado localmente, e retornar uma lista de produtos que batem com o nome buscado. Ele também é responsável por mostrar as informações nutricionais do produto selecionado e guardar um histórico dos produtos já buscados.
        
    Para reutilizar esse componente, basta importá-lo e guardar o CSV na pasta `public/assets/`. O CSV deve ter as seguintes colunas: `nome`, `energia_kcal`, `carboidratos_total_g`, `proteina_g`, `lipidios_g` e `fibra_alimentar_g`.
