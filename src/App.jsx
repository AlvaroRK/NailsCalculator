import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas'; 
import './App.css';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const INITIAL_CATEGORIES = [
  {
    id: 'cat_1', name: 'Servicios Base',
    options: [
      {
        id: 'opt_base', name: 'Servicio Principal', type: 'button-group', price: 0,
        choices: [
          { id: 'c_semi', name: 'Semi', price: 7000 },
          { id: 'c_kapp', name: 'Kapping', price: 9000 },
          { id: 'c_soft', name: 'Soft Gel', price: 12000 }
        ]
      }
    ]
  },
  {
    id: 'cat_2', name: 'Retiros',
    options: [
      {
        id: 'opt_retiro', name: 'Servicio de Retiro', type: 'dropdown', price: 0,
        choices: [
          { id: 'r_nada', name: 'Ninguno', price: 0 },
          { id: 'r_mio', name: 'De mi trabajo', price: 0 },
          { id: 'r_otro', name: 'De otro salón', price: 2500 }
        ]
      },
      { id: 'opt_rota', name: 'Uñas Rotas (Reparación)', type: 'counter', price: 800, choices: [] }
    ]
  },
  {
    id: 'cat_3', name: 'Efectos (por uña)',
    options: [
      { id: 'e_gato', name: 'Ojo de Gato', type: 'counter', price: 300, choices: [] },
      { id: 'e_polvo', name: 'Polvos (Chroma, Aurora)', type: 'counter', price: 400, choices: [] },
      { id: 'e_hada', name: 'Polvo de Hada', type: 'counter', price: 400, choices: [] },
      { id: 'e_3d', name: 'Encapsulados / Gel 3D', type: 'counter', price: 600, choices: [] }
    ]
  },
  {
    id: 'cat_4', name: 'Deco (unidad)',
    options: [
      { id: 'd_sc', name: 'Strass Chico', type: 'counter', price: 50, choices: [] },
      { id: 'd_sm', name: 'Strass Mediano', type: 'counter', price: 100, choices: [] },
      { id: 'd_sg', name: 'Strass Grande', type: 'counter', price: 150, choices: [] },
      { id: 'd_cc', name: 'Charm Chico', type: 'counter', price: 500, choices: [] },
      { id: 'd_cm', name: 'Charm Mediano', type: 'counter', price: 800, choices: [] },
      { id: 'd_cg', name: 'Charm Grande', type: 'counter', price: 1200, choices: [] }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('nail_custom_cats_v2');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [customState, setCustomState] = useState({
    opt_base: 'c_semi', 
    opt_retiro: 'r_nada'
  });

  const [total, setTotal] = useState(0);
  const [resumenList, setResumenList] = useState([]); 

  useEffect(() => {
    localStorage.setItem('nail_custom_cats_v2', JSON.stringify(customCategories));
  }, [customCategories]);

  // --- CRUD FUNCTIONS ---
  const handleAddCustomCategory = () => {
    const name = prompt('Nombre de la nueva categoría:');
    if (name && name.trim() !== '') {
      setCustomCategories([...customCategories, { id: generateId(), name, options: [] }]);
    }
  };

  const handleRenameCustomCategory = (id, oldName) => {
    const newName = prompt('Nuevo nombre:', oldName);
    if (newName && newName.trim() !== '' && newName !== oldName) {
      setCustomCategories(customCategories.map(cat => cat.id === id ? { ...cat, name: newName } : cat));
    }
  };

  const handleDeleteCustomCategory = (id) => {
    if (window.confirm('¿Seguro que querés eliminar esta categoría entera?')) {
      setCustomCategories(customCategories.filter(c => c.id !== id));
    }
  };

  const [activeOptionForm, setActiveOptionForm] = useState(null); 
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [optionForm, setOptionForm] = useState({ name: '', type: 'counter', price: '', choices: [] });
  const [choiceForm, setChoiceForm] = useState({ name: '', price: '' });

  const addChoiceToOption = () => {
    if (!choiceForm.name || choiceForm.price === '') return;
    setOptionForm(prev => ({
      ...prev, choices: [...prev.choices, { id: generateId(), name: choiceForm.name, price: Number(choiceForm.price) }]
    }));
    setChoiceForm({ name: '', price: '' });
  };

  const saveOptionToCategory = (catId) => {
    if (!optionForm.name) return alert('Ingresá el nombre.');
    if (['counter', 'checkbox'].includes(optionForm.type) && optionForm.price === '') return alert('Ingresá el precio.');
    if (['dropdown', 'button-group'].includes(optionForm.type) && optionForm.choices.length === 0) return alert('Agregá al menos un ítem.');

    const newOption = {
      id: editingOptionId || generateId(),
      name: optionForm.name,
      type: optionForm.type,
      price: Number(optionForm.price) || 0,
      choices: optionForm.choices
    };

    setCustomCategories(customCategories.map(cat => {
      if (cat.id === catId) {
        if (editingOptionId) return { ...cat, options: cat.options.map(o => o.id === editingOptionId ? newOption : o) };
        return { ...cat, options: [...cat.options, newOption] };
      }
      return cat;
    }));
    setActiveOptionForm(null);
    setEditingOptionId(null);
  };

  const deleteCustomOption = (catId, optId) => {
    if (window.confirm('¿Eliminar esta opción?')) {
      setCustomCategories(customCategories.map(cat => {
        if (cat.id === catId) return { ...cat, options: cat.options.filter(o => o.id !== optId) };
        return cat;
      }));
    }
  };

  // --- MANEJADORES DE ESTADO DEL COTIZADOR ---
  const handleCustomChange = (id, value, type) => {
    setCustomState(prev => ({ ...prev, [id]: type === 'checkbox' ? !prev[id] : value }));
  };

  const handleCustomCounter = (id, change) => {
    setCustomState(prev => {
      const current = prev[id] || 0;
      const next = current + change;
      if (next < 0) return prev;
      return { ...prev, [id]: next };
    });
  };

  // --- CÁLCULO Y ARMADO DE RESUMEN ---
  useEffect(() => {
    let nuevoTotal = 0;
    const detalles = [];

    const addDetalle = (nombre, cantidad, precioUnitario) => {
      const subtotal = cantidad * precioUnitario;
      if (cantidad > 0 || subtotal > 0 || (cantidad > 0 && precioUnitario === 0)) {
         detalles.push({ nombre, cantidad, subtotal });
         nuevoTotal += subtotal;
      }
    };

    customCategories.forEach(cat => {
      cat.options.forEach(opt => {
        const val = customState[opt.id];

        if (opt.type === 'checkbox' && val) {
          addDetalle(opt.name, 1, opt.price);
        } 
        else if (opt.type === 'counter' && val > 0) {
          addDetalle(opt.name, val, opt.price);
        } 
        else if (['dropdown', 'button-group'].includes(opt.type) && val) {
          const selectedChoice = opt.choices.find(c => c.id === val);
          if (selectedChoice) {
             if (!(selectedChoice.price === 0 && selectedChoice.name.toLowerCase() === 'ninguno')) {
               addDetalle(`${opt.name}: ${selectedChoice.name}`, 1, selectedChoice.price);
             }
          }
        }
      });
    });

    setResumenList(detalles);
    setTotal(nuevoTotal);
  }, [customState, customCategories]); 

  const formatoMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(monto);

  // --- EXPORTAR A IMAGEN ---
  const descargarTicketComoImagen = async () => {
    const ticketElement = document.getElementById('ticket-a-descargar');
    
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, {
        backgroundColor: '#1e1e1e', 
        scale: 2,
        useCORS: true // Esto ayuda a que el logo se renderice bien si hay temas de permisos
      });
      
      const imagenDataUrl = canvas.toDataURL('image/png');
      
      const a = document.createElement('a');
      a.href = imagenDataUrl;
      a.download = `Ticket-AluciNails-${Date.now()}.png`;
      a.click();
      
    } catch (error) {
      console.error("Error al generar la imagen", error);
      alert("Hubo un error al crear la imagen del ticket.");
    }
  };


  return (
    <div className="app-wrapper">
      
      {/* VISTA 1: CALCULADORA */}
      {activeTab === 'calculator' && (
        <div className="calculator" style={{marginBottom: '70px'}}>
          <h2>Cotizador de Servicios</h2>

          {customCategories.length === 0 && <p className="text-muted" style={{textAlign:'center'}}>No hay categorías. Creá una en Precios.</p>}

          {customCategories.map(cat => (
            <div className="section" key={cat.id}>
              <div className="section-title">{cat.name}</div>
              
              {cat.options.map(opt => (
                <div className={opt.type === 'button-group' ? "" : "form-row"} key={opt.id}>
                  {opt.type !== 'button-group' && (
                    <div className="label-col"><span className="label-title">{opt.name}</span></div>
                  )}

                  <div className={opt.type === 'button-group' ? "service-options" : "input-col"} style={opt.type === 'dropdown' ? {width: '170px'} : {}}>
                    
                    {opt.type === 'counter' && (
                      <div className="counter-controls">
                        <button type="button" onClick={() => handleCustomCounter(opt.id, -1)}>-</button>
                        <span>{customState[opt.id] || 0}</span>
                        <button type="button" onClick={() => handleCustomCounter(opt.id, 1)}>+</button>
                      </div>
                    )}

                    {opt.type === 'checkbox' && (
                      <div style={{textAlign: 'right'}}>
                        <input type="checkbox" checked={!!customState[opt.id]} onChange={() => handleCustomChange(opt.id, null, 'checkbox')} />
                      </div>
                    )}

                    {opt.type === 'dropdown' && (
                      <select value={customState[opt.id] || ''} onChange={(e) => handleCustomChange(opt.id, e.target.value, 'dropdown')}>
                        <option value="">Seleccionar...</option>
                        {opt.choices.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}

                    {opt.type === 'button-group' && opt.choices.map(c => (
                      <button 
                        key={c.id} type="button" 
                        className={`service-btn ${customState[opt.id] === c.id ? 'active' : ''}`} 
                        onClick={() => handleCustomChange(opt.id, c.id, 'button-group')}
                      >
                        {c.name}
                      </button>
                    ))}

                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* CAJA DEL TICKET ENCAPSULADA PARA LA FOTO */}
          <div id="ticket-a-descargar" style={{padding: '10px'}}>
            <div className="resumen-container">
              
              {/* ACÁ ESTÁ EL LOGO DE ALUCINAILS */}
              {/* Si tu archivo tiene extensión, cambialo por src="/nails.png" o src="/nails.jpg" */}
              <img src="/nails.png" alt="Logo AluciNails" className="ticket-logo" />

              <div className="resumen-title">Detalle del Servicio</div>
              {resumenList.length === 0 ? (
                <div className="resumen-empty">Seleccioná opciones para ver el desglose.</div>
              ) : (
                resumenList.map((item, idx) => (
                  <div className="resumen-item" key={idx}>
                    <span>{item.cantidad > 1 ? `${item.cantidad}x ` : ''}{item.nombre}</span>
                    <strong>{item.subtotal === 0 ? 'Incluido' : formatoMoneda(item.subtotal)}</strong>
                  </div>
                ))
              )}
              
              <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85em', fontWeight: 'bold'}}>Total</span>
                <span style={{color: 'var(--success)', fontSize: '1.5em', fontWeight: 'bold'}}>{formatoMoneda(total)}</span>
              </div>

              <div style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '500'}}>
                ¡Gracias por elegir AluciNails!
              </div>
            </div>
          </div>

          {/* BOTÓN ÚNICO DE EXPORTACIÓN */}
          <div className="export-actions">
            <button className="btn-image" style={{width: '100%'}} onClick={descargarTicketComoImagen}>
              🖼️ Guardar Ticket
            </button>
          </div>

        </div>
      )}

      {/* VISTA 2: CRUD UNIFICADO */}
      {activeTab === 'settings' && (
        <div className="calculator" style={{marginBottom: '70px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={{margin: 0, border: 'none', padding: 0}}>Gestión de Precios</h2>
            <button className="mini-btn" onClick={handleAddCustomCategory}>+ Categoría</button>
          </div>
          <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px'}}>
            Todo el cotizador se construye desde acá.
          </p>

          {customCategories.map(cat => (
            <div className="custom-category-card" key={cat.id}>
              <div className="custom-cat-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <strong>{cat.name}</strong>
                  <button className="mini-btn" onClick={() => handleRenameCustomCategory(cat.id, cat.name)}>✏️</button>
                </div>
                <div>
                  <button className="mini-btn danger" style={{marginRight: '5px'}} onClick={() => handleDeleteCustomCategory(cat.id)}>🗑️</button>
                  <button className="mini-btn" onClick={() => {
                    setActiveOptionForm(cat.id);
                    setEditingOptionId(null);
                    setOptionForm({ name: '', type: 'counter', price: '', choices: [] });
                  }}>+ Opción</button>
                </div>
              </div>

              {cat.options.map(opt => (
                <div className="form-row" style={{borderBottom: 'none'}} key={opt.id}>
                  <div className="label-col" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span className="label-title" style={{fontSize: '0.9em'}}>
                      {opt.name} <span style={{color: 'var(--text-muted)'}}>({opt.type})</span>
                    </span>
                    <button className="mini-btn" onClick={() => {
                      setActiveOptionForm(cat.id);
                      setEditingOptionId(opt.id);
                      setOptionForm({ name: opt.name, type: opt.type, price: opt.price || '', choices: opt.choices || [] });
                    }}>✏️</button>
                  </div>
                  <div className="input-col" style={{textAlign: 'right'}}>
                    <button className="mini-btn danger" onClick={() => deleteCustomOption(cat.id, opt.id)}>✖</button>
                  </div>
                </div>
              ))}

              {activeOptionForm === cat.id && (
                <div className="option-builder">
                  <span style={{fontSize: '0.9em', color: 'var(--accent)', fontWeight: 'bold', display: 'block', marginBottom: '10px'}}>
                    {editingOptionId ? 'Editando Opción' : 'Nueva Opción'}
                  </span>
                  <input type="text" placeholder="Nombre (Ej: Ojo de Gato)" value={optionForm.name} onChange={e => setOptionForm({...optionForm, name: e.target.value})} />
                  
                  <select value={optionForm.type} onChange={e => setOptionForm({...optionForm, type: e.target.value})}>
                    <option value="counter">Contador (- / +)</option>
                    <option value="checkbox">Casilla (Checkbox)</option>
                    <option value="dropdown">Desplegable</option>
                    <option value="button-group">Botones Seleccionables</option>
                  </select>

                  {['counter', 'checkbox'].includes(optionForm.type) && (
                    <input type="number" placeholder="Precio ($)" value={optionForm.price} onChange={e => setOptionForm({...optionForm, price: e.target.value})} />
                  )}

                  {['dropdown', 'button-group'].includes(optionForm.type) && (
                    <div className="choices-list">
                      <span style={{fontSize: '0.85em', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Elementos:</span>
                      {optionForm.choices.map((c, idx) => (
                        <div className="choice-item" key={c.id}>
                          <span>{c.name} - ${c.price}</span>
                          <button className="mini-btn danger" onClick={() => {
                            const newChoices = [...optionForm.choices];
                            newChoices.splice(idx, 1);
                            setOptionForm({...optionForm, choices: newChoices});
                          }}>✖</button>
                        </div>
                      ))}
                      
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}>
                        <span style={{fontSize: '0.8em', color: 'var(--text-muted)'}}>Agregar nuevo elemento:</span>
                        <input type="text" placeholder="Nombre del elemento" value={choiceForm.name} onChange={e => setChoiceForm({...choiceForm, name: e.target.value})} style={{width: '100%', margin: 0}} />
                        <input type="number" placeholder="Precio ($)" value={choiceForm.price} onChange={e => setChoiceForm({...choiceForm, price: e.target.value})} style={{width: '100%', margin: 0}} />
                        <button className="mini-btn" style={{padding: '10px', width: '100%', fontWeight: 'bold'}} onClick={addChoiceToOption}>+ Añadir Elemento</button>
                      </div>
                    </div>
                  )}

                  <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                    <button className="add-btn" style={{background: 'var(--section-bg)'}} onClick={() => { setActiveOptionForm(null); setEditingOptionId(null); }}>Cancelar</button>
                    <button className="add-btn" onClick={() => saveOptionToCategory(cat.id)}>{editingOptionId ? 'Actualizar' : 'Guardar'}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <nav className="bottom-nav">
        <button className={activeTab === 'calculator' ? 'active' : ''} onClick={() => setActiveTab('calculator')}>💰 Cotizador</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>⚙️ Precios</button>
      </nav>
    </div>
  );
}