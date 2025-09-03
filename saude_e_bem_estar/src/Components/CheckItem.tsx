import React, { useState } from 'react';

interface CheckItemProps {
  id?: string;
  text: string;
  isChecked?: boolean;
  onToggle?: (id: string, checked: boolean) => void;
  onDelete?: (id: string) => void;
}

const CheckItem: React.FC<CheckItemProps> = ({ 
  id = '', 
  text, 
  isChecked = false, 
  onToggle,
  onDelete 
}) => {
  const [checked, setChecked] = useState(isChecked);

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: 'white', margin: '5px 0', borderRadius: '8px', border: '1px solid #ccc' }}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={() => {
          setChecked(!checked);
          onToggle?.(id, !checked);
        }}
      />
      <span style={{ marginLeft: '10px', textDecoration: checked ? 'line-through' : 'none' }}>
        {text}
      </span>
      <button 
        onClick={() => onDelete?.(id)}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        🗑️
      </button>
    </div>
  );
};

export default CheckItem;
