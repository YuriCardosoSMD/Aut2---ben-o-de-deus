/* ==================================================================
   QUESTÃO 3: BACKEND API (Node.js + Express)
   ================================================================== */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json()); // Para processar JSON no corpo da requisição
app.use(cors());         // Permite que o Frontend (outra porta) acesse a API

// Banco de dados em memória (Vetor de Objetos)
const usersDB = [];

// Lista de palavras proibidas (SQL Injection)
const sqlBlacklist = ["SELECT", "CREATE", "DELETE", "UPDATE"];

// --- ROTA DE CADASTRO ---
app.post('/cadastrarusr', (req, res) => {
    const dados = req.body;
    const erros = [];

    // === 1. SANITIZAÇÃO (Segurança contra SQL Injection) ===
    // Verifica se qualquer valor dos campos contém as palavras proibidas
    const valores = Object.values(dados);
    const tentativaAtaque = valores.some(valor => {
        if (typeof valor === 'string') {
            const valorUpper = valor.toUpperCase();
            return sqlBlacklist.some(word => valorUpper.includes(word));
        }
        return false;
    });

    if (tentativaAtaque) {
        return res.status(500).json({ 
            erro: "Tentativa de injeção SQL detectada. Requisição rejeitada." 
        });
    }

    // === 2. VALIDAÇÃO DUPLA (Replicando regras do Frontend) ===

    // Nome (3-50 chars)
    if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
        erros.push("Nome: Entre 3 e 50 caracteres.");
    }

    // E-mail (Regex estrito)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!dados.email || !emailRegex.test(dados.email)) {
        erros.push("E-mail: Formato inválido.");
    }

    // Rua (Min 4)
    if (!dados.rua || dados.rua.trim().length < 4) {
        erros.push("Rua: Mínimo de 4 caracteres.");
    }

    // Número (Obrigatório)
    if (!dados.numero || dados.numero.trim() === "") {
        erros.push("Número: Obrigatório.");
    }

    // CEP (8 dígitos, com ou sem máscara)
    const cepLimpo = dados.cep ? dados.cep.replace(/\D/g, '') : '';
    if (cepLimpo.length !== 8) {
        erros.push("CEP: Formato inválido.");
    }

    // Cidade (Min 3)
    if (!dados.cidade || dados.cidade.trim().length < 3) {
        erros.push("Cidade: Mínimo de 3 caracteres.");
    }

    // Estado (Exatamente 2)
    if (!dados.estado || dados.estado.trim().length !== 2) {
        erros.push("Estado: Deve conter 2 letras.");
    }

    // Senha (Min 10, Letra, Número, Especial permitido, Sem proibidos)
    const senha = dados.senha || "";
    const validacaoSenha = 
        senha.length >= 10 &&
        /[a-zA-Z]/.test(senha) &&     
        /[0-9]/.test(senha) &&        
        /[*;#]/.test(senha) &&        
        !/[^a-zA-Z0-9*;#]/.test(senha); 

    if (!validacaoSenha) {
        erros.push("Senha: Fraca ou caracteres inválidos (Use apenas *, ; ou #).");
    }

    // Confirmação de Senha
    if (dados.senha !== dados.senha_confirm) {
        erros.push("Confirmação de Senha: As senhas não conferem.");
    }

    // === 3. RESPOSTA ===
    if (erros.length > 0) {
        // Retorna erro 500 com lista de problemas
        return res.status(500).json({ 
            erro: "Erro de validação", 
            detalhes: erros 
        });
    }

    // Se passou, salva e retorna 200
    // Removemos a confirmação de senha antes de salvar
    const usuarioSalvo = { ...dados };
    delete usuarioSalvo.senha_confirm;
    
    usersDB.push(usuarioSalvo);
    console.log("Novo usuário cadastrado:", usuarioSalvo.nome);
    console.log("Total de usuários:", usersDB.length);

    return res.status(200).json({ message: "OK" });
});

// --- ROTA PARA LISTAR USUÁRIOS (GET) ---
// Isso permite que você acesse http://localhost:5000/usuarios e veja o JSON
app.get('/usuarios', (req, res) => {
    // Retorna o array da memória como JSON
    res.status(200).json(usersDB);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});