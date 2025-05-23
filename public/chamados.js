/* Lista os chamados */

document.addEventListener('DOMContentLoaded', () => {
  carregarChamados();
});

async function carregarChamados() {
  const listaChamados = document.getElementById('lista-chamados');
  listaChamados.innerHTML = 'Carregando...';

  try {
    const resposta = await fetch('/api/chamados');
    const chamados = await resposta.json();

    renderChamados(chamados);
  } catch (erro) {
    listaChamados.innerHTML = 'Erro ao carregar chamados.';
    console.error(erro);
  }
}

async function atualizarStatus(id, novoStatus) {
  try {
    await fetch(`/api/chamados/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });

    carregarChamados();
  } catch (erro) {
    alert('Erro ao atualizar status: ' + erro.message);
  }
}

function avancarStatus(id, statusAtual) {
  const novoStatus = statusAtual === 'Aberto' ? 'Em andamento' : 'Concluído';
  atualizarStatus(id, novoStatus);
}

function retornarStatus(id, statusAtual) {
  const novoStatus = statusAtual === 'Concluído' ? 'Em andamento' : 'Aberto';
  atualizarStatus(id, novoStatus);
}

function renderChamados(chamados) {
  const lista = document.getElementById('lista-chamados');
  lista.innerHTML = '';

  const statusMap = {
    'Aberto': [],
    'Em andamento': [],
    'Concluído': []
  };

  chamados.forEach(ch => {
    if (statusMap[ch.status]) {
      statusMap[ch.status].push(ch);
    }
  });

  const statusClasses = {
    'Aberto': 'status-aberto',
    'Em andamento': 'status-andamento',
    'Concluído': 'status-concluido'
  };

  function criarCard(ch) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${ch.local} - PC ${ch.numero}</h2>
      <p><i class="fas fa-clock"></i>  <strong>Data/hora:</strong> ${ch.data}</p>
      <p><i class="fas fa-chalkboard-teacher"></i>  <strong>Professor:</strong> ${ch.professor}</p>
      <p><i class="fas fa-exclamation-circle"></i> <strong>Problema:</strong> ${ch.problema}</p>
      <p><i class="fas fa-tools"></i> <strong>Equipamentos:</strong> ${(ch.equipamentos || []).join(', ')}</p>
      <p><i class="fas fa-thumbtack"></i> Status: <strong>${ch.status}</strong></p>
      <div class="campo">
        ${ch.status !== 'Aberto' ? `<button class="botao-retornar" onclick="retornarStatus('${ch.id}', '${ch.status}')"><i class="fas fa-arrow-left"></i> Voltar</button>` : ''}
        ${ch.status !== 'Concluído' ? `<button class="botao-avancar" onclick="avancarStatus('${ch.id}', '${ch.status}')">Avançar <i class="fas fa-arrow-right"></i></button>` : ''}
      </div>
    `;
    return card;
  }

  // Limpa antes de renderizar as seções
  lista.innerHTML = '';

  let statusCount = 0;

  for (const status of ['Aberto', 'Em andamento', 'Concluído']) {
    if (statusMap[status].length > 0) {
      statusCount++;
      const secao = document.createElement('section');
      const quantidade = statusMap[status].length;
      const titulo = document.createElement('h2');
      titulo.textContent = `${status} (${quantidade})`;
      secao.appendChild(titulo);
      secao.className = statusClasses[status];
      statusMap[status].forEach(ch => secao.appendChild(criarCard(ch)));
      lista.appendChild(secao);
    }
  }

  // Ajusta colunas da grid conforme o número de status
  if (statusCount === 1) {
    lista.style.gridTemplateColumns = '1fr';
  } else if (statusCount === 2) {
    lista.style.gridTemplateColumns = '1fr 1fr';
  } else {
    lista.style.gridTemplateColumns = '1fr 1fr 1fr';
  }
}
