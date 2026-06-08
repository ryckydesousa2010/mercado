// Elementos da página
const form = document.getElementById('formProduto');
const tabela = document.getElementById('tabelaProdutos').querySelector('tbody');
const alertaEstoque = document.getElementById('alertaEstoque');
const listaAlerta = document.getElementById('listaAlerta');
const alertaValidade = document.getElementById('alertaValidade');
const listaValidade = document.getElementById('listaValidade');
const selectProduto = document.getElementById('produtoVenda');
const btnAdicionar = document.getElementById('btnAdicionar');
const tabelaCarrinho = document.getElementById('tabelaCarrinho').querySelector('tbody');
const valorTotalBrutoEl = document.getElementById('valorTotalBruto');
const valorTotalEl = document.getElementById('valorTotal');
const valorPagoEl = document.getElementById('valorPago');
const btnCalcularTroco = document.getElementById('calcularTroco');
const resultadoTroco = document.getElementById('resultadoTroco');
const btnFinalizar = document.getElementById('finalizarVenda');

// Elementos Desconto/Acrescimo
const tipoOperacao = document.getElementById('tipoOperacao');
const tipoValor = document.getElementById('tipoValor');
const valorOperacao = document.getElementById('valorOperacao');
const btnAplicarOperacao = document.getElementById('aplicarOperacao');
const textoOperacao = document.getElementById('textoOperacao');

// Elementos das abas
const botoesAba = document.querySelectorAll('.aba-btn');
const conteudosAba = document.querySelectorAll('.aba-conteudo');

// Elementos da edição
const selecionaProdutoEditar = document.getElementById('selecionaProdutoEditar');
const formEdicao = document.getElementById('formEdicao');
const indiceEdicao = document.getElementById('indiceEdicao');
const editaNome = document.getElementById('editaNome');
const editaCusto = document.getElementById('editaCusto');
const editaPreco = document.getElementById('editaPreco');
const editaQtd = document.getElementById('editaQtd');
const editaEstoqueMin = document.getElementById('editaEstoqueMin');
const editaValidade = document.getElementById('editaValidade');

// Elementos relatórios
const btnExportarExcel = document.getElementById('btnExportarExcel');
const btnImprimirRelatorio = document.getElementById('btnImprimirRelatorio');
const dataRelatorio = document.getElementById('dataRelatorio');
const tabelaRelatorio = document.getElementById('tabelaRelatorio').querySelector('tbody');
const lucroTotalGeral = document.getElementById('lucroTotalGeral');

// Elementos histórico
const filtroData = document.getElementById('filtroData');
const btnFiltrarData = document.getElementById('btnFiltrarData');
const btnLimparFiltro = document.getElementById('btnLimparFiltro');
const totalPeriodo = document.getElementById('totalPeriodo');
const tabelaHistorico = document.getElementById('tabelaHistorico').querySelector('tbody');
const btnExportarHistorico = document.getElementById('btnExportarHistorico');
const btnImprimirHistorico = document.getElementById('btnImprimirHistorico');
const areaImpressaoHistorico = document.getElementById('areaImpressaoHistorico');
const periodoImpressao = document.getElementById('periodoImpressao');
const tabelaImpressaoHistorico = document.getElementById('tabelaImpressaoHistorico').querySelector('tbody');

// Dados
let produtos = [];
let carrinho = [];
let valorTotalBruto = 0;
let valorAjuste = 0;
let tipoAjusteTexto = '';
let historicoVendas = [];

// -------------------- SALVAMENTO --------------------
function salvarDados() {
    localStorage.setItem('mercadinho_produtos', JSON.stringify(produtos));
    localStorage.setItem('mercadinho_historico', JSON.stringify(historicoVendas));
}

function carregarDados() {
    const dadosSalvos = localStorage.getItem('mercadinho_produtos');
    if (dadosSalvos) produtos = JSON.parse(dadosSalvos);
    const historicoSalvo = localStorage.getItem('mercadinho_historico');
    if (historicoSalvo) historicoVendas = JSON.parse(historicoSalvo);
}

