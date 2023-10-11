import React, { useEffect, useState } from "react";
import { Box, Button, Icon, Input, Page, Text, Modal } from "zmp-ui";
import { onConfirmToExit, offConfirmToExit, closeApp } from "zmp-sdk/apis";
import { configAppView } from "zmp-sdk/apis";
const DetailAccountPage: React.FunctionComponent = () => {
  const [inputError, setInputError] = useState(false);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#1843EF",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
          leftButton: "back",
        },
      });
    } catch (error) {}
  };
  useEffect(() => {
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  });
  return (
    <Page className="section-container" hideScrollbar={true}>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img src={userInfo.avatar} alt="Avatar" className="avatar-large" />
      </Box>

      <Box>
        <Box flexDirection="row" mt={3}>
          <Text bold size="large">
            Họ và tên
          </Text>
        </Box>
        <Input
          type="text"
          placeholder="Trống"
          defaultValue={contactData.data.full_name}
        />
      </Box>

      <Box mt={3}>
        <Text bold size="large">
          Di động
        </Text>
        <Input
          type="text"
          placeholder="Vui lòng nhập di động"
          defaultValue={contactData.data.mobile}
        />
      </Box>

      <Box mt={3}>
        <Text bold size="large">
          Email
        </Text>
        <Input
          type="text"
          placeholder="Vui lòng nhập email"
          defaultValue={contactData.data.email}
        />
      </Box>

      <Box mt={3}>
        <Text bold size="large">
          Công ty
        </Text>
        <Input
          type="text"
          helperText=""
          placeholder="Vui lòng nhập tên công ty"
        />
      </Box>
      <Button fullWidth style={{ marginTop: "18px" }}>
        Cập nhật
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
export default DetailAccountPage;
