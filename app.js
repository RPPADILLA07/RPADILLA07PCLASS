/*
EXAMEN PROGRAMACION DE COMPUTADORES
PROFESOR: JOSE JAVIER ZAPATA POLO
*/
// Referencias a DOM
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('form-container');
  const result = document.getElementById('result');
  const select = document.getElementById('calc-select');

  // Criterios normas colombianas
  const TAU_ADM = 0.58;        // N/mm²
  const SLOPE_MAX = 5;         // %
  const FS_MIN = 2;            // Adimensional
  const P_ADM = 500000;        // Pa
  const RHO_MIN = 0.0033;      // Cuantía mínima NSR-10

  select.addEventListener('change', () => {
    container.innerHTML = '';
    result.textContent = '';
    const funcs = {
      beam: renderBeamForm,
      volume: renderVolumeForm,
      shear: renderShearForm,
      slope: renderSlopeForm,
      fs: renderFSForm,
      hydraulic: renderHydraulicForm,
      slab: renderSlabForm
    };
    const fn = funcs[select.value];
    if (fn) fn();
  });

  function isPositive(v) { return typeof v === 'number' && v > 0; }

  function renderBeamForm() {
    container.innerHTML = `
      <form id="beam-form">
        <label>M (kN·m): <input type="number" id="M" min="0" step="0.01" required></label>
        <label>Z (cm³): <input type="number" id="Z" min="0" step="1" required></label>
        <label>fy (MPa): <input type="number" id="fy" min="0" step="0.1" required></label>
        <button type="submit">Calcular</button>
      </form>`;
    document.getElementById('beam-form').addEventListener('submit', e => {
      e.preventDefault();
      const Mknm = parseFloat(document.getElementById('M').value);
      const Zcm3 = parseFloat(document.getElementById('Z').value);
      const fy = parseFloat(document.getElementById('fy').value);
      if (![Mknm, Zcm3, fy].every(isPositive)) return result.textContent = 'Valores deben ser positivos';
      const sigma = (Mknm * 1e6) / (Zcm3 * 1e3);
      const status = sigma <= fy ? 'Segura' : 'No segura';
      result.innerHTML = `
        <p><strong>Cálculo:</strong> σ = (M·10⁶)/(Z·10³) = ${sigma.toFixed(2)} N/mm²</p>
        <p><strong>fy =</strong> ${fy} MPa</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }

  function renderVolumeForm() {
    container.innerHTML = `
      <form id="vol-form">
        <label>A (m²): <input type="number" id="A" min="0" step="0.001" required></label>
        <label>L (m): <input type="number" id="L" min="0" step="0.001" required></label>
        <label>Volumen máx. admisible (m³): <input type="number" id="Vmax" min="0" step="0.001" required></label>
        <button type="submit">Calcular</button>
      </form>`;
    document.getElementById('vol-form').addEventListener('submit', e => {
      e.preventDefault();
      const A = parseFloat(document.getElementById('A').value);
      const L = parseFloat(document.getElementById('L').value);
      const Vmax = parseFloat(document.getElementById('Vmax').value);
      if (![A, L, Vmax].every(isPositive)) return result.textContent = 'Valores deben ser positivos';
      const V = A * L;
      const status = V <= Vmax ? 'Seguro' : 'No seguro';
      result.innerHTML = `
        <p><strong>Cálculo:</strong> V = A·L = ${A}·${L} = ${V.toFixed(3)} m³</p>
        <p><strong>Volumen admisible:</strong> ${Vmax} m³</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }

  function renderShearForm() {
    container.innerHTML = `
      <form id="shear-form">
        <label>V (kN): <input type="number" id="V" min="0" step="0.01" required></label>
        <label>A (cm²): <input type="number" id="A" min="0" step="0.1" required></label>
        <button type="submit">Calcular</button>
      </form>`;
    document.getElementById('shear-form').addEventListener('submit', e => {
      e.preventDefault();
      const Vkn = parseFloat(document.getElementById('V').value);
      const Acm2 = parseFloat(document.getElementById('A').value);
      if (![Vkn, Acm2].every(isPositive)) return result.textContent = 'Valores deben ser positivos';
      const tau = (Vkn * 1e3) / (Acm2 * 1e2);
      const status = tau <= TAU_ADM ? 'Segura' : 'No segura';
      result.innerHTML = `
        <p><strong>Cálculo:</strong> τ = ${tau.toFixed(2)} N/mm²</p>
        <p><strong>Límite τ<sub>adm</sub>:</strong> ${TAU_ADM} N/mm²</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }

  function renderSlopeForm() {
    container.innerHTML = `
      <form id="slope-form">
        <label>Δh (m): <input type="number" id="dh" min="0" step="0.01" required></label>
        <label>L (m): <input type="number" id="Lh" min="0" step="0.01" required></label>
        <button type="submit">Calcular</button>
      </form>`;
    document.getElementById('slope-form').addEventListener('submit', e => {
      e.preventDefault();
      const dh = parseFloat(document.getElementById('dh').value);
      const Lh = parseFloat(document.getElementById('Lh').value);
      if (![dh, Lh].every(isPositive)) return result.textContent = 'Valores deben ser positivos';
      const slope = (dh / Lh) * 100;
      const status = slope <= SLOPE_MAX ? 'Segura' : 'No segura';
      result.innerHTML = `
        <p><strong>Cálculo:</strong> i = ${slope.toFixed(2)}%</p>
        <p><strong>Límite pendiente:</strong> ${SLOPE_MAX}%</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }

  function renderFSForm() {
    container.innerHTML = `
      <form id="fs-form">
        <label>Qu (kN): <input type="number" id="Qu" min="0" step="0.1" required></label>
        <label>q (kN/m²): <input type="number" id="q" min="0" step="1" required></label>
        <button type="submit">Calcular</button>
      </form>`;
    document.getElementById('fs-form').addEventListener('submit', e => {
      e.preventDefault();
      const Qu = parseFloat(document.getElementById('Qu').value);
      const q = parseFloat(document.getElementById('q').value);
      if (![Qu, q].every(isPositive)) return result.textContent = 'Valores deben ser positivos';
      const FS = Qu / q;
      const status = FS >= FS_MIN ? 'Segura' : 'No segura';
      result.innerHTML = `
        <p><strong>Cálculo:</strong> FS = ${FS.toFixed(2)}</p>
        <p><strong>FS mínimo:</strong> ${FS_MIN}</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }

  function renderHydraulicForm() {
    container.innerHTML = `
      <form id="hyd-form">
        <label>ρ (kg/m³): <input type="number" id="rho" min="0" step="1" required></label>
        <label>g (m/s²): <input type="number" id"g" min="0" step="0.01" required></label>
        <label>h (m): <input type="number" id="h" min="0" step="0.01" required></label>
        <button type="submit">Calcular</button>
      </form>`;
    document.getElementById('hyd-form').addEventListener('submit', e => {
      e.preventDefault();
      const rho = parseFloat(document.getElementById('rho').value);
      const g = parseFloat(document.getElementById('g').value);
      const h = parseFloat(document.getElementById('h').value);
      if (![rho, g, h].every(isPositive)) return result.textContent = 'Valores deben ser positivos';
      const P = rho * g * h;
      const status = P <= P_ADM ? 'Segura' : 'No segura';
      result.innerHTML = `
        <p><strong>Cálculo:</strong> P = ${P.toFixed(2)} Pa</p>
        <p><strong>Límite P<sub>adm</sub>:</strong> ${P_ADM} Pa</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }

  function renderSlabForm() {
    container.innerHTML = `
      <form id="slab-form">
        <label>Luz libre L (m): <input type="number" id="Lspan" value="3" min="0.1" step="0.01" required></label>
        <label>Recubrimiento c (m): <input type="number" id="cover" value="0.02" min="0" step="0.001" required></label>
        <label>Profundidad efectiva d (m): <input type="number" id="ef_depth" value="0.10" min="0" step="0.001" required></label>
        <label>f'c (MPa): <input type="number" id="fc" value="21" min="1" step="0.1" required></label>
        <label>fy (MPa): <input type="number" id="fy_slab" value="420" min="1" step="1" required></label>
        <label>Peso propio (kN/m²): <input type="number" id="wt_self" value="2.94" min="0" step="0.01" required></label>
        <label>Carga muerta (kN/m²): <input type="number" id="wt_dead" value="4.6" min="0" step="0.01" required></label>
        <label>Carga viva (kN/m²): <input type="number" id="wt_live" value="1.8" min="0" step="0.01" required></label>
        <label>Condición:
          <select id="condition">
            <option value="14">Simple apoyada L/14</option>
            <option value="16">Un extremo continuo L/16</option>
            <option value="19">Ambos extremos continuos L/19</option>
            <option value="10">Voladizo L/10</option>
          </select>
        </label>
        <button type="submit">Calcular diseño</button>
      </form>`;
    document.getElementById('slab-form').addEventListener('submit', e => {
      e.preventDefault();
      const L = parseFloat(document.getElementById('Lspan').value);
      const cover = parseFloat(document.getElementById('cover').value);
      const d = parseFloat(document.getElementById('ef_depth').value);
      const fc = parseFloat(document.getElementById('fc').value);
      const fy = parseFloat(document.getElementById('fy_slab').value);
      const ws = parseFloat(document.getElementById('wt_self').value);
      const wd = parseFloat(document.getElementById('wt_dead').value);
      const wl = parseFloat(document.getElementById('wt_live').value);
      const factor = parseInt(document.getElementById('condition').value);
      if (![L, cover, d, fc, fy, ws, wd, wl, factor].every(isPositive)) return result.textContent = 'Valores inválidos';
      const hMin = Math.ceil((L / factor) * 1000);
      const Wu = 1.2 * (ws + wd) + 1.6 * wl;
      const Mu = Wu * L * L / 8;
      const Mu_Nmm = Mu * 1e6;
      const b = 1000;
      const d_mm = d * 1000;
      const Rn = Mu_Nmm / (b * d_mm * d_mm);
      const term = 1 - 2 * Rn / (0.85 * fc);
      const rho = (0.85 * fc / fy) * (1 - Math.sqrt(Math.max(term, 0)));
      const status = rho >= RHO_MIN ? 'Segura' : 'No segura';
      const As = rho * b * d_mm;
      result.innerHTML = `
        <p><strong>h<sub>min</sub>:</strong> ${hMin} mm</p>
        <p><strong>Wu:</strong> ${Wu.toFixed(2)} kN/m²</p>
        <p><strong>Mu:</strong> ${Mu.toFixed(2)} kN·m/m</p>
        <p><strong>Rn:</strong> ${Rn.toFixed(4)}</p>
        <p><strong>ρ:</strong> ${rho.toFixed(4)}</p>
        <p><strong>As:</strong> ${As.toFixed(2)} mm²/m</p>
        <p><strong>Estado:</strong> ${status}</p>
      `;
    });
  }
});
