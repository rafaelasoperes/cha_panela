# 🏠 Chá de Panela - Site de Presentes

Um site simples, leve e responsivo para gerenciar presentes em um chá de panela. Os convidados podem escolher um ou mais presentes e seus dados são automaticamente salvos em uma planilha do Google.

## ✨ Características

- ✅ Interface bonita e responsiva (desktop, tablet, mobile)
- ✅ Tema delicado com cores suaves em tons de verde militar
- ✅ Filtros por categoria: Cozinha, Banheiro e Lavanderia
- ✅ Seleção de múltiplos presentes com checkboxes
- ✅ Validações em tempo real
- ✅ Integração com Google Sheets via Google Apps Script
- ✅ Sem dependências externas (HTML, CSS, JavaScript puros)
- ✅ Código comentado e fácil de manter
- ✅ Formatação automática de telefone
- ✅ Presentes carregados dinamicamente de arquivos de texto
- ✅ Paginação automática para listas longas
- ✅ Local Storage para presentes removidos

## 📁 Estrutura do Projeto

```
chaPanela/
├── index.html              # Página principal (HTML semântico)
├── css/
│   └── style.css           # Estilos (responsivo, tema delicado)
├── js/
│   └── script.js           # Lógica (validações, envio de dados, filtros)
├── Cozinha.txt             # Lista de presentes de cozinha
├── Banheiro.txt            # Lista de presentes de banheiro
├── Lavanderia.txt          # Lista de presentes de lavanderia
├── apps-script.gs          # Google Apps Script (back-end)
└── README.md              # Este arquivo
```

## 🚀 Como Começar

### Opção 1: Usar Localmente (Teste Rápido)

1. **Clonar ou baixar os arquivos**
   ```bash
   git clone <repositório>
   cd chaPanela
   ```

2. **Abrir no navegador**
   - Clique duas vezes em `index.html`
   - Ou arraste o arquivo para o navegador
   - ⚠️ **Nota**: Sem configurar o Google Apps Script, o envio não funcionará, mas você pode testar o design e validações

### Opção 2: Servir com um servidor local

Se quiser testar com mais realismo:

**Com Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Com Node.js:**
```bash
npx http-server
```

Depois acesse: `http://localhost:8000`

---

## 🔧 Configuração Completa (com Google Sheets)

Siga estes passos para integrar com Google Sheets:

### PASSO 1: Preparar o Google Sheets

1. **Ir para Google Sheets**
   - Acesse: https://docs.google.com/spreadsheets/
   - Clique em **"+ Nova planilha"**
   - Dê um nome, ex: `Chá de Panela - Presentes`

2. **Copiar o ID da planilha**
   - A URL será algo como:
     ```
     https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
     ```
   - O ID é a parte entre `/d/` e `/edit`:
     ```
     1a2b3c4d5e6f7g8h9i0j
     ```
   - **Guarde este ID, você precisará depois!**

---

### PASSO 2: Configurar Google Apps Script

1. **Abrir Google Apps Script Editor**
   - Vá para: https://script.google.com
   - Clique em **"+ Novo projeto"**

2. **Copiar o código**
   - Cole o conteúdo do arquivo `apps-script.gs`
   - Dê um nome ao projeto, ex: `Chá de Panela`
   - Salve (`Ctrl + S`)

3. **Adicionar o ID da planilha**
   - Na linha 15 do código, substitua:
     ```javascript
     const PLANILHA_ID = 'SEU_ID_DA_PLANILHA_AQUI';
     ```
   - Pelo ID que você copiou no Passo 1:
     ```javascript
     const PLANILHA_ID = '1a2b3c4d5e6f7g8h9i0j';
     ```
   - Salve (`Ctrl + S`)

4. **Testar o script (opcional)**
   - No menu superior, selecione a função **`testarEnvio`**
   - Clique no botão ▶️ **"Executar"**
   - Autorize a aplicação (primeira vez)
   - Verifique se dados de teste apareceram na planilha

---

