import { db } from "../config/firebase";
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { ShoppingList } from '../types/ShoppingTypes';

/**
 * Model - Service para comunicação com Firebase Firestore
 * Responsável por todas as operações CRUD no banco de dados
 */
class ShoppingListService {
    private collectionName = 'shoppingLists';

    /**
     * Converte um documento do Firestore para o tipo ShoppingList
     */
    private docToShoppingList(doc: QueryDocumentSnapshot<DocumentData>): ShoppingList {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            items: data.items || []
        };
    }

    /**
     * Busca todas as listas de compras
     * @returns Promise com array de ShoppingList
     */
    async getAllLists(): Promise<ShoppingList[]> {
        try {
            const listsCollection = collection(db, this.collectionName);
            const q = query(listsCollection, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => this.docToShoppingList(doc));
        } catch (error) {
            console.error('Erro ao buscar listas:', error);
            throw new Error('Não foi possível carregar as listas');
        }
    }

    /**
     * Busca uma lista específica por ID
     * @param id - ID da lista
     * @returns Promise com ShoppingList ou null
     */
    async getListById(id: string): Promise<ShoppingList | null> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return this.docToShoppingList(docSnap as QueryDocumentSnapshot<DocumentData>);
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar lista:', error);
            throw new Error('Não foi possível carregar a lista');
        }
    }

    /**
     * Cria uma nova lista de compras
     * @param listName - Nome da lista
     * @returns Promise com a lista criada
     */
    async createList(listName: string): Promise<ShoppingList> {
        try {
            const newList = {
                name: listName.trim(),
                items: [],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.collectionName), newList);
            
            return {
                id: docRef.id,
                name: newList.name,
                items: newList.items
            };
        } catch (error) {
            console.error('Erro ao criar lista:', error);
            throw new Error('Não foi possível criar a lista');
        }
    }

    /**
     * Atualiza uma lista existente
     * @param id - ID da lista
     * @param updates - Dados para atualizar
     */
    async updateList(id: string, updates: Partial<ShoppingList>): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Erro ao atualizar lista:', error);
            throw new Error('Não foi possível atualizar a lista');
        }
    }

    /**
     * Deleta uma lista de compras
     * @param id - ID da lista
     */
    async deleteList(id: string): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Erro ao deletar lista:', error);
            throw new Error('Não foi possível deletar a lista');
        }
    }
}

// Exporta uma instância única (Singleton)
export const shoppingListService = new ShoppingListService();