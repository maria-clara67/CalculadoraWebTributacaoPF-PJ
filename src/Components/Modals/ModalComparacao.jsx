import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Modal,
  useTheme,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Collapse,
  Grow,
  Backdrop,
  IconButton,
} from "@mui/material";
import { tokens } from "../../Tema";
import GoBack from "../GoBack";
import CalculateIcon from "@mui/icons-material/Calculate";
import {
  comparativoService,
  isAuthenticated,
} from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ModalComparacao = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // CONTROLE DE ESTADO DO MODAL
  const [open, setOpen] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  // HANDLERS DE ABERTURA/FECHAMENTO DO MODAL
  const handleOpen = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // CALCULA ORIGEM DA ANIMAÇÃO BASEADA NA POSIÇÃO DO BOTÃO
    const origin = `${rect.left + rect.width / 2}px ${
      rect.top + rect.height / 2
    }px`;
    setTransformOrigin(origin);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // ESTILOS DO MODAL
  const style = {
    width: { xs: "90vw", md: 800 },
    bgcolor: colors.primary[500],
    border: `2px solid ${colors.blueAccent[500]}`,
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "80vh",
    maxWidth: "90vw",
    overflowY: "auto",
    zIndex: 1300,
    position: "relative",
  };

  // GERENCIAMENTO DO FORMULÁRIO COM REACT-HOOK-FORM
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rendaMensal: "",
      custosMensais: "",
      profissao: "",
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  // OBSERVAÇÃO DOS CAMPOS PARA VALIDAÇÃO EM TEMPO REAL
  const watchedFields = watch();
  const campoPreenchido = (valor) => {
  return (
    valor !== "" &&
    valor !== undefined &&
    valor !== null &&
    !Number.isNaN(valor)
  );
};

const areAllFieldsFilled =
  campoPreenchido(watchedFields.rendaMensal) &&
  campoPreenchido(watchedFields.custosMensais) &&
  campoPreenchido(watchedFields.profissao);

  // CONTROLE DE ESTADO DO BOTÃO DE CÁLCULO
  const isButtonDisabled = !areAllFieldsFilled;

  // 📊 ESTADOS PARA RESULTADOS E FEEDBACK
  const [resultadoPF, setResultadoPF] = useState(null);
  const [resultadoPJ, setResultadoPJ] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // CONSTANTES PARA CÁLCULOS TRIBUTÁRIOS
  const SALARIO_MINIMO = 1621.0;
  const LIMITE_RENDA = 15000.0;
  const DESCONTO_SIMPLIFICADO_IR = 607.2;

  // FUNÇÃO DE FORMATAÇÃO MONETÁRIA
  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // SISTEMA DE ALERTAS TEMPORÁRIOS
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  // FUNÇÃO DE ENVIO DE EMAIL (SIMULAÇÃO)
  const enviarEmail = (pf, pj) => {
    const emailUsuario = watch("emailUsuario");
    console.log("Enviando e-mail de:", emailUsuario);
    console.log("Resultados PF:", pf);
    console.log("Resultados PJ:", pj);

    showAlert("Resultados enviados para seu email.", "success");
  };

  // CÁLCULO DE PESSOA FÍSICA (IMPOSTO DE RENDA)