// -------------------- CONTROLE DE ABAS --------------------
botoesAba.forEach(botao => {
    botao.addEventListener('click', function() {
        botoesAba.forEach(btn => btn.classList.remove('ativa'));
        conteudosAba.forEach(cont => cont.classList.remove('ativa'));
        this.classList.add('ativa');
        const abaAtiva = this.getAttribute('data-aba');
        document.getElementById(abaAtiva).classList.add('ativa');
        
        if (abaAtiva === 'editar') atualizarSelectEdicao();
        if (abaAtiva === 'relatorios') preencherRelatorio();
        if (abaAtiva === 'historico') carregarHistorico();
    });
});

// -------------------- CADASTRO DE PRODUTO (COM CUSTO E VALIDADE) --------------------
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeProduto').value;
    const precoCusto = parseFloat(document.getElementById('precoCusto').value);
    const precoVenda = parseFloat(document.getElementById('precoProduto').value);
    const quantidade = parseInt(document.getElementById('qtdProduto').value);
    const estoqueMinimo = parseInt(document.getElementById('estoqueMinimo').value);
    const validade = document.getElementById('validadeProduto').value;

    produtos.push({ nome, precoCusto, precoVenda, quantidade, estoqueMinimo, validade });
    salvarDados();
    atualizarTabela();
    atualizarSelectProdutos();
    verificarAlertas();
    form.reset();
});

