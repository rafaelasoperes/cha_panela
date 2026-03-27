/* ========================================
   CHÁ DE PANELA - JAVASCRIPT
   ======================================== */

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzjCfcpHuq1ds3Zgg3AiMsyYguUOvUvzny4MAGSK-AsKEd6DispZ2ECF-zAVvuhXcD1/exec';

const PRESENTES_FALLBACK = [
    'Jogo de Pratos',
    'Conjunto de Taças',
    'Panela',
    'Faqueiro',
    'Liquidificador',
    'Air Fryer',
    'Toalhas',
    'Utensílios de Cozinha'
];

const REMOVED_GIFTS_STORAGE_KEY = 'presentesRemovidos';
const CATEGORIES = {
    cozinha: 'Cozinha.txt',
    banheiro: 'Banheiro.txt',
    lavanderia: 'Lavanderia.txt'
};

let allPresentesByCategory = {
    cozinha: [],
    banheiro: [],
    lavanderia: []
};

// agora guarda a quantidade já escolhida por nome
let presentesEscolhidosContagem = {};

let currentCategory = 'cozinha';

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let totalPages = 1;

const form = document.getElementById('presentForm');
const nomeInput = document.getElementById('nome');
const telefoneInput = document.getElementById('telefone');
const categoryFilter = document.getElementById('categoryFilter');
const giftsContainer = document.getElementById('giftsContainer');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const paginationInfo = document.getElementById('paginationInfo');
const presentesNoDisponiveis = document.getElementById('presentesNoDisponiveis');
const loadingPresentes = document.getElementById('loadingPresentes');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

function getPresentesCheckboxes() {
    return document.querySelectorAll('input[name="presentes"]');
}

function normalizePresentName(nome) {
    return nome.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function validarNome(nome) {
    const nomeError = document.getElementById('nomeError');
    const trimmedNome = nome.trim();

    if (!trimmedNome) {
        nomeError.textContent = 'Nome é obrigatório';
        nomeError.classList.add('show');
        return false;
    }

    if (trimmedNome.length < 3) {
        nomeError.textContent = 'Nome deve ter pelo menos 3 caracteres';
        nomeError.classList.add('show');
        return false;
    }

    nomeError.classList.remove('show');
    return true;
}

function validarTelefone(telefone) {
    const telefoneError = document.getElementById('telefoneError');
    const trimmedTelefone = telefone.trim();

    const apenasNumeros = trimmedTelefone.replace(/\D/g, '');

    if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
        telefoneError.textContent = 'Telefone deve ter 10 ou 11 dígitos';
        telefoneError.classList.add('show');
        return false;
    }

    telefoneError.classList.remove('show');
    return true;
}

function validarPresentes() {
    const presentesError = document.getElementById('presentesError');
    const presentesSelecionados = Array.from(getPresentesCheckboxes()).filter(cb => cb.checked);

    if (presentesSelecionados.length === 0) {
        presentesError.textContent = 'Selecione pelo menos um presente';
        presentesError.classList.add('show');
        return false;
    }

    presentesError.classList.remove('show');
    return true;
}

function validarFormulario() {
    const nomeValido = validarNome(nomeInput.value);
    const telefoneValido = validarTelefone(telefoneInput.value);
    const presentesValidos = validarPresentes();

    return nomeValido && telefoneValido && presentesValidos;
}

function coletarDados() {
    const presentesSelecionados = Array.from(getPresentesCheckboxes())
        .filter(cb => cb.checked)
        .map(checkbox => checkbox.value);

    return {
        nome: nomeInput.value.trim(),
        telefone: nomeInput ? telefoneInput.value.trim() : '',
        presentes: presentesSelecionados.join('; '),
        dataHora: new Date().toLocaleString('pt-BR')
    };
}

async function carregarPresentesBloqueados() {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        const data = await response.json();

        if (data.status === 'sucesso' && data.presentesEscolhidos && typeof data.presentesEscolhidos === 'object') {
            presentesEscolhidosContagem = {};

            Object.entries(data.presentesEscolhidos).forEach(([nome, qtd]) => {
                const normalizado = normalizePresentName(nome);
                if (normalizado) {
                    presentesEscolhidosContagem[normalizado] = Number(qtd) || 0;
                }
            });

            console.log('presentesEscolhidosContagem:', presentesEscolhidosContagem);
        } else {
            presentesEscolhidosContagem = {};
        }
    } catch (error) {
        console.error('Erro ao carregar presentes bloqueados:', error);
        presentesEscolhidosContagem = {};
    }
}