const calcularPF = (renda, custos) => {
  const baseCalculo = Math.max(
    0,
    renda - custos - DESCONTO_SIMPLIFICADO_IR
  );

  let impostoCalculado = 0;
  let aliquota = 0;
  let parcelaADeduzir = 0;
  let faixa = "";
  let redutor = 0;

  if (baseCalculo <= 2428.8) {
    aliquota = 0;
    parcelaADeduzir = 0;
    faixa = "Até R$ 2.428,80";
  } else if (baseCalculo <= 2826.65) {
    aliquota = 7.5;
    parcelaADeduzir = 182.16;
    impostoCalculado = baseCalculo * 0.075 - parcelaADeduzir;
    faixa = "De R$ 2.428,81 até R$ 2.826,65";
  } else if (baseCalculo <= 3751.05) {
    aliquota = 15;
    parcelaADeduzir = 394.16;
    impostoCalculado = baseCalculo * 0.15 - parcelaADeduzir;
    faixa = "De R$ 2.826,66 até R$ 3.751,05";
  } else if (baseCalculo <= 4664.68) {
    aliquota = 22.5;
    parcelaADeduzir = 675.49;
    impostoCalculado = baseCalculo * 0.225 - parcelaADeduzir;
    faixa = "De R$ 3.751,06 até R$ 4.664,68";
  } else {
    aliquota = 27.5;
    parcelaADeduzir = 908.73;
    impostoCalculado = baseCalculo * 0.275 - parcelaADeduzir;
    faixa = "Acima de R$ 4.664,68";
  }

  impostoCalculado = Math.max(0, impostoCalculado);

  if (renda <= 5000) {
    redutor = Math.min(impostoCalculado, 312.89);
  } else if (renda <= 7350) {
    redutor = Math.max(0, 978.62 - 0.133145 * renda);
  }

  const imposto = Math.max(0, impostoCalculado - redutor);
  const rendaLiquida = renda - imposto;
  const aliquotaEfetiva = renda > 0 ? (imposto / renda) * 100 : 0;

  return {
    renda,
    custos,
    descontoSimplificado: DESCONTO_SIMPLIFICADO_IR,
    baseCalculo,
    faixa,
    aliquota,
    parcelaADeduzir,
    impostoCalculado,
    redutor,
    imposto,
    rendaLiquida,
    aliquotaEfetiva,
  };
};

  // CÁLCULO DE PESSOA JURÍDICA (SIMPLES NACIONAL)
const calcularPJ = (renda) => {
  const simplesNacional = renda * 0.06;

  const proLabore = Math.max(
    renda * 0.28,
    SALARIO_MINIMO
  );

  const inss = proLabore * 0.11;

  const resultadoIRProLabore = calcularPF(proLabore, 0);
  const irProLabore = resultadoIRProLabore.imposto;

  const totalPJ = simplesNacional + inss + irProLabore;
  const rendaLiquida = renda - totalPJ;

  return {
    renda,
    proLabore,
    simplesNacional,
    inss,
    irProLabore,
    totalPJ,
    rendaLiquida,
    tipoCalculo: "padrao",
  };
};

