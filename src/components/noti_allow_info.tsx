// ActivatedAccountModal.js
import React from "react";
import { Modal, Box, Button, Text } from "zmp-ui";
import iconcloudgo from "/assets-src/icon-cloudgo.png";

const ActivatedAccountModal = ({ visible, onClose, onClick }) => {
  return (
    <Modal visible={visible}>
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
          fontSize: "14px",
          color: "rgba(118, 122, 127, 1)",
          paddingBottom: "32px",
          textAlign: "center",
        }}
      >
        My CloudGO cần truy cập các thông tin dưới đây của tài khoản Zalo của
        bạn để phục vụ bạn trong quá trình sử dụng
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
            onClose;
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
            onClick;
          }}
        >
          Đã hiểu
        </Button>
      </Box>
    </Modal>
  );
};

export default ActivatedAccountModal;