function marcarPresentesRemovidos(selecionados) {
    const guardados = JSON.parse(localStorage.getItem(REMOVED_GIFTS_STORAGE_KEY) || '[]');
    const unicos = Array.from(new Set([...guardados, ...selecionados]));
    localStorage.setItem(REMOVED_GIFTS_STORAGE_KEY, JSON.stringify(unicos));
}

function obterPresentesRemovidos() {
    return JSON.parse(localStorage.getItem(REMOVED_GIFTS_STORAGE_KEY) || '[]');
}

function inserirOpcoesPresentes(presentes) {
    giftsContainer.innerHTML = '';

    if (presentes.length === 0) {
        presentesNoDisponiveis.style.display = 'block';
        return;
    }

    presentesNoDisponiveis.style.display = 'none';

    const presentesCategoria = allPresentesByCategory[currentCategory] || [];

    const inicioPagina = (currentPage - 1) * ITEMS_PER_PAGE;
    const anteriores = presentesCategoria.slice(0, inicioPagina);

    const contagemAnteriores = {};
    anteriores.forEach(presente => {
        const normalizado = normalizePresentName(presente);
        contagemAnteriores[normalizado] = (contagemAnteriores[normalizado] || 0) + 1;
    });

    const renderizados = { ...contagemAnteriores };

    presentes.forEach(presente => {
        const normalizado = normalizePresentName(presente);

        renderizados[normalizado] = (renderizados[normalizado] || 0) + 1;

        const quantidadeEscolhida = presentesEscolhidosContagem[normalizado] || 0;
        const bloqueado = renderizados[normalizado] <= quantidadeEscolhida;

        const id = 'gift-' + normalizado.replace(/[^a-z0-9]+/g, '-') + '-' + renderizados[normalizado];

        const div = document.createElement('div');
        div.className = `gift-option ${bloqueado ? 'gift-option--disabled' : ''}`;

        const icon = getIconForPresent(presente);

        div.innerHTML = `
            <input
                type="checkbox"
                id="${id}"
                name="presentes"
                value="${presente}"
                ${bloqueado ? 'disabled' : ''}
            >
            <label for="${id}">
                <span class="icon">${icon}</span>
                <span>${presente}</span>
                ${bloqueado ? '<small class="gift-status">Indisponível</small>' : ''}
            </label>
        `;

        giftsContainer.appendChild(div);
    });

    atualizarListenersPresentes();
}

function getIconForPresent(presente) {
    const mapeamento = {
        'jogo de pratos': '🍽️',
        'conjunto de taças': '🥂',
        'panela': '🍲',
        'faqueiro': '🔪',
        'liquidificador': '🥤',
        'air fryer': '🍟',
        'toalhas': '🧣',
        'utensílios de cozinha': '🍴',
        'frigideira': '🍳',
        'panela de pressão': '🫕',
        'copo medidor': '🧪',
        'serviço': '🥘'
    };

    return mapeamento[presente.toLowerCase()] || '🎁';
}

function obterPresentesPagina(presentes, pagina) {
    const inicio = (pagina - 1) * ITEMS_PER_PAGE;
    return presentes.slice(inicio, inicio + ITEMS_PER_PAGE);
}

function atualizarPaginacao(totalItems) {
    totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    paginationControls.style.display = totalItems > ITEMS_PER_PAGE ? 'flex' : 'none';
}

function atualizarPresentesDisponiveis() {
    const removidos = obterPresentesRemovidos().map(normalizePresentName);
    const presentesCategoria = allPresentesByCategory[currentCategory] || [];

    const disponiveis = presentesCategoria.filter(p => !removidos.includes(normalizePresentName(p)));

    totalPages = Math.max(1, Math.ceil(disponiveis.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    const presentesPagina = obterPresentesPagina(disponiveis, currentPage);
    inserirOpcoesPresentes(presentesPagina);
    atualizarPaginacao(disponiveis.length);
}

function carregarPresentes() {
    console.log('Iniciando carregamento de presentes...');
    loadingPresentes.style.display = 'block';
    presentesNoDisponiveis.style.display = 'none';

    const carregamentos = Object.entries(CATEGORIES).map(([categoria, arquivo]) => {
        return fetch(arquivo)
            .then(response => {
                if (!response.ok) throw new Error('Falha ao carregar ' + arquivo);
                return response.text();
            })
            .then(text => {
                const linhas = text.split('\n')
                    .map(l => l.trim())
                    .filter(l => l && l.toLowerCase() !== categoria.toLowerCase());

                allPresentesByCategory[categoria] = linhas.length > 0 ? linhas : PRESENTES_FALLBACK;
            })
            .catch(() => {
                allPresentesByCategory[categoria] = PRESENTES_FALLBACK;
            });
    });

    Promise.all(carregamentos)
        .then(() => {
            setTimeout(() => {
                loadingPresentes.style.display = 'none';
                currentPage = 1;
                atualizarCategoriaBotoes();
                atualizarPresentesDisponiveis();
            }, 2000);
        })
        .catch(() => {
            setTimeout(() => {
                loadingPresentes.style.display = 'none';
                currentPage = 1;
                atualizarCategoriaBotoes();
                atualizarPresentesDisponiveis();
            }, 2000);
        });
}

function atualizarListenersPresentes() {
    const checkboxes = getPresentesCheckboxes();
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const presentesError = document.getElementById('presentesError');
            if (presentesError.classList.contains('show')) {
                validarPresentes();
            }
        });
    });
}

