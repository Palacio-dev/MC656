/**
 * Test cases for ingredient extraction
 * Run this in browser console to test the extraction logic
 */

// Import the extraction function (you'll need to export it first for testing)
// For now, copy the function here for testing

function extractMainIngredient(ingredientText: string): string {
  let cleaned = ingredientText.toLowerCase();
  
  // Remove frações e números (incluindo decimais, frações, etc)
  cleaned = cleaned.replace(/\d+[\.,]?\d*/g, '');
  cleaned = cleaned.replace(/½|¼|¾|⅓|⅔|⅛|⅜|⅝|⅞/g, '');
  
  // Remove unidades de medida comuns
  cleaned = cleaned.replace(/\b(g|gr|gramas?|kg|quilogramas?)\b/gi, '');
  cleaned = cleaned.replace(/\b(ml|mililitros?|l|litros?)\b/gi, '');
  cleaned = cleaned.replace(/\b(xícara|xícaras|xic|xics)\b/gi, '');
  cleaned = cleaned.replace(/\b(colheres?|colher|col|cols)\b/gi, '');
  cleaned = cleaned.replace(/\b(sopa|sobremesa|chá|café)\b/gi, '');
  cleaned = cleaned.replace(/\b(unidade|unidades|und|pc|pç|peça|peças)\b/gi, '');
  cleaned = cleaned.replace(/\b(dente|dentes)\b/gi, '');
  cleaned = cleaned.replace(/\b(fatia|fatias|rodela|rodelas)\b/gi, '');
  cleaned = cleaned.replace(/\b(pitada|pitadas|punhado|punhados)\b/gi, '');
  cleaned = cleaned.replace(/\b(lata|latas|pacote|pacotes|caixa|caixas)\b/gi, '');
  cleaned = cleaned.replace(/\b(maço|maços|molho|molhos|ramo|ramos)\b/gi, '');
  
  // Remove preposições e artigos
  cleaned = cleaned.replace(/\b(de|da|do|das|dos|em|no|na|nos|nas)\b/gi, '');
  cleaned = cleaned.replace(/\b(à|ao|aos|às|para|por|com|sem)\b/gi, '');
  cleaned = cleaned.replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, '');
  
  // Remove adjetivos e estados comuns
  cleaned = cleaned.replace(/\b(picado|picada|picados|picadas)\b/gi, '');
  cleaned = cleaned.replace(/\b(ralado|ralada|ralados|raladas)\b/gi, '');
  cleaned = cleaned.replace(/\b(fatiado|fatiada|fatiados|fatiadas)\b/gi, '');
  cleaned = cleaned.replace(/\b(cortado|cortada|cortados|cortadas)\b/gi, '');
  cleaned = cleaned.replace(/\b(moído|moída|moídos|moídas)\b/gi, '');
  cleaned = cleaned.replace(/\b(batido|batida|batidos|batidas)\b/gi, '');
  cleaned = cleaned.replace(/\b(cozido|cozida|cozidos|cozidas)\b/gi, '');
  cleaned = cleaned.replace(/\b(cru|crua|crus|cruas)\b/gi, '');
  cleaned = cleaned.replace(/\b(fresco|fresca|frescos|frescas)\b/gi, '');
  cleaned = cleaned.replace(/\b(seco|seca|secos|secas)\b/gi, '');
  cleaned = cleaned.replace(/\b(maduro|madura|maduros|maduras)\b/gi, '');
  cleaned = cleaned.replace(/\b(verde|verdes|vermelho|vermelha|amarelo|amarela)\b/gi, '');
  cleaned = cleaned.replace(/\b(grande|grandes|pequeno|pequena|pequenos|pequenas)\b/gi, '');
  cleaned = cleaned.replace(/\b(médio|média|médios|médias)\b/gi, '');
  cleaned = cleaned.replace(/\b(inteiro|inteira|inteiros|inteiras)\b/gi, '');
  
  // Remove expressões opcionais
  cleaned = cleaned.replace(/\b(a gosto|opcional|se necessário|conforme necessário|ou mais)\b/gi, '');
  cleaned = cleaned.replace(/\(.*?\)/g, '');
  
  // Remove pontuação
  cleaned = cleaned.replace(/[,;:.!?()]/g, ' ');
  
  // Normaliza espaços
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Singulariza palavras comuns no plural
  cleaned = cleaned.replace(/\bovos\b/g, 'ovo');
  cleaned = cleaned.replace(/\btomates\b/g, 'tomate');
  cleaned = cleaned.replace(/\bcebolas\b/g, 'cebola');
  cleaned = cleaned.replace(/\balhos\b/g, 'alho');
  
  if (!cleaned || cleaned.length < 2) {
    return ingredientText.toLowerCase().trim();
  }
  
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  
  if (words.length === 0) {
    return ingredientText.toLowerCase().trim();
  }
  
  return words.slice(0, 2).join(' ').trim();
}

// Test cases
const testCases = [
  "4 ovos",
  "200g de tomate picado",
  "1 xícara de farinha de trigo",
  "2 dentes de alho",
  "1/2 cebola picada",
  "500ml de leite",
  "3 colheres de sopa de azeite",
  "Sal a gosto",
  "1 pacote de queijo ralado",
  "250g de manteiga sem sal",
  "1 lata de leite condensado",
  "Pimenta do reino moída (opcional)"
];

console.log("=== TESTE DE EXTRAÇÃO DE INGREDIENTES ===\n");

testCases.forEach(test => {
  const result = extractMainIngredient(test);
  console.log(`"${test}"`);
  console.log(`  → "${result}"\n`);
});

export { extractMainIngredient };
