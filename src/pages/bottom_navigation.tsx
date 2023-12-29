import React, { useEffect, useState } from "react";
import { BottomNavigation, Box, Button, Icon, Modal, Page, Text } from "zmp-ui";
import HomePage from "./home";
import CreateTicketPage from "./create_ticket";
import MyAccountPage from "./about_us";
import SearchPage from "./tickets_list";
import iconcloudgo from "/assets-src/icon-cloudgo.png";
import { configAppView } from "zmp-sdk/apis";
import { openChat } from "zmp-sdk/apis";
const BottomNavigationPage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [followOAModal, setFollowOAModal] = useState(false);
  const [isGetData, setIsGetData] = useState(false);
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
          leftButton: "none",
        },
      });
    } catch (error) {
      // Xử lý khi gọi API thất bại
    }
  };

  const handleIsGetDataChange = (newValue) => {
    setIsGetData(newValue);
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

  useEffect(() => {
    configView();
  }, []);

  const navigateToCreateTicket = () => {
    if (isGetData) {
      setActiveTab("create_ticket");
    } else {
      setActiveTab(activeTab);
      setFollowOAModal(true);
    }
  };

  const navigate_tickets_list = () => {
    if (isGetData) {
      setActiveTab("tickets_list");
    } else {
      setActiveTab(activeTab);
      setFollowOAModal(true);
    }
  };

  const navigate_home = () => {
    if (isGetData) {
      setActiveTab("home");
    } else {
      setActiveTab(activeTab);
      setFollowOAModal(true);
    }
  };

  const navigate_about_us = () => {
    setActiveTab("about_us");
  };

  const chatoa = () => {
    if (isGetData) {
      setActiveTab(activeTab);
      openChatScreen();
    } else {
      setActiveTab(activeTab);
      setFollowOAModal(true);
    }
  };

  const navigateTo = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Page className="page" hideScrollbar={true}>
      <BottomNavigation
        fixed
        activeKey={activeTab}
        onChange={(key) => navigateTo(key)}
      >
        <BottomNavigation.Item
          key="home"
          label="Trang chủ"
          icon={<Icon size={28} icon="zi-home" />}
          activeIcon={<Icon size={28} icon="zi-home" />}
          onClick={navigate_home}
        />
        <BottomNavigation.Item
          key="tickets_list"
          label="Tickets"
          icon={<Icon icon="zi-file" />}
          activeIcon={<Icon icon="zi-file" />}
          onClick={navigate_tickets_list}
        />
        <BottomNavigation.Item
          label=""
          style={{
            height: "38px",
            paddingRight: "18px",
          }}
          icon={
            <Icon
              icon="zi-plus-circle-solid"
              size={42}
              style={{ color: "rgba(0, 106, 245, 1)" }}
            />
          }
          onClick={navigateToCreateTicket}
        />

        <BottomNavigation.Item
          key="chat_oa"
          label="Chat OA"
          icon={<Icon icon="zi-chat" />}
          onClick={chatoa}
        />
        <BottomNavigation.Item
          key="about_us"
          label="Liên hệ"
          icon={<Icon icon="zi-user" />}
          activeIcon={<Icon icon="zi-user" />}
          onClick={navigate_about_us}
        />
      </BottomNavigation>

      {activeTab === "home" && (
        <HomePage onIsGetDataChange={handleIsGetDataChange} />
      )}
      {activeTab === "tickets_list" && <SearchPage />}
      {activeTab === "create_ticket" && <CreateTicketPage />}
      {activeTab === "about_us" && <MyAccountPage />}
      <Modal visible={followOAModal}>
        <img
          style={{
            width: "100px",
            height: "100px",
            display: "block",
            margin: "0 auto",
          }}
          src={iconcloudgo}
        />

        <Text
          style={{
            fontWeight: 500,
            fontSize: "18px",
            textAlign: "center",
            paddingTop: "24px",
            paddingBottom: "16px",
          }}
        >
          Cho phép My CloudGO nhận các thông tin của bạn
        </Text>
        <Text
          style={{
            fontWeight: 500,
            fontSize: "4px",
            color: "rgba(118, 122, 127, 1)",
            paddingBottom: "32px",
            textAlign: "center",
          }}
        >
          My CloudGO cần truy cập thông tin tài khoản và số điện thoại của bạn
          để phục vụ bạn trong quá trình sử dụng
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
              width: "50%",
              borderRadius: "8px",
              border: "1px rgba(0, 106, 245, 1) solid ",
            }}
            size="medium"
            onClick={() => {
              setFollowOAModal(false);
            }}
          >
            Từ chối
          </Button>
          <Box width={5} height={1}></Box>
          <Button
            style={{
              padding: "8px",
              width: "50%",
              borderRadius: "8px",
            }}
            size="medium"
            onClick={() => {
              setFollowOAModal(false);
            }}
          >
            Đã hiểu
          </Button>
        </Box>
      </Modal>
    </Page>
  );
};

export default BottomNavigationPage;
