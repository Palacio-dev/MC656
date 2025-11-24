import { Product } from './product';
import { Timestamp } from "firebase/firestore";

export interface ProductHistoryEntry {
    id: string;
    userId: string;
    productId: string;
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    timestamp: Date | Timestamp; // ⬅ CORREÇÃO AQUI
}

/**
 * ProductHistoryQueryParams - Parâmetros para consultar histórico
 */
export interface ProductHistoryQueryParams {
    userId: string;
    limit?: number; // Limite de resultados (padrão: 20)
    orderBy?: 'asc' | 'desc'; // Ordenação por timestamp (padrão: 'desc')
}