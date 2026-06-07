// D4RK — Gestión Técnica de Fibra © 2026
// PROTECCIÓN ANTI-CLONACIÓN (Bloqueo de interfaz)

// Desactivar el menú del clic derecho
document.addEventListener('contextmenu', event => event.preventDefault());

// Desactivar teclas de inspección (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U)
document.addEventListener('keydown', event => {
    if (event.keyCode == 123) return false; // F12
    if (event.ctrlKey && event.shiftKey && (event.keyCode == 73 || event.keyCode == 67)) return false; 
    if (event.ctrlKey && event.keyCode == 85) return false; // Ctrl+U (Ver código fuente)
});

// =========================================================================
// LÓGICA DE NEGOCIO (Optimizada para máxima compatibilidad con el HTML)

const cMap = {
    1: {n: "Azul", c: "#0055ff", t: "#fff"}, 2: {n: "Naranja", c: "#ff6600", t: "#fff"}, 3: {n: "Verde", c: "#00cc44", t: "#fff"}, 4: {n: "Marrón", c: "#8b4513", t: "#fff"},
    5: {n: "Gris", c: "#808080", t: "#fff"}, 6: {n: "Blanco", c: "#ffffff", t: "#000"}, 7: {n: "Rojo", c: "#ee0000", t: "#fff"}, 8: {n: "Negro", c: "#000000", t: "#fff"},
    9: {n: "Amarillo", c: "#eeee00", t: "#000"}, 10: {n: "Violeta", c: "#ba55d3", t: "#fff"}, 11: {n: "Rosa", c: "#ffb6c1", t: "#000"}, 12: {n: "Aqua", c: "#00ffff", t: "#000"}
};

let infoCableGlobal = { bufferNom: '-', bufferIdx: '-', hiloNom: '-', hiloIdx: '-', totalCorrelativo: '-' };

const a = document.getElementById('nHilos'), resBox = document.getElementById('resultado'), errorBox = document.getElementById('error');
let selectedBuffer = null, selectedHilo = null;

// Control del Cambio de Tema (Optimizado para celulares)
const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeBtn.textContent = '☀️'; // Solo el sol para volver a claro
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeBtn.textContent = '🌙'; // Solo la luna para volver a oscuro
    }
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    resBox.classList.remove('activo');
    errorBox.classList.remove('activo');
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

const gridBuffer = document.getElementById('gridBuffer');
const gridHilo = document.getElementById('gridHilo');

