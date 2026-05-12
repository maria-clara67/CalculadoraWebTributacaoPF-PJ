import React from "react";

//Componentes visuais importados do material UI
import {
    Box,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {tokens} from "../../Tema";

const FAQ = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    //Lista de perguntas e respostas 
    const perguntasFrequentes = [
        {
            pergunta: 
                "Qual é o objetivo da calculadora tributária?",
            resposta:
                "A calculadora tem como objetivo comparar a tributação estimada entre Pessoa Física (PF) e Pessoa Jurídica (PJ), ajudando o usuário a visualizar qual opção pode ser mais vantajosa em termos de renda líquida.",
        },
        {
            pergunta:
                "O que significa atuar como Pessoa Física?",
            resposta:
                "Atuar como Pessoa Física significa prestar serviços sem CNPJ. Nesse caso, os rendimentos podem estar sujeitos ao IRRF, considerando a tabela progressiva, o desconto simplificado e o redutor aplicável conforme as regras do projeto.",
        },
        {
            pergunta:
                "O que significa atuar como Pessoa Jurídica?",
            resposta:
                "Atuar como Pessoa Jurídica significa prestar serviços por meio de uma empresa, geralmente com CNPJ. Nesse caso, a tributação pode envolver DAS do Simples Nacional, pró-labore, INSS e, dependendo da profissão, outros encargos.",
        },
        {
            pergunta:
                "O que é pró-labore?",
            resposta:
                "Pró-labore é a remuneração paga ao sócio ou profissional que trabalha na empresa. No projeto, ele é utilizado para calcular encargos como INSS e IRRF sobre o valor retirado.",
        },
        {
            pergunta:
                "O que é Simples Nacional / DAS?",
            resposta:
                "O Simples Nacional é um regime tributário simplificado para empresas. O DAS é o documento de arrecadação usado para recolher os tributos desse regime.",
        },
        {
            pergunta:
                "Por que Psicólogo(a) e Arquiteto(a) usam o mesmo cálculo?",
            resposta:
                "No escopo do projeto, Psicologia e Arquitetura seguem a mesma lógica tributária para Pessoa Jurídica, considerando DAS de 6%, pró-labore de 28% da receita ou salário mínimo, INSS e IRRF sobre pró-labore.",
        },
        {
            pergunta:
                "Por que Advogado(a) tem cálculo diferente?",
            resposta:
                "Advocacia possui uma regra específica no projeto, utilizando DAS de 4,5%, pró-labore mínimo, INSS de 11% e INSS patronal de 20% sobre o pró-labore.",
        },
        {
            pergunta:
                "O que é o redutor do IR?",
            resposta:
                "O redutor é uma redução aplicada ao imposto calculado pela tabela progressiva. Ele serve para zerar ou reduzir o IR em determinadas faixas de renda, conforme as regras de 2026 utilizadas no projeto.",
        },
        {
            pergunta:
                "O PDF gerado substitui uma análise contábil?",
            resposta:
                "Não. O PDF apresenta apenas uma estimativa acadêmica baseada nas regras informadas no projeto. Para uma decisão real, é recomendado consultar um contador.",
        },
        {
            pergunta:
                "Por que o resultado pode variar conforme os custos mensais?",
            resposta:
                "Os custos mensais reduzem a base de cálculo da Pessoa Física. Por isso, quanto maiores os custos informados, menor pode ser a base tributável no cálculo de PF.",
        },
        
    ];

    //Container da pagina FAQ
    return (
        <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        p: { xs: 2, md: 4 },
        minHeight: "70vh",
      }}
    >
      {/* Título principal da página */}
      <Typography
        variant="h4"
        align="center"
        fontWeight="600"
        sx={{ mb: 1 }}
      >
        Perguntas Frequentes
      </Typography>

      {/* Texto introdutório da página */}
      <Typography
        variant="body1"
        align="center"
        sx={{
          mb: 4,
          color:
            theme.palette.mode === "dark" ? colors.grey[400] : colors.grey[600],
        }}
      >
        Tire dúvidas sobre a calculadora tributária, os cálculos de PF e PJ e a
        geração do comparativo.
      </Typography>

      {/* Bloco visual que agrupa todas as perguntas frequentes */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: colors.primary[500],
          border: "1px solid",
          borderColor: "#878787",
        }}
      >
        {/* 
          Percorre o array perguntasFrequentes e cria um Accordion para cada item.
          Assim, a interface é gerada dinamicamente a partir da lista de perguntas.
        */}
        {perguntasFrequentes.map((item, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              border: "1px solid",
              borderColor: colors.grey[700],

              // Remove a linha padrão que o Material UI coloca antes do Accordion.
              "&:before": {
                display: "none",
              },
            }}
          >
            {/* Parte visível do Accordion: exibe a pergunta */}
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.grey[100] }} />}
            >
              <Typography fontWeight="600">{item.pergunta}</Typography>
            </AccordionSummary>

            {/* Parte expansível do Accordion: exibe a resposta */}
            <AccordionDetails>
              <Typography
                variant="body2"
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? colors.grey[300]
                      : colors.grey[800],
                }}
              >
                {item.resposta}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
}

export default FAQ;