import { useState, useEffect } from 'react';
import './App.css';

const PRODUCT_YIELDS = {
  esmalte: { name: 'Esmalte / Color (40 usos)', uses: 40 },
  base: { name: 'Base / Top Coat (50 usos)', uses: 50 },
  unico: { name: 'Uso Único / Descartable', uses: 1 }
};

const POPULAR_BRANDS = [
  "Cherimoya",
  "Meliné",
  "Paris Night",
  "Las Varano",
  "Pink Mask"
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory'); 

  // --- ESTADOS DE INVENTARIO (CON CATEGORÍAS POR DEFECTO) ---
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('nail_inventory');
    
    const defaultInventory = { 
      "Decoración": [],
      "Descartables": []
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Si hay datos guardados, pero el inventario está vacío, forzamos las categorías por defecto.
      if (Object.keys(parsed).length === 0) {
        return defaultInventory;
      }
      return parsed;
    }
    
    return defaultInventory;
  });

  const [addingToCategory, setAddingToCategory] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  const [itemForm, setItemForm] = useState({
    brand: POPULAR_BRANDS[0], 
    color: '', 
    ml: '10', 
    price: '', 
    type: 'esmalte'
  });

  const [inventorySearch, setInventorySearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // --- ESTADOS DE CALCULADORA ---
  const [fixedCost, setFixedCost] = useState(() => localStorage.getItem('nail_fixed') || '');
  const [hourlyRate, setHourlyRate] = useState(() => localStorage.getItem('nail_rate') || '');
  const [profitMargin, setProfitMargin] = useState(() => localStorage.getItem('nail_margin') || '30');
  
  const [hoursSpent, setHoursSpent] = useState('1.5');
  const [selectedItems, setSelectedItems] = useState({}); 
  const [searchQuery, setSearchQuery] = useState('');

  // Guardado automático
  useEffect(() => {
    localStorage.setItem('nail_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('nail_fixed', fixedCost);
    localStorage.setItem('nail_rate', hourlyRate);
    localStorage.setItem('nail_margin', profitMargin);
  }, [fixedCost, hourlyRate, profitMargin]);

  // --- FUNCIONES DE DESPLEGABLES ---
  const toggleCategory = (catName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // --- CRUD DE CATEGORÍAS ---
  const addCategory = () => {
    const catName = prompt('Nombre de la nueva categoría (Ej: Líquidos Preparadores):');
    if (catName && !inventory[catName]) setInventory({ ...inventory, [catName]: [] });
  };

  const renameCategory = (oldName) => {
    const newName = prompt('Nuevo nombre:', oldName);
    if (newName && newName !== oldName && !inventory[newName]) {
      const newInventory = { ...inventory };
      newInventory[newName] = newInventory[oldName];
      delete newInventory[oldName];
      setInventory(newInventory);
      if (addingToCategory === oldName) setAddingToCategory(newName);
      
      if (collapsedCategories[oldName]) {
        setCollapsedCategories(prev => {
          const newCol = { ...prev };
          newCol[newName] = true;
          delete newCol[oldName];
          return newCol;
        });
      }
    }
  };

  const deleteCategory = (catName) => {
    if (window.confirm(`¿Eliminar la categoría "${catName}"?`)) {
      const itemsToDelete = inventory[catName].map(item => item.id);
      
      setSelectedItems(prev => {
        const newSel = { ...prev };
        itemsToDelete.forEach(id => delete newSel[id]);
        return newSel;
      });

      const newInventory = { ...inventory };
      delete newInventory[catName];
      setInventory(newInventory);
      if (addingToCategory === catName) setAddingToCategory(null);
    }
  };

  // --- CRUD DE PRODUCTOS ---
  const editItem = (category, item) => {
    setAddingToCategory(category);
    setEditingItemId(item.id);
    setIsCustomBrand(!POPULAR_BRANDS.includes(item.brand));
    setItemForm({ 
      brand: item.brand, 
      color: item.color, 
      ml: item.ml || (item.type === 'unico' ? '' : '10'), 
      price: item.price, 
      type: item.type || 'esmalte' 
    });
    if (collapsedCategories[category]) toggleCategory(category);
  };

  const handleSaveItem = () => {
    if (!itemForm.brand || !itemForm.color || !itemForm.price) {
      alert("Completá Marca, Color y Precio.");
      return;
    }

    const priceString = String(itemForm.price).replace(',', '.');
    const totalPrice = Number(priceString);

    if (isNaN(totalPrice)) {
      alert("El precio debe ser un número.");
      return;
    }

    const uses = PRODUCT_YIELDS[itemForm.type].uses;
    let costPerUse = totalPrice / uses;
    
    if (itemForm.type === 'unico' && itemForm.ml) {
      const totalUnits = Number(String(itemForm.ml).replace(',', '.'));
      if (!isNaN(totalUnits) && totalUnits > 0) {
        costPerUse = totalPrice / totalUnits;
      }
    }

    const savedItem = { 
      id: editingItemId || generateId(),
      brand: itemForm.brand, 
      color: itemForm.color,
      ml: itemForm.ml, 
      price: totalPrice, 
      type: itemForm.type, 
      costPerUse
    };

    if (editingItemId) {
      setInventory({
        ...inventory,
        [addingToCategory]: inventory[addingToCategory].map(item => item.id === editingItemId ? savedItem : item)
      });
    } else {
      setInventory({ 
        ...inventory, 
        [addingToCategory]: [...inventory[addingToCategory], savedItem] 
      });
    }

    setAddingToCategory(null);
    setEditingItemId(null);
    setIsCustomBrand(false);
    setItemForm({ brand: POPULAR_BRANDS[0], color: '', ml: '10', price: '', type: 'esmalte' });
  };

  const deleteItem = (category, itemId) => {
    if (window.confirm('¿Eliminar este insumo?')) {
      setInventory({ ...inventory, [category]: inventory[category].filter(item => item.id !== itemId) });
      setSelectedItems(prev => {
        const newSel = { ...prev };
        delete newSel[itemId];
        return newSel;
      });
    }
  };

  // --- FUNCIONES DE CALCULADORA Y CONTADOR ---
  const toggleSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (newSelected[itemId]) {
        delete newSelected[itemId]; 
      } else {
        newSelected[itemId] = 1; 
      }
      return newSelected;
    });
  };

  const updateQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      const currentQty = prev[itemId] || 1;
      const newQty = currentQty + change;
      if (newQty < 1) return prev; 
      return { ...prev, [itemId]: newQty };
    });
  };

  const calculateMaterials = () => {
    let total = 0;
    Object.values(inventory).forEach(items => {
      items.forEach(item => { 
        if (selectedItems[item.id]) {
          total += item.costPerUse * selectedItems[item.id]; 
        }
      });
    });
    return total;
  };

  const materialCost = calculateMaterials();
  const fixed = Number(fixedCost) || 0;
  const rate = Number(hourlyRate) || 0;
  const hours = Number(hoursSpent) || 0;
  const margin = Number(profitMargin) || 0;

  const laborCost = rate * hours;
  const subtotal = materialCost + fixed + laborCost;
  const profitAmount = subtotal * (margin / 100);
  const finalPrice = subtotal + profitAmount;

  // --- FILTRO DEL BUSCADOR DE CALCULADORA ---
  const filteredCalculator = Object.entries(inventory).map(([category, items]) => {
    const matchedItems = items.filter(item => 
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.color.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return [category, matchedItems];
  }).filter(([category, items]) => items.length > 0);

  // --- FILTRO DEL BUSCADOR DE INVENTARIO ---
  const filteredInventoryList = Object.entries(inventory).map(([category, items]) => {
    const searchLow = inventorySearch.toLowerCase();
    const catMatches = category.toLowerCase().includes(searchLow);
    const matchedItems = catMatches ? items : items.filter(item => 
      item.brand.toLowerCase().includes(searchLow) || 
      item.color.toLowerCase().includes(searchLow)
    );
    return [category, matchedItems];
  }).filter(([category, items]) => {
    // NUEVA REGLA: Si el buscador está vacío, mostramos TODAS las categorías siempre.
    if (inventorySearch.trim() === '') return true;
    
    // Si está escribiendo algo, ocultamos las que quedan vacías.
    return category.toLowerCase().includes(inventorySearch.toLowerCase()) || items.length > 0;
  });

  return (
    <div className="app-wrapper">
      <div className="main-content">
        
        {/* --- PESTAÑA INVENTARIO --- */}
        {activeTab === 'inventory' && (
          <div className="view-container">
            <h2>Gestión de Insumos</h2>

            <input 
              type="text" 
              placeholder="🔍 Buscar categoría, marca o color..." 
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="search-input"
              style={{ marginBottom: '1.5rem' }}
            />

            <button className="add-cat-btn" onClick={addCategory}>+ Nueva Categoría</button>

            <div className="inventory-list">
              {filteredInventoryList.length === 0 && (
                <p className="empty-text" style={{textAlign: 'center'}}>No se encontraron resultados.</p>
              )}
              {filteredInventoryList.map(([category, items]) => (
                <div key={category} className="inventory-category">
                  <div className="cat-header">
                    <div className="cat-title-actions">
                      <button className="icon-btn collapse-btn" onClick={() => toggleCategory(category)}>
                        {collapsedCategories[category] ? '▶️' : '▼'}
                      </button>
                      <h3 onClick={() => toggleCategory(category)} style={{cursor: 'pointer'}}>{category}</h3>
                      <button className="icon-btn" onClick={() => renameCategory(category)}>✏️</button>
                      <button className="icon-btn delete" onClick={() => deleteCategory(category)}>🗑️</button>
                    </div>
                    <button className="add-item-btn" onClick={() => {
                      setAddingToCategory(category);
                      setEditingItemId(null);
                      setIsCustomBrand(false);
                      setItemForm({ brand: POPULAR_BRANDS[0], color: '', ml: '10', price: '', type: 'esmalte' });
                      if (collapsedCategories[category]) toggleCategory(category);
                    }}>+ Insumo</button>
                  </div>
                  
                  {!collapsedCategories[category] && (
                    <>
                      {addingToCategory === category && (
                        <div className="mobile-form-card">
                          <h4>{editingItemId ? 'Editar Insumo' : `Nuevo en ${category}`}</h4>
                          <div className="form-grid">
                            {!isCustomBrand ? (
                              <select 
                                value={POPULAR_BRANDS.includes(itemForm.brand) ? itemForm.brand : 'otra'} 
                                onChange={e => {
                                  if (e.target.value === 'otra') {
                                    setIsCustomBrand(true);
                                    setItemForm({...itemForm, brand: ''});
                                  } else {
                                    setItemForm({...itemForm, brand: e.target.value});
                                  }
                                }}
                              >
                                {POPULAR_BRANDS.map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                                <option value="otra">+ Escribir otra marca...</option>
                              </select>
                            ) : (
                              <div style={{display: 'flex', gap: '0.5rem'}}>
                                <input 
                                  type="text" 
                                  placeholder="Escribí la marca" 
                                  value={itemForm.brand} 
                                  onChange={e => setItemForm({...itemForm, brand: e.target.value})} 
                                  autoFocus
                                />
                                <button 
                                  type="button" 
                                  className="cancel-btn" 
                                  style={{padding: '0 0.8rem', width: 'auto'}}
                                  onClick={() => {
                                    setIsCustomBrand(false);
                                    setItemForm({...itemForm, brand: POPULAR_BRANDS[0]});
                                  }}
                                >
                                  Volver
                                </button>
                              </div>
                            )}

                            <input type="text" placeholder="Color / Nombre del insumo" value={itemForm.color} onChange={e => setItemForm({...itemForm, color: e.target.value})} />
                            
                            <select 
                              value={itemForm.type} 
                              onChange={e => {
                                const newType = e.target.value;
                                setItemForm({
                                  ...itemForm, 
                                  type: newType, 
                                  ml: newType === 'unico' ? '' : '10'
                                });
                              }}
                            >
                              {Object.entries(PRODUCT_YIELDS).map(([key, data]) => (<option key={key} value={key}>{data.name}</option>))}
                            </select>

                            <input 
                              type="text" 
                              inputMode="decimal" 
                              placeholder={itemForm.type === 'unico' ? "Unidades Totales (Ej: 100)" : "Mililitros (ML)"} 
                              value={itemForm.ml} 
                              onChange={e => setItemForm({...itemForm, ml: e.target.value})} 
                            />
                            
                            <input type="text" inputMode="decimal" placeholder="Precio Total ($)" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} />
                            
                          </div>
                          <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => {
                              setAddingToCategory(null);
                              setIsCustomBrand(false);
                              setItemForm({ brand: POPULAR_BRANDS[0], color: '', ml: '10', price: '', type: 'esmalte' });
                            }}>Cancelar</button>
                            <button type="button" className="save-btn" onClick={handleSaveItem}>Guardar</button>
                          </div>
                        </div>
                      )}

                      <div className="items-grid">
                        {items.length === 0 && !addingToCategory && <p className="empty-text">Vacío.</p>}
                        {items.map(item => (
                          <div key={item.id} className="item-card">
                            <div className="item-info">
                              <span className="item-name">{item.brand} - {item.color}</span>
                              <span className="item-price">
                                {item.type === 'unico' ? `Caja: $${item.price}` : `Frasco: $${item.price}`} | <strong>Uso: ${item.costPerUse.toFixed(2)}</strong>
                              </span>
                            </div>
                            <div className="item-actions">
                              <button className="icon-btn" onClick={() => editItem(category, item)}>✏️</button>
                              <button className="icon-btn delete" onClick={() => deleteItem(category, item.id)}>✖</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PESTAÑA CALCULADORA --- */}
        {activeTab === 'calculator' && (
          <div className="view-container">
            <h2>Presupuesto</h2>
            <div className="inputs-section">
              
              <div className="input-group">
                <label>Materiales a Usar</label>
                
                <input 
                  type="text" 
                  placeholder="🔍 Buscar marca o insumo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />

                <div className="materials-selector">
                  {filteredCalculator.length === 0 ? (
                    <p className="empty-text">No se encontraron insumos.</p>
                  ) : (
                    filteredCalculator.map(([category, items]) => (
                      <div key={category} className="cat-group">
                        <div className="calc-cat-header" onClick={() => toggleCategory(category)}>
                          <strong>{category}</strong>
                          <span style={{fontSize: '0.8rem', opacity: 0.7}}>
                            {collapsedCategories[category] ? '▶️' : '▼'}
                          </span>
                        </div>
                        
                        {!collapsedCategories[category] && items.map(item => (
                          <div key={item.id} className="checkbox-label">
                            <div className="checkbox-main">
                              <input 
                                type="checkbox" 
                                checked={!!selectedItems[item.id]} 
                                onChange={() => toggleSelection(item.id)} 
                              />
                              <div className="item-text-group">
                                <span className="item-text">{item.brand} - {item.color}</span>
                                <span className="tiny-cost">
                                  (+${(item.costPerUse * (selectedItems[item.id] || 1)).toFixed(2)})
                                </span>
                              </div>
                            </div>

                            {!!selectedItems[item.id] && item.type === 'unico' && (
                              <div className="counter-controls">
                                <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                                <span>{selectedItems[item.id]} un.</span>
                                <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="input-group"><label>Desgaste ($)</label><input type="text" inputMode="decimal" value={fixedCost} onChange={(e) => setFixedCost(e.target.value)} /></div>
              <div className="input-group"><label>Valor Hora ($)</label><input type="text" inputMode="decimal" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} /></div>
              <div className="input-group"><label>Horas Turno</label><input type="text" inputMode="decimal" value={hoursSpent} onChange={(e) => setHoursSpent(e.target.value)} /></div>
              <div className="input-group"><label>Ganancia (%)</label><input type="text" inputMode="decimal" value={profitMargin} onChange={(e) => setProfitMargin(e.target.value)} /></div>
            </div>
            
            <div className="results-section">
              <h3>Resumen</h3>
              <div className="result-row"><span>Insumos y Desgaste:</span><span>${(materialCost + fixed).toFixed(2)}</span></div>
              <div className="result-row"><span>Mano de obra:</span><span>${laborCost.toFixed(2)}</span></div>
              <div className="result-row"><span>Costo Base:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="result-row"><span>Ganancia ({margin}%):</span><span>${profitAmount.toFixed(2)}</span></div>
              <hr />
              <div className="result-row final-price"><span>Total a Cobrar:</span><span>${finalPrice.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>📦 Inventario</button>
        <button className={activeTab === 'calculator' ? 'active' : ''} onClick={() => setActiveTab('calculator')}>💰 Calculadora</button>
      </nav>
    </div>
  );
}