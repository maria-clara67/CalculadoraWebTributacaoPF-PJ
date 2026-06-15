import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  Box,
  CircularProgress,
} from "@mui/material";

import { ColorModeContext, useMode } from "./Tema";

import Home from "./Pages/Página Inicial/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import CalculoPF from "./Pages/Cálculos/CalculoPF";
import CalculoPJ from "./Pages/Cálculos/CalculoPJ";
import CalculadoraTributaria from "./Pages/Cálculos/CalculadoraTributaria";
import Explicacao from "./Pages/Explicação/Explicacao";
import Esqueci from "./Pages/Esqueci a senha/Esqueci";
import Contatos from "./Pages/Contatos";
import FAQ from "./Pages/FAQ/FAQ";
import Error from "./Pages/Error";
import Historico from "./Pages/Historico/Historico";
import PageLayout from "./Layout/PageLayout";
import AuthGuard from "./Components/AuthGuard";

function App() {
  const [theme, colorMode] = useMode();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <BrowserRouter>
          <div className="app">
            <main className="content">
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login/forgot" element={<Esqueci />} />

                {/* Rotas que utilizam o layout principal */}
                <Route element={<PageLayout />}>
                  <Route
                    path="/home"
                    element={
                      <AuthGuard>
                        <Home />
                      </AuthGuard>
                    }
                  />

                  <Route
                    path="/calculadora"
                    element={
                      <AuthGuard>
                        <CalculadoraTributaria />
                      </AuthGuard>
                    }
                  />

                  <Route
                    path="/calculopf"
                    element={
                      <AuthGuard>
                        <CalculoPF />
                      </AuthGuard>
                    }
                  />

                  <Route
                    path="/calculopj"
                    element={
                      <AuthGuard>
                        <CalculoPJ />
                      </AuthGuard>
                    }
                  />

                  <Route
                    path="/tributacao"
                    element={
                      <AuthGuard>
                        <Explicacao />
                      </AuthGuard>
                    }
                  />

                  <Route path="/faq" element={<FAQ />} />

                  <Route
                    path="/contatos"
                    element={
                      <AuthGuard>
                        <Contatos />
                      </AuthGuard>
                    }
                  />

                  <Route
                    path="/historico"
                    element={
                      <AuthGuard>
                        <Historico />
                      </AuthGuard>
                    }
                  />
                </Route>

                {/* Rota para páginas inexistentes */}
                <Route path="*" element={<Error />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;