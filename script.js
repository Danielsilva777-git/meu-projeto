// Seletores dos selects 
const rendas_gastos = document.querySelector('#valores'); //Selector de entrada das categorias 
const movimentaçao = document.querySelector('#movimentação');// selector de entradas e saidas
const btn_add = document.querySelector('#btn-adicionar');
const input = document.getElementById("input");
const div = document.querySelector('.divs');
const resultado = document.querySelector('.resultado');

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

movimentaçao.addEventListener('change', () => {
    const valor = movimentaçao.options[movimentaçao.selectedIndex].value;
    valor_selecionado(valor);
});


btn_add.addEventListener('click', addvalores);

let categorias = {};

async function json() {
    try {
        const resposta = await fetch("dados.json");
        if (!resposta.ok) {
            throw new Error(`Erro: ${resposta.status}`);
        }
        const dados = await resposta.json();
        categorias = dados;
        
    } catch (erro) {
        console.log(`Arquivo json não encontrado ${erro}`);
    }
}

// identificando o valor selecionado no select de tipo de entrada
function valor_selecionado(valor) {
    rendas_gastos.innerHTML = "";

    const lista = categorias[valor]; // entrada ou saída
    if (!lista) return;

    lista.forEach(itens => {
        rendas_gastos.appendChild(new Option(itens, itens));
    });
}

// Lista de lançamentos: guarda categoria, valor E o tipo (entrada/saida)
// -> isso é o que faltava para dar pra calcular o saldo depois
let lancamentos = [];

// salvar o array de lançamentos no localStorage
function salvarDados(){
  localStorage.setItem('lancamentos', JSON.stringify(lancamentos));
}

// Lê o localStorage e recupera os lançamentos salvos
function carregarDados(){
  const dadosSalvos = localStorage.getItem('lancamentos');
  if(dadosSalvos){
    lancamentos = JSON.parse(dadosSalvos);
  }
}

function addvalores() {
    const tipo = movimentaçao.value;       // "entrada" ou "saida"
    const categoria = rendas_gastos.value;
    const valorInput = Number(input.value);

    // obs na criaçao da chave valor, foi criada normal sem abreviação devido ela ser do tipo number
    if (valorInput !== 0 && categoria !== "" && !isNaN(valorInput)) {
        lancamentos.push({ tipo, categoria, valor: valorInput });
         salvarDados(); // salvar sempre que adicionar 
        renderizarTela();
    } else {
        alert("Preencher os campos em branco");
        return;
    }

    input.value = "";
    input.focus();
}

// Remonta os cards (agrupados por categoria) e recalcula o saldo total
function renderizarTela() {
    div.innerHTML = "";

    const totaisPorCategoria = {};
    lancamentos.forEach(({ categoria, valor }) => {
        if (!totaisPorCategoria[categoria]) totaisPorCategoria[categoria] = 0;
        totaisPorCategoria[categoria] += valor;
    });

    for (let categoria in totaisPorCategoria) {
        const card = document.createElement('div');
        card.className = 'cards';
        card.innerHTML = `<span>${categoria}:</span> <span>${formatter.format(totaisPorCategoria[categoria])}</span>`;                                                                               
        div.appendChild(card);
    }

    const totalEntradas = lancamentos
        .filter(l => l.tipo === "entrada")
        .reduce((soma, l) => soma + l.valor, 0);

    const totalSaidas = lancamentos
        .filter(l => l.tipo === "saida")
        .reduce((soma, l) => soma + l.valor, 0);

    const saldo = totalEntradas - totalSaidas;

    resultado.innerHTML = `
        <p>Entradas: ${formatter.format(totalEntradas)}</p>
        <p>Saídas: ${formatter.format(totalSaidas)}</p>
        <p><strong>Saldo: ${formatter.format(saldo)}</strong></p>
    `;
}

function remover() {

}

// Inicialização: carrega o JSON e já popula o select de categorias
// com base no valor padrão do select de movimentação
(async function iniciar() {
    await json();
    valor_selecionado(movimentaçao.value);
    carregarDados(); // recupera lançamentos salvos
    renderizarTela(); // Já mostra os cards e o saldo ao abrir 

})();