import { createBrowserRouter } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";
import Passwords from "./pages/Passwords";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import GeneratePass from "./pages/GeneratePass";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <NotFoundPage />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/signup",
                element: <RegisterPage />,
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/generate-password",
                element: <GeneratePass />,
            },
            {
                path: "/passwords",
                element: <Passwords />,
            },
        ]
    }
])

export default router;