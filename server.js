const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000; // Mantive 3000 conforme seu arquivo original

// Habilita CORS e processamento de JSON
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos do frontend
app.use(express.static(__dirname));

// Serve a pasta de uploads publicamente
app.use('/fotos_usuarios', express.static(path.join(__dirname, 'fotos_usuarios')));

// --- CONFIGURAÇÃO DO MULTER (UPLOAD) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'fotos_usuarios/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
        }
    }
});

// --- BANCO DE DADOS EM MEMÓRIA ---
const usuarios = [];

// --- FUNÇÕES AUXILIARES DE VALIDAÇÃO ---

// Verifica ataques de SQL Injection (Simulação)
function contemAtaqueSQL(texto) {
    if (!texto || typeof texto !== 'string') return false;
    const forbidden = ['SELECT', 'CREATE', 'DELETE', 'UPDATE'];
    const upperTexto = texto.toUpperCase();
    return forbidden.some(word => upperTexto.includes(word));
}

// Valida email no formato ccc@ddd.ccc
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@\.]+$/;
    return regex.test(email);
}

// --- ENDPOINTS ---

// 1. POST /cadastrar_usuario (Questão 3)
app.post('/cadastrar_usuario', upload.single('foto'), (req, res) => {
    try {
        // Campos recebidos do FormData
        const { nome, email, cep, rua, numero, bairro, cidade, estado, senha, complemento } = req.body;
        
        // --- QUESTÃO 3: SANITIZAÇÃO (SEGURANÇA) ---
        const dadosVerificar = [nome, email, rua, numero, bairro, cidade, estado, senha, complemento];
        const ataqueDetectado = dadosVerificar.some(campo => contemAtaqueSQL(campo));

        if (ataqueDetectado) {
            // Remove a foto enviada se houver ataque
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ error: "Tentativa de injeção SQL detectada! Cadastro bloqueado." });
        }

        // --- QUESTÃO 3: VALIDAÇÃO DUPLA (REGRAS DE NEGÓCIO) ---
        const erros = [];

        // Nome: Min caracteres para ser real (ex: 2) e max 50
        if (!nome || nome.length < 2 || nome.length > 50) erros.push("Nome inválido (deve ter entre 2 e 50 chars)");

        // Email: Formato estrito
        if (!validarEmail(email)) erros.push("Formato de e-mail inválido (ex: nome@dominio.com)");

        // Endereço: Validações de tamanho
        if (!rua || rua.length < 4) erros.push("Rua muito curta (mín 4 chars)");
        if (!cidade || cidade.length < 3) erros.push("Cidade muito curta (mín 3 chars)");
        if (!estado || estado.length !== 2) erros.push("Estado deve ter 2 letras (UF)");
        
        // Senha: Min 10 chars, letras, números e especiais permitidos (* ; #)
        if (!senha || senha.length < 10) {
            erros.push("Senha muito curta (mín 10 chars)");
        } else {
            const temLetra = /[a-zA-Z]/.test(senha);
            const temNumero = /[0-9]/.test(senha);
            const temEspecial = /[*;#]/.test(senha); // Apenas *, ; ou #
            if (!temLetra || !temNumero || !temEspecial) {
                erros.push("Senha deve conter letras, números e caracteres especiais (* ; #)");
            }
        }

        // Se houver erros, retorna 500 com a lista e apaga a foto
        if (erros.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ error: "Erro de Validação: " + erros.join(' | ') });
        }

        // --- PERSISTÊNCIA ---
        const novoUsuario = {
            id: usuarios.length + 1,
            nome,
            email,
            // Monta o endereço incluindo o complemento se existir
            endereco: `${rua}, ${numero} ${complemento ? '('+complemento+')' : ''} - ${bairro}, ${cidade}/${estado}`,
            // Salva o caminho da imagem (padronizando barras para evitar bugs no Windows)
            foto: req.file ? req.file.path.replace(/\\/g, '/') : 'assets/logo.png' 
        };

        usuarios.push(novoUsuario);

        console.log("Usuário cadastrado:", novoUsuario.nome);
        res.status(200).json({ message: 'OK', usuario: novoUsuario });

    } catch (error) {
        console.error(error);
        if (req.file) fs.unlinkSync(req.file.path); // Limpa lixo em caso de crash
        res.status(500).json({ error: 'Erro interno ao processar o cadastro.' });
    }
});

// 2. GET /listar_usurios - Retorna JSON paginado
app.get('/listar_usurios', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const resultado = {
        totalUsuarios: usuarios.length,
        totalPaginas: Math.ceil(usuarios.length / limit),
        paginaAtual: page,
        usuarios: usuarios.slice(startIndex, endIndex)
    };

    res.json(resultado);
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});