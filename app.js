// FAZENDO IMPORTAÇÕES DOS MÓDULOS
const express = require('express')
const app = express();
const mysql = require('mysql2');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
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
})

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
    res.render('inicio')
})

app.post('/cadastrar', (req, res) => {
    const dados = {
        nomeProduto: req.body.nomeProduto,
        valorProduto: req.body.valorProduto,
        imgNome: req.body.imgNome
    }

    console.log(dados);

    const vet = Array(null, dados.nomeProduto, dados.valorProduto, dados.imgNome);

    conexao.query("INSERT INTO produtos VALUES (?,?,?,?)", vet, (erro, result) => {
        if (erro) {
            console.error("Houve um erro: " + erro);
        } else {
            console.log("Cadastro realizado!");
        }
    });

    res.redirect('/');
})

// SERVIDOR
app.listen(porta, () => console.log("Servidor rodando em http://localhost:" + porta));