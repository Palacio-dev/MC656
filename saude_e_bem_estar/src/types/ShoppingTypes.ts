export interface ShoppingItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface ShoppingList {
    id: string;
    name: string;
    items: ShoppingItem[];
}