function buildGrids() {
    gridBuffer.innerHTML = '';
    for(let i=1; i<=12; i++) {
        const btn = document.createElement('div');
        btn.className = 'color-selector-btn';
        btn.style.backgroundColor = cMap[i].c;
        btn.style.color = cMap[i].t;
        btn.textContent = cMap[i].n;
        btn.onclick = () => {
            document.querySelectorAll('#gridBuffer .color-selector-btn').forEach(b=>b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedBuffer = i;
            ejecutarCalculoDirecto();
        };
        gridBuffer.appendChild(btn);
    }
    renderHiloGrid();
}

function renderHiloGrid() {
    gridHilo.innerHTML = '';
    const maxHilos = parseInt(a.value);
    if(selectedHilo > maxHilos) selectedHilo = null;
    
    for(let i=1; i<=maxHilos; i++) {
        const btn = document.createElement('div');
        btn.className = 'color-selector-btn' + (selectedHilo === i ? ' selected' : '');
        btn.style.backgroundColor = cMap[i].c;
        btn.style.color = cMap[i].t;
        btn.textContent = cMap[i].n;
        btn.onclick = () => {
            document.querySelectorAll('#gridHilo .color-selector-btn').forEach(b=>b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedHilo = i;
            ejecutarCalculoDirecto();
        };
        gridHilo.appendChild(btn);
    }
    ejecutarCalculoDirecto();
}

a.addEventListener('change', renderHiloGrid);

function ejecutarCalculoDirecto() {
    if(!selectedBuffer || !selectedHilo) { resBox.classList.remove('activo'); return; }
    const hilosMax = parseInt(a.value);
    const numAbsoluto = hilosMax * (selectedBuffer - 1) + selectedHilo;
    actualizarHistorialGlobal(cMap[selectedBuffer].n, selectedBuffer, cMap[selectedHilo].n, selectedHilo, numAbsoluto);
    renderizarResultado(cMap[selectedBuffer].n, selectedBuffer, cMap[selectedHilo].n, selectedHilo, numAbsoluto);
    errorBox.classList.remove('activo');
}

const invHilos = document.getElementById('invHilosPorBuffer');
const invNum = document.getElementById('invNumeroHilo');

function ejecutarCalculoInverso() {
    const hilosPorBuffer = parseInt(invHilos.value);
    const numeroAbsoluto = parseInt(invNum.value);

    if (!numeroAbsoluto || numeroAbsoluto < 1) {
        resBox.classList.remove('activo'); errorBox.classList.remove('activo');
        resetHistorialGlobal(); return;
    }

    let bufferCalculado = Math.ceil(numeroAbsoluto / hilosPorBuffer);
    let hiloCalculado = numeroAbsoluto % hilosPorBuffer;
    if (hiloCalculado === 0) hiloCalculado = hilosPorBuffer;

    if (bufferCalculado > 12) {
        mostrarError(`El hilo N° ${numeroAbsoluto} excede los 12 Buffers estándar (${hilosPorBuffer * 12} hilos).`);
        resetHistorialGlobal(); return;
    }

    errorBox.classList.remove('activo');
    actualizarHistorialGlobal(cMap[bufferCalculado].n, bufferCalculado, cMap[hiloCalculado].n, hiloCalculado, numeroAbsoluto);
    renderizarResultado(cMap[bufferCalculado].n, bufferCalculado, cMap[hiloCalculado].n, hiloCalculado, numeroAbsoluto);
}

invNum.addEventListener('input', ejecutarCalculoInverso);
invHilos.addEventListener('change', ejecutarCalculoInverso);

function actualizarHistorialGlobal(bn, bi, hn, hi, num) {
    infoCableGlobal = { bufferNom: bn, bufferIdx: bi, hiloNom: hn, hiloIdx: hi, totalCorrelativo: num };
}

function resetHistorialGlobal() {
    infoCableGlobal = { bufferNom: '-', bufferIdx: '-', hiloNom: '-', hiloIdx: '-', totalCorrelativo: '-' };
}

function renderizarResultado(nomBuffer, idxBuffer, nomHilo, idxHilo, numero) {
    document.getElementById('resultadoBuffer').textContent = `Buffer ${idxBuffer} (${nomBuffer})`;
    document.getElementById('resultadoHilo').textContent = `Hilo ${idxHilo} (${nomHilo})`;
    document.getElementById('resultadoNumero').textContent = `Hilo N° ${numero}`;
    
    const bBuffer = document.getElementById('badgeBuffer');
    const bHilo = document.getElementById('badgeHilo');
    bBuffer.style.backgroundColor = cMap[idxBuffer].c;
    bHilo.style.backgroundColor = cMap[idxHilo].c;
    bBuffer.style.display = 'inline-block';
    bHilo.style.display = 'inline-block';

    resBox.classList.add('activo');
}

document.getElementById('limpiarBtn').addEventListener('click', () => {
    selectedBuffer = null; selectedHilo = null;
    document.querySelectorAll('.color-selector-btn').forEach(b=>b.classList.remove('selected'));
    resBox.classList.remove('activo'); errorBox.classList.remove('activo');
    resetHistorialGlobal();
});

document.getElementById('invLimpiarBtn').addEventListener('click', () => {
    invNum.value = ''; resBox.classList.remove('activo'); errorBox.classList.remove('activo');
    resetHistorialGlobal();
});

function mostrarError(txt){ errorBox.textContent=txt; errorBox.classList.add('activo'); resBox.classList.remove('activo');}

// Autocalcular materiales basados en el FAT
const inputFat = document.getElementById('tplMatFat');
const inputAbrazaderas = document.getElementById('tplMatAbrazaderas');
const inputTornillos = document.getElementById('tplMatTornillos');

if(inputFat) {
    inputFat.addEventListener('input', () => {
        const fatCant = parseInt(inputFat.value) || 0;
        if (fatCant >= 0) {
            inputAbrazaderas.value = fatCant * 4;
            inputTornillos.value = fatCant * 8;
        } else {
            inputAbrazaderas.value = 0;
            inputTornillos.value = 0;
        }
    });
}

// Desplegables de Plantillas
const tplToggle = document.getElementById('tplToggle'), tplContent = document.querySelector('.template-content');
if (tplToggle && tplContent) {
    tplToggle.addEventListener('click', () => {
        const open = tplContent.classList.toggle('open');
        tplToggle.textContent = open ? '🔼 Cerrar Plantilla FDT' : '🔽 Generar Plantilla FDT';
    });
}

const tplToggleLiq = document.getElementById('tplToggleLiq'), tplContentLiq = document.getElementById('tplContentLiq');
if (tplToggleLiq && tplContentLiq) {
    tplToggleLiq.addEventListener('click', () => {
        const open = tplContentLiq.classList.toggle('open');
        tplToggleLiq.textContent = open ? '🔼 Cerrar Plantilla de Liquidación' : '🔽 Generar Plantilla de Liquidación';
    });
}

// Generación FDT
document.getElementById('generarPlantilla').addEventListener('click', () => {
    const lines = [
        '*FDT:*',
        '*Puerto:* ' + (document.getElementById('tplPuerto').value.trim() || '-'),
        '*Bandeja:* ' + (document.getElementById('tplBandeja').value.trim() || '-'),
        '*Splitter:* ' + (document.getElementById('tplSplitter').value.trim() || '-'),
        '*FDT Puerto(s) usado(s):* ' + (document.getElementById('tplPuertosUsados').value.trim() || '-'),
        '*Closure Puerto(s) usado(s):* ' + (document.getElementById('tplClosure').value.trim() || '-'),
        '*Código de Colores:* Buffer ' + infoCableGlobal.bufferIdx + ' (' + infoCableGlobal.bufferNom + ') | Hilo ' + infoCableGlobal.hiloIdx + ' (' + infoCableGlobal.hiloNom + ')',
        '*Hilo Correlativo:* N° ' + infoCableGlobal.totalCorrelativo
    ];
    document.getElementById('plantillaSalida').value = lines.join('\n');
});

// Generación Liquidación
document.getElementById('generarPlantillaLiq').addEventListener('click', () => {
    const lines = [
        '*Dirección:* ' + (document.getElementById('tplDireccion').value.trim() || '-'),
        '*Nombre de Edificio:* ' + (document.getElementById('tplEdificio').value.trim() || '-'),
        '*Cantidad de Torres:* ' + (document.getElementById('tplTorres').value || '0'),
        '*Cantidad de Pisos:* ' + (document.getElementById('tplPisos').value || '0'),
        '*Dptos. por Piso:* ' + (document.getElementById('tplDptosPorPiso').value || '-'),
        '*Piso donde queda el FAT:* ' + (document.getElementById('tplPisoFat').value.trim() || '-'),
        '*Ingreso:* ' + (document.getElementById('tplIngreso').value.trim() || '-'),
        '*Cantidad de Sótanos:* ' + (document.getElementById('tplSotanos').value || '0'),
        '',
        '*Materiales Utilizados:*',
        '*Closure:* ' + (document.getElementById('tplMatClosure').value.trim() || '-'),
        '*Fat:* ' + (document.getElementById('tplMatFat').value || '0'),
        '*Preformados:* ' + (document.getElementById('tplMatPreformados').value || '0'),
        '*Etiquetas:* ' + (document.getElementById('tplMatEtiquetas').value || '0'),
        '*Cintillos Amarres:* ' + (document.getElementById('tplMatCintillos').value || '0'),
        '*Smuv:* ' + (document.getElementById('tplMatSmuv').value || '0'),
        '*Cinta Aislante:* ' + (document.getElementById('tplMatCinta').value || '0'),
        '*Abrazaderas:* ' + (document.getElementById('tplMatAbrazaderas').value || '0'),
        '*Tornillos:* ' + (document.getElementById('tplMatTornillos').value || '0'),
        '*F.O (mts):* ' + (document.getElementById('tplMatFO').value || '0'),
        '*Canaletas:* ' + (document.getElementById('tplMatCanaletas').value || '0'),
        '*Postes Totales:* ' + (document.getElementById('tplMatPostes').value || '0'),
        '',
        '*Datos de Empalme:*',
        '*Número de bandeja:* ' + (document.getElementById('tplEmpBandeja').value.trim() || '-'),
        '*Número de Splitter FDT:* ' + (document.getElementById('tplEmpSplitter').value.trim() || '-'),
        '*Puertos del Closure usado:* ' + (document.getElementById('tplEmpPortsClosure').value.trim() || '-'),
        '',
        '*Puerto PON de FAT Instalado:*',
        '*Hilo alimentador:* ' + (document.getElementById('tplPonHilo').value.trim() || '-'),
        '',
        '*Información del Cable Calculado:*',
        '*Fibra Óptica:* Buffer ' + infoCableGlobal.bufferIdx + ' (' + infoCableGlobal.bufferNom + ') — Hilo ' + infoCableGlobal.hiloIdx + ' (' + infoCableGlobal.hiloNom + ')',
        '*Hilo Correlativo:* N° ' + infoCableGlobal.totalCorrelativo,
        '',
        '*Cuadrilla:*',
        '*Tec. Empalmador:* ' + (document.getElementById('tplTecEmpalmador').value.trim() || '-'),
        '*Tec. Liniero:* ' + (document.getElementById('tplTecLiniero').value.trim() || '-'),
        '*Tec. Ayudante:* ' + (document.getElementById('tplTecAyudante').value.trim() || '-'),
        '*Supervisor:* ' + (document.getElementById('tplSupervisor').value.trim() || '-')
    ];
    document.getElementById('plantillaSalidaLiq').value = lines.join('\n');
});

// Portapapeles Seguro
async function setupClipboard(btn, textarea) {
    btn.addEventListener('click', async () => {
        if(!textarea.value) return;
        try {
            await navigator.clipboard.writeText(textarea.value);
            const oldTxt = btn.textContent;
            btn.textContent = '✓ Copiado';
            setTimeout(() => btn.textContent = oldTxt, 1500);
        } catch (err) { console.error('Error al copiar', err); }
    });
}
setupClipboard(document.getElementById('copiarPlantilla'), document.getElementById('plantillaSalida'));
setupClipboard(document.getElementById('copiarPlantillaLiq'), document.getElementById('plantillaSalidaLiq'));

buildGrids();