// -------------------- ATUALIZAR TABELA PRINCIPAL --------------------
function atualizarTabela() {
    tabela.innerHTML = '';
    produtos.forEach((produto, index) => {
        const lucroUnit = (produto.precoVenda - produto.precoCusto).toFixed(2);
        const estoqueBaixo = produto.quantidade <= produto.estoqueMinimo ? 'aviso-estoque' : '';
        
        // Status validade
        const hoje = new Date();
        const dataVal = new Date(produto.validade);
        let statusValidade = '';
        let classeValidade = '';
        
        if(dataVal < hoje) {
            statusValidade = 'VENCIDO';
            classeValidade = 'aviso-vencido';
        } else {
            const diffDias = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
            if(diffDias <= 30) {
                statusValidade = `Vence em ${diffDias} dias`;
                classeValidade = 'aviso-proximo';
            } else {
                statusValidade = 'Normal';
            }
        }

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.precoVenda.toFixed(2)}</td>
            <td>R$ ${produto.precoCusto.toFixed(2)}</td>
            <td>R$ ${lucroUnit}</td>
            <td class="${estoqueBaixo}">${produto.quantidade}</td>
            <td class="${classeValidade}">${new Date(produto.validade).toLocaleDateString('pt-BR')}<br><small>${statusValidade}</small></td>
            <td>
                <button class="btn-editar" onclick="prepararEdicao(${index})">Editar</button>
                <button class="btn-excluir" onclick="excluirProduto(${index})">Excluir</button>
            </td>
        `;
        tabela.appendChild(linha);
    });
}

// -------------------- EDIÇÃO --------------------
function atualizarSelectEdicao() {
    selecionaProdutoEditar.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach((p, i) => {
        const opcao = document.createElement('option');
        opcao.value = i;
        opcao.textContent = p.nome;
        selecionaProdutoEditar.appendChild(opcao);
    });
}

function prepararEdicao(index) {
    const produto = produtos[index];
    indiceEdicao.value = index;
    editaNome.value = produto.nome;
    editaCusto.value = produto.precoCusto;
    editaPreco.value = produto.precoVenda;
    editaQtd.value = produto.quantidade;
    editaEstoqueMin.value = produto.estoqueMinimo;
    editaValidade.value = produto.validade;
    document.querySelector('[data-aba="editar"]').click();
}

selecionaProdutoEditar.addEventListener('change', function() {
    const index = parseInt(this.value);
    if(!isNaN(index)) prepararEdicao(index);
    else formEdicao.reset();
});

formEdicao.addEventListener('submit', function(e) {
    e.preventDefault();
    const index = parseInt(indiceEdicao.value);
    produtos[index] = {
        nome: editaNome.value,
        precoCusto: parseFloat(editaCusto.value),
        precoVenda: parseFloat(editaPreco.value),
        quantidade: parseInt(editaQtd.value),
        estoqueMinimo: parseInt(editaEstoqueMin.value),
        validade: editaValidade.value
    };
    salvarDados();
    atualizarTabela();
    atualizarSelectProdutos();
    verificarAlertas();
    alert('✅ Produto salvo!');
    formEdicao.reset();
});

// -------------------- EXCLUIR --------------------
function excluirProduto(index) {
    if(confirm('Deseja excluir este produto?')) {
        produtos.splice(index, 1);
        salvarDados();
        atualizarTabela();
        atualizarSelectProdutos();
        verificarAlertas();
    }
}

// -------------------- ALERTAS DE ESTOQUE E VALIDADE --------------------
function verificarAlertas() {
    const hoje = new Date();
    
    // Alerta Estoque
    const baixos = produtos.filter(p => p.quantidade <= p.estoqueMinimo);
    alertaEstoque.style.display = baixos.length ? 'block' : 'none';
    listaAlerta.innerHTML = baixos.map(p => `<li>${p.nome} (${p.quantidade} un)</li>`).join('');

    // Alerta Validade
    const vencidosOuProximos = produtos.filter(p => {
        const v = new Date(p.validade);
        const diff = Math.ceil((v - hoje) / (1000*60*60*24));
        return v < hoje || diff <= 30;
    });
    alertaValidade.style.display = vencidosOuProximos.length ? 'block' : 'none';
    listaValidade.innerHTML = vencidosOuProximos.map(p => {
        const v = new Date(p.validade);
        const diff = Math.ceil((v - hoje) / (1000*60*60*24));
        return `<li>${p.nome}: ${v < hoje ? '❌ VENCIDO' : `⏳ Vence em ${diff} dias`}</li>`;
    }).join('');
}

// -------------------- VENDAS + DESCONTO/ACRÉSCIMO --------------------
function atualizarSelectProdutos() {
    selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach((p, i) => {
        const opcao = document.createElement('option');
        opcao.value = i;
        opcao.textContent = `${p.nome} - R$ ${p.precoVenda.toFixed(2)}`;
        selectProduto.appendChild(opcao);
    });
}

btnAdicionar.addEventListener('click', () => {
    const indice = parseInt(selectProduto.value);
    const qtd = parseInt(document.getElementById('qtdVenda').value);
    if(isNaN(indice) || isNaN(qtd) || qtd <= 0) return alert('Dados inválidos!');
    
    const prod = produtos[indice];
    if(qtd > prod.quantidade) return alert(`Estoque insuficiente: ${prod.quantidade} disponíveis`);

    carrinho.push({ 
        indiceProduto: indice, 
        nome: prod.nome, 
        preco: prod.precoVenda, 
        custo: prod.precoCusto,
        quantidade: qtd, 
        subtotal: prod.precoVenda * qtd 
    });
    atualizarCarrinho();
    document.getElementById('qtdVenda').value = '';
    valorAjuste = 0;
    textoOperacao.textContent = '';
});

function atualizarCarrinho() {
    tabelaCarrinho.innerHTML = '';
    valorTotalBruto = 0;
    carrinho.forEach((item, i) => {
        valorTotalBruto += item.subtotal;
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${item.nome}</td><td>${item.quantidade}</td><td>R$ ${item.preco.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td><td><button class="btn-excluir" onclick="removerItem(${i})">X</button></td>
        `;
        tabelaCarrinho.appendChild(linha);
    });
    valorTotalBrutoEl.textContent = valorTotalBruto.toFixed(2);
    calcularTotalFinal();
}

function removerItem(i) {
    carrinho.splice(i,1);
    atualizarCarrinho();
}

