import React, { useEffect, useState } from "react";
import { BottomNavigation, Modal, Icon, Page, Button, Text, Box } from "zmp-ui";
import HomePage from "./home";
import CreateTicketPage from "./create_ticket";
import MyAccountPage from "./my_account";
import {
  onConfirmToExit,
  offConfirmToExit,
  closeApp,
  setNavigationBarLeftButton,
} from "zmp-sdk/apis";
import { configAppView } from "zmp-sdk/apis";

const BottomNavigationPage = () => {
  const [activeTab, setActiveTab] = useState("my_account");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
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

  setNavigationBarLeftButton({
    type: "none",
    success: (res) => {
      // xử lý khi gọi api thành công
    },
    fail: (error) => {
      // xử lý khi gọi api thất bại
      console.log(error);
    },
  });

  useEffect(() => {
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, [confirmModalVisible]);

  const returnHome = () => {
    setActiveTab("home");
  };

  useEffect(() => {
    const myTimeout = setTimeout(() => {
      setActiveTab("home");
      console.log("timeout");
    }, 450);
  }, []);

  const navigateToCreateTicket = () => {
    setActiveTab("create_ticket");
  };

  return (
    <Page className="page" hideScrollbar={true}>
      <BottomNavigation
        fixed
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
      >
        <BottomNavigation.Item
          key="home"
          label="Trang chủ"
          icon={<Icon icon="zi-home" size={27} />}
          activeIcon={<Icon icon="zi-home" size={27} />}
        />
        <BottomNavigation.Item
          key="create_ticket"
          label=""
          style={{ height: "38px", paddingRight: "16px" }}
          icon={
            <Icon
              icon="zi-plus-circle-solid"
              size={42}
              style={{ color: "rgba(0, 106, 245, 1)" }}
            />
          }
          activeIcon={<Icon icon="zi-plus-circle-solid" size={42} />}
          onClick={navigateToCreateTicket}
        />
        <BottomNavigation.Item
          label="Tài khoản"
          key="my_account"
          icon={<Icon icon="zi-user" size={27} />}
          activeIcon={<Icon icon="zi-user" size={27} />}
        />
      </BottomNavigation>
      {activeTab === "home" && <HomePage />}
      {activeTab === "create_ticket" && (
        <CreateTicketPage onReturnHome={returnHome} />
      )}
      {activeTab === "my_account" && <MyAccountPage />}
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

export default BottomNavigationPage;
