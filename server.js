import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import prisma from "./Backend/prismaClient.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

if (!SECRET_KEY) {
  throw new Error(
    "A variável JWT_SECRET não foi configurada no arquivo .env."
  );
}

// Permite que o frontend envie requisições para o backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Permite receber JSON nas requisições
app.use(express.json());

// Configuração do serviço de e-mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

/*
|--------------------------------------------------------------------------
| MIDDLEWARE DE AUTENTICAÇÃO
|--------------------------------------------------------------------------
*/

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token não fornecido!",
    });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token inválido ou expirado!",
    });
  }
}

/*
|--------------------------------------------------------------------------
| TESTE DE CONEXÃO COM POSTGRESQL
|--------------------------------------------------------------------------
*/

app.get("/api/teste-banco", async (req, res) => {
  try {
    const quantidadeUsuarios = await prisma.user.count();

    return res.status(200).json({
      message: "Conexão com PostgreSQL e Prisma funcionando!",
      quantidadeUsuarios,
    });
  } catch (error) {
    console.error("Erro ao testar banco:", error);

    return res.status(500).json({
      message: "Erro ao conectar com o banco de dados.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| VERIFICAÇÃO DE E-MAIL
|--------------------------------------------------------------------------
*/

app.get("/check-email", async (req, res) => {
  try {
    const email = req.query.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "O e-mail é obrigatório.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return res.status(200).json({
      exists: Boolean(user),
    });
  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| CADASTRO DO USUÁRIO
|--------------------------------------------------------------------------
*/

app.post("/register", async (req, res) => {
  try {
    const { username, profissao, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!username || !profissao || !email || !password) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha deve possuir pelo menos 6 caracteres.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "E-mail já cadastrado!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        profissao,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profissao: newUser.profissao,
      },
      SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      userId: newUser.id,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profissao: newUser.profissao,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN DO USUÁRIO
|--------------------------------------------------------------------------
*/

app.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios!",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos!",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        profissao: user.profissao,
      },
      SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({
      message: "Autenticação realizada!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profissao: user.profissao,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| ROTA PROTEGIDA PARA TESTAR O TOKEN
|--------------------------------------------------------------------------
*/

app.get("/protected", authenticateToken, (req, res) => {
  return res.status(200).json({
    message: "Acesso autorizado à rota protegida!",
    user: req.user,
  });
});

/*
|--------------------------------------------------------------------------
| RECUPERAÇÃO DE SENHA
|--------------------------------------------------------------------------
*/

app.post("/api/send-reset-link", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "O e-mail é obrigatório.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "E-mail não encontrado.",
      });
    }

    const passResetHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Recuperação de senha</h2>

        <p>Olá, ${user.username}.</p>

        <p>
          Foi realizada uma solicitação de recuperação de senha para a sua
          conta.
        </p>

        <h3>
          Isto é apenas uma demonstração acadêmica. A senha não será
          realmente alterada.
        </h3>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.email,
      to: user.email,
      subject: "Recuperação de senha",
      html: passResetHtml,
    });

    return res.status(200).json({
      message: "E-mail de recuperação enviado com sucesso!",
      email: user.email,
      userId: user.id,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);

    return res.status(500).json({
      message: "Erro ao enviar e-mail de recuperação.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| FORMULÁRIO DE CONTATO COM O NAF
|--------------------------------------------------------------------------
*/

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "Preencha todos os campos.",
      });
    }

    const nafHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Novo formulário de contato</h2>

        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong> ${message}</p>
      </div>
    `;

    const userHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Formulário recebido</h2>

        <p>Olá, ${name}.</p>

        <p>
          Recebemos a sua mensagem. Obrigado por entrar em contato com o NAF.
        </p>

        <p>
          Este é um recibo automático. Não responda diretamente a este
          e-mail.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.email,
      replyTo: email,
      to: process.env.email_naf,
      subject,
      html: nafHtml,
    });

    await transporter.sendMail({
      from: process.env.email,
      to: email,
      subject: "Confirmação de recebimento do formulário",
      html: userHtml,
    });

    return res.status(200).json({
      success: true,
      message: "E-mails enviados com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao enviar os e-mails:", error);

    return res.status(500).json({
      error: "Erro ao enviar os e-mails.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| CADASTRO DE COMPARATIVO
|--------------------------------------------------------------------------
| Só pode ser acessado por usuário autenticado.
*/

app.post("/api/comparativos", authenticateToken, async (req, res) => {
  try {
    const {
      profissao,
      tipoCalculoPJ,
      rendaMensal,
      custosMensais,
      totalTributosPF,
      totalTributosPJ,
      rendaLiquidaPF,
      rendaLiquidaPJ,
      melhorOpcao,
      economiaMensal,
      dadosPF,
      dadosPJ,
    } = req.body;

    if (
      !profissao ||
      !tipoCalculoPJ ||
      !melhorOpcao ||
      !dadosPF ||
      !dadosPJ
    ) {
      return res.status(400).json({
        message: "Os dados do comparativo estão incompletos.",
      });
    }

    const valoresNumericos = {
      rendaMensal: Number(rendaMensal),
      custosMensais: Number(custosMensais),
      totalTributosPF: Number(totalTributosPF),
      totalTributosPJ: Number(totalTributosPJ),
      rendaLiquidaPF: Number(rendaLiquidaPF),
      rendaLiquidaPJ: Number(rendaLiquidaPJ),
      economiaMensal: Number(economiaMensal),
    };

    const possuiValorInvalido = Object.values(valoresNumericos).some(
      (valor) => !Number.isFinite(valor)
    );

    if (possuiValorInvalido) {
      return res.status(400).json({
        message: "Um ou mais valores numéricos são inválidos.",
      });
    }

    const comparativo = await prisma.comparativo.create({
      data: {
        profissao,
        tipoCalculoPJ,
        rendaMensal: valoresNumericos.rendaMensal,
        custosMensais: valoresNumericos.custosMensais,
        totalTributosPF: valoresNumericos.totalTributosPF,
        totalTributosPJ: valoresNumericos.totalTributosPJ,
        rendaLiquidaPF: valoresNumericos.rendaLiquidaPF,
        rendaLiquidaPJ: valoresNumericos.rendaLiquidaPJ,
        melhorOpcao,
        economiaMensal: valoresNumericos.economiaMensal,
        dadosPF,
        dadosPJ,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: "Comparativo armazenado com sucesso!",
      comparativo,
    });
  } catch (error) {
    console.error("Erro ao salvar comparativo:", error);

    return res.status(500).json({
      message: "Erro ao armazenar o comparativo.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| LISTAGEM DOS COMPARATIVOS DO USUÁRIO
|--------------------------------------------------------------------------
*/

app.get("/api/comparativos", authenticateToken, async (req, res) => {
  try {
    const comparativos = await prisma.comparativo.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(comparativos);
  } catch (error) {
    console.error("Erro ao listar comparativos:", error);

    return res.status(500).json({
      message: "Erro ao consultar os comparativos.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| CONSULTA DE UM COMPARATIVO
|--------------------------------------------------------------------------
*/

app.get(
  "/api/comparativos/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const comparativoId = Number(req.params.id);

      if (!Number.isInteger(comparativoId)) {
        return res.status(400).json({
          message: "Identificador do comparativo inválido.",
        });
      }

      const comparativo = await prisma.comparativo.findFirst({
        where: {
          id: comparativoId,
          userId: req.user.id,
        },
      });

      if (!comparativo) {
        return res.status(404).json({
          message: "Comparativo não encontrado.",
        });
      }

      return res.status(200).json(comparativo);
    } catch (error) {
      console.error("Erro ao consultar comparativo:", error);

      return res.status(500).json({
        message: "Erro ao consultar o comparativo.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| EXCLUSÃO DE COMPARATIVO
|--------------------------------------------------------------------------
*/

app.delete(
  "/api/comparativos/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const comparativoId = Number(req.params.id);

      if (!Number.isInteger(comparativoId)) {
        return res.status(400).json({
          message: "Identificador do comparativo inválido.",
        });
      }

      const comparativo = await prisma.comparativo.findFirst({
        where: {
          id: comparativoId,
          userId: req.user.id,
        },
      });

      if (!comparativo) {
        return res.status(404).json({
          message: "Comparativo não encontrado.",
        });
      }

      await prisma.comparativo.delete({
        where: {
          id: comparativoId,
        },
      });

      return res.status(200).json({
        message: "Comparativo excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir comparativo:", error);

      return res.status(500).json({
        message: "Erro ao excluir o comparativo.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ROTA NÃO ENCONTRADA
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    message: "Rota não encontrada.",
  });
});

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO DO SERVIDOR
|--------------------------------------------------------------------------
*/

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

/*
|--------------------------------------------------------------------------
| ENCERRAMENTO DA APLICAÇÃO
|--------------------------------------------------------------------------
*/

async function encerrarServidor() {
  console.log("Encerrando servidor...");

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", encerrarServidor);
process.on("SIGTERM", encerrarServidor);
