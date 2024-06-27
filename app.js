// FAZENDO IMPORTAÇÕES DOS MÓDULOS
const express = require('express')
const app = express();
const file = require('express-fileupload');
const mysql = require('mysql2');
const hbs = require('express-handlebars');
const fs = require('fs');
const bodyParser = require('body-parser');
const { error } = require('console');
const porta = process.env.PORT || 8080;

// FAZENDO A CONEXÃO COM O BANCO DE DADOS
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projeto_nodejs'
})

conexao.connect((erro) => {
    if (erro) throw erro;
    console.log("Conectado com sucesso!");
});

// CONFIGURANDO O FILEUPLOAD
app.use(file());

// CONFIGURAÇÃO DO PUBLIC E DO BOOTSTRAP
app.use(express.static('./public'));
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

// CONFIGURAÇÃO DO BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CONFIGURAÇÃO DO HANDLEBARS
app.engine('hbs', hbs.engine({ defaultLayout: 'main', extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

// ROTAS
app.get('/', (req, res) => {
    const selecionar = 'SELECT * FROM produtos';
    conexao.query(selecionar, (erro, sucesso) => {
        if (erro) throw erro;
        if (sucesso.length !== 0) {
            res.render('inicio', { produtos: sucesso });
        } else {
            res.render('inicio');
        }
    })
})

app.post('/cadastrar', (req, res) => {
    const dados = {
        nomeProduto: req.body.nomeProduto,
        valorProduto: req.body.valorProduto,
        imgNome: req.files.imgNome.name
    }
    console.log(dados);

    req.files.imgNome.mv(`${__dirname}/public/img/${dados.imgNome}`);

    const query = "INSERT INTO produtos VALUES (?,?,?,?)";
    const vet = Array(null, dados.nomeProduto, dados.valorProduto, dados.imgNome);

    conexao.query(query, vet, (erro, result) => {
        if (erro) {
            console.error("Houve um erro: " + erro);
        } else {
            console.log("Cadastro realizado!");
        }
    });

    res.redirect('/');
})

app.get('/deletar/:cod&:imagem', (req, res) => {
    const cod = req.params.cod;
    const imagem = req.params.imagem;

    const sql = `DELETE FROM produtos WHERE codigo_prod = ?`;

    conexao.query(sql, cod, (erro, sucesso) => {
        if (erro) throw erro;
        console.log(sucesso);
        fs.unlink(`${__dirname}/public/img/${imagem}`, (erro) => {
            if (erro) throw erro;
        });
        console.log("Arquivo removido com sucesso!");
    })
    res.redirect('/');
})


app.get('/editar/:cod', (req, res) => {
    console.log(req.params.cod);
    const cod = req.params.cod;
    const selecionar = `SELECT * FROM produtos WHERE codigo_prod = ?`;
    conexao.query(selecionar, cod, (erro, sucesso) => {
        if (erro) throw erro;
        res.render('formularioEdicao', { produtos: sucesso });
    })
})


app.post('/atualizar', (req, res) => {
    const dados = {
        codigo: req.body.codigo_prod,
        nome: req.body.nomeProduto,
        valor: req.body.valorProduto,
        img: req.files.imgNome.name
    }

    const sql = `UPDATE produtos SET nome_prod=?, valor_prod = ?, imagem_prod=? WHERE codigo_prod = ?`;
    const vet = Array(dados.nome, dados.valor, dados.img, dados.codigo);

    req.files.imgNome.mv(`${__dirname}/public/img/${dados.img}`);

    conexao.query(sql, vet, (error) => {
        if (error) throw error;
        console.log("Atualizado com sucesso!");
        res.redirect('/');
    })


})

// SERVIDOR 
app.listen(
    porta,
    () => console.log(`Servidor rodando em http://localhost:${porta}`)
);