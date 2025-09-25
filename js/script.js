
let receitas = [];
let despesasFixas = [];
let despesasVariaveis = [];
let comprasCartao = [];
let beneficios = [];
let historicoBeneficios = [];
let parcelasCartao = [];


let editandoIndex = -1;
let tipoEditando = '';


const saldoDisponivelEl = document.getElementById('saldo-disponivel');
const receitasTotaisEl = document.getElementById('receitas-totais');
const despesasFixasEl = document.getElementById('despesas-fixas');
const despesasVariaveisEl = document.getElementById('despesas-variáveis');
const alertMessageEl = document.getElementById('alert-message');
const themeToggle = document.getElementById('theme-toggle');


let chartDespesas, chartEvolucao, chartComparativo, chartBeneficios;


function inicializarAplicacao() {
    carregarDados();
    atualizarDashboard();
    configurarEventListeners();
    configurarTema();
    configurarDatasPadrao();
    inicializarGraficos();
    processarParcelasCartao();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAplicacao);
} else {
    inicializarAplicacao();
}


function configurarTema() {
    const temaSalvo = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaSalvo);
    
    const icon = themeToggle.querySelector('i');
    icon.className = temaSalvo === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    themeToggle.addEventListener('click', function() {
        const temaAtual = document.documentElement.getAttribute('data-theme');
        const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', novoTema);
        localStorage.setItem('tema', novoTema);
        
        icon.className = novoTema === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}


function configurarDatasPadrao() {
    const hoje = new Date().toISOString().split('T')[0];
    
    
    const camposData = [
        'data-receita', 'vencimento-despesa-fixa', 'data-despesa-variavel', 
        'data-beneficio', 'vencimento-rapido-fixa', 'data-compra-cartao'
    ];
    
    camposData.forEach(campo => {
        const element = document.getElementById(campo);
        if (element) element.value = hoje;
    });
    
    
    const proximoMes = new Date();
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    document.getElementById('vencimento-rapido-fixa').value = proximoMes.toISOString().split('T')[0];
}


function inicializarGraficos() {
    const ctxDespesas = document.getElementById('chart-despesas')?.getContext('2d');
    const ctxEvolucao = document.getElementById('chart-evolucao')?.getContext('2d');
    const ctxComparativo = document.getElementById('chart-comparativo')?.getContext('2d');
    const ctxBeneficios = document.getElementById('chart-beneficios')?.getContext('2d');
    
    if (ctxDespesas) {
        chartDespesas = new Chart(ctxDespesas, {
            type: 'doughnut',
            data: {
                labels: ['Carregando...'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    if (ctxEvolucao) {
        chartEvolucao = new Chart(ctxEvolucao, {
            type: 'line',
            data: {
                labels: ['Carregando...'],
                datasets: []
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    if (ctxComparativo) {
        chartComparativo = new Chart(ctxComparativo, {
            type: 'bar',
            data: {
                labels: ['Carregando...'],
                datasets: []
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    if (ctxBeneficios) {
        chartBeneficios = new Chart(ctxBeneficios, {
            type: 'pie',
            data: {
                labels: ['Carregando...'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}


function carregarDados() {
    const dadosSalvos = localStorage.getItem('controleFinanceiro');
    
    if (dadosSalvos) {
        try {
            const dados = JSON.parse(dadosSalvos);
            receitas = dados.receitas || [];
            despesasFixas = dados.despesasFixas || [];
            despesasVariaveis = dados.despesasVariaveis || [];
            comprasCartao = dados.comprasCartao || [];
            beneficios = dados.beneficios || [];
            historicoBeneficios = dados.historicoBeneficios || [];
            parcelasCartao = dados.parcelasCartao || [];
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            mostrarAlerta('Erro ao carregar dados salvos', 'danger');
        }
    }
    
    atualizarTabelas();
    atualizarRelatorios();
    atualizarGraficos();
}


function salvarDados() {
    const dados = {
        receitas,
        despesasFixas,
        despesasVariaveis,
        comprasCartao,
        beneficios,
        historicoBeneficios,
        parcelasCartao,
        ultimaAtualizacao: new Date().toISOString(),
        versao: '3.1'
    };
    
    localStorage.setItem('controleFinanceiro', JSON.stringify(dados));
}


function atualizarDashboard() {
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesasFixas = despesasFixas.reduce((total, despesa) => total + despesa.valor, 0);
    const totalDespesasVariaveis = despesasVariaveis.reduce((total, despesa) => total + despesa.valor, 0);
    
    
    const totalParcelasPendentes = parcelasCartao
        .filter(parcela => parcela.status === 'pendente' || parcela.status === 'atrasada')
        .reduce((total, parcela) => total + parcela.valor, 0);
    
    const totalBeneficios = beneficios.reduce((total, beneficio) => total + beneficio.valor, 0);
    
    
    const beneficiosUtilizados = historicoBeneficios.reduce((total, uso) => total + uso.valorUtilizado, 0);
    const saldoBeneficios = totalBeneficios - beneficiosUtilizados;
    
    receitasTotaisEl.textContent = formatarMoeda(totalReceitas);
    despesasFixasEl.textContent = formatarMoeda(totalDespesasFixas);
    despesasVariaveisEl.textContent = formatarMoeda(totalDespesasVariaveis + totalParcelasPendentes);
    
    
    const saldoDisponivel = totalReceitas - totalDespesasFixas - totalDespesasVariaveis - totalParcelasPendentes + saldoBeneficios;
    saldoDisponivelEl.textContent = formatarMoeda(saldoDisponivel);
    saldoDisponivelEl.className = 'amount ' + (saldoDisponivel >= 0 ? 'positive' : 'negative');
    
    atualizarTendencias(totalReceitas, totalDespesasFixas, totalDespesasVariaveis, saldoBeneficios);
}


function atualizarTendencias(totalReceitas, totalDespesasFixas, totalDespesasVariaveis, saldoBeneficios) {
    const trends = document.querySelectorAll('.trend');
    
    trends.forEach(trend => {
        const card = trend.closest('.card');
        if (!card) return;
        
        const amountEl = card.querySelector('.amount');
        if (!amountEl) return;
        
        if (amountEl.id === 'saldo-disponivel') {
            const totalParcelasPendentes = parcelasCartao
                .filter(parcela => parcela.status === 'pendente' || parcela.status === 'atrasada')
                .reduce((total, parcela) => total + parcela.valor, 0);
                
            const saldo = totalReceitas - totalDespesasFixas - totalDespesasVariaveis - totalParcelasPendentes + saldoBeneficios;
            
            if (saldo > 0) {
                trend.innerHTML = '<i class="fas fa-arrow-up"></i><span>Saldo positivo</span>';
                trend.className = 'trend positive';
            } else if (saldo < 0) {
                trend.innerHTML = '<i class="fas fa-arrow-down"></i><span>Saldo negativo</span>';
                trend.className = 'trend negative';
            } else {
                trend.innerHTML = '<i class="fas fa-minus"></i><span>Saldo zerado</span>';
                trend.className = 'trend neutral';
            }
        }
    });
}


function descontarDoBeneficio(tipoBeneficio, valor, descricao) {
    const beneficio = beneficios.find(b => b.tipo === tipoBeneficio);
    if (!beneficio) {
        mostrarAlerta('Benefício não encontrado!', 'danger');
        return false;
    }
    
    const saldoBeneficio = calcularSaldoBeneficio(tipoBeneficio);
    if (valor > saldoBeneficio) {
        mostrarAlerta(`Saldo insuficiente no ${formatarTipoBeneficio(tipoBeneficio)}!`, 'danger');
        return false;
    }
    
    historicoBeneficios.push({
        id: Date.now(),
        tipoBeneficio,
        valorUtilizado: valor,
        descricao,
        data: new Date().toISOString().split('T')[0],
        dataUtilizacao: new Date().toISOString()
    });
    
    mostrarAlerta(`Descontado R$ ${valor.toFixed(2)} do ${formatarTipoBeneficio(tipoBeneficio)}`, 'success');
    return true;
}


function reverterDescontoBeneficio(tipoBeneficio, valor, descricao) {
    const usos = historicoBeneficios
        .filter(h => h.tipoBeneficio === tipoBeneficio && h.descricao === descricao)
        .sort((a, b) => new Date(b.dataUtilizacao) - new Date(a.dataUtilizacao));
    
    if (usos.length > 0) {
        const ultimoUso = usos[0];
        if (ultimoUso.valorUtilizado === valor) {
            const index = historicoBeneficios.indexOf(ultimoUso);
            historicoBeneficios.splice(index, 1);
            mostrarAlerta(`Desconto de R$ ${valor.toFixed(2)} revertido do ${formatarTipoBeneficio(tipoBeneficio)}`, 'success');
            return true;
        }
    }
    
    mostrarAlerta('Não foi possível reverter o desconto do benefício', 'danger');
    return false;
}


function calcularSaldoBeneficio(tipoBeneficio) {
    const totalBeneficio = calcularTotalBeneficio(tipoBeneficio);
    const utilizado = historicoBeneficios
        .filter(h => h.tipoBeneficio === tipoBeneficio)
        .reduce((total, h) => total + h.valorUtilizado, 0);
    
    return totalBeneficio - utilizado;
}


function calcularTotalBeneficio(tipoBeneficio) {
    return beneficios
        .filter(b => b.tipo === tipoBeneficio)
        .reduce((total, b) => total + b.valor, 0);
}


function getSaldoValeAlimentacao() {
    return calcularSaldoBeneficio('vale-alimentacao');
}

function getSaldoValeTransporte() {
    return calcularSaldoBeneficio('vale-transporte');
}


function processarParcelasCartao() {
    parcelasCartao = [];
    
    comprasCartao.forEach(compra => {
        const dataCompra = new Date(compra.dataCompra);
        const valorParcela = compra.valorTotal / compra.parcelas;
        
        for (let i = 0; i < compra.parcelas; i++) {
            const dataVencimento = new Date(dataCompra);
            dataVencimento.setMonth(dataVencimento.getMonth() + i + 1);
            
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = new Date(dataVencimento);
            vencimento.setHours(0, 0, 0, 0);
            
            let status = 'pendente';
            if (vencimento < hoje) {
                status = 'atrasada';
            }
            
            parcelasCartao.push({
                id: `${compra.id}-${i + 1}`,
                compraId: compra.id,
                descricao: compra.descricao,
                parcela: i + 1,
                totalParcelas: compra.parcelas,
                valor: valorParcela,
                dataVencimento: dataVencimento.toISOString().split('T')[0],
                status: status,
                categoria: compra.categoria
            });
        }
    });
    
    salvarDados();
}


function atualizarTabelas(tabelaEspecifica = null) {
    const atualizacoes = {
        'receitas': atualizarTabelaReceitas,
        'despesasFixas': atualizarTabelaDespesasFixas,
        'despesasVariaveis': atualizarTabelaDespesasVariaveis,
        'cartaoCredito': atualizarTabelaCartaoCredito,
        'parcelas': atualizarTabelaParcelas,
        'beneficios': atualizarTabelaBeneficios
    };
    
    if (tabelaEspecifica && atualizacoes[tabelaEspecifica]) {
        atualizacoes[tabelaEspecifica]();
    } else {
        Object.values(atualizacoes).forEach(fn => fn());
    }
    
    atualizarDashboard();
    atualizarRelatorios();
    
    if (!tabelaEspecifica || tabelaEspecifica !== 'beneficios') {
        atualizarGraficos();
    }
}


function atualizarTabelaReceitas() {
    const tbody = document.querySelector('#tabela-receitas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (receitas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">Nenhuma receita cadastrada</td></tr>';
        return;
    }
    
    const receitasOrdenadas = [...receitas].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    receitasOrdenadas.forEach((receita, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${receita.descricao}</td>
            <td>${formatarMoeda(receita.valor)}</td>
            <td><span class="badge ${receita.tipo === 'fixa' ? 'badge-primary' : 'badge-secondary'}">${receita.tipo === 'fixa' ? 'Fixa' : 'Variável'}</span></td>
            <td>${formatarData(receita.data)}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm" onclick="editarReceita(${receitas.indexOf(receita)})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="removerReceita(${receitas.indexOf(receita)})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function atualizarTabelaDespesasFixas() {
    const tbody = document.querySelector('#tabela-despesas-fixas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (despesasFixas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--gray);">Nenhuma despesa fixa cadastrada</td></tr>';
        return;
    }
    
    const despesasOrdenadas = [...despesasFixas].sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
    
    despesasOrdenadas.forEach((despesa, index) => {
        const status = calcularStatusVencimento(despesa.vencimento);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${despesa.descricao}</td>
            <td>${formatarMoeda(despesa.valor)}</td>
            <td>${formatarData(despesa.vencimento)}</td>
            <td><span class="badge badge-info">${formatarCategoria(despesa.categoria)}</span></td>
            <td><span class="status-${status}">${formatarStatusVencimento(status)}</span></td>
            <td class="actions">
                <button class="btn btn-danger btn-sm" onclick="removerDespesaFixa(${despesasFixas.indexOf(despesa)})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function calcularStatusVencimento(vencimento) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVencimento = new Date(vencimento);
    dataVencimento.setHours(0, 0, 0, 0);
    const diffTime = dataVencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'vencido';
    if (diffDays <= 7) return 'proximo';
    return 'pendente';
}

function formatarStatusVencimento(status) {
    const statusMap = {
        'vencido': 'Vencido',
        'proximo': 'Próximo',
        'pendente': 'Pendente',
        'atrasada': 'Atrasada'
    };
    return statusMap[status] || status;
}


function atualizarTabelaDespesasVariaveis() {
    const tbody = document.querySelector('#tabela-despesas-variáveis tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (despesasVariaveis.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--gray);">Nenhuma despesa variável cadastrada</td></tr>';
        return;
    }
    
    const despesasOrdenadas = [...despesasVariaveis].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    despesasOrdenadas.forEach((despesa, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${despesa.descricao}</td>
            <td>${formatarMoeda(despesa.valor)}</td>
            <td>${formatarData(despesa.data)}</td>
            <td><span class="badge badge-info">${formatarCategoria(despesa.categoria)}</span></td>
            <td>${despesa.parcelas > 1 ? `${despesa.parcelas}x de ${formatarMoeda(despesa.valor / despesa.parcelas)}` : 'À vista'}</td>
            <td>${despesa.descontoBeneficio ? formatarTipoBeneficio(despesa.descontoBeneficio) : 'Não'}</td>
            <td class="actions">
                <button class="btn btn-danger btn-sm" onclick="removerDespesaVariavel(${despesasVariaveis.indexOf(despesa)})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function atualizarTabelaCartaoCredito() {
    const tbody = document.querySelector('#tabela-cartao-credito tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (comprasCartao.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--gray);">Nenhuma compra no cartão cadastrada</td></tr>';
        return;
    }
    
    const comprasOrdenadas = [...comprasCartao].sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra));
    
    comprasOrdenadas.forEach((compra, index) => {
        const parcelasPendentes = parcelasCartao.filter(p => p.compraId === compra.id && (p.status === 'pendente' || p.status === 'atrasada')).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${compra.descricao}</td>
            <td>${formatarMoeda(compra.valorTotal)}</td>
            <td>${compra.parcelas}x</td>
            <td>${formatarMoeda(compra.valorTotal / compra.parcelas)}</td>
            <td>${formatarData(compra.dataCompra)}</td>
            <td>${parcelasPendentes} parcelas pendentes</td>
            <td class="actions">
                <button class="btn btn-danger btn-sm" onclick="removerCompraCartao(${comprasCartao.indexOf(compra)})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function atualizarTabelaParcelas() {
    const tbody = document.querySelector('#tabela-proximas-parcelas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const parcelasPendentes = parcelasCartao
        .filter(parcela => parcela.status === 'pendente' || parcela.status === 'atrasada')
        .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
    
    if (parcelasPendentes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">Nenhuma parcela pendente</td></tr>';
        return;
    }
    
    parcelasPendentes.forEach(parcela => {
        const status = calcularStatusVencimento(parcela.dataVencimento);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${parcela.descricao} (Parcela ${parcela.parcela}/${parcela.totalParcelas})</td>
            <td>${formatarMoeda(parcela.valor)}</td>
            <td>${formatarData(parcela.dataVencimento)}</td>
            <td>${parcela.parcela}/${parcela.totalParcelas}</td>
            <td><span class="status-${parcela.status}">${formatarStatusVencimento(parcela.status)}</span></td>
        `;
        tbody.appendChild(tr);
    });
}


function atualizarTabelaBeneficios() {
    const tbody = document.querySelector('#tabela-beneficios tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (beneficios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">Nenhum benefício cadastrado</td></tr>';
        return;
    }
    
    const beneficiosOrdenados = [...beneficios].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    beneficiosOrdenados.forEach((beneficio, index) => {
        const saldoDisponivel = calcularSaldoBeneficio(beneficio.tipo);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge badge-success">${formatarTipoBeneficio(beneficio.tipo)}</span></td>
            <td>${formatarMoeda(beneficio.valor)}</td>
            <td>${formatarData(beneficio.data)}</td>
            <td class="${saldoDisponivel <= 0 ? 'beneficio-utilizado' : ''}">${formatarMoeda(saldoDisponivel)}</td>
            <td class="actions">
                <button class="btn btn-danger btn-sm" onclick="removerBeneficio(${beneficios.indexOf(beneficio)})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function atualizarRelatorios() {
    atualizarResumoFinanceiro();
    atualizarAnaliseTendencias();
    atualizarProximosVencimentos();
}

function atualizarResumoFinanceiro() {
    const resumoFinanceiroEl = document.getElementById('resumo-financeiro');
    if (!resumoFinanceiroEl) return;
    
    if (receitas.length === 0 && despesasFixas.length === 0 && despesasVariaveis.length === 0) {
        resumoFinanceiroEl.innerHTML = '<p>Adicione dados para visualizar o resumo financeiro</p>';
        return;
    }
    
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesasFixas = despesasFixas.reduce((total, despesa) => total + despesa.valor, 0);
    const totalDespesasVariaveis = despesasVariaveis.reduce((total, despesa) => total + despesa.valor, 0);
    const totalParcelasPendentes = parcelasCartao
        .filter(parcela => parcela.status === 'pendente' || parcela.status === 'atrasada')
        .reduce((total, parcela) => total + parcela.valor, 0);
    
    const saldoValeAlimentacao = getSaldoValeAlimentacao();
    const saldoValeTransporte = getSaldoValeTransporte();
    const saldoDisponivel = totalReceitas - totalDespesasFixas - totalDespesasVariaveis - totalParcelasPendentes + saldoValeAlimentacao + saldoValeTransporte;
    
    const html = `
        <div class="resumo-item">
            <span>Receitas Totais:</span>
            <span class="positive">${formatarMoeda(totalReceitas)}</span>
        </div>
        <div class="resumo-item">
            <span>Despesas Fixas:</span>
            <span class="negative">${formatarMoeda(totalDespesasFixas)}</span>
        </div>
        <div class="resumo-item">
            <span>Despesas Variáveis:</span>
            <span class="negative">${formatarMoeda(totalDespesasVariaveis)}</span>
        </div>
        <div class="resumo-item">
            <span>Parcelas Cartão Pendentes:</span>
            <span class="negative">${formatarMoeda(totalParcelasPendentes)}</span>
        </div>
        <div class="resumo-item">
            <span>Saldo Vale Alimentação:</span>
            <span class="${saldoValeAlimentacao >= 0 ? 'positive' : 'negative'}">${formatarMoeda(saldoValeAlimentacao)}</span>
        </div>
        <div class="resumo-item">
            <span>Saldo Vale Transporte:</span>
            <span class="${saldoValeTransporte >= 0 ? 'positive' : 'negative'}">${formatarMoeda(saldoValeTransporte)}</span>
        </div>
        <div class="resumo-item destacado">
            <span>Saldo Disponível Final:</span>
            <span class="${saldoDisponivel >= 0 ? 'positive' : 'negative'}">${formatarMoeda(saldoDisponivel)}</span>
        </div>
    `;
    
    resumoFinanceiroEl.innerHTML = html;
}


function configurarEventListeners() {

    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            if (tabId === 'relatorios') {
                setTimeout(() => {
                    atualizarGraficos();
                }, 100);
            }
        });
    });
    

    document.getElementById('form-receita').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (editandoIndex !== -1 && tipoEditando === 'receita') {
            atualizarReceita();
            return;
        }
        
        const descricao = document.getElementById('descricao-receita').value;
        const valor = parseFloat(document.getElementById('valor-receita').value);
        const tipo = document.getElementById('tipo-receita').value;
        const data = document.getElementById('data-receita').value;
        
        if (!validarValorPositivo(valor, 'valor da receita')) return;
        
        adicionarReceita(descricao, valor, tipo, data);
        this.reset();
        document.getElementById('data-receita').valueAsDate = new Date();
    });
    

    document.getElementById('form-despesa-fixa').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descricao = document.getElementById('descricao-despesa-fixa').value;
        const valor = parseFloat(document.getElementById('valor-despesa-fixa').value);
        const vencimento = document.getElementById('vencimento-despesa-fixa').value;
        const categoria = document.getElementById('categoria-despesa-fixa').value;
        
        if (!validarValorPositivo(valor, 'valor da despesa')) return;
        if (!validarDataFutura(vencimento, 'de vencimento')) return;
        
        adicionarDespesaFixa(descricao, valor, vencimento, categoria);
        this.reset();
        document.getElementById('vencimento-despesa-fixa').valueAsDate = new Date();
    });
    

    document.getElementById('form-despesa-variavel').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descricao = document.getElementById('descricao-despesa-variavel').value;
        const valor = parseFloat(document.getElementById('valor-despesa-variavel').value);
        const data = document.getElementById('data-despesa-variavel').value;
        const categoria = document.getElementById('categoria-despesa-variavel').value;
        const parcelas = parseInt(document.getElementById('parcelas-despesa-variavel').value) || 1;
        const descontoBeneficio = document.getElementById('desconto-beneficio').value;
        
        if (!validarValorPositivo(valor, 'valor da despesa')) return;
        
        adicionarDespesaVariavel(descricao, valor, data, categoria, parcelas, descontoBeneficio);
        this.reset();
        document.getElementById('data-despesa-variavel').valueAsDate = new Date();
        document.getElementById('parcelas-despesa-variavel').value = 1;
        document.getElementById('desconto-beneficio').value = '';
    });
    

    document.getElementById('form-cartao-credito').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descricao = document.getElementById('descricao-cartao').value;
        const valorTotal = parseFloat(document.getElementById('valor-cartao').value);
        const dataCompra = document.getElementById('data-compra-cartao').value;
        const parcelas = parseInt(document.getElementById('parcelas-cartao').value) || 1;
        const categoria = document.getElementById('categoria-cartao').value;
        
        if (!validarValorPositivo(valorTotal, 'valor total')) return;
        
        adicionarCompraCartao(descricao, valorTotal, dataCompra, parcelas, categoria);
        this.reset();
        document.getElementById('data-compra-cartao').valueAsDate = new Date();
        document.getElementById('parcelas-cartao').value = 1;
    });
    

    document.getElementById('form-beneficio').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tipo = document.getElementById('tipo-beneficio').value;
        const valor = parseFloat(document.getElementById('valor-beneficio').value);
        const data = document.getElementById('data-beneficio').value;
        
        if (!validarValorPositivo(valor, 'valor do benefício')) return;
        
        adicionarBeneficio(tipo, valor, data);
        this.reset();
        document.getElementById('data-beneficio').valueAsDate = new Date();
    });
    

    document.getElementById('form-rapido-despesa-variavel').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descricao = document.getElementById('descricao-rapida-despesa').value;
        const valor = parseFloat(document.getElementById('valor-rapido-despesa').value);
        const categoria = document.getElementById('categoria-rapida-despesa').value;
        const descontoBeneficio = document.getElementById('desconto-beneficio-rapido').value;
        const data = new Date().toISOString().split('T')[0];
        
        if (!validarValorPositivo(valor, 'valor da despesa')) return;
        
        adicionarDespesaVariavel(descricao, valor, data, categoria, 1, descontoBeneficio);
        this.reset();
        mostrarAlerta('Despesa variável adicionada rapidamente!', 'success');
    });
    

    document.getElementById('form-rapido-despesa-fixa').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descricao = document.getElementById('descricao-rapida-fixa').value;
        const valor = parseFloat(document.getElementById('valor-rapido-fixa').value);
        const categoria = document.getElementById('categoria-rapida-fixa').value;
        const vencimento = document.getElementById('vencimento-rapido-fixa').value;
        
        if (!validarValorPositivo(valor, 'valor da despesa')) return;
        if (!validarDataFutura(vencimento, 'de vencimento')) return;
        
        adicionarDespesaFixa(descricao, valor, vencimento, categoria);
        this.reset();
        
        const proximoMes = new Date();
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        document.getElementById('vencimento-rapido-fixa').valueAsDate = proximoMes;
        
        mostrarAlerta('Despesa fixa adicionada rapidamente!', 'success');
    });
    

    document.getElementById('exportar-excel').addEventListener('click', exportarParaExcel);
    document.getElementById('importar-excel').addEventListener('click', () => {
        document.getElementById('arquivo-importacao-excel').click();
    });
    
    document.getElementById('arquivo-importacao-excel').addEventListener('change', importarDoExcel);
    document.getElementById('backup-dados').addEventListener('click', fazerBackupCompleto);
    document.getElementById('limpar-dados').addEventListener('click', limparDados);
}


function adicionarReceita(descricao, valor, tipo, data) {
    receitas.push({
        id: Date.now(),
        descricao,
        valor,
        tipo,
        data,
        dataCriacao: new Date().toISOString()
    });
    
    salvarDados();
    atualizarTabelas('receitas');
    mostrarAlerta('Receita adicionada com sucesso!', 'success');
}

function adicionarDespesaFixa(descricao, valor, vencimento, categoria) {
    despesasFixas.push({
        id: Date.now(),
        descricao,
        valor,
        vencimento,
        categoria,
        dataCriacao: new Date().toISOString()
    });
    
    salvarDados();
    atualizarTabelas('despesasFixas');
    mostrarAlerta('Despesa fixa adicionada com sucesso!', 'success');
}

function adicionarDespesaVariavel(descricao, valor, data, categoria, parcelas = 1, descontoBeneficio = '') {
    if (descontoBeneficio) {
        const sucesso = descontarDoBeneficio(descontoBeneficio, valor, descricao);
        if (!sucesso) return;
    }
    
    despesasVariaveis.push({
        id: Date.now(),
        descricao,
        valor,
        data,
        categoria,
        parcelas,
        descontoBeneficio: descontoBeneficio || null,
        dataCriacao: new Date().toISOString()
    });
    
    salvarDados();
    atualizarTabelas('despesasVariaveis');
    mostrarAlerta('Despesa variável adicionada com sucesso!', 'success');
}

function adicionarCompraCartao(descricao, valorTotal, dataCompra, parcelas, categoria) {
    comprasCartao.push({
        id: Date.now(),
        descricao,
        valorTotal,
        dataCompra,
        parcelas,
        categoria,
        dataCriacao: new Date().toISOString()
    });
    
    processarParcelasCartao();
    atualizarTabelas('cartaoCredito');
    mostrarAlerta('Compra no cartão adicionada com sucesso!', 'success');
}

function adicionarBeneficio(tipo, valor, data) {
    beneficios.push({
        id: Date.now(),
        tipo,
        valor,
        data,
        dataCriacao: new Date().toISOString()
    });
    
    salvarDados();
    atualizarTabelas('beneficios');
    mostrarAlerta('Benefício adicionado com sucesso!', 'success');
}


function removerReceita(index) {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
        receitas.splice(index, 1);
        salvarDados();
        atualizarTabelas('receitas');
        mostrarAlerta('Receita removida com sucesso!', 'success');
    }
}

function removerDespesaFixa(index) {
    if (confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
        despesasFixas.splice(index, 1);
        salvarDados();
        atualizarTabelas('despesasFixas');
        mostrarAlerta('Despesa fixa removida com sucesso!', 'success');
    }
}

function removerDespesaVariavel(index) {
    if (confirm('Tem certeza que deseja excluir esta despesa variável?')) {
        const despesa = despesasVariaveis[index];
        
        if (despesa.descontoBeneficio) {
            if (confirm('Esta despesa tinha desconto de benefício. Deseja reverter o desconto?')) {
                const sucesso = reverterDescontoBeneficio(
                    despesa.descontoBeneficio, 
                    despesa.valor, 
                    despesa.descricao
                );
                if (!sucesso) return;
            }
        }
        
        despesasVariaveis.splice(index, 1);
        salvarDados();
        atualizarTabelas('despesasVariaveis');
        mostrarAlerta('Despesa variável removida com sucesso!', 'success');
    }
}

function removerCompraCartao(index) {
    if (confirm('Tem certeza que deseja excluir esta compra do cartão?')) {
        const compra = comprasCartao[index];
        
        parcelasCartao = parcelasCartao.filter(p => p.compraId !== compra.id);
        comprasCartao.splice(index, 1);
        
        salvarDados();
        atualizarTabelas('cartaoCredito');
        mostrarAlerta('Compra do cartão removida com sucesso!', 'success');
    }
}

function removerBeneficio(index) {
    if (confirm('Tem certeza que deseja excluir este benefício?')) {
        beneficios.splice(index, 1);
        salvarDados();
        atualizarTabelas('beneficios');
        mostrarAlerta('Benefício removido com sucesso!', 'success');
    }
}


function editarReceita(index) {
    const receita = receitas[index];
    
    document.getElementById('descricao-receita').value = receita.descricao;
    document.getElementById('valor-receita').value = receita.valor;
    document.getElementById('tipo-receita').value = receita.tipo;
    document.getElementById('data-receita').value = receita.data;
    
    editandoIndex = index;
    tipoEditando = 'receita';
    
    const btn = document.querySelector('#form-receita button');
    btn.innerHTML = '<i class="fas fa-edit"></i> Atualizar Receita';
    
    document.getElementById('form-receita').scrollIntoView({ behavior: 'smooth' });
}

function atualizarReceita() {
    if (editandoIndex === -1 || tipoEditando !== 'receita') return;
    
    const descricao = document.getElementById('descricao-receita').value;
    const valor = parseFloat(document.getElementById('valor-receita').value);
    const tipo = document.getElementById('tipo-receita').value;
    const data = document.getElementById('data-receita').value;
    
    if (!validarValorPositivo(valor, 'valor da receita')) return;
    
    receitas[editandoIndex] = {
        ...receitas[editandoIndex],
        descricao,
        valor,
        tipo,
        data
    };
    
    document.getElementById('form-receita').reset();
    const btn = document.querySelector('#form-receita button');
    btn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Receita';
    
    editandoIndex = -1;
    tipoEditando = '';
    
    salvarDados();
    atualizarTabelas('receitas');
    mostrarAlerta('Receita atualizada com sucesso!', 'success');
}


function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarCategoria(categoria) {
    const categorias = {
        'moradia': 'Moradia',
        'utilidades': 'Utilidades',
        'transporte': 'Transporte',
        'saude': 'Saúde',
        'educacao': 'Educação',
        'outros': 'Outros',
        'alimentacao': 'Alimentação',
        'lazer': 'Lazer',
        'compras': 'Compras',
        'cartao': 'Cartão de Crédito'
    };
    
    return categorias[categoria] || categoria;
}

function formatarTipoBeneficio(tipo) {
    const tipos = {
        'vale-transporte': 'Vale Transporte',
        'vale-alimentacao': 'Vale Alimentação',
        'outro': 'Outro'
    };
    
    return tipos[tipo] || tipo;
}

function mostrarAlerta(mensagem, tipo) {
    if (!alertMessageEl) return;
    
    alertMessageEl.textContent = mensagem;
    alertMessageEl.className = `alert alert-${tipo}`;
    alertMessageEl.style.display = 'block';
    
    setTimeout(() => {
        alertMessageEl.style.display = 'none';
    }, 3000);
}


function validarDataFutura(data, campo) {
    const dataInput = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataInput < hoje) {
        mostrarAlerta(`A data ${campo} não pode ser anterior à data atual`, 'danger');
        return false;
    }
    return true;
}

function validarValorPositivo(valor, campo) {
    if (valor <= 0) {
        mostrarAlerta(`O ${campo} deve ser maior que zero`, 'danger');
        return false;
    }
    return true;
}


function exportarParaExcel() {
    try {
        const dados = {
            Receitas: receitas.map(r => ({
                'Descrição': r.descricao,
                'Valor': r.valor,
                'Tipo': r.tipo === 'fixa' ? 'Fixa' : 'Variável',
                'Data': r.data
            })),
            'Despesas Fixas': despesasFixas.map(d => ({
                'Descrição': d.descricao,
                'Valor': d.valor,
                'Vencimento': d.vencimento,
                'Categoria': formatarCategoria(d.categoria),
                'Status': calcularStatusVencimento(d.vencimento)
            })),
            'Despesas Variáveis': despesasVariaveis.map(d => ({
                'Descrição': d.descricao,
                'Valor': d.valor,
                'Data': d.data,
                'Categoria': formatarCategoria(d.categoria),
                'Parcelas': d.parcelas,
                'Valor Parcela': d.parcelas > 1 ? (d.valor / d.parcelas).toFixed(2) : 'À vista',
                'Desconto Benefício': d.descontoBeneficio ? formatarTipoBeneficio(d.descontoBeneficio) : 'Não'
            })),
            'Cartão de Crédito': comprasCartao.map(c => ({
                'Descrição': c.descricao,
                'Valor Total': c.valorTotal,
                'Parcelas': c.parcelas,
                'Valor Parcela': (c.valorTotal / c.parcelas).toFixed(2),
                'Data Compra': c.dataCompra,
                'Categoria': formatarCategoria(c.categoria)
            })),
            'Parcelas Pendentes': parcelasCartao
                .filter(p => p.status === 'pendente' || p.status === 'atrasada')
                .map(p => ({
                    'Descrição': p.descricao,
                    'Parcela': `${p.parcela}/${p.totalParcelas}`,
                    'Valor': p.valor,
                    'Vencimento': p.dataVencimento,
                    'Status': formatarStatusVencimento(p.status)
                })),
            'Benefícios': beneficios.map(b => ({
                'Tipo': formatarTipoBeneficio(b.tipo),
                'Valor': b.valor,
                'Data Recebimento': b.data,
                'Saldo Disponível': calcularSaldoBeneficio(b.tipo)
            }))
        };
        
        const workbook = XLSX.utils.book_new();
        
        Object.keys(dados).forEach(sheetName => {
            if (dados[sheetName].length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(dados[sheetName]);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }
        });
        
        const totalReceitas = receitas.reduce((t, r) => t + r.valor, 0);
        const totalDespesasFixas = despesasFixas.reduce((t, d) => t + d.valor, 0);
        const totalDespesasVariaveis = despesasVariaveis.reduce((t, d) => t + d.valor, 0);
        const totalParcelasPendentes = parcelasCartao
            .filter(p => p.status === 'pendente' || p.status === 'atrasada')
            .reduce((t, p) => t + p.valor, 0);
        
        const resumoData = [
            ['RESUMO FINANCEIRO'],
            [''],
            ['Receitas Totais:', totalReceitas],
            ['Despesas Fixas Totais:', totalDespesasFixas],
            ['Despesas Variáveis Totais:', totalDespesasVariaveis],
            ['Parcelas Cartão Pendentes:', totalParcelasPendentes],
            ['Saldo Vale Alimentação:', getSaldoValeAlimentacao()],
            ['Saldo Vale Transporte:', getSaldoValeTransporte()],
            [''],
            ['SALDO FINAL:', totalReceitas - totalDespesasFixas - totalDespesasVariaveis - totalParcelasPendentes + 
                            getSaldoValeAlimentacao() + getSaldoValeTransporte()]
        ];
        
        const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
        XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');
        
        XLSX.writeFile(workbook, `controle-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarAlerta('Dados exportados para Excel com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        mostrarAlerta('Erro ao exportar para Excel', 'danger');
    }
}


function importarDoExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
                receitas = [];
                despesasFixas = [];
                despesasVariaveis = [];
                comprasCartao = [];
                beneficios = [];
                historicoBeneficios = [];
                parcelasCartao = [];
                
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    switch(sheetName) {
                        case 'Receitas':
                            jsonData.forEach(item => {
                                receitas.push({
                                    id: Date.now() + Math.random(),
                                    descricao: item['Descrição'] || '',
                                    valor: parseFloat(item['Valor']) || 0,
                                    tipo: item['Tipo'] === 'Fixa' ? 'fixa' : 'variavel',
                                    data: item['Data'] || new Date().toISOString().split('T')[0],
                                    dataCriacao: new Date().toISOString()
                                });
                            });
                            break;
                            
                        case 'Despesas Fixas':
                            jsonData.forEach(item => {
                                despesasFixas.push({
                                    id: Date.now() + Math.random(),
                                    descricao: item['Descrição'] || '',
                                    valor: parseFloat(item['Valor']) || 0,
                                    vencimento: item['Vencimento'] || new Date().toISOString().split('T')[0],
                                    categoria: obterCategoriaPorNome(item['Categoria']),
                                    dataCriacao: new Date().toISOString()
                                });
                            });
                            break;
                    }
                });
                
                processarParcelasCartao();
                salvarDados();
                atualizarTabelas();
                mostrarAlerta('Dados importados do Excel com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao importar do Excel:', error);
            mostrarAlerta('Erro ao importar do Excel. Verifique o formato do arquivo.', 'danger');
        }
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}

function obterCategoriaPorNome(nomeCategoria) {
    const categorias = {
        'Moradia': 'moradia',
        'Utilidades': 'utilidades',
        'Transporte': 'transporte',
        'Saúde': 'saude',
        'Educação': 'educacao',
        'Outros': 'outros',
        'Alimentação': 'alimentacao',
        'Lazer': 'lazer',
        'Compras': 'compras'
    };
    return categorias[nomeCategoria] || 'outros';
}


function fazerBackupCompleto() {
    const dados = {
        receitas,
        despesasFixas,
        despesasVariaveis,
        comprasCartao,
        beneficios,
        historicoBeneficios,
        parcelasCartao,
        backupEm: new Date().toISOString(),
        versao: '3.1'
    };
    
    const dadosJSON = JSON.stringify(dados, null, 2);
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    mostrarAlerta('Backup realizado com sucesso!', 'success');
}


function limparDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        receitas = [];
        despesasFixas = [];
        despesasVariaveis = [];
        comprasCartao = [];
        beneficios = [];
        historicoBeneficios = [];
        parcelasCartao = [];
        
        salvarDados();
        atualizarTabelas();
        mostrarAlerta('Todos os dados foram limpos!', 'success');
    }
}


function atualizarGraficos() {
    atualizarGraficoDespesas();
    atualizarGraficoEvolucao();
    atualizarGraficoComparativo();
    atualizarGraficoBeneficios();
}

function atualizarGraficoDespesas() {
    if (!chartDespesas) return;
    
    const categorias = {};
    
    despesasVariaveis.forEach(despesa => {
        categorias[despesa.categoria] = (categorias[despesa.categoria] || 0) + despesa.valor;
    });
    
    const totalParcelasPendentes = parcelasCartao
        .filter(p => p.status === 'pendente' || p.status === 'atrasada')
        .reduce((total, p) => total + p.valor, 0);
    
    if (totalParcelasPendentes > 0) {
        categorias['cartao'] = totalParcelasPendentes;
    }
    
    const labels = Object.keys(categorias).map(cat => cat === 'cartao' ? 'Cartão de Crédito' : formatarCategoria(cat));
    const data = Object.values(categorias);
    const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'];
    
    chartDespesas.data.labels = labels;
    chartDespesas.data.datasets = [{
        data: data,
        backgroundColor: cores.slice(0, labels.length)
    }];
    chartDespesas.update();
}

function atualizarGraficoEvolucao() {
    if (!chartEvolucao) return;
    
    const meses = {};
    const ultimos6Meses = [];
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`;
        ultimos6Meses.push(mesAno);
        meses[mesAno] = { receitas: 0, despesas: 0, parcelas: 0 };
    }
    
    receitas.forEach(item => {
        const data = new Date(item.data);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        if (meses[mesAno]) {
            meses[mesAno].receitas += item.valor;
        }
    });
    
    despesasVariaveis.forEach(item => {
        const data = new Date(item.data);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        if (meses[mesAno]) {
            meses[mesAno].despesas += item.valor;
        }
    });
    
    parcelasCartao.forEach(parcela => {
        const data = new Date(parcela.dataVencimento);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        if (meses[mesAno] && (parcela.status === 'pendente' || parcela.status === 'atrasada')) {
            meses[mesAno].parcelas += parcela.valor;
        }
    });
    
    const receitasData = ultimos6Meses.map(mes => meses[mes].receitas);
    const despesasData = ultimos6Meses.map(mes => meses[mes].despesas);
    const parcelasData = ultimos6Meses.map(mes => meses[mes].parcelas);
    
    chartEvolucao.data.labels = ultimos6Meses;
    chartEvolucao.data.datasets = [
        {
            label: 'Receitas',
            data: receitasData,
            borderColor: '#4CC9F0',
            backgroundColor: 'rgba(76, 201, 240, 0.1)',
            tension: 0.4,
            fill: true
        },
        {
            label: 'Despesas Variáveis',
            data: despesasData,
            borderColor: '#F72585',
            backgroundColor: 'rgba(247, 37, 133, 0.1)',
            tension: 0.4,
            fill: true
        },
        {
            label: 'Parcelas Cartão',
            data: parcelasData,
            borderColor: '#FF9F40',
            backgroundColor: 'rgba(255, 159, 64, 0.1)',
            tension: 0.4,
            fill: true
        }
    ];
    chartEvolucao.update();
}

function atualizarGraficoComparativo() {
    if (!chartComparativo) return;
    
    const ultimos6Meses = [];
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        ultimos6Meses.push(`${date.getMonth() + 1}/${date.getFullYear()}`);
    }
    
    const fixasPorMes = Array(6).fill(0);
    const variaveisPorMes = Array(6).fill(0);
    const cartaoPorMes = Array(6).fill(0);
    
    despesasFixas.forEach(despesa => {
        const data = new Date(despesa.vencimento);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        const index = ultimos6Meses.indexOf(mesAno);
        if (index !== -1) {
            fixasPorMes[index] += despesa.valor;
        }
    });
    
    despesasVariaveis.forEach(despesa => {
        const data = new Date(despesa.data);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        const index = ultimos6Meses.indexOf(mesAno);
        if (index !== -1) {
            variaveisPorMes[index] += despesa.valor;
        }
    });
    
    parcelasCartao.forEach(parcela => {
        const data = new Date(parcela.dataVencimento);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        const index = ultimos6Meses.indexOf(mesAno);
        if (index !== -1 && (parcela.status === 'pendente' || parcela.status === 'atrasada')) {
            cartaoPorMes[index] += parcela.valor;
        }
    });
    
    chartComparativo.data.labels = ultimos6Meses;
    chartComparativo.data.datasets = [
        {
            label: 'Despesas Fixas',
            data: fixasPorMes,
            backgroundColor: '#4361EE'
        },
        {
            label: 'Despesas Variáveis',
            data: variaveisPorMes,
            backgroundColor: '#F72585'
        },
        {
            label: 'Cartão de Crédito',
            data: cartaoPorMes,
            backgroundColor: '#FF9F40'
        }
    ];
    chartComparativo.update();
}

function atualizarGraficoBeneficios() {
    if (!chartBeneficios) return;
    
    const saldoVA = getSaldoValeAlimentacao();
    const saldoVT = getSaldoValeTransporte();
    const totalVA = calcularTotalBeneficio('vale-alimentacao');
    const totalVT = calcularTotalBeneficio('vale-transporte');
    
    const utilizadoVA = totalVA - saldoVA;
    const utilizadoVT = totalVT - saldoVT;
    
    chartBeneficios.data.labels = [
        'Vale Alimentação Utilizado', 
        'Vale Alimentação Disponível', 
        'Vale Transporte Utilizado', 
        'Vale Transporte Disponível'
    ];
    chartBeneficios.data.datasets = [{
        data: [utilizadoVA, saldoVA, utilizadoVT, saldoVT],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }];
    chartBeneficios.update();
}

function atualizarAnaliseTendencias() {
    const analiseTendenciasEl = document.getElementById('analise-tendencias');
    if (!analiseTendenciasEl) return;
    
    if (receitas.length === 0 && despesasFixas.length === 0 && despesasVariaveis.length === 0) {
        analiseTendenciasEl.innerHTML = '<p>Adicione dados para visualizar a análise de tendências</p>';
        return;
    }
    
    const ultimoMes = new Date();
    ultimoMes.setMonth(ultimoMes.getMonth() - 1);
    
    const despesasEsteMes = despesasVariaveis.filter(d => {
        const data = new Date(d.data);
        return data.getMonth() === new Date().getMonth() && data.getFullYear() === new Date().getFullYear();
    }).reduce((total, d) => total + d.valor, 0);
    
    const despesasMesPassado = despesasVariaveis.filter(d => {
        const data = new Date(d.data);
        return data.getMonth() === ultimoMes.getMonth() && data.getFullYear() === ultimoMes.getFullYear();
    }).reduce((total, d) => total + d.valor, 0);
    
    const variacao = despesasMesPassado > 0 ? 
        ((despesasEsteMes - despesasMesPassado) / despesasMesPassado * 100) : 0;
    
    const totalParcelasPendentes = parcelasCartao
        .filter(p => p.status === 'pendente' || p.status === 'atrasada')
        .reduce((total, p) => total + p.valor, 0);
    
    const saldoVA = getSaldoValeAlimentacao();
    const totalVA = calcularTotalBeneficio('vale-alimentacao');
    const utilizacaoValeAlimentacao = totalVA > 0 ? (1 - (saldoVA / totalVA)) * 100 : 0;
    
    let analiseHTML = '';
    
    if (variacao > 20) {
        analiseHTML += `<div class="analise-item analise-negativa">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Atenção:</strong> Suas despesas variáveis aumentaram ${variacao.toFixed(1)}% em relação ao mês passado.
        </div>`;
    } else if (variacao < -10) {
        analiseHTML += `<div class="analise-item analise-positiva">
            <i class="fas fa-check-circle"></i>
            <strong>Bom trabalho:</strong> Suas despesas variáveis diminuíram ${Math.abs(variacao).toFixed(1)}% em relação ao mês passado.
        </div>`;
    }
    
    if (totalParcelasPendentes > 0) {
        analiseHTML += `<div class="analise-item analise-negativa">
            <i class="fas fa-credit-card"></i>
            <strong>Cartão de Crédito:</strong> Você tem ${formatarMoeda(totalParcelasPendentes)} em parcelas pendentes.
        </div>`;
    }
    
    if (utilizacaoValeAlimentacao < 50 && totalVA > 0) {
        analiseHTML += `<div class="analise-item analise-negativa">
            <i class="fas fa-info-circle"></i>
            <strong>Vale Alimentação:</strong> Apenas ${utilizacaoValeAlimentacao.toFixed(1)}% utilizado. Considere melhor aproveitamento.
        </div>`;
    }
    
    analiseTendenciasEl.innerHTML = analiseHTML || '<p>Nenhuma tendência significativa detectada neste período.</p>';
}

function atualizarProximosVencimentos() {
    const proximosVencimentosEl = document.getElementById('proximos-vencimentos');
    if (!proximosVencimentosEl) return;
    
    const hoje = new Date();
    const vencimentosProximos = despesasFixas.filter(despesa => {
        const vencimento = new Date(despesa.vencimento);
        const diffTime = vencimento - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 15 && diffDays >= 0;
    }).sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
    
    const parcelasProximas = parcelasCartao.filter(parcela => {
        const vencimento = new Date(parcela.dataVencimento);
        const diffTime = vencimento - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0 && (parcela.status === 'pendente' || parcela.status === 'atrasada');
    }).sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
    
    const vencimentosAtrasados = despesasFixas.filter(despesa => {
        const vencimento = new Date(despesa.vencimento);
        return vencimento < hoje;
    });
    
    let html = '';
    
    if (vencimentosAtrasados.length > 0) {
        html += '<h4>Vencimentos Atrasados</h4>';
        vencimentosAtrasados.forEach(despesa => {
            html += `
                <div class="vencimento-atrasado">
                    <strong>${despesa.descricao}</strong> - ${formatarMoeda(despesa.valor)}
                    <br><small>Venceu em ${formatarData(despesa.vencimento)}</small>
                </div>
            `;
        });
    }
    
    if (vencimentosProximos.length > 0) {
        html += '<h4>Próximos Vencimentos (15 dias)</h4>';
        vencimentosProximos.forEach(despesa => {
            const vencimento = new Date(despesa.vencimento);
            const diffDays = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
            
            html += `
                <div class="vencimento-proximo">
                    <strong>${despesa.descricao}</strong> - ${formatarMoeda(despesa.valor)}
                    <br><small>Vence em ${diffDays} dia(s) - ${formatarData(despesa.vencimento)}</small>
                </div>
            `;
        });
    }
    
    if (parcelasProximas.length > 0) {
        html += '<h4>Próximas Parcelas do Cartão (30 dias)</h4>';
        parcelasProximas.forEach(parcela => {
            const vencimento = new Date(parcela.dataVencimento);
            const diffDays = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
            
            html += `
                <div class="vencimento-proximo">
                    <strong>${parcela.descricao} (Parcela ${parcela.parcela}/${parcela.totalParcelas})</strong> - ${formatarMoeda(parcela.valor)}
                    <br><small>Vence em ${diffDays} dia(s) - ${formatarData(parcela.dataVencimento)}</small>
                </div>
            `;
        });
    }
    
    proximosVencimentosEl.innerHTML = html || '<p>Nenhum vencimento próximo ou atrasado encontrado.</p>';
}


function adicionarEstilosDinamicos() {
    const style = document.createElement('style');
    style.textContent = `
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .badge-primary { background-color: var(--primary); color: white; }
        .badge-secondary { background-color: var(--gray); color: white; }
        .badge-success { background-color: var(--success); color: white; }
        .badge-info { background-color: var(--info); color: white; }
        .badge-danger { background-color: var(--danger); color: white; }
        .badge-warning { background-color: var(--warning); color: white; }
        
        .resumo-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid var(--gray-light);
        }
        
        .resumo-item.destacado {
            font-weight: bold;
            border-top: 2px solid var(--primary);
            margin-top: 10px;
            padding-top: 15px;
        }
        
        .btn-sm {
            padding: 6px 10px;
            font-size: 0.85rem;
        }
        
        .btn-block {
            width: 100%;
            justify-content: center;
        }
        
        .status-vencido { color: var(--danger); font-weight: bold; }
        .status-proximo { color: var(--warning); font-weight: bold; }
        .status-pendente { color: var(--success); }
        .status-atrasada { color: var(--danger); font-weight: bold; }
        .status-paga { color: var(--gray); text-decoration: line-through; }
        
        .beneficio-utilizado {
            opacity: 0.7;
            text-decoration: line-through;
        }
        
        .analise-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            background: var(--gray-light);
        }
        
        .analise-positiva {
            border-left: 4px solid var(--success);
        }
        
        .analise-negativa {
            border-left: 4px solid var(--danger);
        }
        
        .vencimento-proximo {
            background: #fff3cd;
            border-left: 4px solid var(--warning);
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
        }
        
        .vencimento-atrasado {
            background: #f8d7da;
            border-left: 4px solid var(--danger);
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
        }
        
        .chart-container {
            height: 300px;
            position: relative;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        .actions {
            display: flex;
            gap: 5px;
        }
        
        .actions button {
            padding: 5px 10px;
            font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
            .actions {
                flex-direction: column;
            }
            
            .chart-container {
                height: 250px;
            }
        }
    `;
    
    if (!document.querySelector('#estilos-dinamicos')) {
        style.id = 'estilos-dinamicos';
        document.head.appendChild(style);
    }
}


adicionarEstilosDinamicos();