
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