function atualizarCategoriaBotoes() {
    const botoes = document.querySelectorAll('.category-btn');
    botoes.forEach(btn => {
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function inicializarFiltrosCategoria() {
    if (!categoryFilter) return;

    categoryFilter.addEventListener('click', (event) => {
        const botao = event.target.closest('.category-btn');
        if (!botao) return;

        const categoria = botao.dataset.category;
        if (!categoria || !CATEGORIES[categoria]) return;
        if (currentCategory === categoria) return;

        currentCategory = categoria;
        currentPage = 1;
        atualizarCategoriaBotoes();
        atualizarPresentesDisponiveis();
    });
}

function desabilitarBotao() {
    submitBtn.disabled = true;
    document.getElementById('submitText').style.display = 'none';
    document.getElementById('submitSpinner').style.display = 'inline-block';
}

function habilitarBotao() {
    submitBtn.disabled = false;
    document.getElementById('submitText').style.display = 'inline';
    document.getElementById('submitSpinner').style.display = 'none';
}

function exibirSucesso() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
        form.reset();
        successMessage.style.display = 'none';
    }, 3000);
}

function exibirErro(mensagem) {
    successMessage.style.display = 'none';
    errorText.textContent = mensagem || 'Erro ao enviar. Tente novamente.';
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function enviarDados(dados) {
    desabilitarBotao();

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (resultado.status !== 'sucesso') {
            exibirErro(resultado.mensagem || 'Não foi possível salvar os dados.');
            habilitarBotao();
            return;
        }

        await carregarPresentesBloqueados();
        atualizarPresentesDisponiveis();
        exibirSucesso();
        habilitarBotao();

    } catch (error) {
        console.error('Erro ao enviar:', error);
        exibirErro('Erro ao enviar dados. Verifique sua conexão e tente novamente.');
        habilitarBotao();
    }
}

nomeInput.addEventListener('blur', () => {
    validarNome(nomeInput.value);
});

nomeInput.addEventListener('input', () => {
    const nomeError = document.getElementById('nomeError');
    if (nomeError.classList.contains('show')) {
        validarNome(nomeInput.value);
    }
});

telefoneInput.addEventListener('blur', () => {
    validarTelefone(telefoneInput.value);
});

telefoneInput.addEventListener('input', () => {
    const telefoneError = document.getElementById('telefoneError');
    if (telefoneError.classList.contains('show')) {
        validarTelefone(telefoneInput.value);
    }
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        atualizarPresentesDisponiveis();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        atualizarPresentesDisponiveis();
    }
});

atualizarListenersPresentes();

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const dados = coletarDados();
    console.log('Dados a enviar:', dados);
    enviarDados(dados);
});

document.addEventListener('DOMContentLoaded', async () => {
    if (GOOGLE_APPS_SCRIPT_URL.includes('SEU_ID_AQUI')) {
        console.warn('⚠️ AVISO: URL do Google Apps Script não foi configurada!');
        console.warn('Veja o arquivo README.md para instruções.');
    }

    console.log('DOMContentLoaded, loadingPresentes:', loadingPresentes);
    nomeInput.focus();
    inicializarFiltrosCategoria();

    await carregarPresentesBloqueados();
    carregarPresentes();
});

function formatarTelefone(value) {
    const numeros = value.replace(/\D/g, '');

    if (numeros.length === 11) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return value;
}

telefoneInput.addEventListener('input', (event) => {
    const formattedValue = formatarTelefone(event.target.value);
    event.target.value = formattedValue;
});