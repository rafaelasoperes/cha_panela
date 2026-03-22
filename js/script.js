/* ========================================
   CHÁ DE PANELA - JAVASCRIPT
   ======================================== */

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcZmtZLuOTr2mB2z6S6Rqdg2oKUP89ETc3vMrHudrb7nI8688Y6DzQ6wQNOw1hifdk/exec';

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
let currentCategory = 'cozinha';

const ITEMS_PER_PAGE = 10;
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
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

function getPresentesCheckboxes() {
    return document.querySelectorAll('input[name="presentes"]');
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
    const presentesSelecionados = Array.from(
        getPresentesCheckboxes()
    ).filter(cb => cb.checked)
     .map(checkbox => checkbox.value);

    return {
        nome: nomeInput.value.trim(),
        telefone: telefoneInput.value.trim(),
        presentes: presentesSelecionados.join('; '), // Separado por ponto e vírgula
        dataHora: new Date().toLocaleString('pt-BR')
    };
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

    presentes.forEach(presente => {
        const id = 'gift-' + presente.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const div = document.createElement('div');
        div.className = 'gift-option';

        const icon = getIconForPresent(presente);

        div.innerHTML = `
            <input type="checkbox" id="${id}" name="presentes" value="${presente}">
            <label for="${id}">
                <span class="icon">${icon}</span>
                <span>${presente}</span>
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

    const texto = `Página ${currentPage} de ${totalPages}`;
    paginationInfo.textContent = texto;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    if (totalItems > ITEMS_PER_PAGE) {
        paginationControls.style.display = 'flex';
    } else {
        paginationControls.style.display = 'none';
    }
}

function atualizarPresentesDisponiveis() {
    const removidos = obterPresentesRemovidos();
    const presentesCategoria = allPresentesByCategory[currentCategory] || [];
    const disponiveis = presentesCategoria.filter(p => !removidos.includes(p));
    
    totalPages = Math.max(1, Math.ceil(disponiveis.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    const presentesPagina = obterPresentesPagina(disponiveis, currentPage);
    inserirOpcoesPresentes(presentesPagina);
    atualizarPaginacao(disponiveis.length);
}

function carregarPresentes() {
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
            currentPage = 1;
            atualizarCategoriaBotoes();
            atualizarPresentesDisponiveis();
        })
        .catch(() => {
            currentPage = 1;
            atualizarCategoriaBotoes();
            atualizarPresentesDisponiveis();
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

function getPresentesCheckboxes() {
    return document.querySelectorAll('input[name="presentes"]');
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
    
    // Rolar até a mensagem de sucesso
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Limpar formulário após 2 segundos
    setTimeout(() => {
        form.reset();
        successMessage.style.display = 'none';
    }, 3000);
}

function exibirErro(mensagem) {
    successMessage.style.display = 'none';
    errorText.textContent = mensagem || 'Erro ao enviar. Tente novamente.';
    errorMessage.style.display = 'block';
    
    // Rolar até a mensagem de erro
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function enviarDados(dados) {
    desabilitarBotao();

    fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
    })
    .then(response => {
        // Com mode: 'no-cors', não conseguimos checar status
        // Então consideramos sucesso após 2 segundos
        setTimeout(() => {
            const selecionados = Array.from(getPresentesCheckboxes())
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selecionados.length > 0) {
                marcarPresentesRemovidos(selecionados);
                atualizarPresentesDisponiveis();
            }

            exibirSucesso();
            habilitarBotao();
        }, 1000);
    })
    .catch(error => {
        console.error('Erro ao enviar:', error);
        exibirErro('Erro ao enviar dados. Verifique sua conexão e tente novamente.');
        habilitarBotao();
    });
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

document.addEventListener('DOMContentLoaded', () => {
    if (GOOGLE_APPS_SCRIPT_URL.includes('SEU_ID_AQUI')) {
        console.warn('⚠️ AVISO: URL do Google Apps Script não foi configurada!');
        console.warn('Veja o arquivo README.md para instruções.');
    }

    nomeInput.focus();

    inicializarFiltrosCategoria();

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
