import {
    doc, 
    getDoc, 
    updateDoc,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ShoppingList, ShoppingItem } from '../types/ShoppingTypes';

/**
 * Model - Service para comunicação com Firebase Firestore
 * Responsável por todas as operações CRUD no banco de dados
 */
class ShoppingListDetailService {
    private collectionName = 'shoppingLists';

    /**
     * Converte um documento do Firestore para o tipo ShoppingList
     */
    private docToShoppingList(doc: QueryDocumentSnapshot<DocumentData>): ShoppingList {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            items: data.items || [],
            userId: data.userId
        };
    }

    /**
     * Busca uma lista específica por ID (verifica se pertence ao usuário)
     * @param id - ID da lista
     * @param userId - ID do usuário autenticado
     * @returns Promise com ShoppingList ou null
     */
    async getListById(id: string, userId: string): Promise<ShoppingList | null> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const list = this.docToShoppingList(docSnap as QueryDocumentSnapshot<DocumentData>);
                // Verifica se a lista pertence ao usuário
                if (list.userId !== userId) {
                    throw new Error('Acesso negado: esta lista não pertence ao usuário');
                }
                return list;
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar lista:', error);
            throw new Error('Não foi possível carregar a lista');
        }
    }

    /**
     * Atualiza uma lista existente (verifica se pertence ao usuário)
     * @param id - ID da lista
     * @param userId - ID do usuário autenticado
     * @param updates - Dados para atualizar
     */
    async updateList(id: string, userId: string, updates: Partial<ShoppingList>): Promise<void> {
        try {
            // Verifica se a lista pertence ao usuário antes de atualizar
            const list = await this.getListById(id, userId);
            if (!list) {
                throw new Error('Lista não encontrada ou acesso negado');
            }
            
            const docRef = doc(db, this.collectionName, id);
            // Remove userId dos updates para evitar modificação
            const { userId: _, ...safeUpdates } = updates;
            await updateDoc(docRef, {
                ...safeUpdates,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Erro ao atualizar lista:', error);
            throw new Error('Não foi possível atualizar a lista');
        }
    }

    // ============================================
    // MÉTODOS PARA GERENCIAR ITEMS DA LISTA
    // ============================================

    /**
     * Adiciona um novo item à lista
     * @param listId - ID da lista
     * @param userId - ID do usuário autenticado
     * @param itemText - Texto do item
     * @param quantity - Quantidade opcional (ex: "2kg", "500g")
     * @returns Promise com o item criado
     */
    async addItem(listId: string, userId: string, itemText: string, quantity?: string): Promise<ShoppingItem> {
        try {
            // Busca a lista atual
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error('Lista não encontrada');
            }

            // Cria o novo item
            const newItem: ShoppingItem = {
                id: Date.now().toString(),
                text: itemText.trim(),
                checked: false,
                ...(quantity && quantity.trim() ? { quantity: quantity.trim() } : {})
            };

            // Adiciona o item ao array
            const updatedItems = [...list.items, newItem];

            // Atualiza no Firestore
            await this.updateList(listId, userId, { items: updatedItems });

            return newItem;
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            throw new Error('Não foi possível adicionar o item');
        }
    }

    /**
     * Atualiza um item da lista (marca/desmarca)
     * @param listId - ID da lista
     * @param userId - ID do usuário autenticado
     * @param itemId - ID do item
     * @param checked - Novo estado do checkbox
     */
    async toggleItem(listId: string, userId: string, itemId: string, checked: boolean): Promise<void> {
        try {
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error('Lista não encontrada');
            }

            const updatedItems = list.items.map(item =>
                item.id === itemId ? { ...item, checked } : item
            );

            await this.updateList(listId, userId, { items: updatedItems });
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            throw new Error('Não foi possível atualizar o item');
        }
    }

    /**
     * Deleta um item da lista
     * @param listId - ID da lista
     * @param userId - ID do usuário autenticado
     * @param itemId - ID do item
     */
    async deleteItem(listId: string, userId: string, itemId: string): Promise<void> {
        try {
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error('Lista não encontrada');
            }

            const updatedItems = list.items.filter(item => item.id !== itemId);

            await this.updateList(listId, userId, { items: updatedItems });
        } catch (error) {
            console.error('Erro ao deletar item:', error);
            throw new Error('Não foi possível deletar o item');
        }
    }

    /**
     * Remove todos os itens marcados da lista
     * @param listId - ID da lista
     * @param userId - ID do usuário autenticado
     */
    async clearCheckedItems(listId: string, userId: string): Promise<void> {
        try {
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error('Lista não encontrada');
            }

            const updatedItems = list.items.filter(item => !item.checked);

            await this.updateList(listId, userId, { items: updatedItems });
        } catch (error) {
            console.error('Erro ao limpar itens marcados:', error);
            throw new Error('Não foi possível limpar os itens marcados');
        }
    }

    /**
     * Atualiza múltiplos items de uma vez (operação em batch)
     * @param listId - ID da lista
     * @param userId - ID do usuário autenticado
     * @param items - Array completo de items atualizado
     */
    async updateItems(listId: string, userId: string, items: ShoppingItem[]): Promise<void> {
        try {
            await this.updateList(listId, userId, { items });
        } catch (error) {
            console.error('Erro ao atualizar items:', error);
            throw new Error('Não foi possível atualizar os items');
        }
    }
}

// Exporta uma instância única (Singleton)
export const shoppingListDetailService = new ShoppingListDetailService();