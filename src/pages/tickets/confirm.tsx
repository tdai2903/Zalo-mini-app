import React, { useEffect } from "react";
import { Box, Button, Page, Text, useNavigate } from "zmp-ui";
import {
  configAppView,
  getUserInfo,
  setNavigationBarLeftButton,
} from "zmp-sdk/apis";
import { followOA, requestSendNotification } from "zmp-sdk";
import confirmImg from "/assets-src/createticket.png";

const ConfirmTicketPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const followZaloOA = async () => {
    try {
      // Lấy thông tin người dùng
      const { userInfo } = await getUserInfo({});

      // Kiểm tra nếu người dùng chưa theo dõi OA
      if (!userInfo.idByOA) {
        // Thực hiện theo dõi OA
        await followOA({
          id: "2197174064623873199",
        });

        console.log("Đã thực hiện theo dõi OA thành công.");
      } else {
        console.log("Người dùng đã theo dõi OA.");
      }
      navigate("/main", { replace: true });
    } catch (error) {
      console.error("Lỗi khi kiểm tra và thực hiện theo dõi OA:", error);
    }
  };

  const sendNotification = async () => {
    try {
      await requestSendNotification({});
      navigate("/main", { replace: true });
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
          title: "My CloudGO",
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

  // const followZaloOA = async () => {
  //   try {
  //     await followOA({
  //       id: "2197174064623873199",
  //     });
  //     navigate("/main", { replace: true });
  //   } catch (error) {
  //     // xử lý khi gọi api thất bại
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    configView();
    setLeftButton();
  }, []);

  return (
    <Page
      hideScrollbar={true}
      className="section-container"
      resetScroll={false}
    >
      <Box
        justifyContent="center"
        flexDirection="column"
        style={{ height: "60%" }}
      >
        <img
          style={{
            height: "100px",
            width: "100px",
            display: "block",
            margin: "auto",
          }}
          alt="createticket"
          src={confirmImg}
        />

        <Text
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          Tạo ticket thành công
        </Text>

        <Text
          style={{
            marginTop: "16px",
            marginBottom: "32px",
            textAlign: "center",
            lineHeight: "22px",
            fontSize: "14px",
          }}
        >
          CloudGO rất trân trọng ý kiến đóng góp của bạn. Hãy quan tâm OA
          CloudGO để không bỏ lỡ những thông báo quan trọng về ticket của bạn
          qua tin nhắn
        </Text>
      </Box>

      <Button variant="primary" fullWidth onClick={sendNotification}>
        Tiếp tục
      </Button>
      <Button
        variant="tertiary"
        type="neutral"
        fullWidth
        onClick={() => navigate("/main", { replace: true })}
      >
        Để sau
      </Button>
    </Page>
  );
};

export default ConfirmTicketPage;
