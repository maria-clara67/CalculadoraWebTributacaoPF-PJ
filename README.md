### Calculadora Tributária NAF - React

Aplicação web desenvolvida em React para auxiliar profissionais na comparação tributária entre atuação como Pessoa Física (PF) e Pessoa Jurídica (PJ).

O projeto é uma continuação da Calculadora Web de PJ e PF do NAF da Universidade Christus, com foco na atualização dos cálculos tributários e inclusão de novas profissões conforme as exigências do trabalho de Desenvolvimento de Aplicações com Frameworks Web.

### Sobre o Projeto

A aplicação permite que o usuário informe sua renda mensal, custos mensais e profissão. Com base nesses dados, o sistema calcula e compara os encargos tributários como Pessoa Física e Pessoa Jurídica, indicando qual opção apresenta maior renda líquida estimada.

Nesta versão, foram implementadas atualizações para o semestre 2026.1, incluindo novas regras tributárias, novas profissões e geração de PDF do comparativo.

### Funcionalidades Implementadas

- Cálculo tributário para Pessoa Física.
- Cálculo tributário para Pessoa Jurídica.
- Comparação entre PF e PJ.
- Indicação da opção mais vantajosa.
- Atualização dos cálculos tributários para Psicólogo(a) conforme regras de 2026.
- Inclusão da profissão Arquiteto(a), utilizando a mesma lógica de cálculo de Psicólogo(a).
- Inclusão da profissão Advogado(a), com cálculo próprio para Pessoa Jurídica.
- Geração de PDF com o comparativo tributário.
- Interface com abas para visualizar:
  - Pessoa Física;
  - Pessoa Jurídica;
  - Comparação PF x PJ.
- Layout responsivo com Material UI.

### Profissões Disponíveis

Atualmente, a calculadora contempla as seguintes profissões:

- Psicólogo(a)
- Arquiteto(a)
- Advogado(a)

### Regras de Cálculo Implementadas

Pessoa Física

O cálculo de Pessoa Física considera:

- Renda mensal;
- Custos mensais;
- Desconto simplificado de R$ 607,20;
- Tabela progressiva mensal do IRRF;
- Redutor do IR mensal para rendimentos até R$ 7.350,00;
- Renda líquida;
- Alíquota efetiva.

### A base de cálculo é definida como:

```js
baseCalculo = renda - custos - descontoSimplificado;
```
Caso a base fique negativa, o sistema considera zero como base de cálculo.

### Pessoa Jurídica - Psicologia e Arquitetura

Para Psicólogo(a) e Arquiteto(a), o cálculo de PJ considera:

- **Simples Nacional / DAS:** 6% sobre a receita mensal;
- **Pró-labore:** maior valor entre 28% da receita mensal e o salário mínimo vigente;
- **INSS:** 11% sobre o pró-labore;
- **IRRF sobre o pró-labore;**
- **Total de tributos PJ;**
- **Renda líquida PJ.**

### Pessoa Jurídica - Advocacia

Para Advogado(a), o cálculo de PJ considera:

- **Simples Nacional / DAS:** 4,5% sobre a receita mensal;
- **Pró-labore:** salário mínimo vigente;
- **INSS descontado:** 11% sobre o pró-labore;
- **INSS patronal / empresa:** 20% sobre o pró-labore;
- **IRRF sobre o pró-labore;**
- **Total de tributos PJ;**
- **Renda líquida PJ.**

## Geração de PDF

A aplicação possui um botão na aba de comparação para gerar um PDF com os resultados calculados.

O PDF contém:

- Profissão selecionada;
- Renda mensal;
- Custos mensais;
- Dados de Pessoa Física;
- Dados de Pessoa Jurídica;
- INSS patronal, quando aplicável;
- Melhor opção entre PF e PJ;
- Economia mensal estimada;
- Observação sobre os cálculos.

A geração do PDF foi implementada com as bibliotecas:

- **jsPDF**
- **jsPDF AutoTable**

## Tecnologias Utilizadas

### Frontend

- React;
- Vite;
- JavaScript;
- Material UI;
- React Router DOM;
- React Hook Form;
- TailwindCSS;
- Zustand.

