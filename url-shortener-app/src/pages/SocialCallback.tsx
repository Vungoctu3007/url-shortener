import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const SocialCallback = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
    localStorage.setItem("isLogin", "1");
    navigate("/home");
  }, []);
};

export default SocialCallback;
