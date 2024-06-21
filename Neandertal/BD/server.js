const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const usuariosFilePath = path.join(__dirname, 'usuarios.json');

// Middleware para permitir CORS
app.use(cors());

// Middleware para parsear JSON
app.use(bodyParser.json());

// Endpoint para cadastrar um novo usuário
app.post('/cadastro', (req, res) => {
    const novoUsuario = req.body;

    fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') {
            // Se o arquivo não existir, cria um novo array de usuários
            const usuarios = [novoUsuario];
            fs.writeFile(usuariosFilePath, JSON.stringify(usuarios, null, 2), (err) => {
                if (err) {
                    console.error('Erro ao escrever no arquivo', err);
                    res.status(500).json({ error: 'Erro ao cadastrar' });
                } else {
                    res.json({ message: 'Cadastro realizado com sucesso!' });
                }
            });
        } else if (err) {
            // Se houver outro erro, responde com um erro de servidor
            console.error('Erro ao ler o arquivo', err);
            res.status(500).json({ error: 'Erro ao cadastrar' });
        } else {
            // Se o arquivo existir, adiciona o novo usuário ao array existente
            const usuarios = JSON.parse(data);
            usuarios.push(novoUsuario);
            fs.writeFile(usuariosFilePath, JSON.stringify(usuarios, null, 2), (err) => {
                if (err) {
                    console.error('Erro ao escrever no arquivo', err);
                    res.status(500).json({ error: 'Erro ao cadastrar' });
                } else {
                    res.json({ message: 'Cadastro realizado com sucesso!' });
                }
            });
        }
    });
});


// Endpoint POST para autenticar usuários
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo', err);
            res.status(500).json({ error: 'Erro interno' });
            return;
        }

        try {
            const usuarios = JSON.parse(data);
            const usuarioValido = usuarios.find(user => user.email === email && user.senha === senha);

            if (usuarioValido) {
                res.json({ message: 'Login bem-sucedido!' });
            } else {
                res.status(401).json({ error: 'Credenciais inválidas' });
            }
        } catch (error) {
            console.error('Erro ao parsear JSON', error);
            res.status(500).json({ error: 'Erro interno' });
        }
    });
});

// Endpoint PUT para atualizar dados do usuário
app.put('/update', (req, res) => {
    const { email, novosDados } = req.body;

    fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo', err);
            res.status(500).json({ error: 'Erro interno' });
            return;
        }

        try {
            let usuarios = JSON.parse(data);
            // Encontra o usuário pelo email e atualiza os dados
            usuarios = usuarios.map(user => {
                if (user.email === email) {
                    return { ...user, ...novosDados };
                }
                return user;
            });

            // Escreve o arquivo atualizado
            fs.writeFile(usuariosFilePath, JSON.stringify(usuarios, null, 2), (err) => {
                if (err) {
                    console.error('Erro ao escrever no arquivo', err);
                    res.status(500).json({ error: 'Erro ao atualizar usuário' });
                } else {
                    res.json({ message: 'Usuário atualizado com sucesso!' });
                }
            });
        } catch (error) {
            console.error('Erro ao parsear JSON', error);
            res.status(500).json({ error: 'Erro interno' });
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
