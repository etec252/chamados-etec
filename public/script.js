const categoriaSelect = document.getElementById('categoria');
const localContainer = document.getElementById('local-container');
const checkboxesDiv = document.getElementById('local-checkboxes');

const locais = {
  "Laboratório": ["1", "2", "3", "4", "5"],
  "Sala": ["1", "2", "3", "4", "5", "6", "7", "Maker"],
  "Multimeios": ["1", "2"],
  "Carrinho": []
};

categoriaSelect.addEventListener('change', function () {
  const categoria = this.value;

  // Limpa qualquer conteúdo anterior
  checkboxesDiv.innerHTML = '';
  localContainer.style.display = 'none';

  // Atualiza visibilidade do campo número (ex: Carrinho não tem locais)
  atualizarCampoNumero();

  // Se categoria for inválida ou sem locais, sai
  if (!categoria || !locais[categoria] || locais[categoria].length === 0) {
    return;
  }

  // Cria os radios para os locais
  locais[categoria].forEach((item, index) => {
    const localName = (item === "Maker" ? "Sala Maker" : `${categoria} ${item}`);
    const id = `local-${index}`;

    const label = document.createElement('label');
    label.innerHTML = `
      <input type="radio" name="local" value="${localName}" id="${id}">
      <span class="custom-checkbox"></span>${localName}
    `;

    checkboxesDiv.appendChild(label);
  });

  // Adiciona os listeners APÓS criar os radios
  const radios = checkboxesDiv.querySelectorAll('input[name="local"]');
  radios.forEach(radio => {
    radio.addEventListener('change', atualizarCampoNumero);
  });

  localContainer.style.display = 'block';

  // Atualiza o campo número caso alguma condição seja verdadeira já
  atualizarCampoNumero();
});


const numeroContainer = document.getElementById('numero-container');
const numeroInput = document.getElementById('numero');

// Função que mostra ou oculta o campo do número do PC
function atualizarCampoNumero() {
  const categoria = categoriaSelect.value;
  const localSelecionado = document.querySelector('input[name="local"]:checked');
  const valorLocal = localSelecionado ? localSelecionado.value : '';

  const deveExibirNumero =
    categoria === 'Laboratório' ||
    categoria === 'Carrinho' ||
    (categoria === 'Sala' && valorLocal.toLowerCase().includes('maker'));

  if (deveExibirNumero) {
    numeroContainer.style.display = 'block';
    numeroInput.required = true;
    numeroInput.type = 'number';
    numeroInput.value = '';
  } else {
    numeroContainer.style.display = 'none';
    numeroInput.required = false;
    numeroInput.type = 'hidden';
    numeroInput.value = 'Professor';
  }
}

atualizarCampoNumero();


document.getElementById('chamadoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const botao = e.target.querySelector('button[type="submit"]');
  botao.disabled = true;
  botao.textContent = 'Enviando...';

  const categoria = categoriaSelect.value;
  const problema = document.getElementById('problema').value.trim();
  const professor = document.getElementById('professor').value.trim();
  const numero = document.getElementById('numero').value.trim();

  const equipamentos = Array.from(document.querySelectorAll('input[name="equipamentos"]:checked'))
    .map(checkbox => checkbox.value);

  // Valida equipamentos
  if (equipamentos.length === 0) {
    alert("Por favor, selecione pelo menos um problema.");
    botao.disabled = false;
    botao.textContent = 'Enviar Chamado';
    return;
  }

  // Valida seleção do local - somente se a categoria tem locais para selecionar
  let local = '';
  if (locais[categoria] && locais[categoria].length > 0) {
    const localSelecionado = document.querySelector('input[name="local"]:checked');
    if (!localSelecionado) {
      alert("Por favor, selecione um local.");
      botao.disabled = false;
      botao.textContent = 'Enviar Chamado';
      return;
    }
    local = localSelecionado.value;
  } else {
    local = categoria;
  }

  try {
    const resposta = await fetch('/api/chamados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local, problema, professor, numero, equipamentos })
    });

    if (!resposta.ok) throw new Error('Erro ao enviar chamado');

    alert('Chamado enviado com sucesso!');
    document.getElementById('chamadoForm').reset();
    localContainer.style.display = 'none'; // Esconde os locais após resetar
  } catch (err) {
    alert('Erro: ' + err.message);
  } finally {
    botao.disabled = false;
    botao.textContent = 'Enviar Chamado';
  }
});
