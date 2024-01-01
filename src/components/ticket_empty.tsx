import React from "react";
import { Box, Text } from "zmp-ui";
import imgTicketEmpty from "/assets-src/ticketEmpty.png";

const TicketEmpty = () => {
  return (
    <Box mt={5} style={{ textAlign: "center" }}>
      <img
        src={imgTicketEmpty}
        alt="iconticket"
        style={{
          height: "80px",
          width: "80px",
          display: "block",
          margin: "0 auto",
          color: "rgba(118, 122, 127, 1)",
        }}
      />
      <Text
        bold
        style={{
          textAlign: "center",
          paddingTop: "10px",
          color: "rgba(118, 122, 127, 1)",
        }}
      >
        Quý khách chưa có lịch sử ticket nào
      </Text>
    </Box>
  );
};

export default TicketEmpty;