### Backend

- Node.js;
- Express;
- MySQL;
- Nodemailer;
- JSON Web Token;
- dotenv;
- body-parser.

### Geração de PDF

- jsPDF;
- jsPDF AutoTable.

## Como Rodar o Projeto

```md
### 1. Clonar o repositório

Comando:

`git clone https://github.com/maria-clara67/CalculadoraWebTributacaoPF-PJ`

Depois entre na pasta do projeto:

`cd CalculadoraWebTributacaoPF-PJ`

### 2. Instalar as dependências

Comando:

`npm install`

Caso as bibliotecas de PDF ainda não estejam instaladas, execute:

`npm install jspdf jspdf-autotable`

### 3. Rodar o frontend

Comando:

`npm run dev`

O Vite exibirá um link semelhante a:

`http://localhost:5173/`

Abra esse endereço no navegador.


```
### Estrutura Geral do Projeto
```
src/
├── Components/
│   ├── Inputs/
│   ├── Modals/
│   └── ...
├── Layout/
│   └── PageLayout.jsx
├── Pages/
│   ├── Login/
│   ├── Register/
│   ├── Cálculos/
│   │   ├── CalculadoraTributaria.jsx
│   │   ├── CalculoPF.jsx
│   │   └── CalculoPJ.jsx
│   ├── Contatos/
│   └── ...
├── store/
├── Tema.jsx
└── App.jsx
```
## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurar e-mail, senha, e-mail do NAF e senha do MySQL.

### 1. Email

```text
process.env.email
```

### 2. Password/Senha

```text
process.env.password
```

### 3. Email NAF

```text
process.env.email_naf
```

### 4. Senha MySQL

```text
process.env.db_pass
```

## Autenticação

O sistema inclui:

- Login de usuário;
- Registro de novo usuário;
- Recuperação de senha;
- Persistência de sessão.

# Configuração do Backend

## Pré-requisitos

1. MySQL instalado e rodando;
2. Banco de dados `auth_db` criado.

## Instale as dependências

```bash
npm install express mysql2 nodemailer jsonwebtoken dotenv body-parser
```
## Configuração do Banco de Dados
1. Abra o MySQL e crie o banco de dados:
   ```
   CREATE DATABASE auth_db;
   ```
2. Configure as credenciais no arquivo server.js:
   ```
    const dbConfig = {
      host: "localhost",
      user: "root",
      password: process.env.db_pass,
      database: "auth_db"
    };

Observação: no projeto, a senha do MySQL deve ser informada por meio da variável de ambiente db_pass.

## Exemplo de arquivo .env
```
email=SEU_EMAIL
password=SUA_SENHA
email_naf=EMAIL_DO_NAF
db_pass=SUA_SENHA_DO_MYSQL
```
### Como Rodar
## Backend Node.js
  ```
  npm start
  O servidor estará rodando em:
  http://localhost:3000
  ```

### Endpoints Disponíveis
## POST /register
Registra um novo usuário.
```
  {
  "username": "Nome do Usuário",
  "profissao": "Psicólogo(a)",
  "email": "email@example.com",
  "password": "senha123"
  }
```
## POST /login
Faz login do usuário.
```
{
  "email": "email@example.com",
  "password": "senha123"
}
```
## POST /api/contact
Manda um e-mail para o usuário, e o usuário recebe um e-mail da NAF confirmando que a mensagem foi recebida.
```
{
  "name": "joao",
  "email": "email@example.com",
  "subject": "Mensagem de teste",
  "message": "Lorem ipsum"
}
```
## POST /api/send-reset-link
Manda um e-mail para recuperação de senha do usuário.
```
{
  "email": "email@example.com"
}
```
## GET /protected
Rota protegida que requer autenticação com token JWT no header Authorization.

## Notas Importantes

- O token JWT é armazenado no `localStorage` do navegador;
- O token expira em 1 hora;
- O CORS está configurado para permitir requisições do frontend na porta `5173`.
- Este projeto foi desenvolvido a partir de uma versão anterior da Calculadora Tributária NAF, sendo atualizado e expandido para a versão 2026.1.

