import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Page,
  useNavigate,
  Modal,
  Icon,
  useSnackbar,
} from "zmp-ui";
import {
  login,
  getAccessToken,
  onConfirmToExit,
  offConfirmToExit,
  configAppView,
  closeApp,
  getPhoneNumber,
} from "zmp-sdk/apis";
import url_api from "../service";
const LoginPage = () => {
  const navigate = useNavigate();
  const { openSnackbar, closeSnackbar } = useSnackbar();
  const [token, setToken] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const saveLocateToken = (updatedToken) => {
    localStorage.setItem("token", updatedToken);
    setToken(updatedToken);
  };

  const phoneNumberAccessGranted = localStorage.getItem(
    "phoneNumberAccessGranted"
  );

  useEffect(() => {
    if (phoneNumberAccessGranted) {
      navigate("/main");
    }
  }, [phoneNumberAccessGranted, navigate]);

  const handleWindowResize = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
  };

  const handleLogin = async () => {
    try {
      await login({});
      console.log("Login thành công");
    } catch (error) {
      console.log("Login thất bại", error);
    }
  };

  let userAccessToken: string | undefined;
  let tokenPhone: string | undefined;

  const handleGetPhoneNumber = () => {
    getPhoneNumber({
      success: async (data) => {
        let { token } = data;
        console.log("token phone number:", token);
        tokenPhone = token;

        ConvertPhoneNumber();

        getNewToken();

        localStorage.setItem("phoneNumberAccessGranted", "true");
      },
      fail: (error) => {
        console.log(error);
      },
    });
  };

  getAccessToken({
    success: (accessToken) => {
      console.log("accessToken", accessToken);
      userAccessToken = accessToken;
    },
    fail: (error) => {
      console.log(error);
    },
  });

  const ConvertPhoneNumber = async () => {
    const endpoint = "https://graph.zalo.me/v2.0/me/info";
    const secretKey = "sFnqO2AGjsL4gD6BMTD7";
    const headers = {
      access_token: userAccessToken,
      code: tokenPhone,
      secret_key: secretKey,
    };
    axios
      .get(endpoint, { headers })
      .then((response) => {
        const phoneNumber = response.data.data.number;
        console.log("Phone Number:", phoneNumber);
        localStorage.setItem("phoneNumber", phoneNumber);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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
      console.log(json);
      saveLocateToken(json.token);
      console.log("token:", json.token);
      setToken(json.token);
      navigate("/main");
      return json;
    } catch (error) {
      console.error(error);
    }
  };

  const closeMiniApp = async () => {
    try {
      await closeApp({});
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleLogin();
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    window.addEventListener("resize", handleWindowResize);
    return () => {
      offConfirmToExit();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [confirmModalVisible]);

  const resFont = (value) => {
    let fontValue = (value / 360) * screenWidth;
    console.log(`${fontValue}px`);
    return `${fontValue}px`;
  };

  const resHeight = (value) => {
    let fontValue = (value / 800) * screenHeight;
    console.log(`${fontValue}px`);
    return `${fontValue}px`;
  };

  useEffect(() => {
    console.log("Chiều rộng màn hình:", screenWidth);
    console.log("Chiều cao màn hình:", screenHeight);
  }, [screenWidth, screenHeight]);

  return (
    <Page
      className="section-container"
      hideScrollbar={true}
      // restoreScrollOnBack={false}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "25%",
        }}
      >
        <img
          style={{ height: screenHeight * 0.1, width: screenWidth * 0.7 }}
          alt="Hình ảnh"
          src="https://tel4vn.edu.vn/uploads/2023/07/CloudGO-logo-vertical.png"
        />
      </Box>

      <Box style={{ height: "60%" }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: resFont(18),
            fontWeight: 500,
          }}
        >
          My CloudGO dành cho Khách hàng cần
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: resFont(18),
            marginTop: "6px",
            fontWeight: 500,
          }}
        >
          số điện thoại của bạn
        </Text>

        <Box mt={6} flexDirection="row" alignContent="center">
          <Icon
            size={24}
            icon="zi-user"
            style={{ marginRight: "6px", color: "rgba(0, 106, 245, 1)" }}
          ></Icon>
          <Text
            style={{
              color: "rgba(20, 20, 21, 1)",
              fontWeight: 400,
              fontSize: resFont(14),
            }}
          >
            Định danh tài khoản
          </Text>
        </Box>
        <Box mt={5} flexDirection="row" alignContent="center">
          <Icon
            size={24}
            icon="zi-note"
            style={{ marginRight: "6px", color: "rgba(0, 106, 245, 1)" }}
          ></Icon>
          <Text
            style={{
              color: "rgba(20, 20, 21, 1)",
              fontWeight: 400,
              fontSize: resFont(14),
            }}
          >
            Theo dõi tình trạng ticket
          </Text>
        </Box>
        <Box mt={5} flexDirection="row" alignContent="center">
          <Icon
            size={24}
            icon="zi-notif"
            style={{ marginRight: "6px", color: "rgba(0, 106, 245, 1)" }}
          ></Icon>
          <Text
            style={{
              color: "rgba(20, 20, 21, 1)",
              fontWeight: 400,
              fontSize: resFont(14),
            }}
          >
            Nhận thông tin thay đổi trạng thái
          </Text>
        </Box>
        <Box mt={5}>
          <Text
            style={{
              textAlign: "center",
              fontSize: resFont(13),
              fontWeight: 400,
            }}
          >
            Vui lòng đồng ý chia sẻ số điện thoại để liên kết với tài khoản của
            bạn trên hệ thống với My CloudGO
          </Text>
        </Box>
      </Box>
      <Box style={{ height: "15%" }}>
        <Button variant="primary" fullWidth onClick={handleGetPhoneNumber}>
          Liên kết số điện thoại
        </Button>
        <Button
          style={{ marginTop: resHeight(8) }}
          variant="tertiary"
          type="danger"
          fullWidth
          onClick={closeMiniApp}
        >
          Từ chối và thoát
        </Button>
      </Box>

      <Modal visible={confirmModalVisible}>
        <img
          style={{
            width: "100px",
            height: "100px",
            display: "block",
            margin: "0 auto",
          }}
          src="https://clipart-library.com/images/gTe5bLznc.gif"
        />

        <Text
          style={{
            fontWeight: 500,
            fontSize: "24px",
            textAlign: "center",
            paddingTop: "24px",
            paddingBottom: "16px",
          }}
        >
          My CloudGO
        </Text>
        <Text
          style={{
            fontWeight: 500,
            color: "rgba(118, 122, 127, 1)",
            paddingBottom: "32px",
          }}
        >
          Bạn có chắc chắn rời khỏi Mini App không?
        </Text>
        <Box
          flex
          flexDirection="row"
          justifyContent="center"
          alignContent="center"
        >
          <Button
            variant="tertiary"
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
              border: "1px rgba(0, 106, 245, 1) solid ",
            }}
            size="medium"
            onClick={() => {
              closeApp();
            }}
          >
            Rời khỏi
          </Button>
          <Box width={5} height={1}></Box>
          <Button
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
            }}
            size="medium"
            onClick={() => {
              setConfirmModalVisible(false);
              offConfirmToExit();
            }}
          >
            Ở lại Mini App
          </Button>
        </Box>
      </Modal>
    </Page>
  );
};

export default LoginPage;
