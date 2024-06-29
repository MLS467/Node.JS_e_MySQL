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
app.engine('hbs', hbs.engine({
    defaultLayout: 'main', extname: 'hbs',
    helpers: {
        // Função auxiliar para verificar igualdade
        condicionalIgualdade: function (parametro1, parametro2, options) {
            return parametro1 === parametro2 ? options.fn(this) : options.inverse(this);
        }
    }
}));
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

app.get('/:situacao', (req, res) => {
    const selecionar = 'SELECT * FROM produtos';
    conexao.query(selecionar, (erro, sucesso) => {
        if (erro) throw erro;
        if (sucesso.length !== 0) {


            console.log()
            res.render('inicio', { produtos: sucesso, situacao: req.params.situacao });
        }
    })
})

app.post('/cadastrar', (req, res) => {
    try {
        const dados = {
            nomeProduto: req.body.nomeProduto,
            valorProduto: req.body.valorProduto,
            imgNome: req.files.imgNome.name
        }
        console.log(dados);
        if (dados.nomeProduto == '' || dados.imgNome == '' || dados.valorProduto == '' || isNaN(dados.valorProduto)) {
            console.log("cadastro não realizado!");
            res.redirect('/cadastro_erro');
        } else {
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
            res.redirect('/cadastro_ok');
        }
    } catch (erro) {
        console.log("cadastro não realizado!");
        res.redirect('/cadastro_erro');
    }
})

app.get('/deletar/:cod&:imagem', (req, res) => {
    try {
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
        res.redirect('/deletado_ok');
    } catch (error) {
        res.redirect('/deletado_erro');
    }
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
    try {

        let dados = {
            codigo: req.body.codigo_prod,
            nome: req.body.nomeProduto,
            valor: req.body.valorProduto,
            imgAtual: req.body.imagem_prod,
        }

        if (dados.nome == '' || dados.imgAtual == '' || dados.valor == '' || isNaN(dados.valor)) {
            res.redirect('/atualizado_erro');
        } else {
            let vet = null;
            let sql = null;

            try {
                dados.img = req.files.imgNome.name;
                fs.unlink(`${__dirname}/public/img/${dados.imgAtual}`, (erro) => {
                    if (erro) throw erro;
                });

                sql = `UPDATE produtos SET nome_prod=?, valor_prod = ?, imagem_prod=? WHERE codigo_prod = ?`;

                vet = [dados.nome, dados.valor, dados.img, dados.codigo];

                req.files.imgNome.mv(`${__dirname}/public/img/${dados.img}`);

                console.log('Imagem será alterada!');
            } catch (erro) {
                sql = `UPDATE produtos SET nome_prod=?, valor_prod = ? WHERE codigo_prod = ?`;

                vet = [dados.nome, dados.valor, dados.codigo];

                console.log('Imagem não será alterada!');
            }

            conexao.query(sql, vet, (error) => {
                if (error) throw error;
                console.log("Atualizado com sucesso!");
                res.redirect('/atualizado_ok');
            })


        }

    } catch (error) {
        res.redirect('/atualizado_erro');
    }
})

// SERVIDOR 
app.listen(
    porta,
    () => console.log(`Servidor rodando em http://localhost:${porta}`)
);