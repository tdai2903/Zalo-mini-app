import React from "react";
import { Box, Text, Icon, List } from "zmp-ui";

const TicketItem = ({
  ticket,
  translationStatus,
  statusColors,
  statusTextColors,
  formatCreatedTime,
  navigate,
  followTicket,
  setRes,
}) => {
  const handleStarClick = (starredValue) => {
    followTicket(ticket.ticketid, starredValue);
    const updatedTicket = { ...ticket, starred: starredValue.toString() };
    setRes((prevRes) =>
      prevRes.map((t) => (t.ticketid === ticket.ticketid ? updatedTicket : t))
    );
  };
  return (
    <List>
      <Box key={ticket.ticketid}>
        <Box
          style={{
            position: "relative",
            flex: 1,
          }}
        >
          {ticket.starred === "1" ? (
            <div
              style={{
                color: "gold",
                cursor: "pointer",
                position: "absolute",
                top: 10,
                right: 12,
              }}
              onClick={() => handleStarClick(0)}
            >
              <Icon size={20} icon="zi-star-solid">
                {ticket.starred}
              </Icon>
            </div>
          ) : (
            <div
              style={{
                color: "rgba(118, 122, 127, 1)",
                cursor: "pointer",
                position: "absolute",
                top: 10,
                right: 12,
              }}
              onClick={() => handleStarClick(1)}
            >
              <Icon size={20} icon="zi-star">
                {ticket.starred}
              </Icon>
            </div>
          )}
        </Box>
        <Box
          className="title-detail-container"
          key={ticket.ticketid}
          style={{
            cursor: "pointer",
            flex: 2,
          }}
          onClick={() => {
            navigate(`/tickets/detail/${ticket.ticketid}`, {
              state: { ...ticket },
            });
          }}
        >
          <Text
            style={{
              width: "95%",
              color: "rgba(20, 20, 21, 1)",
              fontWeight: 500,
              whiteSpace: "normal", // Đặt về "normal" để cho phép ngắt dòng tự động
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2, // Hiển thị tối đa 2 dòng
              overflow: "hidden",
            }}
          >
            [{translationStatus[ticket.category]}] {ticket.title}
          </Text>

          <Box
            mt={1}
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Box flexDirection="row" alignContent="center" alignItems="center">
              <Icon
                size={20}
                icon="zi-more-grid"
                style={{ color: "rgba(118, 122, 127, 1)" }}
              ></Icon>
              <Text
                style={{
                  paddingLeft: "6px",
                  color: "rgba(118, 122, 127, 1)",
                }}
              >
                {ticket.ticket_no}
              </Text>
            </Box>
            <Text
              style={{
                color: "rgba(118, 122, 127, 1)",
              }}
            >
              {formatCreatedTime(ticket.createdtime)}
            </Text>
          </Box>

          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Box mt={1} flexDirection="row" alignContent="center">
              <Icon
                size={20}
                style={{ color: "rgba(118, 122, 127, 1)" }}
                icon="zi-star"
              />
              <Text
                style={{
                  paddingLeft: "6px",
                  color: "rgba(118, 122, 127, 1)",
                }}
              >
                {ticket.helpdesk_rating || 0}
              </Text>
            </Box>
            <Box
              className="status"
              mt={1}
              flexDirection="row"
              alignContent="center"
              justifyContent="center"
              style={{
                backgroundColor: statusColors[ticket.status],
                display: "inline-block",
                minWidth: "20%",
                height: "25px",
                paddingLeft: "16px",
                paddingRight: "16px",
                textAlign: "center",
                borderRadius: "16px",
              }}
            >
              <Text
                style={{
                  color: statusTextColors[ticket.status],
                  fontSize: "14",
                  lineHeight: "25px",
                }}
              >
                {translationStatus[ticket.status]}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box className="list-container" height={4}></Box>
      </Box>
    </List>
  );
};

export default TicketItem;
