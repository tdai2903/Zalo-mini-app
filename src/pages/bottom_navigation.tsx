import React, { useEffect, useState } from "react";
import { BottomNavigation, Box, Button, Icon, Modal, Page, Text } from "zmp-ui";
import HomePage from "./home/index";
import CreateTicketPage from "./tickets/save";
import MyAccountPage from "./about_us";
import TicketsListPage from "./tickets/list";
import iconcloudgo from "/assets-src/icon-cloudgo.png";
import { openChat } from "zmp-sdk/apis";
import { useService } from "../functions/common";
const BottomNavigationPage = () => {
  const [activeTab, setActiveTab] = useState("home/index"); // activeTab bottom navigation
  const [activatedAccount, setActivatedAccount] = useState(false); // state hiển thị modal active account khi chư active
  const [isGetData, setIsGetData] = useState(false); // state check getData
  const { configView } = useService();

  const handleIsGetDataChange = (newValue) => {
    setIsGetData(newValue);
  };

  // openChatScreen từ api zalo
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
    configView("My CloudGO", "none");
  }, []);

  // Hàm navigate các tab ở bottom navigation
  const navigateWithCondition = (tab) => {
    if (isGetData) {
      setActiveTab(tab);
    } else {
      setActiveTab(activeTab);
      setActivatedAccount(true);
    }
  };

  // navigate home page
  const navigate_home = () => {
    navigateWithCondition("home/index");
  };

  // navigate ticket_list
  const navigate_tickets_list = () => {
    navigateWithCondition("tickets/list");
  };

  //navigate save ticket page
  const navigateToCreateTicket = () => {
    navigateWithCondition("tickets/save");
  };

  // navigate chat oa
  const chatoa = () => {
    navigateWithCondition(activeTab);
    openChatScreen();
  };

  // navigate about cloudgo page
  const navigate_about_us = () => {
    navigateWithCondition("about_us");
  };

  // hàm setActiveTab khi click qua tab khác
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
          key="home/index"
          label="Trang chủ"
          icon={<Icon size={28} icon="zi-home" />}
          activeIcon={<Icon size={28} icon="zi-home" />}
          onClick={navigate_home}
        />
        <BottomNavigation.Item
          key="tickets/list"
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

      {activeTab === "home/index" && (
        <HomePage onIsGetDataChange={handleIsGetDataChange} />
      )}
      {activeTab === "tickets/list" && <TicketsListPage />}
      {activeTab === "tickets/save" && <CreateTicketPage />}
      {activeTab === "about_us" && <MyAccountPage />}
      <Modal visible={activatedAccount}>
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
              setActivatedAccount(false);
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
              setActivatedAccount(false);
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
