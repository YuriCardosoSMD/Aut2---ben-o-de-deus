const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Habilita CORS e processamento de JSON
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos do frontend (html, css, js)
app.use(express.static(__dirname));

// Serve a pasta de uploads publicamente para as imagens carregarem
app.use('/fotos_usuarios', express.static(path.join(__dirname, 'fotos_usuarios')));

// --- CONFIGURAÇÃO DO MULTER (UPLOAD) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'fotos_usuarios/';
        // Cria a pasta se não existir
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Gera um nome único: data atual + numero aleatorio + extensão original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro e Limites
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

// --- BANCO DE DADOS EM MEMÓRIA (VETOR) ---
const usuarios = [];

// --- ENDPOINTS ---

// 1. POST /cadastro - Recebe dados e arquivo
app.post('/cadastro', upload.single('foto'), (req, res) => {
    try {
        const { nome, email, cep, rua, numero, bairro, cidade, estado } = req.body;
        
        const novoUsuario = {
            id: usuarios.length + 1,
            nome,
            email,
            endereco: `${rua}, ${numero} - ${bairro}, ${cidade}/${estado}`,
            // Salva o caminho relativo da imagem se ela existir
            foto: req.file ? req.file.path.replace(/\\/g, '/') : 'assets/logo.png' 
        };

        usuarios.push(novoUsuario);

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', usuario: novoUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar o cadastro.' });
    }
});

// 2. GET /listar_usurios - Retorna JSON paginado
app.get('/listar_usurios', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Usuários por página
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