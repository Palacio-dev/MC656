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
    where,
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
            items: data.items || [],
            userId: data.userId
        };
    }

    /**
     * Busca todas as listas de compras de um usuário específico
     * @param userId - ID do usuário autenticado
     * @returns Promise com array de ShoppingList
     */
    async getAllLists(userId: string): Promise<ShoppingList[]> {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }
            
            console.log('Buscando listas para userId:', userId);
            
            const listsCollection = collection(db, this.collectionName);
            // Removido orderBy para evitar necessidade de índice composto
            // As listas serão ordenadas no cliente
            const q = query(
                listsCollection, 
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            
            console.log('Listas encontradas:', querySnapshot.docs.length);
            
            // Ordena as listas no cliente por createdAt (mais recente primeiro)
            const lists = querySnapshot.docs.map(doc => this.docToShoppingList(doc));
            return lists.sort((a, b) => {
                // Se não tiver createdAt, coloca no final
                const aData = querySnapshot.docs.find(d => d.id === a.id)?.data();
                const bData = querySnapshot.docs.find(d => d.id === b.id)?.data();
                const aTime = aData?.createdAt?.toMillis() || 0;
                const bTime = bData?.createdAt?.toMillis() || 0;
                return bTime - aTime; // desc
            });
        } catch (error: any) {
            console.error('Erro detalhado ao buscar listas:', {
                message: error?.message,
                code: error?.code,
                details: error
            });
            throw error;
        }
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
     * Cria uma nova lista de compras para um usuário específico
     * @param listName - Nome da lista
     * @param userId - ID do usuário autenticado
     * @returns Promise com a lista criada
     */
    async createList(listName: string, userId: string): Promise<ShoppingList> {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }
            
            console.log('Criando lista:', { listName, userId });
            
            const newList = {
                name: listName.trim(),
                items: [],
                userId: userId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            console.log('Dados da nova lista:', newList);
            const docRef = await addDoc(collection(db, this.collectionName), newList);
            console.log('Lista criada com sucesso! ID:', docRef.id);
            
            return {
                id: docRef.id,
                name: newList.name,
                items: newList.items,
                userId: newList.userId
            };
        } catch (error: any) {
            console.error('Erro detalhado ao criar lista:', {
                message: error?.message,
                code: error?.code,
                stack: error?.stack,
                details: error
            });
            throw error; // Propaga o erro original para debug
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

    /**
     * Deleta uma lista de compras (verifica se pertence ao usuário)
     * @param id - ID da lista
     * @param userId - ID do usuário autenticado
     */
    async deleteList(id: string, userId: string): Promise<void> {
        try {
            // Verifica se a lista pertence ao usuário antes de deletar
            const list = await this.getListById(id, userId);
            if (!list) {
                throw new Error('Lista não encontrada ou acesso negado');
            }
            
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