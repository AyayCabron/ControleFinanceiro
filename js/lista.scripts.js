

class ListaFinanceira {
    constructor() {
        this.listaVisivel = false;
        this.dadosFiltrados = [];
        this.filtroAtual = 'todos';
        this.init();
    }

    init() {
        this.criarModalLista();
        this.configurarEventos();
        this.carregarDados();
    }

    criarModalLista() {
        const modalHTML = `
            <div id="modal-lista" class="modal-lista">
                <div class="modal-lista-content">
                    <div class="modal-lista-header">
                        <h2><i class="fas fa-list"></i> Lista Completa de Transações</h2>
                        <button id="fechar-lista" class="btn-fechar">&times;</button>
                    </div>
                    
                    <div class="modal-lista-controls">
                        <div class="filtros-rapidos">
                            <button class="filtro-btn active" data-filtro="todos">Todos</button>
                            <button class="filtro-btn" data-filtro="receitas">Receitas</button>
                            <button class="filtro-btn" data-filtro="despesas-fixas">Despesas Fixas</button>
                            <button class="filtro-btn" data-filtro="despesas-variáveis">Despesas Variáveis</button>
                            <button class="filtro-btn" data-filtro="cartao">Cartão</button>
                            <button class="filtro-btn" data-filtro="beneficios">Benefícios</button>
                        </div>
                        
                        <div class="pesquisa-avancada">
                            <input type="text" id="pesquisa-lista" placeholder="Pesquisar por descrição...">
                            <select id="filtro-categoria">
                                <option value="">Todas categorias</option>
                                <option value="alimentacao">Alimentação</option>
                                <option value="transporte">Transporte</option>
                                <option value="lazer">Lazer</option>
                                <option value="moradia">Moradia</option>
                                <!-- Adicione mais categorias conforme necessário -->
                            </select>
                            <input type="date" id="filtro-data-inicio">
                            <input type="date" id="filtro-data-fim">
                            <button id="aplicar-filtros" class="btn btn-primary">Aplicar</button>
                            <button id="limpar-filtros" class="btn btn-secondary">Limpar</button>
                        </div>
                    </div>
                    
                    <div class="modal-lista-stats">
                        <div class="stat-card">
                            <span class="stat-label">Itens encontrados:</span>
                            <span class="stat-value" id="total-itens">0</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Valor total:</span>
                            <span class="stat-value" id="valor-total">R$ 0,00</span>
                        </div>
                    </div>
                    
                    <div class="table-container-lista">
                        <table id="tabela-lista-completa">
                            <thead>
                                <tr>
                                    <th data-sort="tipo">Tipo <i class="fas fa-sort"></i></th>
                                    <th data-sort="descricao">Descrição <i class="fas fa-sort"></i></th>
                                    <th data-sort="valor">Valor <i class="fas fa-sort"></i></th>
                                    <th data-sort="data">Data <i class="fas fa-sort"></i></th>
                                    <th data-sort="categoria">Categoria <i class="fas fa-sort"></i></th>
                                    <th data-sort="status">Status <i class="fas fa-sort"></i></th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="corpo-tabela-lista">
                                <!-- Dados serão inseridos aqui -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="modal-lista-footer">
                        <button id="exportar-lista-excel" class="btn btn-success">
                            <i class="fas fa-file-excel"></i> Exportar para Excel
                        </button>
                        <button id="imprimir-lista" class="btn btn-info">
                            <i class="fas fa-print"></i> Imprimir Lista
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    configurarEventos() {
        
        document.getElementById('lista-toggle').addEventListener('click', () => this.toggleLista());
        document.getElementById('fechar-lista').addEventListener('click', () => this.fecharLista());

        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.aplicarFiltroRapido(e.target.dataset.filtro));
        });

        
        document.getElementById('aplicar-filtros').addEventListener('click', () => this.aplicarFiltrosAvancados());
        document.getElementById('limpar-filtros').addEventListener('click', () => this.limparFiltros());
        document.getElementById('pesquisa-lista').addEventListener('input', (e) => this.filtrarPorTexto(e.target.value));

        
        document.querySelectorAll('#tabela-lista-completa th[data-sort]').forEach(th => {
            th.addEventListener('click', () => this.ordenarTabela(th.dataset.sort));
        });

        
        document.getElementById('exportar-lista-excel').addEventListener('click', () => this.exportarParaExcel());
        document.getElementById('imprimir-lista').addEventListener('click', () => this.imprimirLista());

        
        document.getElementById('modal-lista').addEventListener('click', (e) => {
            if (e.target.id === 'modal-lista') this.fecharLista();
        });
    }

    toggleLista() {
        this.listaVisivel = !this.listaVisivel;
        const modal = document.getElementById('modal-lista');
        
        if (this.listaVisivel) {
            modal.style.display = 'block';
            this.carregarDados();
            this.atualizarLista();
        } else {
            modal.style.display = 'none';
        }
    }

    fecharLista() {
        this.listaVisivel = false;
        document.getElementById('modal-lista').style.display = 'none';
    }

    carregarDados() {
        
        this.dados = {
            receitas: JSON.parse(localStorage.getItem('receitas')) || [],
            despesasFixas: JSON.parse(localStorage.getItem('despesasFixas')) || [],
            despesasVariaveis: JSON.parse(localStorage.getItem('despesasVariaveis')) || [],
            cartaoCredito: JSON.parse(localStorage.getItem('cartaoCredito')) || [],
            beneficios: JSON.parse(localStorage.getItem('beneficios')) || []
        };
    }

    aplicarFiltroRapido(filtro) {
        this.filtroAtual = filtro;
        
        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filtro === filtro);
        });
        
        this.atualizarLista();
    }

    aplicarFiltrosAvancados() {
        this.atualizarLista();
    }

    limparFiltros() {
        document.getElementById('pesquisa-lista').value = '';
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('filtro-data-inicio').value = '';
        document.getElementById('filtro-data-fim').value = '';
        this.filtroAtual = 'todos';
        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filtro === 'todos');
        });
        
        this.atualizarLista();
    }

    filtrarPorTexto(texto) {
        this.atualizarLista();
    }

    ordenarTabela(campo) {
        
        console.log('Ordenar por:', campo);
        this.atualizarLista();
    }

    consolidarDados() {
        let dadosConsolidados = [];

        
        this.dados.receitas.forEach(item => {
            dadosConsolidados.push({
                tipo: 'Receita',
                descricao: item.descricao,
                valor: item.valor,
                data: item.data,
                categoria: item.tipo,
                status: 'Ativo',
                origem: 'receita',
                dadosCompletos: item
            });
        });

        
        this.dados.despesasFixas.forEach(item => {
            dadosConsolidados.push({
                tipo: 'Despesa Fixa',
                descricao: item.descricao,
                valor: -item.valor, 
                data: item.vencimento,
                categoria: item.categoria,
                status: this.calcularStatusDespesa(item.vencimento),
                origem: 'despesaFixa',
                dadosCompletos: item
            });
        });

        
        this.dados.despesasVariaveis.forEach(item => {
            dadosConsolidados.push({
                tipo: 'Despesa Variável',
                descricao: item.descricao,
                valor: -item.valor,
                data: item.data,
                categoria: item.categoria,
                status: 'Pago',
                origem: 'despesaVariavel',
                dadosCompletos: item
            });
        });

        
        this.dados.cartaoCredito.forEach(item => {
            dadosConsolidados.push({
                tipo: 'Cartão de Crédito',
                descricao: item.descricao,
                valor: -item.valorTotal,
                data: item.dataCompra,
                categoria: item.categoria,
                status: `Parcelado (${item.parcelas}x)`,
                origem: 'cartaoCredito',
                dadosCompletos: item
            });
        });

        
        this.dados.beneficios.forEach(item => {
            dadosConsolidados.push({
                tipo: 'Benefício',
                descricao: `Benefício - ${item.tipo}`,
                valor: item.valor,
                data: item.data,
                categoria: item.tipo,
                status: 'Recebido',
                origem: 'beneficio',
                dadosCompletos: item
            });
        });

        return dadosConsolidados;
    }

    calcularStatusDespesa(vencimento) {
        const hoje = new Date();
        const venc = new Date(vencimento);
        const diffTime = venc - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Vencido';
        if (diffDays <= 7) return 'Próximo';
        return 'Pendente';
    }

    aplicarFiltros(dados) {
        let dadosFiltrados = dados;

        
        if (this.filtroAtual !== 'todos') {
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.origem.includes(this.filtroAtual)
            );
        }

        
        const textoPesquisa = document.getElementById('pesquisa-lista').value.toLowerCase();
        if (textoPesquisa) {
            dadosFiltrados = dadosFiltrados.filter(item =>
                item.descricao.toLowerCase().includes(textoPesquisa)
            );
        }

        
        const categoria = document.getElementById('filtro-categoria').value;
        if (categoria) {
            dadosFiltrados = dadosFiltrados.filter(item =>
                item.categoria === categoria
            );
        }

        
        const dataInicio = document.getElementById('filtro-data-inicio').value;
        const dataFim = document.getElementById('filtro-data-fim').value;

        if (dataInicio) {
            dadosFiltrados = dadosFiltrados.filter(item =>
                new Date(item.data) >= new Date(dataInicio)
            );
        }

        if (dataFim) {
            dadosFiltrados = dadosFiltrados.filter(item =>
                new Date(item.data) <= new Date(dataFim)
            );
        }

        return dadosFiltrados;
    }

    atualizarLista() {
        const dadosConsolidados = this.consolidarDados();
        this.dadosFiltrados = this.aplicarFiltros(dadosConsolidados);

        this.atualizarEstatisticas();
        this.renderizarTabela();
    }

    atualizarEstatisticas() {
        const totalItens = this.dadosFiltrados.length;
        const valorTotal = this.dadosFiltrados.reduce((sum, item) => sum + parseFloat(item.valor), 0);

        document.getElementById('total-itens').textContent = totalItens;
        document.getElementById('valor-total').textContent = this.formatarMoeda(valorTotal);
    }

    renderizarTabela() {
        const tbody = document.getElementById('corpo-tabela-lista');
        tbody.innerHTML = '';

        this.dadosFiltrados.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge tipo-${item.origem}">${item.tipo}</span></td>
                <td>${item.descricao}</td>
                <td class="${item.valor >= 0 ? 'positive' : 'negative'}">${this.formatarMoeda(item.valor)}</td>
                <td>${this.formatarData(item.data)}</td>
                <td>${this.formatarCategoria(item.categoria)}</td>
                <td><span class="status-${item.status.toLowerCase()}">${item.status}</span></td>
                <td>
                    <button class="btn-icon btn-editar" title="Editar" onclick="listaFinanceira.editarItem('${item.origem}', ${this.dadosFiltrados.indexOf(item)})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-excluir" title="Excluir" onclick="listaFinanceira.excluirItem('${item.origem}', ${this.dadosFiltrados.indexOf(item)})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    formatarCategoria(categoria) {
        const categorias = {
            'alimentacao': 'Alimentação',
            'transporte': 'Transporte',
            'lazer': 'Lazer',
            'moradia': 'Moradia',
            'fixa': 'Fixa',
            'variavel': 'Variável'
        };
        return categorias[categoria] || categoria;
    }

    editarItem(tipo, index) {
        
        console.log('Editar:', tipo, index);
        alert(`Editar item do tipo: ${tipo}`);
    }

    excluirItem(tipo, index) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            
            console.log('Excluir:', tipo, index);
            this.carregarDados();
            this.atualizarLista();
        }
    }

    exportarParaExcel() {
        const dadosParaExportar = this.dadosFiltrados.map(item => ({
            'Tipo': item.tipo,
            'Descrição': item.descricao,
            'Valor': item.valor,
            'Data': item.data,
            'Categoria': item.categoria,
            'Status': item.status
        }));

        const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transações');
        XLSX.writeFile(wb, 'lista_transacoes.xlsx');
    }

    imprimirLista() {
        window.print();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    window.listaFinanceira = new ListaFinanceira();
});