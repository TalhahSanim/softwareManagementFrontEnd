import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import Categories from "./pages/Categories.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SoftwareDetail from "./pages/SoftwareDetail.jsx";
import SoftwareForm from "./pages/SoftwareForm.jsx";
import Users from "./pages/Users.jsx";

function Protected({ children, admin = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/software/new"
          element={
            <Protected>
              <SoftwareForm />
            </Protected>
          }
        />
        <Route path="/software/:id" element={<SoftwareDetail />} />
        <Route
          path="/software/:id/edit"
          element={
            <Protected>
              <SoftwareForm />
            </Protected>
          }
        />
        <Route path="/categories" element={<Categories />} />
        <Route
          path="/users"
          element={
            <Protected admin>
              <Users />
            </Protected>
          }
        />
      </Route>
    </Routes>
  );
}