### PASSO 3: Publicar como Web App

1. **Criar um novo Deploy**
   - Clique em **"Deploy"** (ou ⚙️ "Fazer uma implantação nova")
   - Selecione **tipo**: `Web app`
   - **Executar como**: Sua conta Google
   - **Quem tem acesso**: `Qualquer um`
   - Clique em **"Implantar"**

2. **Copiar a URL**
   - Uma URL será fornecida, algo como:
     ```
     https://script.google.com/macros/d/1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX9YZ/usercopy?state=done
     ```
   - **Copie e guarde esta URL!**

---

### PASSO 4: Configurar o JavaScript

1. **Abrir arquivo `js/script.js`**

2. **Substitua a URL na linha 11:**
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/SEU_ID_AQUI/usercopy?state=done';
   ```
   
   Pela URL que você copiou no Passo 3:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX9YZ/usercopy?state=done';
   ```

3. **Salve o arquivo**

---

### PASSO 5: Testar!

1. **Abra o arquivo `index.html`** no navegador
2. **Preencha o formulário:**
   - Nome: Ex. "João Silva"
   - Telefone: Ex. "(11) 99999-9999" ou "11999999999"
   - Escolha um ou mais presentes
3. **Clique em "Enviar"**
4. **Verifique a planilha** - os dados devem aparecer em uma nova linha!

---

## 📝 Validações Implementadas

✅ **Nome:**
- Obrigatório
- Mínimo 3 caracteres

✅ **Telefone:**
- Obrigatório
- Aceita: `(11) 99999-9999` ou `11999999999`
- Valida se tem 10 ou 11 dígitos

✅ **Presentes:**
- Obrigatório selecionar pelo menos 1
- Pode selecionar múltiplos
- Filtros por categoria (Cozinha, Banheiro, Lavanderia)
- Paginação automática
- Validação visual com cores

✅ **Mensagens:**
- Erro em tempo real (quando sai do campo)
- Sucesso após envio
- Feedback visual claro

## 🏷️ Funcionalidades Especiais

- **Filtros por Categoria**: Botões para alternar entre Cozinha, Banheiro e Lavanderia
- **Paginação**: Lista dividida em páginas de 10 itens para melhor performance
- **Local Storage**: Presentes removidos são lembrados entre sessões
- **Observação Importante**: Caixa destacada sobre preferência de cores dos utensílios
- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **Glassmorphism**: Efeitos visuais modernos no header

---

## 🎨 Personalizando

### Adicionar/Remover Presentes

Os presentes são carregados dinamicamente dos arquivos `.txt`. Cada linha representa um presente.

1. **Para ADICIONAR um presente:**
   - Abra o arquivo correspondente (`Cozinha.txt`, `Banheiro.txt` ou `Lavanderia.txt`)
   - Adicione uma nova linha com o nome do presente
   - Exemplo: `Jogo de Panelas Antiaderente`

2. **Para REMOVER um presente:**
   - Abra o arquivo correspondente
   - Apague a linha do presente
   - Salve o arquivo

3. **Para ADICIONAR uma nova categoria:**
   - Crie um novo arquivo `.txt` (ex: `Sala.txt`)
   - Adicione presentes, um por linha
   - Atualize o HTML: adicione um botão no `categoryFilter`
   - Atualize o JavaScript: adicione o caso no `carregarPresentes()`

### Mudar Cores do Tema

1. **Abra `css/style.css`**
2. **Localize as variáveis CSS no início do arquivo (linhas 5-30)**
3. **Edite as cores:**
   ```css
   --primary-color: #8f9b72;        /* Verde militar suave */
   --secondary-color: #b7c28b;      /* Verde claro */
   --accent-color: #6c7a4f;         /* Verde mais escuro */
   --dark-bg: #2f3a26;              /* Verde escuro para textos */
   --light-bg: #f1f3ea;             /* Fundo claro esverdeado */
   ```

### Mudar Textos

