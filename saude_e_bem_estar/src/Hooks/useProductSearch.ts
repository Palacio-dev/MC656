import { useEffect, useMemo, useState } from "react";
// fetch suggestions when query changes
useEffect(() => {
let cancelled = false;
const load = async () => {
if (query.length <= 1) {
setSuggestions([]);
return;
}
setLoading(true);
try {
const res = await productService.fetchProducts(query);
if (!cancelled) setSuggestions(res);
} catch (err) {
console.error("Error fetching suggestions", err);
} finally {
if (!cancelled) setLoading(false);
}
};
load();
return () => {
cancelled = true;
};
}, [query]);


const select = (p: Product) => {
setSelected(p);
setQuery("");
setSuggestions([]);
setHistory((prev) => {
if (prev.find((h) => h.name === p.name)) return prev;
return [p, ...prev].slice(0, 20);
});
};


const clearHistory = () => {
setHistory([]);
setSelected(null);
};


const selectFromHistory = (p: Product) => select(p);


const clearSelected = () => setSelected(null);


// derived values
const hasSuggestions = useMemo(() => suggestions.length > 0, [suggestions]);


return {
query,
setQuery,
suggestions,
hasSuggestions,
selected,
loading,
history,
select,
clearHistory,
selectFromHistory,
clearSelected,
} as const;
}