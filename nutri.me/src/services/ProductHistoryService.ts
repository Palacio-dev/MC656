import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc,
    doc,
    query,
    where,
    limit as firestoreLimit,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot,
    writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Product } from "../types/product";
import { ProductHistoryEntry, ProductHistoryQueryParams } from "../types/productHistory";

/**
 * Model - Service para gerenciar histórico de produtos no Firebase
 * Responsável por todas as operações CRUD do histórico de pesquisas
 */
class ProductHistoryService {
    private collectionName = 'historicoAlimentos';

    /**
     * Converte um documento do Firestore para ProductHistoryEntry
     */
    private docToHistoryEntry(doc: QueryDocumentSnapshot<DocumentData>): ProductHistoryEntry {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            productId: data.productId,
            name: data.name,
            calories: data.calories,
            carbs: data.carbs,
            protein: data.protein,
            fat: data.fat,
            fiber: data.fiber,
            timestamp: data.timestamp?.toDate() || new Date()
        };
    }

    /**
     * Salva um produto no histórico de um usuário
     * @param userId - ID do usuário
     * @param product - Produto pesquisado
     */
    async saveToHistory(userId: string, product: Product): Promise<void> {
        if (!userId) {
            throw new Error('userId é obrigatório');
        }

        try {
            const historyEntry: Omit<ProductHistoryEntry, 'id'> = {
                userId,
                productId: this.generateProductId(product),
                name: product.name,
                calories: product.calories,
                carbs: product.carbs,
                protein: product.protein,
                fat: product.fat,
                fiber: product.fiber,
                timestamp: Timestamp.now()
            };

            await addDoc(collection(db, this.collectionName), {
                ...historyEntry,
            });

            console.log('✅ Produto salvo no histórico:', product.name);
        } catch (error) {
            console.error('❌ Erro ao salvar no histórico:', error);
            throw new Error('Não foi possível salvar o produto no histórico');
        }
    }

    /**
     * Busca o histórico de um usuário específico
     * @param params - Parâmetros da consulta (userId, limit, orderBy)
     * @returns Promise com array de ProductHistoryEntry
     */
    async getUserHistory(userId: string): Promise<ProductHistoryEntry[]> {

        if (!userId) {
            throw new Error('userId é obrigatório');
        }

        try {
            const historyCollection = collection(db, this.collectionName);

            console.log('Buscando listas para userId:', userId);
            // Removido orderBy para evitar necessidade de índice composto
            // As listas serão ordenadas no cliente
            const q = query(
                historyCollection, 
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            
            console.log('Historico encontradas:', querySnapshot.docs.length);
            const historico = querySnapshot.docs.map(doc => this.docToHistoryEntry(doc));
            
            return historico;
        } catch (error) {
            console.error('Erro ao buscar historico:', error);
            throw new Error('Não foi possível carregar as historico');
        }
    }

    /**
     * Busca os produtos únicos do histórico (sem duplicatas)
     * Remove produtos duplicados, mantendo apenas a pesquisa mais recente
     * @param userId - ID do usuário
     * @param limit - Limite de resultados únicos (padrão: 20)
     * @returns Promise com array de Product (apenas dados do produto)
     */
    async getUniqueUserHistory(userId: string, limit: number = 20): Promise<Product[]> {
        if (!userId) {
            throw new Error('userId é obrigatório');
        }

        try {
            // Busca mais entradas do que o necessário para filtrar duplicatas
            const history = await this.getUserHistory(userId);

            // Remove duplicatas baseado no nome do produto
            const uniqueProducts = new Map<string, Product>();
            
            for (const entry of history) {
                if (!uniqueProducts.has(entry.name)) {
                    uniqueProducts.set(entry.name, {
                        name: entry.name,
                        calories: entry.calories,
                        carbs: entry.carbs,
                        protein: entry.protein,
                        fat: entry.fat,
                        fiber: entry.fiber
                    });
                }

                // Para quando alcançar o limite desejado
                if (uniqueProducts.size >= limit) break;
            }

            return Array.from(uniqueProducts.values());
        } catch (error) {
            console.error('❌ Erro ao buscar histórico único:', error);
            throw new Error('Não foi possível carregar o histórico');
        }
    }

    /**
 * Deleta TODO o histórico de um usuário, independente da quantidade (>500 docs).
 */
async clearUserHistory(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("userId é obrigatório");
    }

    try {
        const historyCollection = collection(db, this.collectionName);

        // Cria a query base
        const q = query(
            historyCollection, 
            where("userId", "==", userId)
        );

        let totalDeleted = 0;

        while (true) {
            // SEMPRE busca direto do servidor para evitar cache offline
            const snapshot = await getDocs(q /*, { source: "server" } */);

            if (snapshot.empty) {
                console.log(`ℹ️ Histórico já está vazio`);
                break;
            }

            // Firestore batch = máx 500 operações
            const batch = writeBatch(db);

            snapshot.docs.slice(0, 500).forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            totalDeleted += snapshot.docs.length;
            console.log(`🗑️ Deletados ${snapshot.docs.length} docs...`);
        }

        console.log(`✅ Histórico de ${userId} limpo. Total: ${totalDeleted} itens deletados.`);
    } catch (error) {
        console.error("❌ Erro ao limpar histórico:", error);
        throw new Error("Não foi possível limpar o histórico");
    }
}


    /**
     * Deleta uma entrada específica do histórico
     * @param entryId - ID da entrada no histórico
     */
    async deleteHistoryEntry(entryId: string): Promise<void> {
        if (!entryId) {
            throw new Error('entryId é obrigatório');
        }

        try {
            const docRef = doc(db, this.collectionName, entryId);
            await deleteDoc(docRef);
            console.log('✅ Entrada removida do histórico');
        } catch (error) {
            console.error('❌ Erro ao deletar entrada:', error);
            throw new Error('Não foi possível deletar a entrada');
        }
    }

    /**
     * Gera um ID único para o produto baseado no nome
     * Remove espaços e caracteres especiais, converte para lowercase
     * @param product - Produto
     * @returns ID do produto
     */
    private generateProductId(product: Product): string {
        return product.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9]/g, '_'); // Substitui caracteres especiais por _
    }

    /**
     * Verifica se um produto já foi pesquisado recentemente (últimas 24h)
     * Útil para evitar duplicatas muito próximas
     * @param userId - ID do usuário
     * @param productName - Nome do produto
     * @returns Promise<boolean> - true se já foi pesquisado recentemente
     */
    async isRecentlySearched(userId: string, productName: string): Promise<boolean> {
        try {
            const oneDayAgo = new Date();
            oneDayAgo.setHours(oneDayAgo.getHours() - 24);

            const historyCollection = collection(db, this.collectionName);
            const q = query(
                historyCollection,
                where('userId', '==', userId),
                where('name', '==', productName),
                where('timestamp', '>', Timestamp.fromDate(oneDayAgo)),
                firestoreLimit(1)
            );

            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('❌ Erro ao verificar pesquisa recente:', error);
            return false; // Em caso de erro, permite adicionar
        }
    }
}

// Exporta uma instância única (Singleton)
export const productHistoryService = new ProductHistoryService();