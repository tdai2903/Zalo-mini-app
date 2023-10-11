import React, { useEffect } from "react";
import { Box, Icon, Page, Text, useNavigate } from "zmp-ui";
import { configAppView } from "zmp-sdk/apis";
import { openChat } from "zmp-sdk/apis";
const MyAccountPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const handleTextClick = () => {
    navigate("/detail_account");
  };
  const handleClick = () => {
    window.location.href = "https://cloudgo.vn/gioi-thieu-ve-cloudgo";
  };
  const openChatScreen = async () => {
    try {
      await openChat({
        type: "user",
        id: "6304414410641560859",
        message: "Xin Chào",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#1843EF",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Thông tin tài khoản",
          leftButton: "back",
        },
      });
      // xử lý khi gọi api thành công
    } catch (error) {
      // xử lý khi gọi api thất bại
    }
  };
  useEffect(() => {
    configView();
  });
  return (
    <Page hideScrollbar={true}>
      <Box className="section-container">
        <Box flex flexDirection="row">
          <img src={userInfo.avatar} alt="Avatar" className="avatar" />
          <Box ml={2}>
            <Text bold style={{ fontSize: "15px" }}>
              {contactData.data.full_name}
            </Text>
            <Text>{contactData.data.mobile}</Text>
          </Box>
        </Box>
        <Box
          mt={5}
          flex
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-user" style={{ color: "grey" }}></Icon>
            <Text
              bold
              style={{
                marginLeft: "12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={handleTextClick}
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
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-bubble-multiselect" style={{ color: "grey" }}></Icon>
            <Text
              bold
              style={{
                marginLeft: "12px",
                fontSize: "16px",
                cursor: "pointer",
              }}
              onClick={openChatScreen}
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
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-inbox" style={{ color: "grey" }}></Icon>
            <Text
              bold
              style={{
                marginLeft: "12px",
                fontSize: "16px",
              }}
            >
              Thông tin về CloudGO
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
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Icon icon="zi-note" style={{ color: "grey" }}></Icon>
            <Text bold style={{ marginLeft: "12px", fontSize: "16px" }}>
              Điều khoản dịch vụ
            </Text>
          </Box>

          <Icon icon="zi-chevron-right"></Icon>
        </Box>
      </Box>
    </Page>
  );
};

export default MyAccountPage;