const calcularPJAdvogado = (renda) => {
  const simplesNacional = renda * 0.045;
  const proLabore = SALARIO_MINIMO;

  const inss = proLabore * 0.11;
  const inssPatronal = proLabore * 0.2;

  const resultadoIRProLabore = calcularPF(proLabore, 0);
  const irProLabore = resultadoIRProLabore.imposto;

  const totalPJ =
    simplesNacional +
    inss +
    inssPatronal +
    irProLabore;

  const rendaLiquida = renda - totalPJ;

  return {
    renda,
    proLabore,
    simplesNacional,
    inss,
    inssPatronal,
    irProLabore,
    totalPJ,
    rendaLiquida,
    tipoCalculo: "advogado",
  };
};

  // FUNÇÃO PRINCIPAL DE CÁLCULO
 const calcular = async (data) => {
  const renda = parseFloat(data.rendaMensal) || 0;
  const custos = parseFloat(data.custosMensais) || 0;
  const profissao = String(data.profissao || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

  if (renda > LIMITE_RENDA) {
    showAlert(
      `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
      "error"
    );
    return;
  }

  let pf;
  let pj;

if (profissao.includes("advogado")) {
  pf = calcularPF(renda, custos);
  pj = calcularPJAdvogado(renda);
} else if (
  profissao.includes("psicologo") ||
  profissao.includes("arquiteto")
) {
  pf = calcularPF(renda, custos);
  pj = calcularPJ(renda);
} else {
  showAlert("Selecione uma profissão válida.", "error");
  return;
}

  setResultadoPF(pf);
  setResultadoPJ(pj);
  setMostrarResultados(true);

  if (!isAuthenticated()) {
    showAlert(
      "Cálculo realizado. Entre na conta para salvar o comparativo.",
      "success"
    );
    return;
  }

  const melhorOpcao =
    pf.rendaLiquida > pj.rendaLiquida ? "PF" : "PJ";

  const economiaMensal = Math.abs(
    pf.rendaLiquida - pj.rendaLiquida
  );

  try {
    await comparativoService.salvar({
      profissao,
      tipoCalculoPJ: pj.tipoCalculo,
      rendaMensal: renda,
      custosMensais: custos,
      totalTributosPF: pf.imposto,
      totalTributosPJ: pj.totalPJ,
      rendaLiquidaPF: pf.rendaLiquida,
      rendaLiquidaPJ: pj.rendaLiquida,
      melhorOpcao,
      economiaMensal,
      dadosPF: pf,
      dadosPJ: pj,
    });

    showAlert(
      "Cálculos realizados e comparativo salvo com sucesso!",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar comparativo:", error);

    showAlert(
      "O cálculo foi realizado, mas não foi possível salvar o comparativo.",
      "error"
    );
  }
};

const gerarPDFComparativo = () => {
  if (!resultadoPF || !resultadoPJ) {
    showAlert(
      "Calcule os resultados antes de gerar o PDF.",
      "error"
    );
    return;
  }

  const profissao = watch("profissao");

  const melhorOpcao =
    resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
      ? "Pessoa Física (PF)"
      : "Pessoa Jurídica (PJ)";

  const economiaMensal = Math.abs(
    resultadoPF.rendaLiquida - resultadoPJ.rendaLiquida
  );

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Comparativo Tributário - PF x PJ", 14, 20);

  doc.setFontSize(11);
  doc.text(`Profissão: ${profissao}`, 14, 32);
  doc.text(
    `Renda mensal: ${formatMoney(resultadoPF.renda)}`,
    14,
    40
  );
  doc.text(
    `Custos mensais: ${formatMoney(resultadoPF.custos)}`,
    14,
    48
  );

  autoTable(doc, {
    startY: 60,
    head: [["Pessoa Física (PF)", "Valor"]],
    body: [
      [
        "Base de cálculo",
        formatMoney(resultadoPF.baseCalculo),
      ],
      ["Faixa de tributação", resultadoPF.faixa],
      ["Alíquota", `${resultadoPF.aliquota}%`],
      [
        "Parcela a deduzir",
        formatMoney(resultadoPF.parcelaADeduzir),
      ],
      [
        "Imposto antes do redutor",
        formatMoney(resultadoPF.impostoCalculado || 0),
      ],
      [
        "Redutor aplicado",
        formatMoney(resultadoPF.redutor || 0),
      ],
      [
        "Imposto final",
        formatMoney(resultadoPF.imposto),
      ],
      [
        "Renda líquida",
        formatMoney(resultadoPF.rendaLiquida),
      ],
      [
        "Alíquota efetiva",
        `${resultadoPF.aliquotaEfetiva.toFixed(2)}%`,
      ],
    ],
  });

  const dadosPJ = [
    ["Receita mensal", formatMoney(resultadoPJ.renda)],
    ["Pró-labore", formatMoney(resultadoPJ.proLabore)],
    [
      "Simples Nacional",
      formatMoney(resultadoPJ.simplesNacional),
    ],
    [
      "INSS sobre pró-labore",
      formatMoney(resultadoPJ.inss),
    ],
  ];

  if (resultadoPJ.inssPatronal !== undefined) {
    dadosPJ.push([
      "INSS patronal",
      formatMoney(resultadoPJ.inssPatronal),
    ]);
  }

  dadosPJ.push(
    [
      "IR sobre pró-labore",
      formatMoney(resultadoPJ.irProLabore),
    ],
    [
      "Tipo de cálculo",
      resultadoPJ.tipoCalculo === "advogado"
        ? "Advocacia - Anexo IV"
        : "Psicologia/Arquitetura - Anexo III",
    ],
    [
      "Total de tributos PJ",
      formatMoney(resultadoPJ.totalPJ),
    ],
    [
      "Renda líquida PJ",
      formatMoney(resultadoPJ.rendaLiquida),
    ]
  );

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Pessoa Jurídica (PJ)", "Valor"]],
    body: dadosPJ,
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Comparação", "Resultado"]],
    body: [
      ["Melhor opção", melhorOpcao],
      [
        "Economia mensal estimada",
        formatMoney(economiaMensal),
      ],
      [
        "Tributos PF",
        formatMoney(resultadoPF.imposto),
      ],
      [
        "Tributos PJ",
        formatMoney(resultadoPJ.totalPJ),
      ],
    ],
  });

  doc.setFontSize(9);
  doc.text(
    "Os valores apresentados são estimativas para fins acadêmicos.",
    14,
    doc.lastAutoTable.finalY + 15
  );

  doc.save("comparativo-tributario.pdf");
};

  return (
    <div>
      {/* BOTÃO QUE ABRE O MODAL COMPARATIVO */}
      <Button
        onClick={handleOpen}
        size="large"
        startIcon={<CalculateIcon />}
        sx={{
          color: colors.grey[900],
          backgroundColor: colors.redAccent[500],
          fontSize: "1.1rem",
          px: 2,
          py: 1,
          transition: "all 0.3s ease-in-out",
          transitionDelay: "30ms",
          transform: "translateY(0) scale(1)",
          "&:hover": {
            backgroundColor: colors.redAccent[600],
            transform: "translateY(-4px) scale(1.02)",
            boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3)`,
          },
        }}
      >
        Calculadora Comparativa
      </Button>

      {/* MODAL PRINCIPAL */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grow in={open} timeout={400} style={{ transformOrigin }}>
          <Box sx={style}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: colors.grey[100],
                fontWeight: 600,
                mb: 2,
              }}
            >
              Calculadora Comparativa
            </Typography>

            {/* BOTÃO FECHAR MODAl */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                ml: 1,
                bgcolor: "transparent",
                "&:hover svg": {
                  color: colors.redAccent[400],
                },
              }}
            >
              <GoBack />
            </IconButton>

            <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
              {/* FORMULÁRIO DE DADOS */}
              <Paper sx={{ p: 3, backgroundColor: colors.primary[500], mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                  Insira seus dados para comparação
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit(calcular)}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: { xs: "wrap", md: "nowrap" },
                    }}
                  >
                    {/* CAMPO RENDA MENSAL */}
                    <TextField
                      label="Renda Mensal"
                      type="number"
                      fullWidth
                      required
                      {...register("rendaMensal", {
                        required: "Renda mensal é obrigatória!",
                        min: {
                          value: 0,
                          message: "Renda não pode ser negativa",
                        },
                        max: {
                          value: LIMITE_RENDA,
                          message: `Renda não pode exceder ${formatMoney(
                            LIMITE_RENDA
                          )}`,
                        },
                        valueAsNumber: true,
                      })}
                      error={!!errors.rendaMensal}
                      helperText={errors.rendaMensal?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[500],
                          "& fieldset": { borderColor: colors.grey[300] },
                          "&:hover fieldset": {
                            borderColor: colors.blueAccent[500],
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.blueAccent[500],
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: colors.grey[300],
                          "&.Mui-focused": { color: colors.blueAccent[500] },
                        },
                        "& .MuiOutlinedInput-input": {
                          color: colors.grey[100],
                        },
                        "& .MuiFormHelperText-root": {
                          color: errors.rendaMensal
                            ? colors.redAccent[400]
                            : theme.palette.mode === "dark"
                            ? colors.grey[500]
                            : colors.grey[600],
                        },
                      }}
                    />

                    {/* CAMPO CUSTOS MENSais */}
                    <TextField
                      label="Custos Mensais"
                      type="number"
                      fullWidth
                      required
                      {...register("custosMensais", {
                        required: "Custos mensais são obrigatórios!",
                        min: {
                          value: 0,
                          message: "Custos não podem ser negativos",
                        },
                        valueAsNumber: true,
                      })}
                      error={!!errors.custosMensais}
                      helperText={errors.custosMensais?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[500],
                          "& fieldset": { borderColor: colors.grey[300] },
                          "&:hover fieldset": {
                            borderColor: colors.blueAccent[500],
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.blueAccent[500],
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: colors.grey[300],
                          "&.Mui-focused": { color: colors.blueAccent[500] },
                        },
                        "& .MuiOutlinedInput-input": {
                          color: colors.grey[100],
                        },
                        "& .MuiFormHelperText-root": {
                          color: errors.custosMensais
                            ? colors.redAccent[400]
                            : theme.palette.mode === "dark"
                            ? colors.grey[500]
                            : colors.grey[600],
                        },
                      }}
                    />

                    {/* CAMPO PROFISSÃO */}
                    <FormControl sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel
                        sx={{
                          color: colors.grey[300],
                          "&.Mui-focused": {
                            color: colors.blueAccent[500],
                          },
                          "&.MuiInputLabel-shrink": {
                            color: colors.blueAccent[500],
                          },
                        }}
                      >
                        Profissão
                      </InputLabel>
                      <Select
                        label="Profissão"
                        {...register("profissao", {
                          required: "Profissão é obrigatória!",
                        })}
                        error={!!errors.profissao}
                        defaultValue=""
                        sx={{
                          minHeight: "56px",
                          backgroundColor: colors.primary[500],
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: errors.profissao
                              ? colors.redAccent[400]
                              : colors.grey[300],
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.blueAccent[500],
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.blueAccent[500],
                          },
                          "& .MuiSelect-select": {
                            color: colors.grey[100],
                            padding: "16.5px 14px",
                            display: "flex",
                            alignItems: "center",
                            minHeight: "auto",
                          },
                        }}
                      >
                        <MenuItem value="psicologo">Psicólogo(a)</MenuItem>
                        <MenuItem value="arquiteto">Arquiteto(a)</MenuItem>
                        <MenuItem value="advogado">Advogado(a)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* BOTÃO CALCULAR COMPARAÇÃO */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isButtonDisabled}
                    sx={{
                      backgroundColor: isButtonDisabled
                        ? colors.grey[600]
                        : colors.redAccent[500],
                      color: colors.grey[900],
                      fontWeight: "bold",
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: isButtonDisabled
                          ? colors.grey[600]
                          : colors.redAccent[600],
                        color: colors.grey[900],
                        transform: isButtonDisabled
                          ? "none"
                          : "translateY(-2px)",
                        boxShadow: isButtonDisabled ? "none" : 3,
                      },
                      transition: "all 0.3s ease",
                      minWidth: "400px",
                      mx: "auto",
                      display: "block",
                    }}
                  >
                    Calcular Comparação
                  </Button>
                </Box>
              </Paper>

              {/* SEÇÃO DE RESULTADOS (APÓS CÁLCULO) */}
              {mostrarResultados && resultadoPF && resultadoPJ && (
                <Box>
                  <Paper sx={{ p: 3, backgroundColor: colors.primary[500] }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, textAlign: "center" }}
                    >
                      Comparação PF x PJ
                    </Typography>

                    {/* GRID DE COMPARAÇÃO VISUAL */}
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 3 }}
                    >
                      <Grid
                        container
                        spacing={2}
                        sx={{ maxWidth: 600, justifyContent: "center" }}
                      >
                        {/* CARTA PESSOA FÍSICA */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Paper
                            sx={{
                              p: 2,
                              backgroundColor: colors.primary[200],
                              border: `2px solid ${colors.blueAccent[500]}`,
                              textAlign: "center",
                              height: "100%",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ mb: 2, color: colors.blueAccent[400] }}
                            >
                              Pessoa Física (PF)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Tributos Totais:{" "}
                              <strong style={{ color: colors.redAccent[400] }}>
                                {formatMoney(resultadoPF.imposto)}
                              </strong>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Renda Líquida:{" "}
                              <strong
                                style={{ color: colors.greenAccent[400] }}
                              >
                                {formatMoney(resultadoPF.rendaLiquida)}
                              </strong>
                            </Typography>
                            <Typography variant="body2">
                              Alíquota Efetiva:{" "}
                              <strong>
                                {resultadoPF.aliquotaEfetiva.toFixed(2)}%
                              </strong>
                            </Typography>
                          </Paper>
                        </Grid>

                        {/* CARTA PESSOA JURÍDICA */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Paper
                            sx={{
                              p: 2,
                              backgroundColor: colors.primary[200],
                              border: `2px solid ${colors.greenAccent[500]}`,
                              textAlign: "center",
                              height: "100%",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ mb: 2, color: colors.greenAccent[400] }}
                            >
                              Pessoa Jurídica (PJ)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Tributos Totais:{" "}
                              <strong style={{ color: colors.redAccent[400] }}>
                                {formatMoney(resultadoPJ.totalPJ)}
                              </strong>
                            </Typography>

                            {resultadoPJ.inssPatronal !== undefined && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                INSS Patronal:{" "}
                                <strong>{formatMoney(resultadoPJ.inssPatronal)}</strong>
                              </Typography>
                              )}
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Tipo de cálculo:{" "}
                                <strong>
                                  {resultadoPJ.tipoCalculo === "advogado"
                                  ? "Advocacia — Anexo IV"
                                  : "Psicologia/Arquitetura — Anexo III"}
                                </strong>
                              </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Renda Líquida:{" "}
                              <strong
                                style={{ color: colors.greenAccent[400] }}
                              >
                                {formatMoney(resultadoPJ.rendaLiquida)}
                              </strong>
                            </Typography>
                            <Typography variant="body2">
                              Alíquota Total:{" "}
                              <strong>
                                {(
                                  (resultadoPJ.totalPJ / resultadoPJ.renda) *
                                  100
                                ).toFixed(2)}
                                %
                              </strong>
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* SEÇÃO DE RECOMENDAÇÃO */}
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Grid container justifyContent="center">
                        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                          <Paper
                            sx={{
                              p: 2,
                              backgroundColor:
                                resultadoPF.rendaLiquida >
                                resultadoPJ.rendaLiquida
                                  ? colors.blueAccent[800]
                                  : colors.greenAccent[800],
                              border: `3px solid ${
                                resultadoPF.rendaLiquida >
                                resultadoPJ.rendaLiquida
                                  ? colors.blueAccent[500]
                                  : colors.greenAccent[500]
                              }`,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ mb: 1 }}
                            >
                              Recomendação
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {resultadoPF.rendaLiquida >
                              resultadoPJ.rendaLiquida
                                ? `Pessoa Física (PF) é mais vantajosa!`
                                : `Pessoa Jurídica (PJ) é mais vantajosa!`}
                            </Typography>
                            <Typography variant="body2">
                              Economia de:{" "}
                              <strong>
                                {formatMoney(
                                  Math.abs(
                                    resultadoPF.rendaLiquida -
                                      resultadoPJ.rendaLiquida
                                  )
                                )}
                              </strong>{" "}
                              por mês
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>

                  <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    mt: 3,
    mb: 2,
  }}
