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
const LoginPage = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [token, setToken] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const saveLocateToken = (updatedToken) => {
    localStorage.setItem("token", updatedToken);
    setToken(updatedToken);
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
        tokenPhone = token;

        ConvertPhoneNumber();
        getNewToken();
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
        headerColor: "#1843EF",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
        },
      });
    } catch (error) {}
  };

  async function getNewToken() {
    try {
      const response = await axios.post(
        "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        {
          RequestAction: "Login",
          IsOpenId: 0,
          Credentials: {
            api_key: "",
            email: "",
            username: "admin",
            password: "CloudGO@022",
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

      const json = response.data;
      console.log(json);
      saveLocateToken(json.token);
      console.log("token:", json.token);
      setToken(json.token);
      navigate("/main");
      return json;
    } catch (error) {
      console.error(error);
    }
  }

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
    return () => offConfirmToExit();
  }, []);
  return (
    <Page className="section-container" hideScrollbar={true}>
      <img
        alt="Hình ảnh"
        src="https://geso.us/upload/baiviet/artboard-12x-6067.png"
      />
      <Text bold style={{ textAlign: "center", fontSize: "18px" }}>
        My CloudGO dành cho Khách hàng cần
      </Text>
      <Text
        bold
        style={{ textAlign: "center", fontSize: "18px", marginTop: "6px" }}
      >
        số điện thoại của bạn
      </Text>
      <Box mt={5} flexDirection="row" alignContent="center">
        <Icon
          size={34}
          icon="zi-user"
          style={{ marginRight: "6px", color: "rgba(0, 106, 245, 1)" }}
        ></Icon>
        <Text>Định danh tài khoản</Text>
      </Box>
      <Box mt={5} flexDirection="row" alignContent="center">
        <Icon
          size={34}
          icon="zi-note"
          style={{ marginRight: "6px", color: "rgba(0, 106, 245, 1)" }}
        ></Icon>
        <Text>Theo dõi tình trạng ticket</Text>
      </Box>
      <Box mt={5} flexDirection="row" alignContent="center">
        <Icon
          size={34}
          icon="zi-notif"
          style={{ marginRight: "6px", color: "rgba(0, 106, 245, 1)" }}
        ></Icon>
        <Text>Nhận thông tin thay đổi trạng thái</Text>
      </Box>
      <Box mt={5}>
        <Text bold style={{ textAlign: "center", fontSize: "15px" }}>
          Vui lòng đồng ý chia sẻ số điện thoại để liên kết với tài khoản của
          bạn trên hệ thống với My CloudGO
        </Text>
      </Box>
      <Button
        style={{ marginTop: "24px" }}
        variant="primary"
        fullWidth
        onClick={handleGetPhoneNumber}
      >
        Liên kết số điện thoại
      </Button>
      <Button
        style={{ marginTop: "16px" }}
        variant="tertiary"
        type="danger"
        fullWidth
        onClick={closeMiniApp}
      >
        Từ chối và thoát
      </Button>

      <Modal
        visible={confirmModalVisible}
        title="CloudTICKET"
        description="Bạn có chắc muốn rời mini app không?"
        actions={[
          {
            text: "Ở lại Mini App",
            onClick: () => {
              setConfirmModalVisible(false);
            },
            highLight: true,
          },
          {
            text: "Rời khỏi",
            onClick: () => {
              closeApp();
            },
          },
        ]}
      />
    </Page>
  );
};

export default LoginPage;
