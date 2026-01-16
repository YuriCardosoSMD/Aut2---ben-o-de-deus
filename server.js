const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// Lista que funciona como nosso banco de dados temporário
const usuarios = [];

// Configurações básicas do servidor (CORS, JSON e arquivos estáticos)
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/fotos_usuarios', express.static(path.join(__dirname, 'fotos_usuarios')));

// Configura o Multer para salvar as imagens enviadas no upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'fotos_usuarios/';
        // Cria a pasta se ela não existir
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Gera um nome único para evitar sobrescrever arquivos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtros de upload: limite de 5MB e apenas imagens
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
        }
    }
});

// Funções de ajuda para validação de segurança e formato
function contemAtaqueSQL(texto) {
    if (!texto || typeof texto !== 'string') return false;
    const forbidden = ['SELECT', 'CREATE', 'DELETE', 'UPDATE'];
    const upperTexto = texto.toUpperCase();
    return forbidden.some(word => upperTexto.includes(word));
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@\.]+$/;
    return regex.test(email);
}

// Rota para cadastrar um novo usuário
app.post('/cadastrar_usuario', upload.single('foto'), (req, res) => {
    try {
        const { nome, email, cep, rua, numero, bairro, cidade, estado, senha, complemento } = req.body;
        
        // Verifica se há tentativas de injeção de código malicioso
        const dadosVerificar = [nome, email, rua, numero, bairro, cidade, estado, senha, complemento];
        if (dadosVerificar.some(campo => contemAtaqueSQL(campo))) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ error: "Tentativa de injeção SQL detectada! Cadastro bloqueado." });
        }

        // Valida as regras de negócio (tamanho dos campos, formato da senha, etc)
        const erros = [];
        if (!nome || nome.length < 3 || nome.length > 50) erros.push("Nome inválido (deve ter entre 3 e 50 chars)");
        if (!validarEmail(email)) erros.push("Formato de e-mail inválido");
        if (!rua || rua.length < 4) erros.push("Rua muito curta (mín 4 chars)");
        if (!cidade || cidade.length < 3) erros.push("Cidade muito curta (mín 3 chars)");
        if (!estado || estado.length !== 2) erros.push("Estado deve ter 2 letras (UF)");
        
        // Regras complexas de senha
        if (!senha || senha.length < 10) {
            erros.push("Senha muito curta (mín 10 chars)");
        } else {
            const temLetra = /[a-zA-Z]/.test(senha);
            const temNumero = /[0-9]/.test(senha);
            const temEspecial = /[*;#]/.test(senha);
            if (!temLetra || !temNumero || !temEspecial) {
                erros.push("Senha deve conter letras, números e caracteres especiais (* ; #)");
            }
        }

        // Se houver erros, apaga a foto enviada e retorna o erro
        if (erros.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ error: "Erro de Validação: " + erros.join(' | ') });
        }

        // Cria o objeto do usuário e salva na memória
        const novoUsuario = {
            id: usuarios.length + 1,
            nome,
            email,
            endereco: `${rua}, ${numero} ${complemento ? '('+complemento+')' : ''} - ${bairro}, ${cidade}/${estado}`,
            foto: req.file ? req.file.path.replace(/\\/g, '/') : 'assets/logo.png' 
        };

        usuarios.push(novoUsuario);
        console.log("Usuário cadastrado:", novoUsuario.nome);
        res.status(200).json({ message: 'OK', usuario: novoUsuario });

    } catch (error) {
        console.error(error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Erro interno ao processar o cadastro.' });
    }
});

// Rota para listar usuários com paginação
app.get('/listar_usurios', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    res.json({
        totalUsuarios: usuarios.length,
        totalPaginas: Math.ceil(usuarios.length / limit),
        paginaAtual: page,
        usuarios: usuarios.slice(startIndex, endIndex)
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});