import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, List, Input, Page, Icon } from "zmp-ui";
import { TicketType } from "../../type";
import { useService } from "../../functions/common";
import TicketItem from "../../components/ticket";
import { resState } from "../../states_recoil/states_recoil";
import { useRecoilState } from "recoil";
const SearchPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [res, setRes] = useRecoilState(resState);
  const [searchResults, setSearchResults] = useState<TicketType[]>([]);
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(20);
  const profile = JSON.parse(localStorage.getItem("profile") || "{}"); // lấy profile từ local storage
  const { configView, fetchTickets } = useService();

  //Format date time
  function formatCreatedTime(createdTime) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return createdTime.substring(0, 11);
  }

  // Chạy api config header và get ticket list trước tiên
  useEffect(() => {
    configView("My CloudGO", "back");
  }, []);

  // Hàm input value khi search
  const handleSearchInputChange = (e) => {
    fetchTickets(
      "",
      "",
      "test",
      profile.data?.id,
      profile.data?.account_id,
      ""
    );
    const inputText = e.target.value;
    setSearchText(inputText);
  };

  // Hàm cho phép search theo tiêu đề | mã ticket | trạng thái | danh mục
  const filterTickets = () => {
    const filteredTickets = res.filter((ticket) => {
      const ticketTitle = ticket.title.toLowerCase();
      const ticketNo = ticket.ticket_no.toLowerCase();
      const ticketStatus =
        translationStatus[ticket.status]?.toLowerCase() || "";
      const ticketCategory =
        translationStatus[ticket.category]?.toLowerCase() || "";
      const searchInput = searchText.toLowerCase();

      if (
        ticketTitle.includes(searchInput) ||
        ticketNo.includes(searchInput) ||
        ticketStatus.includes(searchInput) ||
        ticketCategory.includes(searchInput)
      ) {
        return true;
      }
      return false;
    });

    // Ưu tiên hiển thị những ticket mới nhất
    const sortedTickets = filteredTickets.sort(
      (a, b) =>
        new Date(b.createdtime).getTime() - new Date(a.createdtime).getTime()
    );

    // Take the latest 20 tickets
    setSearchResults(sortedTickets.slice(0, 20));
  };

  //Chạy useEffect này mỗi khi search
  useEffect(() => {
    filterTickets();
  }, [searchText, res]);

  const statusColors = {
    Open: "rgba(235, 244, 255, 1)",
    Closed: "rgba(230, 250, 237, 1)",
    "Wait For Verifying": "rgba(235, 244, 255, 1)",
    "Wait For Response": "rgba(235, 244, 255, 1)",
    "Customer Confirmed": "rgba(235, 244, 255, 1)",
    Pending: "rgba(244, 245, 246, 1)",
    Testing: "rgba(230, 250, 237, 1)",
    "In Progress": "rgba(239, 234, 251, 1)",
    Assigned: "rgba(235, 244, 255, 1)",
    Reopen: "rgba(244,245,246, 1)",
    "Wait Close": "rgba(230, 250, 237, 1)",
    Cancel: "rgba(244, 245, 246, 1)",
  };

  const statusTextColors = {
    Open: "rgba(0, 106, 245, 1)",
    Closed: "rgba(52, 183, 100, 1)",
    "In Progress": "blue",
    "Wait For Verifying": "rgba(0, 106, 245, 1)",
    "Wait For Response": "rgba(0, 106, 245, 1)",
    Pending: "rgba(118, 122, 127, 1)",
    Testing: "rgba(52, 183, 100, 1)",
    "Customer Confirmed": "rgba(0, 106, 245, 1)",
    Assigned: "rgba(106, 64, 191, 1)",
    Reopen: "rgba(118, 122, 127, 1)",
    "Wait Close": "rgba(52, 183, 100, 1)",
    Cancel: "rgba(118, 122, 127, 1)",
  };

  const translationStatus = {
    Open: "Mới",
    Closed: "Đã đóng",
    "Wait For Verifying": "Chờ xác minh",
    "Wait For Response": "Chờ phản hồi",
    Testing: "Testing",
    Pending: "Tạm hoãn",
    "In Progress": "Đang tiến hành",
    Assigned: "Đã phân công",
    Reopen: "Mở lại",
    "Wait Close": "Đã xong (chờ đóng)",
    Cancel: "Hủy",
    "Customer Confirmed": "KH đã xác nhận",
    Feedback: "Góp ý",
    Bug: "Báo lỗi",
    Other: "Khác",
  };

  return (
    <Page className="section-page" hideScrollbar={true} resetScroll={false}>
      <Box
        className="detail-container"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
          style={{
            width: "100%",
          }}
        >
          <Input.Search
            style={{
              borderRadius: "8px",
              border: "1px rgba(185, 189, 193, 1) solid ",
              width: "97%",
              height: "40px",
              backgroundColor: "rgba(244, 245, 246, 1)",
            }}
            type="text"
            size="small"
            focused={true}
            placeholder="Tìm ticket theo tên, mã, trạng thái"
            clearable={{
              mode: "always",
            }}
            value={searchText}
            onChange={handleSearchInputChange}
          />
        </Box>
        <Box>
          <Text
            style={{ cursor: "pointer", width: "5%" }}
            onClick={() => {
              navigate(-1);
            }}
          >
            Thoát
          </Text>
        </Box>
      </Box>
      {searchText !== "" ? (
        <Box className="bgr-color">
          <List>
            {searchResults.slice(0, visibleTicketsCount).map((ticket) => (
              <TicketItem
                key={ticket.ticketid}
                ticket={ticket}
                translationStatus={translationStatus}
                statusColors={statusColors}
                statusTextColors={statusTextColors}
                formatCreatedTime={formatCreatedTime}
                navigate={navigate}
                setRes={setRes}
              />
            ))}
          </List>
        </Box>
      ) : null}
    </Page>
  );
};

export default SearchPage;
