import axios from "axios";
import React, { useState, useEffect } from "react";
import { Box, Button, Text, Page, useNavigate, useSnackbar } from "zmp-ui";
import { configAppView } from "zmp-sdk/apis";
import loginImg from "/assets-src/login.png";
import logo from "/assets-src/cloudgo-logo.png";
import url_api from "../service";
const LoginPage = () => {
  const navigate = useNavigate();
  const { openSnackbar, closeSnackbar } = useSnackbar();
  const [token, setToken] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  // lưu token vào localStorage
  const saveLocateToken = (updatedToken) => {
    localStorage.setItem("token", updatedToken);
    setToken(updatedToken);
  };

  //set state width | height screen
  const handleWindowResize = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
  };

  //API zalo Config header mini app
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
        },
      });
    } catch (error) {}
  };

  /**
   * API login get token từ crm
   * @param username | password
   * @returns token
   */
  const getNewToken = async () => {
    try {
      openSnackbar({
        text: "Đang đăng nhập ...",
        type: "loading",
        duration: 15000,
      });
      const response = await axios.post(
        url_api,
        {
          RequestAction: "Login",
          IsOpenId: 0,
          Credentials: {
            api_key: "",
            email: "",
            username: "zalo.app",
            password: "zaloapp123",
          },
          comment:
            'IsOpenId: 0, Credentials: {username: "", password: ""} or IsOpenId: 1, Credentials: {api_key: "", email: ""}',
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const json = response.data.data;
      closeSnackbar();
      saveLocateToken(json.token);
      setToken(json.token);
      navigate("/bottom_navigation", { replace: true });
      return json;
    } catch (error) {
      console.error("Lỗi khi lấy token", error);
    }
  };

  useEffect(() => {
    configView();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  // get font width
  const resFont = (value) => {
    let fontValue = (value / screenWidth) * screenWidth;
    return `${fontValue}px`;
  };

  // get height screen
  const resHeight = (value) => {
    let fontValue = (value / screenHeight) * screenHeight;
    return `${fontValue}px`;
  };

  return (
    <Page className="section-container" hideScrollbar={true}>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          alignItems: "center",
          height: resHeight(390),
        }}
      >
        <img alt="Hình ảnh" src={logo} />
        <img src={loginImg} />
      </Box>

      <Box
        style={{ height: resHeight(306), marginTop: resHeight(30) }}
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box>
          <Text
            style={{
              textAlign: "center",
              fontSize: resFont(18),
              fontWeight: 500,
            }}
          >
            Đội ngũ support tận tình, hỗ trợ 24/7
          </Text>

          <Text
            style={{
              marginTop: "12px",
              textAlign: "center",
              lineHeight: "22px",
              fontSize: resFont(14),
            }}
          >
            CloudGO luôn sẵn sàng lắng nghe câu hỏi và ý kiến đóng góp từ bạn
          </Text>
        </Box>
        <Button
          style={{ marginBottom: resHeight(30) }}
          variant="primary"
          fullWidth
          onClick={getNewToken}
        >
          Tiếp tục
        </Button>
      </Box>
    </Page>
  );
};

export default LoginPage;
