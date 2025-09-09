import React, { useState } from 'react';
import '../Styles/checkitem.css';

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
      <span className='textitem' style={{ textDecoration: checked ? 'line-through' : 'none' }}>
        {text}
      </span>
      <button 
        className='buttonitem'
        onClick={() => onDelete?.(id)}
      >
        🗑️
      </button>
    </div>
  );
};

export default CheckItem;
