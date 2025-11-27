import React, { useState, useEffect } from 'react';
import '../styles/checkitem.css';

interface CheckItemProps {
  id?: string;
  text: string;
  quantity?: string;
  isChecked?: boolean;
  onToggle?: (id: string, checked: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, text: string, quantity?: string) => void;
}

const CheckItem: React.FC<CheckItemProps> = ({ 
  id = '', 
  text, 
  quantity,
  isChecked = false, 
  onToggle,
  onDelete,
  onEdit 
}) => {
  const [checked, setChecked] = useState(isChecked);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editQuantity, setEditQuantity] = useState(quantity || '');

  // Sync local checked state with prop when it changes
  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit?.(id, editText.trim(), editQuantity.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(text);
    setEditQuantity(quantity || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className='checkitem editing'>
        <input 
          type="text" 
          className='edit-input'
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Nome do item"
          autoFocus
        />
        <input 
          type="text" 
          className='edit-quantity-input'
          value={editQuantity}
          onChange={(e) => setEditQuantity(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Qtd (ex: 2kg)"
        />
        <button 
          className='button-save'
          onClick={handleSave}
          title="Salvar"
        >
          ✓
        </button>
        <button 
          className='button-cancel'
          onClick={handleCancel}
          title="Cancelar"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className='checkitem'>
      <input 
        type="checkbox" 
        className='checkbox'
        checked={checked}
        onChange={() => {
          setChecked(!checked);
          onToggle?.(id, !checked);
        }}
      />
      <div className='item-content'>
        <span className='textitem' style={{ textDecoration: checked ? 'line-through' : 'none' }}>
          {text}
        </span>
        {quantity && (
          <span className='quantity-badge'>
            {quantity}
          </span>
        )}
      </div>
      <div className='item-actions'>
        <button 
          className='button-edit'
          onClick={() => setIsEditing(true)}
          title="Editar"
        >
          ✏️
        </button>
        <button 
          className='button-delete'
          onClick={() => onDelete?.(id)}
          title="Deletar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CheckItem;
