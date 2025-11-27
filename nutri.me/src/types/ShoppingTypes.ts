export interface ShoppingItem {
    id: string;
    text: string;
    quantity?: string; // Optional quantity field (e.g., "2kg", "500g", "3 unidades")
    checked: boolean;
}

export interface ShoppingList {
    id: string;
    name: string;
    items: ShoppingItem[];
    userId: string; // ID do usuário dono da lista
}