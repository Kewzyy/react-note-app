import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

const ProtectedRoute = () => {
  const token: string = localStorage.getItem("noteToken");
  let auth: boolean = false;
  try {
    var decoded = jwt_decode(token);
    if(decoded) {
      auth = true;
    }
  } catch (error) {
    auth = false;
    localStorage.clear();
  }

  return auth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