>
  <Button
    variant="contained"
    onClick={gerarPDFComparativo}
    sx={{
      backgroundColor: colors.redAccent[500],
      color: colors.grey[900],
      fontWeight: "bold",
      px: 4,
      py: 1.5,
      textTransform: "none",
      "&:hover": {
        backgroundColor: colors.redAccent[600],
        color: colors.grey[900],
      },
    }}
  >
    Baixar PDF do comparativo
  </Button>
</Box>

                  {/* SEÇÃO DE ENVIO POR EMAIL */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      flexWrap: { xs: "wrap", md: "nowrap" },
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    {/* CHECKBOX ENVIAR EMAIL */}
                    <Box sx={{ flexShrink: 0 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...register("enviarEmail")}
                            sx={{
                              color: colors.grey[300],
                              "&.Mui-checked": {
                                color: colors.blueAccent[500],
                              },
                            }}
                          />
                        }
                        label="Deseja receber os cálculos por e-mail?"
                        sx={{ color: colors.grey[100] }}
                      />
                    </Box>

                    {/* FORMULÁRIO DE EMAIL (APARECE COM ANIMAÇÃO) */}
                    <Grow in={watch("enviarEmail")}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          alignItems: "center",
                          flex: 2,
                          minWidth: { xs: "100%", md: "auto" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {/* CAMPO EMAIL */}
                          <TextField
                            label="E-mail"
                            size="small"
                            type="email"
                            fullWidth
                            {...register("emailUsuario", {
                              required: watch("enviarEmail")
                                ? "E-mail é obrigatório"
                                : false,
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "E-mail inválido",
                              },
                            })}
                            error={!!errors.emailUsuario}
                            sx={{
                              flex: 2,
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: colors.primary[500],
                                "& fieldset": {
                                  borderColor: errors.emailUsuario
                                    ? colors.redAccent[400]
                                    : colors.grey[300],
                                },
                                "&:hover fieldset": {
                                  borderColor: colors.blueAccent[500],
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: colors.blueAccent[500],
                                },
                              },
                              "& .MuiInputLabel-root": {
                                color: colors.grey[300],
                                "&.Mui-focused": {
                                  color: colors.blueAccent[500],
                                },
                              },
                              "& .MuiOutlinedInput-input": {
                                color: colors.grey[100],
                              },
                            }}
                          />

                          {/* BOTÃO ENVIAR RESULTADOS */}
                          <Button
                            onClick={() => {
                              const emailValue = watch("emailUsuario");
                              if (!emailValue || emailValue.trim() === "") {
                                showAlert(
                                  "Por favor, informe seu e-mail",
                                  "error"
                                );
                                return;
                              }
                              if (errors.emailUsuario) {
                                showAlert(
                                  "Por favor, informe um e-mail válido",
                                  "error"
                                );
                                return;
                              }
                              if (resultadoPF && resultadoPJ) {
                                enviarEmail(resultadoPF, resultadoPJ);
                              } else {
                                showAlert(
                                  "Por favor, calcule os resultados primeiro",
                                  "error"
                                );
                              }
                            }}
                            sx={{
                              flex: 1,
                              minWidth: "140px",
                              height: "40px",
                              backgroundColor: colors.redAccent[500],
                              color: colors.grey[900],
                              borderRadius: "8px",
                              transition: "all 0.2s ease-in-out",
                              fontWeight: 600,
                              textTransform: "none",
                              fontSize: "0.875rem",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                backgroundColor: colors.redAccent[600],
                                color: colors.grey[900],
                                transform: "translateY(-1px)",
                                boxShadow: `0 4px 8px ${colors.blueAccent[500]}40`,
                              },
                              "&:active": {
                                transform: "translateY(0)",
                              },
                            }}
                          >
                            Enviar resultados
                          </Button>
                        </Box>
                      </Box>
                    </Grow>
                  </Box>
                </Box>
              )}

              {/* ALERTA DE FEEDBACK */}
              <Collapse in={alertVisible} sx={{ mt: 2 }}>
                <Alert
                  severity={alertSeverity}
                  onClose={() => setAlertVisible(false)}
                >
                  {alertMessage}
                </Alert>
              </Collapse>
            </Box>
          </Box>
        </Grow>
      </Modal>
    </div>
  );
};

export default ModalComparacao;
