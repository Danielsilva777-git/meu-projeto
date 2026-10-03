// ===== Seletores =====
const listaLancamentos = document.querySelector('#lista-lancamentos');

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ===== Dados =====
let categorias = {};   // vem do dados.json (entradas/saídas possíveis)
let lancamentos = [];  // vem do localStorage (o que já foi lançado)

// Guarda o id do lançamento que está sendo editado no momento.
// Enquanto for null, nenhuma linha está em modo de edição.
let idEmEdicao = null;

// ===== Carregar dados =====

async function carregarCategorias() {
    try {
        const resposta = await fetch("dados.json");
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
        categorias = await resposta.json();
    } catch (erro) {
        console.log(`Arquivo json não encontrado ${erro}`);
    }
}

function carregarLancamentos() {
    const dadosSalvos = localStorage.getItem('lancamentos');
    if (dadosSalvos) {
        lancamentos = JSON.parse(dadosSalvos);
    }
}

function salvarLancamentos() {
    localStorage.setItem('lancamentos', JSON.stringify(lancamentos));
}

// ===== Renderização =====

function renderizar() {
    listaLancamentos.innerHTML = "";

    if (lancamentos.length === 0) {
        listaLancamentos.innerHTML = `<p style="text-align:center; color:#888;">Nenhum lançamento ainda.</p>`;
        return;
    }

    lancamentos.forEach(lancamento => {
        const linha = (lancamento.id === idEmEdicao)
            ? criarFormularioEdicao(lancamento)
            : criarLinhaVisualizacao(lancamento);

        listaLancamentos.appendChild(linha);
    });
}

// Monta a linha "normal" (modo leitura), com os botões Alterar e Excluir
function criarLinhaVisualizacao(lancamento) {
    const linha = document.createElement('div');
    linha.className = 'linha-lancamento';

    const sinal = lancamento.tipo === "entrada" ? "💰" : "💸";

    // Lançamentos criados antes do campo "data" existir não têm esse valor;
    // nesse caso mostramos um aviso em vez de "Invalid Date".
    const data = lancamento.data
        ? new Date(lancamento.data).toLocaleString("pt-BR")
        : "Data não registrada";

    linha.innerHTML = `
        <div class="info-lancamento">
            <span class="info-principal">${sinal} ${lancamento.categoria} — ${formatter.format(lancamento.valor)}</span>
            <span class="info-data">${data}</span>
        </div>
        <div class="acoes-lancamento">
            <button class="btn-acao btn-alterar" title="Alterar">✏️</button>
            <button class="btn-acao btn-excluir" title="Excluir">🗑️</button>
        </div>
    `;

    // Botão "Alterar": entra em modo de edição para ESTE lançamento
    linha.querySelector('.btn-alterar').addEventListener('click', () => {
        idEmEdicao = lancamento.id;
        renderizar();
    });

    // Botão "Excluir": remove o lançamento pelo id (mesma lógica do script.js)
    linha.querySelector('.btn-excluir').addEventListener('click', () => {
        const confirmar = confirm(`Excluir "${lancamento.categoria} — ${formatter.format(lancamento.valor)}"?`);
        if (!confirmar) return;

        lancamentos = lancamentos.filter(l => l.id !== lancamento.id);
        salvarLancamentos();
        renderizar();
    });

    return linha;
}

// Monta a linha em modo de edição: selects e input já preenchidos
// com os valores atuais do lançamento, prontos para alterar.
function criarFormularioEdicao(lancamento) {
    const linha = document.createElement('div');
    linha.className = 'linha-lancamento linha-editando';

    linha.innerHTML = `
        <select class="edit-tipo">
            <option value="entrada">💰 Entradas</option>
            <option value="saida">💸 Saidas</option>
        </select>

        <select class="edit-categoria"></select>

        <input type="number" class="edit-valor" value="${lancamento.valor}">

        <div class="acoes-lancamento">
            <button class="btn-acao btn-salvar" title="Salvar">💾</button>
            <button class="btn-acao btn-cancelar" title="Cancelar">✖</button>
        </div>
    `;

    const selectTipo = linha.querySelector('.edit-tipo');
    const selectCategoria = linha.querySelector('.edit-categoria');

    // Preenche o select de categorias de acordo com o tipo escolhido,
    // mantendo a categoria atual do lançamento selecionada (se existir na lista)
    function popularCategorias(tipoEscolhido, categoriaParaSelecionar) {
        selectCategoria.innerHTML = "";
        const lista = categorias[tipoEscolhido] || [];
        lista.forEach(nome => {
            const opcao = new Option(nome, nome);
            if (nome === categoriaParaSelecionar) opcao.selected = true;
            selectCategoria.appendChild(opcao);
        });
    }

    // Estado inicial do formulário = dados atuais do lançamento
    selectTipo.value = lancamento.tipo;
    popularCategorias(lancamento.tipo, lancamento.categoria);

    // Se o usuário trocar entradas/saídas durante a edição,
    // a lista de categorias precisa atualizar também
    selectTipo.addEventListener('change', () => {
        popularCategorias(selectTipo.value, null);
    });

    // Botão "Salvar": grava as alterações de volta no lançamento
    linha.querySelector('.btn-salvar').addEventListener('click', () => {
        const novoTipo = selectTipo.value;
        const novaCategoria = selectCategoria.value;
        const novoValor = Number(linha.querySelector('.edit-valor').value);

        if (novaCategoria === "" || novoValor === 0 || isNaN(novoValor)) {
            alert("Preencher os campos corretamente");
            return;
        }

        // Encontra o lançamento original dentro do array pelo id
        // e atualiza seus campos, sem mexer nos outros lançamentos.
        const alvo = lancamentos.find(l => l.id === lancamento.id);
        alvo.tipo = novoTipo;
        alvo.categoria = novaCategoria;
        alvo.valor = novoValor;
        alvo.data = new Date().toISOString(); // atualiza para a data/hora da edição

        idEmEdicao = null;
        salvarLancamentos();
        renderizar();
    });

    // Botão "Cancelar": sai do modo de edição sem salvar nada
    linha.querySelector('.btn-cancelar').addEventListener('click', () => {
        idEmEdicao = null;
        renderizar();
    });

    return linha;
}

// ===== Inicialização =====
(async function iniciar() {
    await carregarCategorias();
    carregarLancamentos();
    renderizar();
})();