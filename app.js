const express = require('express')
const app = express();
const mysql = require('mysql2');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const porta = process.env.PORT || 8080;

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projeto_nodejs'
});

conexao.connect((erro) => {
    if (erro) throw erro;
    console.log("Conectado com sucesso!");
})

app.use(express.static('./public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('hbs', hbs.engine({ defaultLayout: 'main', extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('inicio')
})

app.listen(porta, () => console.log("Servidor rodando em http://localhost:" + porta));