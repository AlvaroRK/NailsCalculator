import { useState, useEffect } from 'react';
import './App.css';

// PRECIOS POR DEFECTO
const DEFAULT_PRICES = {
  base_semi: 7000,
  base_kapping: 9000,
  base_softgel: 12000,
  largo_corto: 0,       
  largo_medio: 1500,    
  largo_largo: 3000,
  largo_extremo: 5000,
  retiro_mio: 0,         
  retiro_otro: 2500,     
  retiro_nutricion: 3500, 
  reparacion: 800,
  francesita: 2000, 
  alzada_1: 400, 
  alzada_2: 800,
  alzada_3: 1500,
  efecto_gato: 300,   
  efecto_polvo: 400,  
  efecto_polvo_hada: 400, 
  efecto_encapsulado: 600, 
  // PRECIOS SEPARADOS POR TAMAÑO
  strass_chico: 50,
  strass_mediano: 100,
  strass_grande: 150,
  charm_chico: 500,
  charm_mediano: 800,
  charm_grande: 1200
};

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  // --- ESTADO DE LOS PRECIOS (AHORA A PRUEBA DE ERRORES) ---
  const [precios, setPrecios] = useState(() => {
    const saved = localStorage.getItem('nail_prices');
    if (saved) {
      const parsed = JSON.parse(saved);
      // MAGIA ACÁ: Mezcla los precios que ella ya tenía guardados con las categorías nuevas que agregamos, evitando el NaN.
      return { ...DEFAULT_PRICES, ...parsed };
    }
    return DEFAULT_PRICES;
  });

  useEffect(() => {
    localStorage.setItem('nail_prices', JSON.stringify(precios));
  }, [precios]);

  const handlePriceChange = (e) => {
    const { id, value } = e.target;
    setPrecios(prev => ({
      ...prev,
      [id]: value === '' ? 0 : parseInt(value)
    }));
  };

  // --- ESTADO DEL COTIZADOR ---
  const [formState, setFormState] = useState({
    servicioBase: 'semi',
    largoSoftGel: 'corto',
    tipoRetiro: 'ninguno',
    unasRotas: 0,
    francesita: false,
    alzadaN1: 0,
    alzadaN2: 0,
    alzadaN3: 0,
    efectoGato: 0,
    efectoPolvo: 0,
    polvoHada: 0, 
    encapsulado: 0,
    strassChico: 0,
    strassMediano: 0,
    strassGrande: 0,
    charmChico: 0,
    charmMediano: 0,
    charmGrande: 0
  });

  const [total, setTotal] = useState(0);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const updateCounter = (id, change, max = 10) => {
    setFormState(prev => {
      const newValue = prev[id] + change;
      if (newValue < 0 || newValue > max) return prev;
      return { ...prev, [id]: newValue };
    });
  };

  // --- CÁLCULO AUTOMÁTICO ---
  useEffect(() => {
    let nuevoTotal = 0;

    // 1. Base y Largo
    if (formState.servicioBase === 'semi') nuevoTotal += (precios.base_semi || 0);
    if (formState.servicioBase === 'kapping') nuevoTotal += (precios.base_kapping || 0);
    if (formState.servicioBase === 'softgel') nuevoTotal += (precios.base_softgel || 0);

    if (formState.servicioBase === 'softgel') {
      if (formState.largoSoftGel === 'corto') nuevoTotal += (precios.largo_corto || 0);
      if (formState.largoSoftGel === 'medio') nuevoTotal += (precios.largo_medio || 0);
      if (formState.largoSoftGel === 'largo') nuevoTotal += (precios.largo_largo || 0);
      if (formState.largoSoftGel === 'extremo') nuevoTotal += (precios.largo_extremo || 0);
    }

    // 2. Retiros y Reparaciones
    if (formState.tipoRetiro === 'mio') nuevoTotal += (precios.retiro_mio || 0);
    if (formState.tipoRetiro === 'otro') nuevoTotal += (precios.retiro_otro || 0);
    if (formState.tipoRetiro === 'nutricion') nuevoTotal += (precios.retiro_nutricion || 0);
    
    nuevoTotal += (formState.unasRotas * (precios.reparacion || 0));

    // 3. Arte y Diseño
    if (formState.francesita) nuevoTotal += (precios.francesita || 0);
    nuevoTotal += (formState.alzadaN1 * (precios.alzada_1 || 0));
    nuevoTotal += (formState.alzadaN2 * (precios.alzada_2 || 0));
    nuevoTotal += (formState.alzadaN3 * (precios.alzada_3 || 0));

    // 4. Efectos 
    nuevoTotal += (formState.efectoGato * (precios.efecto_gato || 0));
    nuevoTotal += (formState.efectoPolvo * (precios.efecto_polvo || 0));
    nuevoTotal += (formState.polvoHada * (precios.efecto_polvo_hada || 0));
    nuevoTotal += (formState.encapsulado * (precios.efecto_encapsulado || 0));

    // 5. Apliques (Strass y Charms por tamaño)
    nuevoTotal += (formState.strassChico * (precios.strass_chico || 0));
    nuevoTotal += (formState.strassMediano * (precios.strass_mediano || 0));
    nuevoTotal += (formState.strassGrande * (precios.strass_grande || 0));
    
    nuevoTotal += (formState.charmChico * (precios.charm_chico || 0));
    nuevoTotal += (formState.charmMediano * (precios.charm_mediano || 0));
    nuevoTotal += (formState.charmGrande * (precios.charm_grande || 0));

    setTotal(nuevoTotal);
  }, [formState, precios]); 

  const formatoMoneda = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(total);

  return (
    <div className="app-wrapper">
      {/* VISTA 1: CALCULADORA */}
      {activeTab === 'calculator' && (
        <div className="calculator" style={{marginBottom: '70px'}}>
          <h2>Cotizador de Servicios</h2>

          {/* SERVICIO BASE */}
          <div className="section">
            <div className="section-title">1. Estructura y Base</div>
            
            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Servicio Principal</span>
              </div>
              <div className="input-col" style={{width: '150px'}}>
                <select id="servicioBase" value={formState.servicioBase} onChange={handleChange}>
                  <option value="semi">Semipermanente</option>
                  <option value="kapping">Kapping</option>
                  <option value="softgel">Soft Gel</option>
                </select>
              </div>
            </div>

            {formState.servicioBase === 'softgel' && (
              <div className="form-row">
                <div className="label-col">
                  <span className="label-title">Largo (Soft Gel)</span>
                </div>
                <div className="input-col" style={{width: '150px'}}>
                  <select id="largoSoftGel" value={formState.largoSoftGel} onChange={handleChange}>
                    <option value="corto">Cortas (1-2)</option>
                    <option value="medio">Medianas (3-4)</option>
                    <option value="largo">Largas (5-6)</option>
                    <option value="extremo">Extremas (7+)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* RETIROS Y TRATAMIENTOS */}
          <div className="section">
            <div className="section-title">2. Retiros y Tratamientos</div>
            
            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Servicio de Retiro</span>
              </div>
              <div className="input-col" style={{width: '170px'}}>
                <select id="tipoRetiro" value={formState.tipoRetiro} onChange={handleChange}>
                  <option value="ninguno">Ninguno</option>
                  <option value="mio">De mi trabajo</option>
                  <option value="otro">De otro salón</option>
                  <option value="nutricion">Solo retiro + nutrición</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Uñas Rotas (Reparación)</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('unasRotas', -1)}>-</button>
                  <span>{formState.unasRotas}</span>
                  <button type="button" onClick={() => updateCounter('unasRotas', 1)}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* ARTE Y DISEÑO */}
          <div className="section">
            <div className="section-title">3. Diseño y Mano Alzada</div>
            
            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Francesita (Set Completo)</span>
              </div>
              <div className="input-col" style={{textAlign: 'right'}}>
                <input type="checkbox" id="francesita" checked={formState.francesita} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Nivel 1 (Simples)</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('alzadaN1', -1)}>-</button>
                  <span>{formState.alzadaN1}</span>
                  <button type="button" onClick={() => updateCounter('alzadaN1', 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Nivel 2 (Intermedio)</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('alzadaN2', -1)}>-</button>
                  <span>{formState.alzadaN2}</span>
                  <button type="button" onClick={() => updateCounter('alzadaN2', 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Nivel 3 (Complejo)</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('alzadaN3', -1)}>-</button>
                  <span>{formState.alzadaN3}</span>
                  <button type="button" onClick={() => updateCounter('alzadaN3', 1)}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* EFECTOS */}
          <div className="section">
            <div className="section-title">4. Efectos y Texturas (Por uña)</div>
            
            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Ojo de Gato</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('efectoGato', -1)}>-</button>
                  <span>{formState.efectoGato}</span>
                  <button type="button" onClick={() => updateCounter('efectoGato', 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Polvos (Chroma, Aurora)</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('efectoPolvo', -1)}>-</button>
                  <span>{formState.efectoPolvo}</span>
                  <button type="button" onClick={() => updateCounter('efectoPolvo', 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Polvo de Hada</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('polvoHada', -1)}>-</button>
                  <span>{formState.polvoHada}</span>
                  <button type="button" onClick={() => updateCounter('polvoHada', 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="label-col">
                <span className="label-title">Encapsulados / Gel 3D</span>
              </div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('encapsulado', -1)}>-</button>
                  <span>{formState.encapsulado}</span>
                  <button type="button" onClick={() => updateCounter('encapsulado', 1)}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* APLIQUES - STRASS Y CHARMS SEPARADOS */}
          <div className="section">
            <div className="section-title">5. Pedrería y Apliques (Unidad)</div>
            
            <div className="form-row">
              <div className="label-col"><span className="label-title">Strass Chico</span></div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('strassChico', -1, 99)}>-</button>
                  <span>{formState.strassChico}</span>
                  <button type="button" onClick={() => updateCounter('strassChico', 1, 99)}>+</button>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="label-col"><span className="label-title">Strass Mediano</span></div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('strassMediano', -1, 99)}>-</button>
                  <span>{formState.strassMediano}</span>
                  <button type="button" onClick={() => updateCounter('strassMediano', 1, 99)}>+</button>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="label-col"><span className="label-title">Strass Grande</span></div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('strassGrande', -1, 99)}>-</button>
                  <span>{formState.strassGrande}</span>
                  <button type="button" onClick={() => updateCounter('strassGrande', 1, 99)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row" style={{marginTop: '15px'}}>
              <div className="label-col"><span className="label-title">Charm Chico</span></div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('charmChico', -1, 99)}>-</button>
                  <span>{formState.charmChico}</span>
                  <button type="button" onClick={() => updateCounter('charmChico', 1, 99)}>+</button>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="label-col"><span className="label-title">Charm Mediano</span></div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('charmMediano', -1, 99)}>-</button>
                  <span>{formState.charmMediano}</span>
                  <button type="button" onClick={() => updateCounter('charmMediano', 1, 99)}>+</button>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="label-col"><span className="label-title">Charm Grande</span></div>
              <div className="input-col">
                <div className="counter-controls">
                  <button type="button" onClick={() => updateCounter('charmGrande', -1, 99)}>-</button>
                  <span>{formState.charmGrande}</span>
                  <button type="button" onClick={() => updateCounter('charmGrande', 1, 99)}>+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="total-container">
            <div className="total-label">Total a cobrar</div>
            <div className="total-amount">{formatoMoneda}</div>
          </div>
        </div>
      )}

      {/* VISTA 2: CONFIGURACIÓN DE PRECIOS */}
      {activeTab === 'settings' && (
        <div className="calculator" style={{marginBottom: '70px'}}>
          <h2>Gestión de Precios ($)</h2>
          <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
            Actualizá los valores acá y la calculadora los usará automáticamente.
          </p>

          <div className="section">
            <div className="section-title">Servicios Base</div>
            <div className="form-row"><span className="label-col">Semipermanente</span><input className="input-col price-input" type="number" id="base_semi" value={precios.base_semi} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Kapping</span><input className="input-col price-input" type="number" id="base_kapping" value={precios.base_kapping} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Soft Gel</span><input className="input-col price-input" type="number" id="base_softgel" value={precios.base_softgel} onChange={handlePriceChange} /></div>
          </div>

          <div className="section">
            <div className="section-title">Extras Soft Gel (Largo)</div>
            <div className="form-row"><span className="label-col">Cortas (1-2)</span><input className="input-col price-input" type="number" id="largo_corto" value={precios.largo_corto} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Medio (3-4)</span><input className="input-col price-input" type="number" id="largo_medio" value={precios.largo_medio} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Largo (5-6)</span><input className="input-col price-input" type="number" id="largo_largo" value={precios.largo_largo} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Extremo (7+)</span><input className="input-col price-input" type="number" id="largo_extremo" value={precios.largo_extremo} onChange={handlePriceChange} /></div>
          </div>

          <div className="section">
            <div className="section-title">Retiros y Reparaciones</div>
            <div className="form-row"><span className="label-col">Retiro (Mi Trabajo)</span><input className="input-col price-input" type="number" id="retiro_mio" value={precios.retiro_mio} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Retiro (Otro Profesional)</span><input className="input-col price-input" type="number" id="retiro_otro" value={precios.retiro_otro} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Solo Retiro + Nutrición</span><input className="input-col price-input" type="number" id="retiro_nutricion" value={precios.retiro_nutricion} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Uña Rota (Unidad)</span><input className="input-col price-input" type="number" id="reparacion" value={precios.reparacion} onChange={handlePriceChange} /></div>
          </div>

          <div className="section">
            <div className="section-title">Arte y Mano Alzada</div>
            <div className="form-row"><span className="label-col">Francesita (Manos)</span><input className="input-col price-input" type="number" id="francesita" value={precios.francesita} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Alzada Nivel 1 (Uña)</span><input className="input-col price-input" type="number" id="alzada_1" value={precios.alzada_1} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Alzada Nivel 2 (Uña)</span><input className="input-col price-input" type="number" id="alzada_2" value={precios.alzada_2} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Alzada Nivel 3 (Uña)</span><input className="input-col price-input" type="number" id="alzada_3" value={precios.alzada_3} onChange={handlePriceChange} /></div>
          </div>

          <div className="section">
            <div className="section-title">Efectos y Apliques (Por Uña)</div>
            <div className="form-row"><span className="label-col">Ojo de Gato</span><input className="input-col price-input" type="number" id="efecto_gato" value={precios.efecto_gato} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Polvos (Aurora, etc)</span><input className="input-col price-input" type="number" id="efecto_polvo" value={precios.efecto_polvo} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Polvo de Hada</span><input className="input-col price-input" type="number" id="efecto_polvo_hada" value={precios.efecto_polvo_hada} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Gel 3D / Encapsulado</span><input className="input-col price-input" type="number" id="efecto_encapsulado" value={precios.efecto_encapsulado} onChange={handlePriceChange} /></div>
            
            <div className="form-row"><span className="label-col">Strass Chico</span><input className="input-col price-input" type="number" id="strass_chico" value={precios.strass_chico} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Strass Mediano</span><input className="input-col price-input" type="number" id="strass_mediano" value={precios.strass_mediano} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Strass Grande</span><input className="input-col price-input" type="number" id="strass_grande" value={precios.strass_grande} onChange={handlePriceChange} /></div>
            
            <div className="form-row"><span className="label-col">Charm Chico</span><input className="input-col price-input" type="number" id="charm_chico" value={precios.charm_chico} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Charm Mediano</span><input className="input-col price-input" type="number" id="charm_mediano" value={precios.charm_mediano} onChange={handlePriceChange} /></div>
            <div className="form-row"><span className="label-col">Charm Grande</span><input className="input-col price-input" type="number" id="charm_grande" value={precios.charm_grande} onChange={handlePriceChange} /></div>
          </div>
        </div>
      )}

      {/* MENÚ DE NAVEGACIÓN INFERIOR */}
      <nav className="bottom-nav">
        <button 
          className={activeTab === 'calculator' ? 'active' : ''} 
          onClick={() => setActiveTab('calculator')}
        >
          💰 Cotizador
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Precios
        </button>
      </nav>
    </div>
  );
}