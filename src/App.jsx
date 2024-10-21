import React, { useEffect, useState } from "react";
import Dashboard from "./screens/dashboard";
import ThemeContext from "./context";
import TreeDetails from "./screens/treedetails";
import UpdateTree from "./screens/updateTree";
import Login from "./screens/login";
import { BrowserRouter, Outlet, Route, Router, Routes, useNavigate } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/protectedroute";
import { Secret } from "./screens/secret";
import Navbar from "./components/navbar";
import Trees from "./screens/trees";
import Maps from "./screens/maps";
import Contact from "./screens/contact";
import TreeDetailId from "./screens/TreeViewById";
import { Button } from "antd";
import Category from "./screens/category";
import Categories from "./screens/categories";
import CategoryViewById from "./screens/CategoryViewById";
import UpdateCategory from "./screens/updateCategory";
import AddChoice from "./screens/addChoices";

const AdminLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const GuestLayout = () => <Outlet />;

function App() {
  const [data, setData] = useState();
  const [selected, setSelected] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(selected);
  }, [selected]);

  return (
    <ThemeContext.Provider
      value={{
        data,
        setData,
        selected,
        setSelected,
        allData,
        setAllData,
        loading,
        setLoading,
      }}
    >
      <Routes>
        <Route element={<AdminLayout />}>
          <Route
            path="*"
            element={
              <div className="flex justify-center items-center h-screen w-full bg-gray-100">
                <h1>Not Found</h1>
                <Button danger onClick={() => navigate("/")}>
                  Go to Login
                </Button>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secret"
            element={
              <ProtectedRoute>
                <Navbar />

                <Secret />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/updateTree/:id" element={<UpdateTree />} /> */}

          <Route
            path="/updateTree/:id"
            element={
              <ProtectedRoute>
                <Navbar />
                <UpdateTree />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trees"
            element={
              <ProtectedRoute>
                <Navbar />
                <Trees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute>
                <Navbar />
                <Category />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addChoices"
            element={
              <ProtectedRoute>
                <Navbar />
                <AddChoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Navbar />
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updateCategory/:id"
            element={
              <ProtectedRoute>
                <Navbar />
                <UpdateCategory />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<GuestLayout />}>
          <Route path="/" element={<Maps />} />
          <Route path="/trees/:id" element={<TreeDetailId />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categorydetail/:id" element={<CategoryViewById />} />
        </Route>
      </Routes>
    </ThemeContext.Provider>
  );
}

export default App;
