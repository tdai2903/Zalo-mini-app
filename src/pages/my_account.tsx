import React, { useEffect, useState } from "react";
import {
  Box,
  Icon,
  Page,
  Text,
  useNavigate,
  Avatar,
  Modal,
  Button,
} from "zmp-ui";
import {
  configAppView,
  onConfirmToExit,
  offConfirmToExit,
  openWebview,
  setNavigationBarLeftButton,
  closeApp,
} from "zmp-sdk/apis";
import url_api from "../service";
import { openChat } from "zmp-sdk/apis";
const MyAccountPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const handleTextClick = () => {
    navigate("/detail_account");
  };
  const handleClick = () => {
    openUrlInWebview();
  };
  const openChatScreen = async () => {
    try {
      await openChat({
        type: "oa",
        id: "2197174064623873199",
        message: "Xin Chào",
      });
      console.log("openchat");
    } catch (error) {
      console.log(error);
    }
  };

  const openUrlInWebview = async () => {
    try {
      await openWebview({
        url: url_api,
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Thông tin tài khoản",
          leftButton: "none",
        },
      });
      // xử lý khi gọi api thành công
    } catch (error) {
      // xử lý khi gọi api thất bại
    }
  };

  const setLeftButton = async () => {
    try {
      await setNavigationBarLeftButton({
        type: "none",
      });
      console.log("Đã ẩn leftButton");
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  useEffect(() => {
    configView();
    setLeftButton();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, []);
  return (
    <Page
      hideScrollbar={true}
      className="section-page"
      // restoreScrollOnBack={false}
    >
      <Box className="section-container">
        <Box flex flexDirection="row">
          <Avatar size={40} src={userInfo.avatar} />
          <Box ml={2}>
            <Text style={{ fontWeight: 500 }}>
              {contactData.data.full_name}
            </Text>
            <Text>{contactData.data.mobile.replace(/^84/, "0")}</Text>
          </Box>
        </Box>
        <Box
          mt={5}
          flex
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
          onClick={handleTextClick}
          height={30}
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-user" style={{ color: "grey" }}></Icon>
            <Text
              style={{
                marginLeft: "12px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Thông tin tài khoản
            </Text>
          </Box>

          <Icon icon="zi-chevron-right"></Icon>
        </Box>
        <Box
          mt={5}
          flex
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
          onClick={openChatScreen}
          height={30}
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-bubble-multiselect" style={{ color: "grey" }}></Icon>
            <Text
              style={{
                marginLeft: "12px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Liên hệ qua Zalo
            </Text>
          </Box>

          <Icon icon="zi-chevron-right"></Icon>
        </Box>
        <Box
          mt={5}
          flex
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
          height={30}
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-inbox" style={{ color: "grey" }}></Icon>
            <Text
              style={{
                fontWeight: 500,
                marginLeft: "12px",
              }}
            >
              Thông tin về CloudGO
            </Text>
          </Box>

          <Icon icon="zi-chevron-right"></Icon>
        </Box>
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

export default MyAccountPage;
