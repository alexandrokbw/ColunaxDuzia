const numeroInput = document.getElementById('numeroInput');
const addBtn = document.getElementById('addBtn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');

const totalJogadasEl = document.getElementById('totalJogadas');
const colunaVariavelEl = document.getElementById('colunaVariavel');
const duziaVariavelEl = document.getElementById('duziaVariavel');
const gruposAtrasadosEl = document.getElementById('gruposAtrasados');

const sColVarEl = document.getElementById('sColVar');
const sDuzVarEl = document.getElementById('sDuzVar');
const sugestaoEl = document.getElementById('sugestao');
const historicoWrapper = document.getElementById('historicoWrapper');

const FIXED_COLUMN = 2;
const FIXED_DOZEN = 2;

const jogadas = [];
let colunaVariavel = null;
let duziaVariavel = null;

// Rastreamento simples de colunas recentes (mais recente primeiro)
let gruposAtrasados = [1, 2, 3];

function obterColuna(numero) {
  if (numero < 1 || numero > 36) return null;
  const resto = numero % 3;
  if (resto === 1) return 1;
  if (resto === 2) return 2;
  return 3;
}

function obterDuzia(numero) {
  if (numero < 1 || numero > 36) return null;
  if (numero <= 12) return 1;
  if (numero <= 24) return 2;
  return 3;
}

function atualizarGrupoAtrasado(grupo) {
  if (!grupo) return;
  gruposAtrasados = gruposAtrasados.filter((g) => g !== grupo);
  gruposAtrasados.unshift(grupo);
  if (gruposAtrasados.length > 3) {
    gruposAtrasados.pop();
  }
}

function numerosDaColuna(coluna) {
  const numeros = [];
  for (let n = 1; n <= 36; n += 1) {
    if (obterColuna(n) === coluna) numeros.push(n);
  }
  return numeros;
}

function numerosDaDuzia(duzia) {
  if (duzia === 1) return Array.from({ length: 12 }, (_, i) => i + 1);
  if (duzia === 2) return Array.from({ length: 12 }, (_, i) => i + 13);
  if (duzia === 3) return Array.from({ length: 12 }, (_, i) => i + 25);
  return [];
}

function calcularSugestao() {
  if (!colunaVariavel || !duziaVariavel) return [];

  const colunasSelecionadas = [FIXED_COLUMN, colunaVariavel];
  const duziasSelecionadas = [FIXED_DOZEN, duziaVariavel];

  const numerosColunas = new Set(
    colunasSelecionadas.flatMap((coluna) => numerosDaColuna(coluna))
  );
  const numerosDuzias = new Set(
    duziasSelecionadas.flatMap((duzia) => numerosDaDuzia(duzia))
  );

  return Array.from(numerosColunas)
    .filter((n) => numerosDuzias.has(n))
    .sort((a, b) => a - b);
}

function renderHistorico() {
  if (!jogadas.length) {
    historicoWrapper.innerHTML = '<div class="empty-state">Nenhuma jogada registrada.</div>';
    return;
  }

  const rows = jogadas
    .map(
      (jogada) => `
      <tr>
        <td>${jogada.id}</td>
        <td>${jogada.numero}</td>
        <td>${jogada.coluna ?? '-'}</td>
        <td>${jogada.duzia ?? '-'}</td>
      </tr>
    `
    )
    .join('');

  historicoWrapper.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Número</th>
          <th>Coluna</th>
          <th>Dúzia</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderSugestao() {
  sColVarEl.textContent = colunaVariavel ?? '-';
  sDuzVarEl.textContent = duziaVariavel ?? '-';

  const sugestao = calcularSugestao();

  if (!sugestao.length) {
    sugestaoEl.className = 'suggestion-list empty-state';
    sugestaoEl.textContent = 'Aguardando coluna e dúzia variáveis (diferentes de 2).';
    return;
  }

  sugestaoEl.className = 'suggestion-list';
  sugestaoEl.textContent = sugestao.join(', ');
}

function renderStats() {
  totalJogadasEl.textContent = String(jogadas.length);
  colunaVariavelEl.textContent = colunaVariavel ?? '-';
  duziaVariavelEl.textContent = duziaVariavel ?? '-';
  gruposAtrasadosEl.textContent = gruposAtrasados.join(', ');
}

function atualizarUI() {
  renderStats();
  renderSugestao();
  renderHistorico();
}

function adicionarNumero() {
  const numero = Number(numeroInput.value);

  if (!Number.isInteger(numero) || numero < 0 || numero > 36) {
    alert('Digite um número inteiro entre 0 e 36.');
    return;
  }

  const coluna = obterColuna(numero);
  const duzia = obterDuzia(numero);

  const jogada = {
    id: jogadas.length + 1,
    numero,
    coluna,
    duzia
  };

  jogadas.push(jogada);

  if (coluna && coluna !== FIXED_COLUMN) {
    colunaVariavel = coluna;
  }

  if (duzia && duzia !== FIXED_DOZEN) {
    duziaVariavel = duzia;
  }

  atualizarGrupoAtrasado(coluna);
  numeroInput.value = '';
  numeroInput.focus();

  atualizarUI();
}

function desfazerUltimo() {
  if (!jogadas.length) return;
  jogadas.pop();

  colunaVariavel = null;
  duziaVariavel = null;
  gruposAtrasados = [1, 2, 3];

  for (const jogada of jogadas) {
    if (jogada.coluna && jogada.coluna !== FIXED_COLUMN) {
      colunaVariavel = jogada.coluna;
    }
    if (jogada.duzia && jogada.duzia !== FIXED_DOZEN) {
      duziaVariavel = jogada.duzia;
    }
    atualizarGrupoAtrasado(jogada.coluna);
  }

  // Reindexa IDs
  jogadas.forEach((jogada, index) => {
    jogada.id = index + 1;
  });

  atualizarUI();
}

function limparTudo() {
  if (!jogadas.length) return;
  const confirmar = confirm('Tem certeza que deseja limpar todo o histórico?');
  if (!confirmar) return;

  jogadas.length = 0;
  colunaVariavel = null;
  duziaVariavel = null;
  gruposAtrasados = [1, 2, 3];
  atualizarUI();
}

addBtn.addEventListener('click', adicionarNumero);
undoBtn.addEventListener('click', desfazerUltimo);
clearBtn.addEventListener('click', limparTudo);
numeroInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    adicionarNumero();
  }
});

atualizarUI();