- **Título**: No `index.html`, procure `<h1 class="main-title">` e edite
- **Nomes do casal**: Procure `<span class="bride">` e `<span class="groom">` e edite
- **Detalhes do evento**: Procure `<div class="event-details">` e edite
- **Texto de boas-vindas**: Procure `<section class="welcome-section">` e edite
- **Rótulos do formulário**: Procure `<label for=...>` e edite

---

## 📱 Responsividade

O site é totalmente responsivo:
- **Desktop**: Layout em coluna única, bem espaçado
- **Tablet**: Grid de presentes adaptado (2-3 colunas)
- **Mobile**: Grid de 1-2 colunas, fontes ajustadas

Teste redimensionando a janela do navegador!

---

## 🐛 Troubleshooting

### "Mensagem de erro: CORS error"
- Certifique-se que a URL do Google Apps Script está correta
- Verifique se o Deploy foi publicado como "Qualquer um"

### "Dados não aparecem na planilha"
- Verifique se o ID da planilha está correto
- Revise o Google Apps Script e execute `testarEnvio()`
- Verifique os logs do Apps Script (menu "Execução")

### "Telefone não valida"
- O script aceita: `(11) 99999-9999` ou `11999999999`
- Deve ter 10 ou 11 dígitos
- Apenas números são contabilizados

### "Formulário não envia"
- Altere o console do navegador (F12) para ver erros
- Verifique se todos os campos estão preenchidos
- Teste com `testarEnvio()` no Apps Script

---

## 📊 O que é Salvo na Planilha

Quando um convidado envia o formulário, os seguintes dados são salvos:

| Campo | Conteúdo |
|-------|----------|
| **Nome** | Nome completo do convidado |
| **Telefone** | Telefone formatado |
| **Presentes** | Presentes selecionados, separados por `;` (incluindo categoria) |
| **Data/Hora** | Data e hora do envio (formato PT-BR) |

**Exemplo:**
```
João Silva | (11) 99999-9999 | Cozinha: Jogo de Pratos; Banheiro: Toalhas | 22/03/2026 14:30:45
```

---

## 🔒 Segurança

⚠️ **Notas importantes:**

1. **Google Apps Script é público**: Qualquer um pode acessar a URL
   - Isso é normal para formulários públicos
   - Não coloque dados sensíveis além do necessário

2. **Spam**: Considere adicionar validações adicionais se receber muitos dados indesejados
   - Exemplo: Captcha (requer biblioteca extra)

3. **Privacidade**: Os dados são salvos no Google Sheets
   - Mantenha a planilha compartilhada apenas com pessoas confiáveis

---

## 💡 Dicas

1. **Fazer cópia da planilha**: Alguns presentes já foram escolhidos? Faça uma cópia da planilha antes de compartilhar novamente

2. **Baixar dados**: Na planilha, vá em `Arquivo > Fazer download > Excel` para exportar

3. **Adicionar mais colunas**: Você pode editar o Google Apps Script para adicionar novos campos

4. **Mudar o nome da aba**: Se mudar o nome da aba, atualize a variável `NOME_ABA` no Apps Script

5. **Editar listas de presentes**: Modifique os arquivos `.txt` diretamente para adicionar/remover itens

6. **Testar validações**: Tente enviar com campos vazios - deve aparecer mensagem de erro

7. **Testar filtros**: Clique nos botões de categoria para ver os presentes de cada seção

---

## 📧 Suporte

Se tiver problemas:

1. **Verifique o README** - tem resposta para a maioria das dúvidas
2. **Console do navegador** - F12 para ver mensagens de erro
3. **Google Apps Script** - Vá em Execução para ver logs

---

## 📄 Licença

Este projeto é livre para usar e modificar!

---

## 🎉 Pronto!

Seu site de Chá de Panela está configurado e pronto para funcionar. Compartilhe o `index.html` com seus convidados e aproveite!

**Dica final**: Teste tudo antes de compartilhar com seus convidados. 😊

---

**Criado com ❤️ para facilitar seu Chá de Panela**
