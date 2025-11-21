import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {shoppingListService} from '../models/ShoppingListService';
import {shoppingListDetailService} from '../models/ShoppingListDetailService';
import '../styles/AddProductToShoppingListModal.css';

type Props = {
  open: boolean;
  onClose: () => void;
  product: any | null;
};

export default function AddProductToShoppingListModal({ open, onClose, product }: Props) {
  const { currentUser: user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  async function loadLists() {
    if (!user) return;
    try {
      setError(null);
      const l: any[] = await shoppingListService.getUserLists(user.uid);
      if (!mountedRef.current) return;
      setLists(l || []);
      if ((l || []).length > 0) {
        const ids = (l || []).map(x => x.id ?? x.listId ?? '');
        if (!selectedListId || !ids.includes(selectedListId)) {
          setSelectedListId(ids[0] || null);
        }
      } else {
        setSelectedListId(null);
      }
    } catch (e) {
      console.error('Failed to load lists', e);
      if (mountedRef.current) setError('Failed to load lists');
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!open || !user) return;
    loadLists();
  }, [open, user]);

  useEffect(() => {
    setSuccess(null);
    setError(null);
  }, [product, open]);

  if (!open || !product) return null;

  async function handleAdd() {
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    if (!selectedListId) {
      setError('Choose a shopping list first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await shoppingListDetailService.addItem(selectedListId, user.uid, product.name);
      setSuccess('Produto adicionado.');
      await loadLists();
    } catch (e) {
      console.error('Failed to add product to list', e);
      setError('Falha ao adicionar o produto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="inline-panel" aria-hidden={!open}>
      <div className="inline-panel-card">
        <div className="inline-panel-header">
          <h3 className="inline-panel-title">Adicionar produto à lista</h3>
        </div>

        <div className="inline-panel-body">
          <div className="inline-panel-right">
            <label className="field-label" htmlFor="list-select">Escolha a lista</label>

            {lists.length === 0 ? (
              <div className="muted">Nenhuma lista encontrada.</div>
            ) : (
              <select
                id="list-select"
                className="list-select"
                value={selectedListId ?? ''}
                onChange={(e) => setSelectedListId(e.target.value || null)}
              >
                {lists.map((l) => {
                  const id = l.id ?? l.listId ?? '';
                  return (
                    <option key={id} value={id}>
                      {l.name ?? l.title ?? 'Lista sem nome'} — {(l.items?.length ?? 0)} items
                    </option>
                  );
                })}
              </select>
            )}

            <div className="inline-panel-actions">
              <button className="btn btn-primary" onClick={handleAdd} disabled={loading || !selectedListId}>
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            </div>

            {success && <div className="toast toast-success">{success}</div>}
            {error && <div className="toast toast-error">{error}</div>}
          </div>
        </div>
      </div>
    </aside>
  );
}