// Aplicar Desconto ou Acréscimo
btnAplicarOperacao.addEventListener('click', () => {
    if(valorTotalBruto <= 0) return alert('Adicione itens ao carrinho primeiro!');
    const valor = parseFloat(valorOperacao.value);
    if(isNaN(valor) || valor < 0) return alert('Valor inválido!');

    let calculo = 0;
    const tipoOp = tipoOperacao.value;
    const tipoVal = tipoValor.value;

    if(tipoVal === 'porcentagem') {
        calculo = (valorTotalBruto * valor) / 100;
        tipoAjusteTexto = `${tipoOp === 'desconto' ? 'Desconto' : 'Acréscimo'} de ${valor}%`;
    } else {
        calculo = valor;
        tipoAjusteTexto = `${tipoOp === 'desconto' ? 'Desconto' : 'Acréscimo'} de R$ ${valor.toFixed(2)}`;
    }

    valorAjuste = tipoOp === 'desconto' ? -calculo : calculo;
    textoOperacao.textContent = tipoAjusteTexto;
    calcularTotalFinal();
    valorOperacao.value = '';
});

function calcularTotalFinal() {
    const total = valorTotalBruto + valorAjuste;
    valorTotalEl.textContent = total > 0 ? total.toFixed(2) : '0,00';
}

// Troco
btnCalcularTroco.addEventListener('click', () => {
    const pago = parseFloat(valorPagoEl.value);
    const totalFinal = valorTotalBruto + valorAjuste;
    if(isNaN(pago) || pago < totalFinal) {
        resultadoTroco.textContent = '❌ Valor insuficiente ou inválido!';
        resultadoTroco.style.color = '#e74c3c';
        return;
    }
    resultadoTroco.textContent = `✅ Troco: R$ ${(pago - totalFinal).toFixed(2)}`;
    resultadoTroco.style.color = '#27ae60';
});

// Finalizar Venda
btnFinalizar.addEventListener('click', () => {
    if(carrinho.length === 0) return alert('Carrinho vazio!');
    const totalFinal = valorTotalBruto + valorAjuste;
    if(totalFinal <= 0) return alert('Valor total inválido!');

    // Dar baixa no estoque
    let lucroVenda = 0;
    carrinho.forEach(item => {
        produtos[item.indiceProduto].quantidade -= item.quantidade;
        lucroVenda += (item.preco - item.custo) * item.quantidade;
    });

    // Registrar no histórico
    const dataHora = new Date();
    historicoVendas.unshift({
        data: dataHora.toLocaleDateString('pt-BR'),
        hora: dataHora.toLocaleTimeString('pt-BR'),
        dataISO: dataHora.toISOString().split('T')[0],
        produtos: carrinho.map(i => `${i.nome} (${i.quantidade}x)`).join(', '),
        totalBruto: valorTotalBruto,
        ajuste: valorAjuste,
        textoAjuste: tipoAjusteTexto || 'Nenhum',
        totalFinal: totalFinal,
        lucroVenda: lucroVenda
    });

    salvarDados();
    carrinho = [];
    valorAjuste = 0;
    tipoAjusteTexto = '';
    atualizarCarrinho();
    verificarAlertas();
    alert('✅ Venda finalizada e registrada!');
});

