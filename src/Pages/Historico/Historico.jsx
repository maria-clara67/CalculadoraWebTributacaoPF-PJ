import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

import { tokens } from "../../Tema";
import { comparativoService } from "../../services/api";

const Historico = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [comparativos, setComparativos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const formatMoney = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor) || 0);
  };

  const formatDate = (data) => {
    if (!data) {
      return "Data não informada";
    }

    return new Date(data).toLocaleString("pt-BR");
  };

  const carregarComparativos = async () => {
    try {
      setCarregando(true);
      setErro("");

      const dados = await comparativoService.listar();

      setComparativos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);

      setErro(
        error.message ||
          "Não foi possível carregar o histórico de comparativos."
      );
    } finally {
      setCarregando(false);
    }
  };

  const excluirComparativo = async (id) => {
    const confirmou = window.confirm(
      "Deseja realmente excluir este comparativo?"
    );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      await comparativoService.excluir(id);

      setComparativos((comparativosAtuais) =>
        comparativosAtuais.filter(
          (comparativo) => comparativo.id !== id
        )
      );

      setMensagem("Comparativo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir comparativo:", error);

      setErro(
        error.message || "Não foi possível excluir o comparativo."
      );
    }
  };

  useEffect(() => {
    carregarComparativos();
  }, []);

  if (carregando) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        p: { xs: 2, md: 4 },
        minHeight: "70vh",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        sx={{ mb: 1 }}
      >
        Histórico de Comparativos
      </Typography>

      <Typography
        variant="body1"
        textAlign="center"
        sx={{
          mb: 4,
          color:
            theme.palette.mode === "dark"
              ? colors.grey[400]
              : colors.grey[600],
        }}
      >
        Comparações tributárias armazenadas na sua conta
      </Typography>

      {erro && (
        <Alert
          severity="error"
          onClose={() => setErro("")}
          sx={{ mb: 3 }}
        >
          {erro}
        </Alert>
      )}

      {mensagem && (
        <Alert
          severity="success"
          onClose={() => setMensagem("")}
          sx={{ mb: 3 }}
        >
          {mensagem}
        </Alert>
      )}

      {comparativos.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: colors.primary[500],
            border: "1px solid",
            borderColor: colors.grey[700],
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Nenhum comparativo foi salvo
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color:
                theme.palette.mode === "dark"
                  ? colors.grey[400]
                  : colors.grey[600],
            }}
          >
            Realize um cálculo enquanto estiver autenticado para que o
            resultado apareça aqui.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {comparativos.map((comparativo) => (
            <Paper
              key={comparativo.id}
              sx={{
                p: 3,
                backgroundColor: colors.primary[500],
                border: "1px solid",
                borderColor: colors.grey[700],
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: colors.blueAccent[400],
                    }}
                  >
                    {comparativo.profissao}
                  </Typography>

                  <Typography variant="body2">
                    Data: {formatDate(comparativo.createdAt)}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    excluirComparativo(comparativo.id)
                  }
                >
                  Excluir
                </Button>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                  mt: 3,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Renda mensal
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.rendaMensal)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Custos mensais
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.custosMensais)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Tipo de cálculo PJ
                  </Typography>

                  <Typography>
                    {comparativo.tipoCalculoPJ === "advogado"
                      ? "Advocacia — Anexo IV"
                      : "Psicologia/Arquitetura — Anexo III"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Tributos PF
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.totalTributosPF)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Tributos PJ
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.totalTributosPJ)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Melhor opção
                  </Typography>

                  <Typography
                    fontWeight="bold"
                    sx={{
                      color: colors.greenAccent[400],
                    }}
                  >
                    {comparativo.melhorOpcao}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Renda líquida PF
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.rendaLiquidaPF)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Renda líquida PJ
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.rendaLiquidaPJ)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Economia mensal
                  </Typography>

                  <Typography>
                    {formatMoney(comparativo.economiaMensal)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Historico;