import React, { useEffect } from "react";
import { Box, Button, Page, Text, useNavigate } from "zmp-ui";
import { getUserInfo } from "zmp-sdk/apis";
import { followOA, requestSendNotification } from "zmp-sdk";
import confirmImg from "/assets-src/createticket.png";
import { useService } from "../../functions/common";

const ConfirmTicketPage: React.FunctionComponent = () => {
  // Sử dụng function từ common.ts
  const { configView, setLeftButton } = useService();

  // Navigation
  const navigate = useNavigate();

  // API Follow OA Zalo
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
      } else {
      }
      navigate("/main", { replace: true });
    } catch (error) {}
  };

  // API cho phép mini app gửi thông báo đến người dùng
  const sendNotification = async () => {
    try {
      await requestSendNotification({});
      navigate("/bottom_navigation", { replace: true });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  // Gọi API điều chỉnh header từ API zalo
  useEffect(() => {
    configView("My CloudGO", "back");
    setLeftButton("back");
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
        onClick={() => navigate("/bottom_navigation", { replace: true })}
      >
        Để sau
      </Button>
    </Page>
  );
};

export default ConfirmTicketPage;