// -------------------- RELATÓRIOS --------------------
function preencherRelatorio() {
    const hoje = new Date();
    dataRelatorio.textContent = hoje.toLocaleDateString('pt-BR') + ' ' + hoje.toLocaleTimeString('pt-BR');
    tabelaRelatorio.innerHTML = '';
    let lucroGeral = 0;

    produtos.forEach(p => {
        const lucroUnit = p.precoVenda - p.precoCusto;
        const margem = p.precoCusto > 0 ? ((lucroUnit / p.precoCusto) * 100).toFixed(1) + '%' : '0%';
        const lucroEstoque = lucroUnit * p.quantidade;
        lucroGeral += lucroEstoque;

        // Status validade
        const dataVal = new Date(p.validade);
        let status = 'Normal';
        let classe = '';
        if(dataVal < hoje) { status = 'VENCIDO'; classe = 'aviso-vencido'; }
        else if(Math.ceil((dataVal - hoje)/(1000*60*60*24)) <=30) { status = 'Próx. Vencer'; classe = 'aviso-proximo'; }
        else if(p.quantidade <= p.estoqueMinimo) { status = 'Estoque Baixo'; classe = 'aviso-estoque'; }

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${p.nome}</td>
            <td>R$ ${p.precoCusto.toFixed(2)}</td>
            <td>R$ ${p.precoVenda.toFixed(2)}</td>
            <td>R$ ${lucroUnit.toFixed(2)}</td>
            <td>${margem}</td>
            <td>${p.quantidade}</td>
            <td>${dataVal.toLocaleDateString('pt-BR')}</td>
            <td class="${classe}">${status}</td>
        `;
        tabelaRelatorio.appendChild(linha);
    });

    lucroTotalGeral.textContent = lucroGeral.toFixed(2);
}

btnExportarExcel.addEventListener('click', () => {
    const dados = produtos.map(p => ({
        Nome: p.nome,
        'Preço Custo': p.precoCusto.toFixed(2),
        'Preço Venda': p.precoVenda.toFixed(2),
        'Lucro Unitário': (p.precoVenda - p.precoCusto).toFixed(2),
        Estoque: p.quantidade,
        'Validade': new Date(p.validade).toLocaleDateString('pt-BR')
    }));
    XLSX.writeFile(XLSX.utils.book_new(), 'relatorio_produtos.xlsx');
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), XLSX.utils.json_to_sheet(dados), 'Produtos');
});

btnImprimirRelatorio.addEventListener('click', () => window.print());

// -------------------- HISTÓRICO --------------------
function carregarHistorico(filtrarData = null) {
    let dados = [...historicoVendas];
    if(filtrarData) dados = dados.filter(v => v.dataISO === filtrarData);
    
    tabelaHistorico.innerHTML = '';
    let totalGeral = 0;

    dados.forEach(v => {
        totalGeral += v.totalFinal;
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${v.data} ${v.hora}</td>
            <td>${v.produtos}</td>
            <td>R$ ${v.totalBruto.toFixed(2)}</td>
            <td>${v.textoAjuste} (R$ ${v.ajuste.toFixed(2)})</td>
            <td><strong>R$ ${v.totalFinal.toFixed(2)}</strong></td>
            <td>R$ ${v.lucroVenda.toFixed(2)}</td>
        `;
        tabelaHistorico.appendChild(linha);
    });

    totalPeriodo.textContent = totalGeral.toFixed(2);
}

btnFiltrarData.addEventListener('click', () => filtroData.value && carregarHistorico(filtroData.value));
btnLimparFiltro.addEventListener('click', () => { filtroData.value = ''; carregarHistorico(); });

btnExportarHistorico.addEventListener('click', () => {
    const dados = historicoVendas.map(v => ({
        Data: v.data, Hora: v.hora, Produtos: v.produtos,
        'Total Bruto': v.totalBruto.toFixed(2), Ajuste: v.textoAjuste,
        'Total Final': v.totalFinal.toFixed(2), 'Lucro': v.lucroVenda.toFixed(2)
    }));
    XLSX.writeFile(XLSX.utils.book_new(), 'historico_vendas.xlsx');
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), XLSX.utils.json_to_sheet(dados), 'Vendas');
});

btnImprimirHistorico.addEventListener('click', {
    beforeprint: () => areaImpressaoHistorico.style.display = 'block',
    afterprint: () => areaImpressaoHistorico.style.display = 'none'
});
btnImprimirHistorico.addEventListener('click', () => window.print());

// -------------------- INICIALIZAÇÃO --------------------
carregarDados();
atualizarTabela();
atualizarSelectProdutos();
verificarAlertas();